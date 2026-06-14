import { NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"
import { stripe, getPlanFromPriceId } from "@/lib/stripe"
import { prisma, safePrismaQuery } from "@/lib/prisma"
import { sendPaymentFailedEmail, sendSubscriptionActivatedEmail, sendSubscriptionCancelledEmail } from "@/lib/email-service"
import type Stripe from "stripe"

export const maxDuration = 30
export const runtime = "nodejs"

const redis = Redis.fromEnv()
const EVENT_DEDUPE_TTL_SECONDS = 24 * 60 * 60

/**
 * Idempotencia: Stripe reentrega eventos (timeouts, reintentos). SET NX marca
 * el event.id ANTES de procesar; si ya existe → ya procesado (o en proceso).
 * Crítico para efectos no idempotentes como extraSeats { increment }.
 */
async function claimEvent(eventId: string): Promise<boolean> {
  try {
    const result = await redis.set(`stripe:event:${eventId}`, "1", {
      nx: true,
      ex: EVENT_DEDUPE_TTL_SECONDS,
    })
    return result === "OK"
  } catch (err) {
    // Redis caído: mejor procesar (riesgo de duplicado puntual) que perder el evento
    console.error("[Stripe webhook] Redis dedupe error:", err instanceof Error ? err.message : err)
    return true
  }
}

async function releaseEvent(eventId: string): Promise<void> {
  try {
    await redis.del(`stripe:event:${eventId}`)
  } catch {
    // si no se puede liberar, el TTL de 24h lo limpia; Stripe reintenta y verá la clave
  }
}

// Stripe requires the raw body to verify the signature.
export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[Stripe webhook] Signature verification failed:", msg)
    return NextResponse.json({ error: `Webhook signature verification failed: ${msg}` }, { status: 400 })
  }

  // Dedupe ANTES de cualquier efecto: evento repetido → 200 sin reprocesar
  const isFirstDelivery = await claimEvent(event.id)
  if (!isFirstDelivery) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    switch (event.type) {

      // ── Checkout completado (nueva suscripción, trial, plantilla, asiento) ──
      case "checkout.session.completed": {
        const sess = event.data.object as Stripe.Checkout.Session
        const sessType = sess.metadata?.type

        // ── Compra de plantilla individual ───────────────────────────────────
        if (sess.mode === "payment" && sessType === "template") {
          const userId = sess.metadata?.userId ?? sess.client_reference_id ?? null
          const templateId = sess.metadata?.templateId ?? null
          if (userId && templateId) {
            await safePrismaQuery(() =>
              prisma.userTemplate.upsert({
                where: { userId_templateId: { userId, templateId } },
                update: {},
                create: { userId, templateId },
              })
            )
          }
          break
        }

        // ── Compra del pack completo de plantillas ───────────────────────────
        if (sess.mode === "payment" && sessType === "template_pack_all") {
          const userId = sess.metadata?.userId ?? sess.client_reference_id ?? null
          if (userId) {
            const premiumTemplates = await prisma.invoiceTemplate.findMany({
              where: { category: "premium" },
              select: { id: true },
            })
            for (const t of premiumTemplates) {
              await safePrismaQuery(() =>
                prisma.userTemplate.upsert({
                  where: { userId_templateId: { userId, templateId: t.id } },
                  update: {},
                  create: { userId, templateId: t.id },
                })
              )
            }
          }
          break
        }

        // ── Asiento extra comprado ───────────────────────────────────────────
        if (sess.mode === "subscription" && sessType === "extra_seat") {
          const userId = sess.metadata?.userId ?? sess.client_reference_id ?? null
          if (userId) {
            await safePrismaQuery(() =>
              prisma.businessProfile.upsert({
                where: { userId },
                update: { extraSeats: { increment: 1 } },
                create: { userId, sector: "general", extraSeats: 1 },
              })
            )
          }
          break
        }

        // ── Suscripción de plan ──────────────────────────────────────────────
        if (sess.mode !== "subscription") break

        const subscriptionId =
          typeof sess.subscription === "string"
            ? sess.subscription
            : (sess.subscription as Stripe.Subscription | null)?.id

        if (!subscriptionId) {
          console.warn("[Stripe webhook] checkout.session.completed: no subscription ID")
          break
        }

        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = sub.metadata?.userId ?? sess.metadata?.userId ?? sess.client_reference_id ?? null

        if (!userId) {
          console.error("[Stripe webhook] checkout.session.completed: userId not found in metadata", {
            subMetadata: sub.metadata,
            sessMetadata: sess.metadata,
            clientRef: sess.client_reference_id,
          })
          break
        }

        await upsertSubscription(userId, sub)
        break
      }

      // ── Suscripción creada (complementa checkout.session.completed) ─────
      case "customer.subscription.created":
      // ── Suscripción actualizada (upgrade, downgrade, trial→active…) ─────
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId

        if (!userId) {
          console.warn(`[Stripe webhook] ${event.type}: no userId in metadata`, sub.metadata)
          break
        }

        if (sub.status === "canceled" || sub.status === "unpaid") {
          await safePrismaQuery(() =>
            prisma.user.update({
              where: { id: userId },
              data: {
                plan: "STARTER",
                isTrial: false,
                stripeSubscriptionId: null,
                planExpiresAt: null,
              },
            })
          )
        } else {
          await upsertSubscription(userId, sub)

          // Detect trial→active or incomplete→active: send activation email
          const prev = (event.data.previous_attributes as Record<string, unknown> | undefined)
          const prevStatus = prev?.status as string | undefined
          const justActivated =
            sub.status === "active" &&
            (prevStatus === "trialing" || prevStatus === "incomplete")

          if (justActivated) {
            const user = await prisma.user.findUnique({
              where: { id: userId },
              select: { email: true, name: true, plan: true, planExpiresAt: true },
            })
            if (user?.email) {
              const planLabel = user.plan ?? "Pro"
              const nextBilling = user.planExpiresAt
                ? user.planExpiresAt.toLocaleDateString("es-ES")
                : "—"
              sendSubscriptionActivatedEmail(user.email, user.name ?? "Usuario", planLabel, nextBilling).catch(() => {})
            }
          }
        }

        break
      }

      // ── Suscripción eliminada ────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break

        const userBefore = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true, plan: true, planExpiresAt: true },
        })

        await safePrismaQuery(() =>
          prisma.user.update({
            where: { id: userId },
            data: {
              plan: "STARTER",
              isTrial: false,
              stripeSubscriptionId: null,
              planExpiresAt: null,
            },
          })
        )

        if (userBefore?.email) {
          const accessUntil = userBefore.planExpiresAt
            ? userBefore.planExpiresAt.toLocaleDateString("es-ES")
            : new Date().toLocaleDateString("es-ES")
          sendSubscriptionCancelledEmail(
            userBefore.email,
            userBefore.name ?? "Usuario",
            userBefore.plan ?? "Pro",
            accessUntil
          ).catch(() => {})
        }
        break
      }

      // ── Pago realizado (renovación de ciclo) ─────────────────────────────
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId =
          (invoice as unknown as { parent?: { subscription_details?: { subscription?: string } } })
            ?.parent?.subscription_details?.subscription

        if (!subscriptionId) break

        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = sub.metadata?.userId
        if (!userId) break

        const item = sub.items.data[0]
        await safePrismaQuery(() =>
          prisma.user.update({
            where: { id: userId },
            data: {
              planExpiresAt: item?.current_period_end ? new Date(item.current_period_end * 1000) : null,
              isTrial: false,
            },
          })
        )
        break
      }

      // ── Pago fallido ─────────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId =
          (invoice as unknown as { parent?: { subscription_details?: { subscription?: string } } })
            ?.parent?.subscription_details?.subscription

        if (!subscriptionId) break

        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = sub.metadata?.userId
        if (!userId) break

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true, plan: true, planExpiresAt: true },
        })
        if (user?.email) {
          const planLabel = user.plan ?? "Pro"
          const nextAttempt =
            (invoice as unknown as { next_payment_attempt?: number | null }).next_payment_attempt
          const retryDate = nextAttempt
            ? new Date(nextAttempt * 1000).toLocaleDateString("es-ES")
            : "—"
          sendPaymentFailedEmail(user.email, user.name ?? "Usuario", planLabel, retryDate).catch(() => {})
        }
        break
      }

      default:
        break
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.stack ?? err.message : String(err)
    console.error("[Stripe webhook] Handler error:", errMsg)
    // Liberar la clave: el 500 hará que Stripe reintente y debe poder reprocesarse
    await releaseEvent(event.id)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

// ── Helper: marca el referido como suscrito y recalcula nivel del referrer ───
// ── Helper: persiste suscripción activa o en trial en la DB ──────────────────
async function upsertSubscription(userId: string, sub: Stripe.Subscription) {
  const item = sub.items.data[0]
  const priceId = item?.price?.id
  const plan = getPlanFromPriceId(priceId ?? "") ?? "PRO"

  // Intervalo de facturación: price.recurring es la fuente correcta en Stripe 2026
  const billingCycle =
    (item?.price as Stripe.Price & { recurring?: { interval?: string } })?.recurring?.interval ??
    null

  const periodStart = item?.current_period_start
    ? new Date(item.current_period_start * 1000)
    : new Date()
  const periodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000)
    : null

  await safePrismaQuery(() =>
    prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        isTrial:              sub.status === "trialing",
        stripeCustomerId:     typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null,
        stripeSubscriptionId: sub.id,
        planStartedAt:        periodStart,
        planExpiresAt:        periodEnd,
        billingCycle,
      },
    })
  )
}
