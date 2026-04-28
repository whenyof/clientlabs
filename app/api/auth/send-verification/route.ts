import { NextResponse } from "next/server"
import { prisma, safePrismaQuery } from "@/lib/prisma"
import { z } from "zod"
import { sendEmail } from "@/lib/email"

const schema = z.object({ email: z.string().email() })

const GREEN = "#1FA97A"
const NAVY  = "#0B1F2A"

function verificationCodeEmail(code: string) {
  return {
    subject: `${code} — Tu código de verificación de ClientLabs`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8FAFB;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif">
  <div style="max-width:580px;margin:0 auto;padding:32px 20px">

    <!-- Logo -->
    <div style="text-align:center;padding:0 0 28px">
      <div style="display:inline-flex;align-items:center;gap:8px">
        <div style="width:32px;height:32px;background:${GREEN};border-radius:8px;display:inline-flex;align-items:center;justify-content:center">
          <span style="color:#fff;font-weight:800;font-size:14px">CL</span>
        </div>
        <span style="font-size:18px;font-weight:700;color:${NAVY}">Client<span style="color:${GREEN}">Labs</span></span>
      </div>
    </div>

    <!-- Card -->
    <div style="background:#fff;border-radius:16px;padding:40px 36px;box-shadow:0 1px 4px rgba(0,0,0,0.07);border:1px solid #E8EFF4;text-align:center">
      <div style="width:56px;height:56px;background:rgba(31,169,122,0.1);border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center">
        <span style="font-size:24px">✉️</span>
      </div>
      <h1 style="color:${NAVY};font-size:22px;font-weight:700;margin:0 0 10px;letter-spacing:-0.3px">Verifica tu email</h1>
      <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 28px">
        Introduce este código en ClientLabs para activar tu cuenta:
      </p>

      <!-- Code block -->
      <div style="background:#F8FAFB;border:2px dashed #CBD5E1;border-radius:14px;padding:20px 32px;display:inline-block;margin-bottom:24px">
        <span style="font-size:38px;font-weight:800;letter-spacing:10px;color:${NAVY};font-family:'Courier New',monospace">${code}</span>
      </div>

      <p style="color:#94a3b8;font-size:13px;margin:0 0 8px">
        ⏱ Este código expira en <strong>10 minutos</strong>.
      </p>
      <p style="color:#94a3b8;font-size:12px;margin:0">
        Si no creaste una cuenta en ClientLabs, ignora este email.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:24px 0 0;font-size:12px;color:#94a3b8">
      <p style="margin:0 0 4px">ClientLabs — Tu negocio, bajo control.</p>
      <p style="margin:0">© 2026 ClientLabs. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>`,
  }
}

export async function POST(request: Request) {
  let parsed: z.infer<typeof schema>
  try {
    const body = await request.json()
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: "Email no válido" }, { status: 400 })
    parsed = result.data
  } catch {
    return NextResponse.json({ error: "JSON no válido" }, { status: 400 })
  }

  const { email } = parsed
  const normalizedEmail = email.toLowerCase().trim()

  // Rate limit: máximo 3 códigos por email cada 10 minutos
  const recentCount = await safePrismaQuery(() =>
    prisma.verificationCode.count({
      where: {
        email: normalizedEmail,
        createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) },
      },
    })
  )

  if (recentCount >= 3) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera 10 minutos antes de solicitar otro código." },
      { status: 429 }
    )
  }

  // Invalidar códigos anteriores del mismo email
  await safePrismaQuery(() =>
    prisma.verificationCode.updateMany({
      where: { email: normalizedEmail, used: false },
      data: { used: true },
    })
  )

  // Generar código de 6 dígitos y guardarlo (expira en 10 min)
  const code = Math.floor(100000 + Math.random() * 900000).toString()

  await safePrismaQuery(() =>
    prisma.verificationCode.create({
      data: {
        email:     normalizedEmail,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    })
  )

  const { subject, html } = verificationCodeEmail(code)
  const emailResult = await sendEmail(normalizedEmail, subject, html)

  // mock:true means RESEND_API_KEY is not configured — treat as failure in production
  if (emailResult.mock) {
    console.error("[send-verification] RESEND_API_KEY not configured — email not sent (mock mode)")
    return NextResponse.json(
      { error: "El servicio de email no está configurado. Contacta con soporte." },
      { status: 503 }
    )
  }

  if (!emailResult.success) {
    console.error("[send-verification] Email failed:", emailResult.error)
    return NextResponse.json(
      { error: "No se pudo enviar el código. Inténtalo de nuevo en unos segundos." },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
