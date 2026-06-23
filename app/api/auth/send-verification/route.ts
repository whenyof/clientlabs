export const maxDuration = 15
import { NextResponse } from "next/server"
import { prisma, safePrismaQuery } from "@/lib/prisma"
import { z } from "zod"
import { sendEmail } from "@/lib/email"
import { checkDistributedRateLimit } from "@/lib/security/distributedRateLimiter"
import { a1Code } from "@/lib/email/archetypes"

const schema = z.object({ email: z.string().email() })

function verificationCodeEmail(code: string) {
  return {
    subject: `${code} — Tu código de verificación de ClientLabs`,
    html: a1Code({
      title: "Tu código de verificación de ClientLabs",
      preheader: "Introduce este código para activar tu cuenta. Caduca en 10 minutos.",
      intro:
        "Introduce este código en ClientLabs para activar tu cuenta. Caduca en 10 minutos.",
      code,
    }),
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

  // Rate limit distribuido (Upstash) como guarda principal del perímetro.
  // Fail-closed. 6/15 min por email — por encima del límite de BD (3/10 min),
  // que sigue dando el mensaje amable de espera.
  const rl = await checkDistributedRateLimit(`auth:sendverification:${normalizedEmail}`, 6, 15 * 60)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera unos minutos antes de solicitar otro email." },
      { status: 429 },
    )
  }

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
