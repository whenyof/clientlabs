export const maxDuration = 30
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe, getPriceId } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body = await req.json()
  const { plan, period } = body as { plan: "STARTER" | "PRO" | "BUSINESS"; period: "monthly" | "yearly" }

  if (!plan || !period) {
    return NextResponse.json({ error: "plan y period son requeridos" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true, stripeCustomerId: true, stripeSubscriptionId: true },
  })

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  // If user already has an active subscription → redirect to portal
  if (user.stripeSubscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
      if (sub.status === "active" || sub.status === "trialing") {
        const portal = await stripe.billingPortal.sessions.create({
          customer: user.stripeCustomerId!,
          return_url: `${process.env.NEXTAUTH_URL}/dashboard/settings?section=subscription`,
        })
        return NextResponse.json({ url: portal.url })
      }
    } catch {
      // Subscription may no longer exist — proceed to new checkout
    }
  }

  // Find or create Stripe customer
  let customerId = user.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: session.user.id },
    })
    customerId = customer.id
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    })
  }

  const priceId = getPriceId(plan, period)
  if (!priceId) {
    return NextResponse.json({ error: "Precio no configurado para este plan." }, { status: 500 })
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

  // context=signup → new user coming from /plan page, redirect to /onboarding after success
  const context = (body as { context?: string }).context ?? "upgrade"
  const successUrl =
    context === "signup"
      ? `${baseUrl}/onboarding?upgrade=success&plan=${plan.toLowerCase()}`
      : `${baseUrl}/dashboard?upgrade=success&plan=${plan.toLowerCase()}`

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      locale: "es",
      payment_method_types: ["card"],
      // Collect payment method only if required — allows 14-day trial without entering a card
      payment_method_collection: "if_required",
      // client_reference_id = userId como fallback extra en el webhook
      client_reference_id: session.user.id,
      metadata: { userId: session.user.id, plan, period },
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
        trial_settings: {
          end_behavior: { missing_payment_method: "cancel" },
        },
        metadata: { userId: session.user.id, plan, period },
      },
      success_url: successUrl,
      cancel_url:  `${baseUrl}/plan`,
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[stripe/checkout] Stripe error:", msg)
    return NextResponse.json(
      { error: "Error al conectar con el sistema de pagos. Inténtalo de nuevo." },
      { status: 500 }
    )
  }
}
