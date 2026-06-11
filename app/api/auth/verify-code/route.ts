export const maxDuration = 15
import { NextResponse } from "next/server"
import { prisma, safePrismaQuery } from "@/lib/prisma"
import { z } from "zod"
import { checkDistributedRateLimit } from "@/lib/security/distributedRateLimiter"

const schema = z.object({
  email: z.string().email(),
  code:  z.string().length(6).regex(/^\d{6}$/),
})

export async function POST(request: Request) {
  let parsed: z.infer<typeof schema>
  try {
    const body = await request.json()
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: "Datos no válidos" }, { status: 400 })
    parsed = result.data
  } catch {
    return NextResponse.json({ error: "JSON no válido" }, { status: 400 })
  }

  const { email, code } = parsed
  const normalizedEmail = email.toLowerCase().trim()

  // Dedicated brute-force limit for the 6-digit code: 5 attempts / 15 min.
  // Fail-closed (denies if Redis is down) — desired for the auth perimeter.
  const rl = await checkDistributedRateLimit(`auth:verifycode:${normalizedEmail}`, 5, 15 * 60)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Inténtalo de nuevo en unos minutos." },
      { status: 429 },
    )
  }

  // Buscar código válido (no usado, no expirado)
  const verification = await safePrismaQuery(() =>
    prisma.verificationCode.findFirst({
      where: {
        email:    normalizedEmail,
        code,
        used:     false,
        expiresAt: { gt: new Date() },
      },
    })
  )

  if (!verification) {
    return NextResponse.json({ error: "Código incorrecto o expirado" }, { status: 400 })
  }

  // Marcar código como usado y verificar el email del usuario en paralelo
  await safePrismaQuery(() =>
    prisma.$transaction([
      prisma.verificationCode.update({
        where: { id: verification.id },
        data:  { used: true },
      }),
      prisma.user.updateMany({
        where: { email: normalizedEmail },
        data:  { emailVerified: new Date() },
      }),
    ])
  )

  return NextResponse.json({ success: true, verified: true })
}
