export const maxDuration = 30
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

async function handleBounce(data: any) {
  const email: string = Array.isArray(data.to) ? data.to[0] : (data.email ?? "")
  if (!email) return

  const bounceType = data.bounce?.type === "permanent" ? "hard" : "soft"
  const reason = data.bounce?.message ?? data.bounce?.subtype ?? null

  await prisma.emailBounce.create({
    data: { email, bounceType, reason },
  })

  // Hard bounce → desactivar suscriptor automáticamente
  if (bounceType === "hard") {
    await prisma.newsletterSubscriber.updateMany({
      where: { email },
      data: { activo: false, bajaEn: new Date() },
    }).catch(() => {})
  }
}

async function handleComplaint(data: any) {
  const email: string = Array.isArray(data.to) ? data.to[0] : (data.email ?? "")
  if (!email) return

  // Spam complaint → baja inmediata (obligatorio RGPD)
  await Promise.all([
    prisma.newsletterSubscriber.updateMany({
      where: { email },
      data: { activo: false, bajaEn: new Date() },
    }),
    prisma.emailUnsubscribe.create({
      data: { email, reason: "spam_complaint" },
    }),
  ]).catch(() => {})
}

async function handleDelivered(data: any) {
  // Future: track delivery confirmation per recipient
  void data
}

export async function POST(req: NextRequest) {
  // Optional: verify RESEND_WEBHOOK_SECRET signature
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (secret) {
    const sig = req.headers.get("resend-signature") ?? req.headers.get("svix-signature")
    if (!sig) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }
    // Full Svix verification can be added here when svix package is installed
    // For now accept with secret present as a basic guard
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { type, data } = body ?? {}

  try {
    switch (type) {
      case "email.bounced":
        await handleBounce(data)
        break
      case "email.complained":
        await handleComplaint(data)
        break
      case "email.delivered":
        await handleDelivered(data)
        break
      // email.opened / email.clicked handled via our own tracking pixel
    }
  } catch (err) {
    console.error("[webhooks/resend] error processing event:", type, err)
  }

  return NextResponse.json({ received: true })
}
