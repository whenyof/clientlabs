import { NextRequest, NextResponse } from "next/server"
import { waitUntil } from "@vercel/functions"
import { buildEmbajadoresConfirmationEmail } from "@/lib/email/embajadores-template"

export const maxDuration = 15

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre, email, telefono, web, dedicacion, porQue, aQuien } = body

    if (!email || !email.includes("@") || !nombre) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    waitUntil(
      Promise.all([
        sendConfirmationEmail(email, nombre),
        notifyAdmin({ nombre, email, telefono, web, dedicacion, porQue, aQuien }),
      ]).catch((err) => console.error("Embajadores email error:", String(err)))
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("EMBAJADORES ERROR:", String(error))
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

async function sendConfirmationEmail(email: string, nombre: string) {
  if (!process.env.RESEND_API_KEY) return

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ClientLabs <hola@clientlabs.io>",
      to: email,
      subject: "Solicitud recibida — Te respondemos en menos de 48h",
      html: buildEmbajadoresConfirmationEmail(nombre),
    }),
  })

  if (!res.ok) {
    const data = await res.json()
    console.error("Resend error (confirmation):", res.status, JSON.stringify(data))
  }
}

async function notifyAdmin(data: Record<string, string>) {
  if (!process.env.RESEND_API_KEY) return

  const lines = [
    `Nombre: ${data.nombre}`,
    `Email: ${data.email}`,
    `Teléfono: ${data.telefono || "—"}`,
    `Web: ${data.web || "—"}`,
    `Dedicación: ${data.dedicacion || "—"}`,
    `¿Por qué encaja?: ${data.porQue || "—"}`,
    `¿A quién recomienda?: ${data.aQuien || "—"}`,
  ]

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ClientLabs <hola@clientlabs.io>",
      to: "hola@clientlabs.io",
      subject: `Nueva solicitud de embajador — ${data.nombre}`,
      text: lines.join("\n"),
    }),
  })

  if (!res.ok) {
    const body = await res.json()
    console.error("Resend error (admin notify):", res.status, JSON.stringify(body))
  }
}
