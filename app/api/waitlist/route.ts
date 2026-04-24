import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { waitUntil } from "@vercel/functions"
import { prisma } from "@/lib/prisma"
import { buildWaitlistEmail } from "@/lib/email/waitlist-template"

export const maxDuration = 30

const BASE_COUNT = 17

const waitlistSchema = z.object({
  email: z.string().email("Email no válido").max(255),
  source: z.string().max(100).optional(),
})

export async function GET() {
  const real = await prisma.waitlistEntry.count()
  return NextResponse.json({ count: real + BASE_COUNT })
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json()
    const result = waitlistSchema.safeParse(raw)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Datos no válidos" },
        { status: 400 }
      )
    }
    const { email, source } = result.data
    const normalizedEmail = email.toLowerCase().trim()

    const existing = await prisma.waitlistEntry.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return NextResponse.json({ error: "Este email ya está registrado" }, { status: 409 })
    }

    const [, realCount] = await Promise.all([
      prisma.waitlistEntry.create({
        data: { email: normalizedEmail, source: source ?? "whitelist" },
      }),
      prisma.waitlistEntry.count(),
    ])

    const position = realCount + BASE_COUNT

    waitUntil(sendWaitlistEmail(normalizedEmail, position).catch(err =>
      console.error("Email error:", err)
    ))

    return NextResponse.json({ success: true, position })
  } catch (error) {
    console.error("WAITLIST ERROR:", error)
    return NextResponse.json({ error: "Error interno. Inténtalo de nuevo." }, { status: 500 })
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
