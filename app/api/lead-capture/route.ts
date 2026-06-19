export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  email: z.string().email("Email inválido").max(254),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Email inválido" },
      { status: 400 }
    )
  }

  const { email } = parsed.data

  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from:    "ClientLabs <hola@clientlabs.io>",
      to:      email,
      subject: "Tu 10% de descuento en ClientLabs",
      html:    buildCouponEmail(),
    })
  } catch (err) {
    console.error("[lead-capture] Resend error:", err)
    return NextResponse.json({ error: "Error al enviar el email" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

function buildCouponEmail(): string {
  const coupon  = process.env.STRIPE_WELCOME_COUPON_CODE ?? "BIENVENIDA10"
  const precios = "https://clientlabs.io/precios"
  const logoUrl = "https://clientlabs.io/logo-trimmed.webp"

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>Tu descuento de bienvenida — ClientLabs</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

      <!-- Logo -->
      <tr><td align="center" style="padding-bottom:28px;">
        <img src="${logoUrl}" width="36" height="36" alt="ClientLabs"
             style="border-radius:8px;display:block;margin:0 auto 10px;" />
        <span style="font-size:20px;font-weight:700;color:#0B1F2A;letter-spacing:-0.3px;">
          Client<span style="color:#0F766E;">Labs</span>
        </span>
      </td></tr>

      <!-- Card -->
      <tr><td style="background:#ffffff;border-radius:12px;border:1px solid #e5e9ec;padding:40px 36px;">

        <p style="margin:0 0 16px;font-size:11px;font-weight:700;text-transform:uppercase;
                  letter-spacing:0.12em;color:#0F766E;">
          Oferta exclusiva de bienvenida
        </p>

        <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#0B1F2A;line-height:1.25;">
          Tu 10% de descuento<br>en el primer mes
        </h1>

        <p style="margin:0 0 28px;font-size:14px;color:#5a6472;line-height:1.65;">
          Gracias por tu interes en ClientLabs. Aqui tienes tu codigo de bienvenida.
          Aplicalo al contratar cualquier plan y obtén un <strong>10% de descuento
          en tu primer mes</strong>.
        </p>

        <!-- Coupon box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td style="background:#f0faf6;border:2px dashed #0F766E;border-radius:10px;
                         padding:20px 24px;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;
                      letter-spacing:0.1em;color:#0F766E;">
              Tu codigo de descuento
            </p>
            <p style="margin:0;font-size:30px;font-weight:800;letter-spacing:0.15em;color:#0B1F2A;">
              ${coupon}
            </p>
          </td></tr>
        </table>

        <!-- Steps -->
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#0B1F2A;">
          Como usarlo:
        </p>
        <ol style="margin:0 0 28px;padding-left:20px;font-size:13px;color:#5a6472;line-height:1.9;">
          <li>Ve a la pagina de precios y elige tu plan</li>
          <li>En el checkout de Stripe introduce el codigo <strong style="color:#0B1F2A;">${coupon}</strong></li>
          <li>El 10% se aplica automaticamente en tu primer mes</li>
        </ol>

        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td align="center">
            <a href="${precios}"
               style="display:inline-block;background:linear-gradient(135deg,#0F766E 0%,#0E665F 100%);
                      color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;
                      padding:14px 32px;border-radius:8px;">
              Ver planes y contratar
            </a>
          </td></tr>
        </table>

        <p style="margin:0;font-size:12px;color:#9aa5b1;line-height:1.5;text-align:center;">
          14 dias gratis &nbsp;·&nbsp; Cancela cuando quieras
        </p>

      </td></tr>

      <!-- Footer -->
      <tr><td style="padding-top:24px;text-align:center;">
        <p style="margin:0;font-size:11px;color:#9aa5b1;line-height:1.6;">
          Has recibido este email porque lo solicitaste en clientlabs.io.<br />
          <a href="https://clientlabs.io" style="color:#9aa5b1;">clientlabs.io</a>
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>

</body>
</html>`
}
