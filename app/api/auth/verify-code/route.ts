import { NextResponse } from "next/server"
import { prisma, safePrismaQuery } from "@/lib/prisma"
import { z } from "zod"

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
