import { NextResponse } from "next/server"

export const maxDuration = 30

async function sendEmail(from: string, subject: string, label: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: "iyanrimada@gmail.com",
        subject,
        html: `<p>Test desde ${label}</p>`,
      }),
    })
    clearTimeout(timeout)
    const data = await res.json()
    return { from, success: res.ok, data }
  } catch (error) {
    clearTimeout(timeout)
    return { from, success: false, data: { error: String(error) } }
  }
}

export async function GET() {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY no configurada" }, { status: 500 })
  }

  const emails = [
    { from: "ClientLabs <hola@clientlabs.io>", subject: "Test hola@", label: "hola@clientlabs.io" },
    { from: "ClientLabs <noreply@clientlabs.io>", subject: "Test noreply@", label: "noreply@clientlabs.io" },
  ]

  const results = []
  for (const email of emails) {
    const result = await sendEmail(email.from, email.subject, email.label)
    results.push(result)
  }

  return NextResponse.json({ sentTo: "iyanrimada@gmail.com", results })
}
