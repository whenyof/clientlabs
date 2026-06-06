export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email-service"
import crypto from "crypto"
import { z } from "zod"

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ success: true }) }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ success: true })

  const { email } = parsed.data

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    })

    if (user) {
      const token = crypto.randomBytes(32).toString("hex")
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })
      await prisma.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt },
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
