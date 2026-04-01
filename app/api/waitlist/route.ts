import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { buildWaitlistEmail } from "@/lib/email/waitlist-template"

const BASE_COUNT = 17

export async function GET() {
  const real = await prisma.waitlistEntry.count()
  return NextResponse.json({ count: real + BASE_COUNT })
}

export async function POST(req: NextRequest) {
  try {
    console.log("WAITLIST POST iniciado")

    const body = await req.json()
    console.log("Body recibido:", body)

    const { email, source } = body

    if (!email || !email.includes("@")) {
      console.log("Email inválido:", email)
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }

    console.log("Verificando duplicado...")
    const existing = await prisma.waitlistEntry.findUnique({ where: { email } })
    if (existing) {
      console.log("Email duplicado:", email)
      return NextResponse.json({ error: "Este email ya está registrado" }, { status: 409 })
    }

    console.log("Creando registro en DB...")
    await prisma.waitlistEntry.create({
      data: { email, source: source ?? "whitelist" },
    })
    console.log("Registro creado OK")

    const realCount = await prisma.waitlistEntry.count()
    const position = realCount + BASE_COUNT
    console.log("Posición:", position)

    sendWaitlistEmail(email, position).catch(err =>
      console.error("Email error:", JSON.stringify(err), String(err))
    )

    console.log("Respondiendo success...")
    return NextResponse.json({ success: true, position })
  } catch (error) {
    console.error("WAITLIST ERROR:", JSON.stringify(error), String(error))
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

async function sendWaitlistEmail(email: string, position: number) {
  if (!process.env.RESEND_API_KEY) {
    console.log("RESEND_API_KEY no configurada — email omitido")
    return
  }

  console.log("Enviando email a:", email, "posición:", position)
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ClientLabs <hola@clientlabs.io>",
      to: email,
      subject: "Ya estás dentro — Acceso anticipado a ClientLabs",
      html: buildWaitlistEmail(position),
    }),
  })
  const data = await res.json()
  console.log("Resend response:", res.status, JSON.stringify(data))
}
