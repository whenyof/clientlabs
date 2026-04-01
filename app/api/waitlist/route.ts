import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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

function buildWaitlistEmail(position: number): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Ya estás dentro — ClientLabs</title>
</head>
<body style="margin:0;padding:0;background-color:#E2E8F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">

<div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#E2E8F0;">
  Bienvenido/a. 1 mes gratis + 50% descuento de por vida reservado.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
</div>

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#E2E8F0;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="max-width:560px;width:100%;">

<!-- HEADER -->
<tr><td style="background-color:#0B1F2A;border-radius:16px 16px 0 0;padding:36px 32px;text-align:center;">

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;">
  <tr><td align="center">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td style="background-color:#1FA97A;border-radius:8px;width:34px;height:34px;text-align:center;vertical-align:middle;">
      <span style="font-size:13px;font-weight:700;color:#ffffff;line-height:34px;display:block;">CL</span>
    </td>
    <td style="padding-left:9px;vertical-align:middle;">
      <span style="font-size:17px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Client<span style="color:#1FA97A;">Labs</span></span>
    </td>
  </tr>
  </table>
  </td></tr>
  </table>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:18px;">
  <tr><td align="center">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="60" height="60">
    <tr><td align="center" valign="middle" style="width:60px;height:60px;border-radius:50%;background-color:rgba(31,169,122,0.12);border:1.5px solid rgba(31,169,122,0.3);">
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 13l5.5 5.5L21 8" stroke="#1FA97A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </td></tr>
    </table>
  </td></tr>
  </table>

  <h1 style="font-size:26px;font-weight:700;color:#ffffff;margin:0 0 6px;letter-spacing:-0.02em;line-height:1.2;">Ya estás dentro.</h1>
  <p style="font-size:13px;color:rgba(255,255,255,0.45);margin:0;">Bienvenido/a al acceso anticipado de ClientLabs</p>
</td></tr>

