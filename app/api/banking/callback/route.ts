export const maxDuration = 15

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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

  try {
    // Recupera el userId del state
    let userId: string | null = null
    if (state) {
      try {
        userId = Buffer.from(state, "base64").toString("utf-8")
      } catch {
        userId = null
      }
    }

    // Guarda el code en DB si tenemos userId
    if (userId) {
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
    }

    return NextResponse.redirect(`${baseUrl}/dashboard/finance/banco?success=true`)
  } catch (err) {
    console.error("Callback error:", err)
    return NextResponse.redirect(`${baseUrl}/dashboard/finance/banco?error=true`)
  }
}
