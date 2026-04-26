import { NextRequest, NextResponse } from "next/server"
import { stripe, getPlanFromPriceId } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import type Stripe from "stripe"

export const runtime = "nodejs"

// Stripe requires the raw body to verify the signature.
// Next.js App Router gives us access to the raw request body via req.text().
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
      case "checkout.session.completed": {
        const sess = event.data.object as Stripe.Checkout.Session
        if (sess.mode !== "subscription" || !sess.subscription) break

        const sub = await stripe.subscriptions.retrieve(sess.subscription as string)
        const userId = sub.metadata?.userId ?? sess.metadata?.userId
        if (!userId) break

        const item = sub.items.data[0]
        const priceId = item?.price.id
        const plan = getPlanFromPriceId(priceId) ?? "PRO"

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan,
            isTrial:              sub.status === "trialing",
            stripeCustomerId:     sub.customer as string,
            stripeSubscriptionId: sub.id,
            planStartedAt:        item?.current_period_start ? new Date(item.current_period_start * 1000) : new Date(),
            planExpiresAt:        item?.current_period_end   ? new Date(item.current_period_end   * 1000) : null,
            billingCycle:         item?.plan?.interval ?? null,
          },
        })
        break
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break

        const item = sub.items.data[0]
        const priceId = item?.price.id
        const plan = getPlanFromPriceId(priceId)

        if (sub.status === "canceled" || sub.status === "unpaid") {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan:                "FREE",
              isTrial:             false,
              stripeSubscriptionId: null,
              planExpiresAt:       null,
            },
          })
        } else if (plan) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan,
              isTrial:      sub.status === "trialing",
              planStartedAt: item?.current_period_start ? new Date(item.current_period_start * 1000) : undefined,
              planExpiresAt: item?.current_period_end   ? new Date(item.current_period_end   * 1000) : null,
              billingCycle:  item?.plan?.interval ?? null,
            },
          })
        }
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan:                "FREE",
            isTrial:             false,
            stripeSubscriptionId: null,
            planExpiresAt:       null,
          },
        })
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        // In Stripe API 2026-02-25.clover, subscription is under invoice.parent
        const subscriptionId =
          (invoice as unknown as { parent?: { subscription_details?: { subscription?: string } } })
            ?.parent?.subscription_details?.subscription

        if (!subscriptionId) break

        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = sub.metadata?.userId
        if (!userId) break

        const item = sub.items.data[0]
        await prisma.user.update({
          where: { id: userId },
          data: {
            planExpiresAt: item?.current_period_end ? new Date(item.current_period_end * 1000) : null,
            isTrial: false,
          },
        })
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId =
          (invoice as unknown as { parent?: { subscription_details?: { subscription?: string } } })
            ?.parent?.subscription_details?.subscription

        if (!subscriptionId) break

        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = sub.metadata?.userId
        if (!userId) break

        // Payment failed — don't downgrade immediately, Stripe retries. Log it.
        console.warn(`[Stripe webhook] Payment failed for user ${userId}, subscription ${sub.id}`)
        break
      }

      default:
        // Unhandled event type — ignore
        break
    }
  } catch (err) {
    console.error("[Stripe webhook] Handler error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
