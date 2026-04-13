export const maxDuration = 15

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const TINK_CLIENT_ID = process.env.TINK_CLIENT_ID!
const TINK_CLIENT_SECRET = process.env.TINK_CLIENT_SECRET!
const TINK_API = "https://api.tink.com"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const baseUrl = process.env.NEXTAUTH_URL ?? ""

  if (error || !code) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard/finance/banco?error=cancelled`
    )
  }

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.redirect(`${baseUrl}/login`)
    }

    // Intercambia el code por un access token de usuario (una sola vez)
    const tokenRes = await fetch(`${TINK_API}/api/v1/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: TINK_CLIENT_ID,
        client_secret: TINK_CLIENT_SECRET,
        grant_type: "authorization_code",
      }),
    })

    const tokenData = await tokenRes.json()
    const accessToken: string | undefined = tokenData.access_token
    const expiresIn: number = tokenData.expires_in ?? 3600

    if (!accessToken) {
      console.error("Tink callback: no access_token", tokenData)
      return NextResponse.redirect(
        `${baseUrl}/dashboard/finance/banco?error=token`
      )
    }

    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000)

    await prisma.bankConnection.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        institutionId: "tink",
        requisitionId: `tink-${session.user.id}`,
        accessToken,
        tokenExpiresAt,
        status: "CONNECTED",
        connectedAt: new Date(),
      },
      update: {
        accessToken,
        tokenExpiresAt,
        status: "CONNECTED",
        connectedAt: new Date(),
        authCode: null,
      },
    })

    return NextResponse.redirect(
      `${baseUrl}/dashboard/finance/banco?success=true`
    )
  } catch (err) {
    console.error("Tink callback error:", err)
    return NextResponse.redirect(
      `${baseUrl}/dashboard/finance/banco?error=server`
    )
  }
}
