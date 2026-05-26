export const maxDuration = 10
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getCachedData, setCachedData } from "@/lib/redis-cache"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const cacheKey = `ai-assistant-stats-${userId}`
  const cached = await getCachedData(cacheKey)
  if (cached) return NextResponse.json(cached)

  const [
    hotLeadsCount,
    riskClientsCount,
    activeAutomationsCount,
    totalExecutions,
  ] = await Promise.all([
    prisma.lead.count({
      where: { userId, score: { gte: 70 } },
    }),
    prisma.client.count({
      where: {
        userId,
        OR: [{ riskLevel: "ALTO" }, { status: "INACTIVE" }],
      },
    }),
    prisma.automation.count({
      where: { userId, active: true },
    }),
    prisma.automationLog.count({
      where: { userId },
    }),
  ])

  const data = { hotLeadsCount, riskClientsCount, activeAutomationsCount, totalExecutions }
  await setCachedData(cacheKey, data, 60)
  return NextResponse.json(data)
}
