export const maxDuration = 30
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export const ADD_SEAT_PRICE_EUR = 3.99

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true, stripeCustomerId: true },
    })
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        name: user.name ?? undefined,
        metadata: { userId: session.user.id },
      })
      customerId = customer.id
      await prisma.user.update({ where: { id: session.user.id }, data: { stripeCustomerId: customerId } })
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      locale: "es",
      payment_method_types: ["card"],
      client_reference_id: session.user.id,
      metadata: { userId: session.user.id, type: "extra_seat" },
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: "Usuario extra — ClientLabs", description: "Asiento adicional para un miembro del equipo" },
          unit_amount: Math.round(ADD_SEAT_PRICE_EUR * 100),
          recurring: { interval: "month" },
        },
        quantity: 1,
      }],
      success_url: `${baseUrl}/dashboard/settings?section=team&seat_added=1`,
      cancel_url: `${baseUrl}/dashboard/settings?section=team`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error("[api/stripe/add-seat]", err)
    return NextResponse.json({ error: "Error al procesar la compra" }, { status: 500 })
  }
}
