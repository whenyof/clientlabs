export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { verifyToken, decryptSecret, generateBackupCodes, hashBackupCode } from "@/lib/auth/2fa"

const schema = z.object({
  token: z.string().length(6),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Código TOTP requerido" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true, twoFactorSecret: true },
  })

  if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
    return NextResponse.json({ error: "2FA no está activado" }, { status: 400 })
  }

  const secret = decryptSecret(user.twoFactorSecret)
  if (!verifyToken(secret, parsed.data.token)) {
    return NextResponse.json({ error: "Código incorrecto" }, { status: 400 })
  }

  const plainCodes = generateBackupCodes()
  const hashedCodes = await Promise.all(plainCodes.map(hashBackupCode))

  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorBackupCodes: hashedCodes },
  })

  return NextResponse.json({ backupCodes: plainCodes })
}
