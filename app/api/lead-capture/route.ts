export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { cMarketing } from "@/lib/email/archetypes"

const schema = z.object({
  email: z.string().email("Email inválido").max(254),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Email inválido" },
      { status: 400 }
    )
  }

  const { email } = parsed.data

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from:    "ClientLabs <hola@clientlabs.io>",
      to:      email,
      subject: "Tu 10% de descuento en ClientLabs",
      html:    buildCouponEmail(),
    })
  } catch (err) {
    console.error("[lead-capture] Resend error:", err)
    return NextResponse.json({ error: "Error al enviar el email" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

function buildCouponEmail(): string {
  const coupon  = process.env.STRIPE_WELCOME_COUPON_CODE ?? "BIENVENIDA10"
  const precios = "https://clientlabs.io/precios"

  return cMarketing({
    title: "Tu descuento de bienvenida — ClientLabs",
    preheader: "Tu 10% de descuento en el primer mes de ClientLabs.",
    label: "Oferta de bienvenida",
    heading: "Tu 10% de descuento en el primer mes",
    intro:
      "Gracias por tu interés en ClientLabs. Aquí tienes tu código de bienvenida: aplícalo al contratar cualquier plan en el checkout de Stripe y obtén un 10% de descuento en tu primer mes.",
    coupon: {
      caption: "Tu código de descuento",
      headline: "10% de descuento",
      code: coupon,
    },
    button: { href: precios, label: "Ver planes y contratar" },
    note: "14 días gratis · Cancela cuando quieras",
    unsubscribeUrl: "mailto:hola@clientlabs.io?subject=Baja%20de%20comunicaciones",
    reason: "Has recibido este email porque lo solicitaste en clientlabs.io.",
  })
}
