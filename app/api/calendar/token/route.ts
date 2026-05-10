export const maxDuration = 10
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

function buildUrls(token: string) {
  const base = process.env.NEXTAUTH_URL ?? "https://app.clientlabs.es"
  const feedUrl = `${base}/api/calendar/feed/${token}`
  const webcal = feedUrl.replace(/^https?:\/\//, "webcal://")
  return {
    token,
    feedUrl,
    webcalUrl: webcal,
    googleCalendarUrl: `https://www.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`,
    appleCalendarUrl: webcal,
    outlookUrl: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(feedUrl)}`,
    outlookDesktopUrl: webcal,
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  let user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { calendarFeedToken: true },
  })

  if (!user?.calendarFeedToken) {
    const token = randomBytes(32).toString("hex")
    await prisma.user.update({
      where: { id: session.user.id },
      data: { calendarFeedToken: token },
    })
    user = { calendarFeedToken: token }
  }

  return NextResponse.json(buildUrls(user.calendarFeedToken!))
}

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const token = randomBytes(32).toString("hex")
  await prisma.user.update({
    where: { id: session.user.id },
    data: { calendarFeedToken: token },
  })

  return NextResponse.json({ success: true, ...buildUrls(token) })
}
