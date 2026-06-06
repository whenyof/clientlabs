export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const { token, password } = parsed.data

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: { select: { id: true } } },
    })

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Enlace inválido o expirado" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashed },
      }),
      prisma.passwordResetToken.delete({ where: { token } }),
    ])

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[reset-password]", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
