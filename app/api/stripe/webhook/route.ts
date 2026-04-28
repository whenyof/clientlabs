import { NextRequest, NextResponse } from "next/server"
import { stripe, getPlanFromPriceId } from "@/lib/stripe"
import { prisma, safePrismaQuery } from "@/lib/prisma"
import type Stripe from "stripe"

export const runtime = "nodejs"

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

  try {
    switch (event.type) {

      // ── Checkout completado (nueva suscripción o trial) ─────────────────
      case "checkout.session.completed": {
        const sess = event.data.object as Stripe.Checkout.Session
        if (sess.mode !== "subscription") break

        // sess.subscription puede ser string o Subscription expandido
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
        console.log(`[Stripe webhook] checkout.session.completed: user ${userId} → plan updated`)
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
                plan: "FREE",
                isTrial: false,
                stripeSubscriptionId: null,
                planExpiresAt: null,
              },
            })
          )
        } else {
          await upsertSubscription(userId, sub)
        }

        console.log(`[Stripe webhook] ${event.type}: user ${userId} → status ${sub.status}`)
        break
      }

      // ── Suscripción eliminada ────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break

        await safePrismaQuery(() =>
          prisma.user.update({
            where: { id: userId },
            data: {
              plan: "FREE",
              isTrial: false,
              stripeSubscriptionId: null,
              planExpiresAt: null,
            },
          })
        )
        console.log(`[Stripe webhook] subscription.deleted: user ${userId} → FREE`)
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

        console.warn(`[Stripe webhook] Payment failed for user ${userId}, sub ${sub.id}`)
        break
      }

      default:
        break
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.stack ?? err.message : String(err)
    console.error("[Stripe webhook] Handler error:", errMsg)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

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
