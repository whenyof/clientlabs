export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getCached, setCached } from "@/lib/cache"

export async function GET() {
  try {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const cacheKey = `leads-kpis-${userId}`
  const cached = getCached(cacheKey)
  if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } })
  const now = new Date()

  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const staleDays = 7 * 24 * 60 * 60 * 1000

  const staleDate = new Date(now.getTime() - staleDays)

  const [total, hot, converted, stalled, newThisWeek, hotYesterday, hotNow, convertedThisMonth, totalThisMonth] =
    await Promise.all([
      prisma.lead.count({ where: { userId } }),
      // Potenciales = score > 40 OR leadStatus = QUALIFIED
      prisma.lead.count({
        where: {
          userId,
          NOT: { leadStatus: { in: ["CONVERTED", "LOST"] } },
          OR: [
            { score: { gte: 40 } },
            { leadStatus: "QUALIFIED" },
            { leadStatus: "CONTACTED" },
          ],
        },
      }),
      prisma.lead.count({ where: { userId, leadStatus: "CONVERTED" } }),
      // Estancados = not CONVERTED/LOST AND no activity in 7+ days
      prisma.lead.count({
        where: {
          userId,
          NOT: { leadStatus: { in: ["CONVERTED", "LOST"] } },
          OR: [
            { lastActionAt: { not: null, lt: staleDate } },
            { lastActionAt: null, createdAt: { lt: staleDate } },
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

  const result = { total, hot, converted, stalled, newThisWeek, hotDelta, conversionRate }
  setCached(cacheKey, result, 60)
  return NextResponse.json(result)
  } catch (error) {
    console.error('[api/leads/kpis] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
