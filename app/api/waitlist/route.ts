import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { buildWaitlistEmail } from "@/lib/email/waitlist-template"

export async function GET() {
  const count = await prisma.waitlistEntry.count()
  return NextResponse.json({ count })
}

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }

    const existing = await prisma.waitlistEntry.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Este email ya está en lista", alreadyIn: true }, { status: 409 })
    }

    await prisma.waitlistEntry.create({
      data: { email, source: source ?? "whitelist" },
    })

    const position = await prisma.waitlistEntry.count()

    try {
      await sendWaitlistConfirmation(email, position)
    } catch (e) {
      console.error("Waitlist email error:", e)
    }

    return NextResponse.json({ success: true, position })
  } catch (e) {
    console.error("POST /api/waitlist:", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

async function sendWaitlistConfirmation(email: string, position: number) {
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
