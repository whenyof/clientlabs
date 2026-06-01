export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { verifyToken, decryptSecret, verifyBackupCode } from "@/lib/auth/2fa"

const schema = z.object({
  token: z.string().min(6).max(8),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Token requerido" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      twoFactorEnabled: true,
      twoFactorSecret: true,
      twoFactorBackupCodes: true,
    },
  })

  if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
    return NextResponse.json({ error: "2FA no está activado" }, { status: 400 })
  }

  const secret = decryptSecret(user.twoFactorSecret)
  const isTotp = verifyToken(secret, parsed.data.token)

  let isBackup = false
  if (!isTotp && parsed.data.token.length === 9) {
    for (const hashed of user.twoFactorBackupCodes) {
      if (await verifyBackupCode(parsed.data.token, hashed)) {
        isBackup = true
        break
      }
    }
  }

  if (!isTotp && !isBackup) {
    return NextResponse.json({ error: "Código incorrecto" }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
      twoFactorVerifiedAt: null,
    },
  })

  return NextResponse.json({ success: true })
}
