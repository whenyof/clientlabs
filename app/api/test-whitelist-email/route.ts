import { NextResponse } from "next/server"
import { buildWaitlistEmail } from "@/lib/email/waitlist-template"

export const maxDuration = 30
export const runtime = "nodejs"

export async function GET() {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY no configurada" }, { status: 500 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 9000)

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ClientLabs <hola@clientlabs.io>",
        to: "iyanrimada@gmail.com",
        subject: "Ya estás dentro — Acceso anticipado a ClientLabs",
        html: buildWaitlistEmail(23),
      }),
    })
    clearTimeout(timeout)
    const data = await res.json()
    return NextResponse.json({ success: res.ok, data })
  } catch (error) {
    clearTimeout(timeout)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
