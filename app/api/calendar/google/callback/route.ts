export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { exchangeCodeForTokens } from "@/lib/google-calendar"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  const redirectBase = process.env.NEXTAUTH_URL ?? ""

  if (error || !code || !state) {
    return NextResponse.redirect(`${redirectBase}/dashboard/tasks?calendar=error`)
  }

  let userId: string
  try {
    userId = Buffer.from(state, "base64url").toString("utf-8")
  } catch {
    return NextResponse.redirect(`${redirectBase}/dashboard/tasks?calendar=error`)
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    await prisma.calendarIntegration.upsert({
      where: { userId },
      create: {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
      },
    })

    return NextResponse.redirect(`${redirectBase}/dashboard/tasks?calendar=connected`)
  } catch (err) {
    console.error("[calendar/callback]", err)
    return NextResponse.redirect(`${redirectBase}/dashboard/tasks?calendar=error`)
  }
}
