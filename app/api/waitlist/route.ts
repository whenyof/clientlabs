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
    const { email, source } = await req.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }

    const existing = await prisma.waitlistEntry.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Este email ya está registrado" }, { status: 409 })
    }

    await prisma.waitlistEntry.create({
      data: { email, source: source ?? "whitelist" },
    })

    const realCount = await prisma.waitlistEntry.count()
    const position = realCount + BASE_COUNT

    try {
      await sendWaitlistEmail(email, position)
    } catch (e) {
      console.error("Waitlist email error:", e)
    }

    return NextResponse.json({ success: true, position })
  } catch (error) {
    console.error("Waitlist error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

async function sendWaitlistEmail(email: string, position: number) {
  if (!process.env.RESEND_API_KEY) return

  await fetch("https://api.resend.com/emails", {
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
}
