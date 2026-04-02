import { NextRequest, NextResponse } from "next/server"
import { waitUntil } from "@vercel/functions"
import { prisma } from "@/lib/prisma"
import { buildWaitlistEmail } from "@/lib/email/waitlist-template"

export const maxDuration = 30

const BASE_COUNT = 17

export async function GET() {
  const real = await prisma.waitlistEntry.count()
  return NextResponse.json({ count: real + BASE_COUNT })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, source } = body

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }

    const existing = await prisma.waitlistEntry.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Este email ya está registrado" }, { status: 409 })
    }

    const [entry, realCount] = await Promise.all([
      prisma.waitlistEntry.create({
        data: { email, source: source ?? "whitelist" },
      }),
      prisma.waitlistEntry.count(),
    ])

    const position = realCount + BASE_COUNT

    waitUntil(sendWaitlistEmail(email, position).catch(err =>
      console.error("Email error:", JSON.stringify(err), String(err))
    ))

    return NextResponse.json({ success: true, position })
  } catch (error) {
    console.error("WAITLIST ERROR:", JSON.stringify(error), String(error))
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

async function sendWaitlistEmail(email: string, position: number) {
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
      subject: "Ya estás dentro — Acceso anticipado a ClientLabs",
      html: buildWaitlistEmail(position),
    }),
  })
  if (!res.ok) {
    const data = await res.json()
    console.error("Resend error:", res.status, JSON.stringify(data))
  }
}
