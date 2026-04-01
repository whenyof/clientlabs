import { NextResponse } from "next/server"

const RESEND_API_KEY = process.env.RESEND_API_KEY
const TO = "iyanrimada@gmail.com"

async function sendEmail(from: string, subject: string, label: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: TO,
      subject,
      html: `
        <div style="font-family:system-ui;max-width:480px;margin:0 auto;padding:32px 20px">
          <div style="background:#0B1F2A;border-radius:12px;padding:32px;text-align:center;margin-bottom:20px">
            <h1 style="color:white;font-size:22px;margin:0 0 8px">Email funcionando</h1>
            <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0">Enviado desde: ${from}</p>
          </div>
          <p style="font-size:14px;color:#475569;line-height:1.6">
            Este es un email de prueba de <strong>ClientLabs</strong> para verificar que la dirección
            <strong>${label}</strong> funciona correctamente con Resend.
          </p>
          <p style="font-size:12px;color:#94A3B8;margin-top:24px;border-top:1px solid #E2E8F0;padding-top:16px">
            ClientLabs · clientlabs.io
          </p>
        </div>
      `,
    }),
  })
  const data = await res.json()
  return { from, success: res.ok, data }
}

export async function GET() {
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY no configurada" }, { status: 500 })
  }

  const results = await Promise.allSettled([
    sendEmail("ClientLabs <hola@clientlabs.io>", "Test — hola@clientlabs.io", "hola@clientlabs.io"),
    sendEmail("ClientLabs Info <info@clientlabs.io>", "Test — info@clientlabs.io", "info@clientlabs.io"),
    sendEmail("ClientLabs Soporte <soporte@clientlabs.io>", "Test — soporte@clientlabs.io", "soporte@clientlabs.io"),
    sendEmail("ClientLabs <noreply@clientlabs.io>", "Test — noreply@clientlabs.io", "noreply@clientlabs.io"),
  ])

  const addresses = [
    "hola@clientlabs.io",
    "info@clientlabs.io",
    "soporte@clientlabs.io",
    "noreply@clientlabs.io",
  ]

  const summary = results.map((r, i) => {
    if (r.status === "fulfilled") {
      return {
        address: addresses[i],
        success: r.value.success,
        id: r.value.data?.id || null,
        error: r.value.data?.message || null,
      }
    }
    return { address: addresses[i], success: false, error: String(r.reason) }
  })

  const allOk = summary.every(s => s.success)

  return NextResponse.json({ allOk, sentTo: TO, results: summary }, { status: allOk ? 200 : 207 })
}
