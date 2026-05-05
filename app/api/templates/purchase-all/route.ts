export const maxDuration = 30
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { PREMIUM_PACK_PRICE } from "@/lib/invoice-templates-catalog"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true, name: true, stripeCustomerId: true } })
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })

    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email ?? undefined, name: user.name ?? undefined, metadata: { userId: session.user.id } })
      customerId = customer.id
      await prisma.user.update({ where: { id: session.user.id }, data: { stripeCustomerId: customerId } })
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      locale: "es",
      payment_method_types: ["card"],
      client_reference_id: session.user.id,
      metadata: { userId: session.user.id, type: "template_pack_all" },
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: "Pack completo — 10 plantillas premium", description: "Acceso a todas las plantillas premium de ClientLabs" },
          unit_amount: Math.round(PREMIUM_PACK_PRICE * 100),
        },
        quantity: 1,
      }],
      success_url: `${baseUrl}/dashboard/settings?section=invoicing&template_purchased=1`,
      cancel_url: `${baseUrl}/dashboard/settings?section=invoicing`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error("[api/templates/purchase-all]", err)
    return NextResponse.json({ error: "Error al procesar la compra" }, { status: 500 })
  }
}
