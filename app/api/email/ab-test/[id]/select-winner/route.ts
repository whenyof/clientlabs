export const maxDuration = 10
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const test = await prisma.emailABTest.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!test) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (test.status !== "running") return NextResponse.json({ error: "Test is not running" }, { status: 409 })

  const openRateA = test.sentToA > 0 ? test.opensA / test.sentToA : 0
  const openRateB = test.sentToB > 0 ? test.opensB / test.sentToB : 0
  const clickRateA = test.sentToA > 0 ? test.clicksA / test.sentToA : 0
  const clickRateB = test.sentToB > 0 ? test.clicksB / test.sentToB : 0

  let winnerId: "A" | "B"
  if (test.winnerMetric === "clickRate") {
    winnerId = clickRateA >= clickRateB ? "A" : "B"
  } else {
    winnerId = openRateA >= openRateB ? "A" : "B"
  }

  const updated = await prisma.emailABTest.update({
    where: { id: test.id },
    data: { status: "winner_selected", winnerId, completedAt: new Date() },
    select: { id: true, status: true, winnerId: true, completedAt: true },
  })

  return NextResponse.json({
    ...updated,
    openRateA: Math.round(openRateA * 1000) / 10,
    openRateB: Math.round(openRateB * 1000) / 10,
    clickRateA: Math.round(clickRateA * 1000) / 10,
    clickRateB: Math.round(clickRateB * 1000) / 10,
  })
}
