export const maxDuration = 10

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  generateSecret,
  generateQRCode,
  encryptSecret,
} from "@/lib/auth/2fa"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true, email: true },
  })

  if (user?.twoFactorEnabled) {
    return NextResponse.json({ error: "2FA ya está activado" }, { status: 400 })
  }

  const secret = generateSecret()
  const qrCode = await generateQRCode(secret, user!.email)
  const encryptedSecret = encryptSecret(secret)

  // Store pending secret (not yet confirmed)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorSecret: encryptedSecret },
  })

  return NextResponse.json({ qrCode, secret })
}
