import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getGoogleAuthUrl } from "@/lib/google-calendar"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const state = Buffer.from(session.user.id).toString("base64url")
  const url = getGoogleAuthUrl(state)

  return NextResponse.redirect(url)
}
