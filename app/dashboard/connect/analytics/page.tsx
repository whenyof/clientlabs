import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AnalyticsView } from "./AnalyticsView"

export const dynamic = "force-dynamic"

interface LeadsByDayRow {
  day: Date
  source: string
  count: number
}

export default async function ConnectAnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth")

  const userId = session.user.id
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    leadsBySource30d,
    allTimeBySource,
    leadsByDayRaw,
    sessionGroups,
    convertedCount,
    totalLeads30d,
    integrations,
    sdkInstallations,
  ] = await Promise.all([
    prisma.lead.groupBy({
      by: ["source"],
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.lead.groupBy({
      by: ["source"],
      where: { userId },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.$queryRaw<LeadsByDayRow[]>`
      SELECT DATE("createdAt") as day, source, COUNT(*)::int as count
      FROM "Lead"
      WHERE "userId" = ${userId}
      AND "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt"), source
      ORDER BY DATE("createdAt")
    `,
    prisma.trackingEvent.groupBy({
      by: ["sessionId"],
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.lead.count({ where: { userId, converted: true, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.lead.count({ where: { userId, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.integration.findMany({
      where: { userId },
      select: { provider: true, status: true, category: true, lastSync: true },
    }),
    prisma.sdkInstallation.findMany({
      where: { userId },
      select: { domain: true, lastSeenAt: true, lastEventAt: true, eventCount: true },
      orderBy: { lastEventAt: "desc" },
    }),
  ])

  // Build 30-day timeline filled with zeros
  const sources = [...new Set(leadsByDayRaw.map((r) => r.source))]
  const days: string[] = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().slice(0, 10)
  })

  const daySourceMap = new Map<string, Map<string, number>>()
  for (const row of leadsByDayRaw) {
    const day = new Date(row.day).toISOString().slice(0, 10)
    if (!daySourceMap.has(day)) daySourceMap.set(day, new Map())
    daySourceMap.get(day)!.set(row.source, Number(row.count))
  }

  const timelineData = days.map((day) => {
    const entry: Record<string, string | number> = {
      day: new Date(day + "T12:00:00Z").toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
    }
    for (const src of sources) entry[src] = daySourceMap.get(day)?.get(src) ?? 0
    return entry
  })

  return (
    <AnalyticsView
      leadsBySource30d={leadsBySource30d.map((r) => ({ source: r.source, count: r._count.id }))}
      allTimeBySource={allTimeBySource.map((r) => ({ source: r.source, count: r._count.id }))}
      timelineData={timelineData}
      sources={sources}
      sessions={sessionGroups.length}
      convertedCount={convertedCount}
      totalLeads30d={totalLeads30d}
      integrations={integrations.map((i) => ({
        provider: i.provider,
        status: i.status,
        category: String(i.category),
        lastSync: i.lastSync?.toISOString() ?? null,
      }))}
      sdkInstallations={sdkInstallations.map((i) => ({
        domain: i.domain,
        lastSeenAt: i.lastSeenAt?.toISOString() ?? null,
        lastEventAt: i.lastEventAt?.toISOString() ?? null,
        eventCount: i.eventCount ?? 0,
      }))}
    />
  )
}
