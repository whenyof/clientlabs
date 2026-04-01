import { NextResponse } from "next/server"

export const maxDuration = 30
export const runtime = "nodejs"

function buildWaitlistEmail(position: number): string {
  const displayPosition = position + 17

  const benefits = [
    { emoji: "🎁", bg: "#E1F5EE", title: "1 mes gratis", desc: "Acceso completo el primer mes. Sin tarjeta." },
    { emoji: "⭐", bg: "#FEF3C7", title: "50% de descuento de por vida", desc: "Tu precio early adopter se mantiene para siempre." },
    { emoji: "⚡", bg: "#DBEAFE", title: "Acceso prioritario", desc: "Entras antes que el resto cuando abramos en Junio 2026." },
    { emoji: "✨", bg: "#EDE9FE", title: "Ofertas exclusivas", desc: "Descuentos con herramientas para autónomos." },
    { emoji: "💬", bg: "#F0FDF9", title: "Soporte directo al equipo", desc: "Canal privado con los fundadores." },
  ]

  const benefitsHtml = benefits.map(({ emoji, bg, title, desc }) => `
    <tr>
      <td style="padding:8px 0">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="40" valign="top">
              <div style="width:34px;height:34px;border-radius:8px;background:${bg};display:flex;align-items:center;justify-content:center;text-align:center">
                <span style="font-size:18px;line-height:34px;">${emoji}</span>
              </div>
            </td>
            <td style="padding-left:12px;vertical-align:top">
              <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#0F172A">${title}</p>
              <p style="margin:0;font-size:12px;color:#64748B;line-height:1.5">${desc}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join("")

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px;background:#F8FAFC">

      <div style="background:#0B1F2A;border-radius:16px;padding:40px 32px;text-align:center;margin-bottom:20px">
        <p style="color:#1FA97A;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 12px">ClientLabs</p>
        <h1 style="color:white;font-size:26px;font-weight:700;margin:0 0 8px;line-height:1.2">Ya estás dentro.</h1>
        <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0">Eres el número <strong style="color:white">${displayPosition}</strong> en la lista de espera</p>
      </div>

      <div style="background:white;border-radius:16px;padding:28px 32px;margin-bottom:16px;border:1px solid #E2E8F0">
        <p style="font-size:14px;color:#334155;margin:0 0 20px;line-height:1.6">
          Gracias por apuntarte. Cuando abramos las puertas, serás de los primeros en entrar — con todas estas ventajas reservadas:
        </p>
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:8px">
          ${benefitsHtml}
        </table>
      </div>

      <div style="background:white;border-radius:12px;padding:16px 24px;margin-bottom:16px;border:1px solid #E2E8F0;text-align:center">
        <p style="margin:0;font-size:13px;color:#475569">
          <span style="font-size:12px;">🚀</span> Fecha de lanzamiento: <strong style="color:#0B1F2A">23 de Junio de 2026</strong>
        </p>
      </div>

      <p style="font-size:12px;color:#94A3B8;text-align:center;margin:0 0 8px">
        Cualquier duda escríbenos a
        <a href="mailto:hola@clientlabs.io" style="color:#1FA97A;text-decoration:none">hola@clientlabs.io</a>
      </p>
      <p style="font-size:11px;color:#CBD5E1;text-align:center;margin:0">
        ClientLabs · clientlabs.io
      </p>

    </div>
  `
}

export async function GET() {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY no configurada" }, { status: 500 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 9000)

  try {
    const html = buildWaitlistEmail(23)

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
        html,
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
