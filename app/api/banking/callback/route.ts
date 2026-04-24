export const maxDuration = 15

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

function verifyState(state: string): string | null {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf-8")
    const dotIndex = decoded.lastIndexOf(".")
    if (dotIndex === -1) return null

    const userId = decoded.slice(0, dotIndex)
    const receivedHmac = decoded.slice(dotIndex + 1)

    const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? ""
    const expectedHmac = crypto.createHmac("sha256", secret).update(userId).digest("hex")

    // Timing-safe comparison to prevent timing attacks
    const receivedBuf = Buffer.from(receivedHmac, "hex")
    const expectedBuf = Buffer.from(expectedHmac, "hex")

    if (receivedBuf.length !== expectedBuf.length) return null
    if (!crypto.timingSafeEqual(receivedBuf, expectedBuf)) return null

    return userId
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  const baseUrl = process.env.NEXTAUTH_URL ?? ""

  if (error || !code) {
    console.error("Tink callback error:", searchParams.get("message"))
    return NextResponse.redirect(`${baseUrl}/dashboard/finance/banco?error=true`)
  }

  // Verify HMAC-signed state — prevents IDOR via base64 userId manipulation
  const userId = state ? verifyState(state) : null

  if (!userId) {
    console.error("Tink callback: invalid or missing state parameter")
    return NextResponse.redirect(`${baseUrl}/dashboard/finance/banco?error=true`)
  }

  try {
    await prisma.bankConnection.upsert({
      where: { userId },
      update: {
        authCode: code,
        status: "CONNECTED",
        connectedAt: new Date(),
      },
      create: {
        userId,
        authCode: code,
        institutionId: "tink",
        requisitionId: `tink-${userId}`,
        status: "CONNECTED",
        connectedAt: new Date(),
      },
    }).catch((err) => console.error("DB error:", err))

    return NextResponse.redirect(`${baseUrl}/dashboard/finance/banco?success=true`)
  } catch (err) {
    console.error("Callback error:", err)
    return NextResponse.redirect(`${baseUrl}/dashboard/finance/banco?error=true`)
  }
}
