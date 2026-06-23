export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email-service"
import crypto from "crypto"
import { z } from "zod"
import { checkDistributedRateLimit } from "@/lib/security/distributedRateLimiter"

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ success: true }) }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ success: true })

  const { email } = parsed.data

  // Dedicated limit to prevent reset-token flooding: 5 requests / 15 min per
  // submitted email. The 429 is returned regardless of whether the email
  // exists, so it does not leak account existence. Fail-closed.
  const rl = await checkDistributedRateLimit(`auth:forgot:${email.toLowerCase().trim()}`, 5, 15 * 60)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Inténtalo de nuevo en unos minutos." },
      { status: 429 },
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    })

    if (user) {
      // El token plano solo viaja por email; en BD guardamos su hash sha256.
      const token = crypto.randomBytes(32).toString("hex")
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })
      await prisma.passwordResetToken.create({
        data: { userId: user.id, token: tokenHash, expiresAt },
      })

      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`
      await sendPasswordResetEmail(user.email, user.name ?? "Usuario", resetUrl).catch(() => {})
    }
  } catch (e) {
    console.error("[forgot-password]", e)
  }

  // Always respond success — don't reveal whether email exists
  return NextResponse.json({ success: true })
}