<!-- BODY -->
<tr><td style="background-color:#ffffff;padding:32px;">

  <p style="font-size:15px;font-weight:500;color:#0F172A;margin:0 0 8px;">Hola,</p>
  <p style="font-size:14px;color:#475569;line-height:1.75;margin:0 0 28px;">
    Gracias por unirte. Eres una de las primeras personas en confiar en ClientLabs antes del lanzamiento oficial — y eso tiene su recompensa. Aquí tienes todo lo que tienes reservado.
  </p>

  <!-- POSICIÓN -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;">
  <tr><td style="background-color:#0B1F2A;border-radius:12px;padding:24px;text-align:center;">
    <p style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.12em;margin:0 0 8px;">Tu posición en la lista de espera</p>
    <p style="font-size:48px;font-weight:700;color:#1FA97A;line-height:1;margin:0;letter-spacing:-0.03em;">#${position}</p>
    <p style="font-size:12px;color:rgba(255,255,255,0.35);margin:6px 0 0;">De los primeros en acceder cuando abramos</p>
  </td></tr>
  </table>

  <p style="font-size:10px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 12px;">Lo que tienes reservado</p>

  <!-- BENEFICIO 1 -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:8px;">
  <tr><td style="background-color:#F8FAFB;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="width:34px;vertical-align:top;padding-right:14px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="34" height="34">
        <tr><td align="center" valign="middle" style="background-color:#E1F5EE;border-radius:9px;width:34px;height:34px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="6" width="14" height="9" rx="1.5" stroke="#0F6E56" stroke-width="1.3"/>
            <path d="M5 6V4.5a3 3 0 116 0V6" stroke="#0F6E56" stroke-width="1.3" stroke-linecap="round"/>
            <circle cx="8" cy="10" r="1" fill="#0F6E56"/>
          </svg>
        </td></tr>
        </table>
      </td>
      <td style="vertical-align:top;">
        <p style="font-size:13px;font-weight:600;color:#0F172A;margin:0 0 3px;">1 mes completamente gratis</p>
        <p style="font-size:12px;color:#64748B;line-height:1.55;margin:0;">Acceso completo a todos los módulos durante 30 días. Sin tarjeta. Sin compromiso.</p>
      </td>
    </tr>
    </table>
  </td></tr>
  </table>

  <!-- BENEFICIO 2 -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:8px;">
  <tr><td style="background-color:#F8FAFB;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="width:34px;vertical-align:top;padding-right:14px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="34" height="34">
        <tr><td align="center" valign="middle" style="background-color:#FEF3C7;border-radius:9px;width:34px;height:34px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1.5l1.5 4.5H14l-3.7 2.7 1.4 4.3L8 10.5l-3.7 2.5 1.4-4.3L2 5.9h4.5z" stroke="#854F0B" stroke-width="1.2" stroke-linejoin="round"/>
          </svg>
        </td></tr>
        </table>
      </td>
      <td style="vertical-align:top;">
        <p style="font-size:13px;font-weight:600;color:#0F172A;margin:0 0 3px;">50% de descuento de por vida</p>
        <p style="font-size:12px;color:#64748B;line-height:1.55;margin:0;">Tu precio early adopter queda fijo para siempre. Aunque canceles y vuelvas, el descuento se mantiene.</p>
      </td>
    </tr>
    </table>
  </td></tr>
  </table>

  <!-- BENEFICIO 3 -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:8px;">
  <tr><td style="background-color:#F8FAFB;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="width:34px;vertical-align:top;padding-right:14px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="34" height="34">
        <tr><td align="center" valign="middle" style="background-color:#DBEAFE;border-radius:9px;width:34px;height:34px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 1L5 9h5l-3 6 7-8H11z" stroke="#1E40AF" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </td></tr>
        </table>
      </td>
      <td style="vertical-align:top;">
        <p style="font-size:13px;font-weight:600;color:#0F172A;margin:0 0 3px;">Acceso prioritario al lanzamiento</p>
        <p style="font-size:12px;color:#64748B;line-height:1.55;margin:0;">Entras el primer día antes de que abramos al público general. Tu cuenta queda activada automáticamente.</p>
      </td>
    </tr>
    </table>
  </td></tr>
  </table>

  <!-- BENEFICIO 4 -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:8px;">
  <tr><td style="background-color:#F8FAFB;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="width:34px;vertical-align:top;padding-right:14px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="34" height="34">
        <tr><td align="center" valign="middle" style="background-color:#EDE9FE;border-radius:9px;width:34px;height:34px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="#5B21B6" stroke-width="1.3" stroke-linecap="round"/>
            <circle cx="8" cy="8" r="2.5" stroke="#5B21B6" stroke-width="1.3"/>
            <circle cx="8" cy="8" r="1" fill="#5B21B6"/>
          </svg>
        </td></tr>
        </table>
      </td>
      <td style="vertical-align:top;">
        <p style="font-size:13px;font-weight:600;color:#0F172A;margin:0 0 3px;">Ofertas exclusivas pre-lanzamiento</p>
        <p style="font-size:12px;color:#64748B;line-height:1.55;margin:0;">Promociones, features en beta y condiciones que nunca estarán disponibles para el público.</p>
      </td>
    </tr>
    </table>
  </td></tr>
  </table>

  <!-- BENEFICIO 5 -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:26px;">
  <tr><td style="background-color:#F8FAFB;border:1px solid #E2E8F0;border-radius:10px;padding:14px 16px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="width:34px;vertical-align:top;padding-right:14px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="34" height="34">
        <tr><td align="center" valign="middle" style="background-color:#F0FDF9;border-radius:9px;width:34px;height:34px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="6" stroke="#0F6E56" stroke-width="1.3"/>
            <path d="M8 5v3.5l2.5 1.5" stroke="#0F6E56" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
        </td></tr>
        </table>
      </td>
      <td style="vertical-align:top;">
        <p style="font-size:13px;font-weight:600;color:#0F172A;margin:0 0 3px;">Influencia directa en el producto</p>
        <p style="font-size:12px;color:#64748B;line-height:1.55;margin:0;">Tu feedback tiene peso real. Las features que pidas en beta tienen prioridad en el roadmap.</p>
      </td>
    </tr>
    </table>
  </td></tr>
  </table>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;">
  <tr><td style="height:1px;background-color:#E2E8F0;font-size:0;line-height:0;"></td></tr>
  </table>

  <!-- FECHA LANZAMIENTO -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:26px;">
  <tr><td style="background-color:#F0FDF9;border:1px solid #9FE1CB;border-radius:10px;padding:18px;text-align:center;">
    <p style="font-size:10px;font-weight:600;color:#0F6E56;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 5px;">Fecha de lanzamiento oficial</p>
    <p style="font-size:19px;font-weight:700;color:#0B1F2A;letter-spacing:-0.02em;margin:0 0 3px;">23 de Junio de 2026</p>
    <p style="font-size:11px;color:#475569;margin:0;">Te avisaremos unos días antes con todos los detalles</p>
  </td></tr>
  </table>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px;">
  <tr><td style="height:1px;background-color:#E2E8F0;font-size:0;line-height:0;"></td></tr>
  </table>

  <!-- FIRMA -->
  <p style="font-size:13px;color:#64748B;line-height:1.75;margin:0;">
    Si tienes cualquier pregunta o quieres contarnos algo sobre tu negocio, responde directamente a este email — lo leeremos personalmente.<br><br>
    Un saludo,<br>
    <strong style="color:#0F172A;font-size:14px;">Iyan</strong><br>
    <span style="color:#94A3B8;font-size:12px;">Fundador de ClientLabs</span>
  </p>

</td></tr>

<!-- FOOTER -->
<tr><td style="background-color:#F8FAFB;border-top:1px solid #E2E8F0;border-radius:0 0 16px 16px;padding:22px 24px;text-align:center;">
  <p style="font-size:13px;font-weight:600;color:#0B1F2A;margin:0 0 10px;">Client<span style="color:#1FA97A;">Labs</span></p>
  <p style="margin:0 0 10px;">
    <a href="https://clientlabs.io" style="font-size:10px;color:#94A3B8;text-decoration:none;">clientlabs.io</a>
    &nbsp;·&nbsp;
    <a href="https://clientlabs.io/privacidad" style="font-size:10px;color:#94A3B8;text-decoration:none;">Privacidad</a>
    &nbsp;·&nbsp;
    <a href="https://clientlabs.io/cookies" style="font-size:10px;color:#94A3B8;text-decoration:none;">Cookies</a>
  </p>
  <p style="font-size:10px;color:#CBD5E1;line-height:1.6;margin:0;">
    Recibiste este email porque te apuntaste a la lista de acceso anticipado de ClientLabs.<br>
    © 2026 ClientLabs · hola@clientlabs.io
  </p>
</td></tr>

</table>
</td></tr>
</table>

</body>
</html>`
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
