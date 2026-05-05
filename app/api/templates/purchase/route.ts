export const maxDuration = 30
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { z } from "zod"

const schema = z.object({ templateSlug: z.string().min(1) })

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "templateSlug requerido" }, { status: 400 })
  }

  try {
    const template = await prisma.invoiceTemplate.findUnique({ where: { slug: parsed.data.templateSlug } })
    if (!template) return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 })
    if (template.category !== "premium") return NextResponse.json({ error: "Esta plantilla es gratuita" }, { status: 400 })

    const already = await prisma.userTemplate.findUnique({
      where: { userId_templateId: { userId: session.user.id, templateId: template.id } },
    })
    if (already) return NextResponse.json({ error: "Ya tienes esta plantilla" }, { status: 400 })

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
      metadata: { userId: session.user.id, type: "template", templateId: template.id },
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: `Plantilla: ${template.name}`, description: template.description ?? undefined },
          unit_amount: Math.round(template.price * 100),
        },
        quantity: 1,
      }],
      success_url: `${baseUrl}/dashboard/settings?section=invoicing&template_purchased=1`,
      cancel_url: `${baseUrl}/dashboard/settings?section=invoicing`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error("[api/templates/purchase]", err)
    return NextResponse.json({ error: "Error al procesar la compra" }, { status: 500 })
  }
}
