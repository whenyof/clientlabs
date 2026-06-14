export const maxDuration = 15

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { checkContactLimit } from "@/lib/rate-limit"

const CONTACT_RECIPIENT = "iyanrimada5@gmail.com"
const FROM = "ClientLabs <hola@clientlabs.io>"

const contactSchema = z.object({
  name: z.string().min(2, "Nombre demasiado corto").max(120),
  email: z.string().email("Email no válido").max(255),
  message: z.string().min(10, "Cuéntanos un poco más (mínimo 10 caracteres)").max(5000),
})

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon"
    const allowed = await checkContactLimit(`contact:${ip}`).catch(() => true)
    if (!allowed) {
      return NextResponse.json({ error: "Demasiados mensajes seguidos. Espera un minuto." }, { status: 429 })
    }

    const raw = await req.json().catch(() => null)
    const parsed = contactSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
        { status: 400 }
      )
    }
    const { name, email, message } = parsed.data

    if (!process.env.RESEND_API_KEY) {
      console.error("Contact form: RESEND_API_KEY no configurada")
      return NextResponse.json({ error: "No se pudo enviar el mensaje. Inténtalo más tarde." }, { status: 503 })
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        from: FROM,
        to: CONTACT_RECIPIENT,
        reply_to: email,
        subject: `Contacto web: ${name}`,
        html: `<p><strong>Nombre:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Mensaje:</strong></p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      console.error("Contact form Resend error:", res.status, JSON.stringify(data))
      return NextResponse.json({ error: "No se pudo enviar el mensaje. Inténtalo más tarde." }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("CONTACT ERROR:", error)
    return NextResponse.json({ error: "Error interno. Inténtalo de nuevo." }, { status: 500 })
  }
}
