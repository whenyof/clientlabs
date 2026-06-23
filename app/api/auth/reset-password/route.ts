export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { checkDistributedRateLimit } from "@/lib/security/distributedRateLimiter"

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  // Límite dedicado contra fuerza bruta de canje de tokens. Fail-closed.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown"
  const rl = await checkDistributedRateLimit(`auth:reset:${ip}`, 10, 15 * 60)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Inténtalo de nuevo en unos minutos." },
      { status: 429 },
    )
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const { token, password } = parsed.data
  // En BD el token está hasheado (sha256); comparamos el hash del token recibido.
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
      include: { user: { select: { id: true } } },
    })

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Enlace inválido o expirado" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashed },
      }),
      prisma.passwordResetToken.delete({ where: { token: tokenHash } }),
    ])

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("[reset-password]", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
