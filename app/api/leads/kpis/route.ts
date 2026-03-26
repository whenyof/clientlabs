export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const now = new Date()

  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const staleDays = 7 * 24 * 60 * 60 * 1000

  const [total, hot, converted, stalled, newThisWeek, hotYesterday, hotNow, convertedThisMonth, totalThisMonth] =
    await Promise.all([
      prisma.lead.count({ where: { userId } }),
      prisma.lead.count({ where: { userId, temperature: "HOT" } }),
      prisma.lead.count({ where: { userId, leadStatus: "CONVERTED" } }),
      prisma.lead.count({
        where: {
          userId,
          NOT: { leadStatus: { in: ["CONVERTED", "LOST"] } },
          OR: [
            { lastActionAt: null },
            { lastActionAt: { lt: new Date(now.getTime() - staleDays) } },
          ],
        },
      }),
      // New leads this week
      prisma.lead.count({ where: { userId, createdAt: { gte: weekAgo } } }),
      // Hot leads as of yesterday (hot now minus hot created today)
      prisma.lead.count({
        where: { userId, temperature: "HOT", createdAt: { lt: dayAgo } },
      }),
      // Hot leads now (same as hot above, but clearer intent)
      prisma.lead.count({ where: { userId, temperature: "HOT" } }),
      // Converted this month
      prisma.lead.count({
        where: { userId, leadStatus: "CONVERTED", updatedAt: { gte: monthStart } },
      }),
      // Total leads this month (for conversion rate)
      prisma.lead.count({ where: { userId, createdAt: { gte: monthStart } } }),
    ])

  const hotDelta = hotNow - hotYesterday
  const conversionRate = totalThisMonth > 0 ? Math.round((convertedThisMonth / totalThisMonth) * 100) : 0

  return NextResponse.json({
    total,
    hot,
    converted,
    stalled,
    newThisWeek,
    hotDelta,
    conversionRate,
  })
}
