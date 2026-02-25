import { NextResponse } from "next/server"
import Stripe from "stripe"

/**
 * POST /api/webhooks/stripe
 * Validates Stripe webhook signature before processing events.
 * If STRIPE_WEBHOOK_SECRET is not configured, returns 200 (noop safe mode).
 */
export async function POST(request: Request) {
 const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
 if (!webhookSecret) {
 // Safe mode: Stripe integration not configured yet — acknowledge and skip
 return NextResponse.json(
 { ok: true, received: true, mode: "noop" },
 { status: 200 },
 )
 }

 const signature = request.headers.get("stripe-signature")
 if (!signature) {
 return NextResponse.json(
 { ok: false, error: "Missing Stripe-Signature header" },
 { status: 400 },
 )
 }

 let event: Stripe.Event
 try {
 const body = await request.text()

 const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
 apiVersion: "2025-12-15.clover",
 })

 event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
 } catch (err) {
 const message = err instanceof Error ? err.message : "Signature verification failed"
 console.error("[webhooks/stripe] Signature verification failed:", message)
 return NextResponse.json(
 { ok: false, error: "Invalid signature" },
 { status: 400 },
 )
 }

 // Event verified — process based on type
 // TODO: Map payment events to sales/subscriptions when Stripe integration is active
 // Example handlers:
 // - checkout.session.completed → create sale
 // - invoice.payment_succeeded → update subscription
 // - customer.subscription.deleted → downgrade plan

 return NextResponse.json(
 { ok: true, received: true, eventType: event.type },
 { status: 200 },
 )
}
