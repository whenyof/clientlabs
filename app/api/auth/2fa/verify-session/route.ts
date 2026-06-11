export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { verifyToken, decryptSecret, verifyBackupCode, hashBackupCode } from "@/lib/auth/2fa"
import { checkDistributedRateLimit } from "@/lib/security/distributedRateLimiter"

const schema = z.object({
  token: z.string().min(6).max(9),
  isBackup: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  // Dedicated brute-force limit for OTP/backup codes: 5 attempts / 15 min.
  // Fail-closed (denies if Redis is down) — desired for the auth perimeter.
  const rl = await checkDistributedRateLimit(`auth:2fa:${session.user.id}`, 5, 15 * 60)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Inténtalo de nuevo en unos minutos." },
      { status: 429 },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Token requerido" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true, twoFactorSecret: true, twoFactorBackupCodes: true },
  })

  if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
    return NextResponse.json({ error: "2FA no configurado" }, { status: 400 })
  }

  if (parsed.data.isBackup) {
    for (let i = 0; i < user.twoFactorBackupCodes.length; i++) {
      const valid = await verifyBackupCode(parsed.data.token, user.twoFactorBackupCodes[i])
      if (valid) {
        // Consume the backup code (remove it from the list)
        const remaining = user.twoFactorBackupCodes.filter((_, idx) => idx !== i)
        const placeholder = await hashBackupCode("__USED__" + i)
        await prisma.user.update({
          where: { id: session.user.id },
          data: { twoFactorBackupCodes: [...remaining, placeholder] },
        })
        return NextResponse.json({ success: true })
      }
    }
    return NextResponse.json({ error: "Código de respaldo inválido" }, { status: 400 })
  }

  const secret = decryptSecret(user.twoFactorSecret)
  if (!verifyToken(secret, parsed.data.token)) {
    return NextResponse.json({ error: "Código incorrecto" }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
