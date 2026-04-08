import { prisma } from "@infra/database/prisma"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LeadsHeader } from "@domains/leads/components/LeadsHeader"
import { LeadsKpisClient } from "./components/LeadsKpisClient"
import { LeadsFilters } from "@domains/leads/components/LeadsFilters"
import { LeadsCharts } from "@domains/leads/components/LeadsCharts"
import { LeadsClientShell } from "./components/LeadsClientShell"
import { Suspense } from "react"
import { format, subDays, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"
import type { Lead } from "@prisma/client"

export const dynamic = "force-dynamic"
export const revalidate = 0

type SearchParams = Promise<{
  status?: string
  temperature?: string
  source?: string
  search?: string
  sortBy?: string
  sortOrder?: string
  showConverted?: string
  showLost?: string
  stale?: string
}>

const STATUS_COLORS: Record<string, string> = {
  NEW:       "#1FA97A",
  CONTACTED: "#3B82F6",
  QUALIFIED: "#D9A441",
  CONVERTED: "#8B5CF6",
  LOST:      "#EF4444",
}

const STATUS_LABELS: Record<string, string> = {
  NEW:       "Nuevo",
  CONTACTED: "Contactado",
  QUALIFIED: "Cualificado",
  CONVERTED: "Convertido",
  LOST:      "Perdido",
}

export default async function LeadsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: SearchParams
}) {
  const session = await getServerSession(authOptions)
  const searchParams = await searchParamsPromise

  if (!session?.user?.id) {
    redirect("/auth")
  }

  const uid = session.user.id
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const staleDays = 7 * 24 * 60 * 60 * 1000
  const thirtyDaysAgo = subDays(now, 30)

  const [
    totalLeads, potenciales, convertedLeads, stalledLeads,
    newThisWeek, hotNow, hotYesterday, convertedThisMonth, totalThisMonth,
    distinctSources,
    initialLeadsData, initialLeadsCount,
    recentLeadsRaw, allLeadsRaw,
  ] = await Promise.all([
    // ── KPIs ──
    prisma.lead.count({ where: { userId: uid } }),
    // Potenciales = score >= 40 OR QUALIFIED OR CONTACTED (igual que /api/leads/kpis)
    prisma.lead.count({
      where: {
        userId: uid,
        NOT: { leadStatus: { in: ["CONVERTED", "LOST"] } },
        OR: [
          { score: { gte: 40 } },
          { leadStatus: "QUALIFIED" },
          { leadStatus: "CONTACTED" },
        ],
      },
    }),
    prisma.lead.count({ where: { userId: uid, leadStatus: "CONVERTED" } }),
    prisma.lead.count({
      where: {
        userId: uid,
        NOT: { leadStatus: { in: ["CONVERTED", "LOST"] } },
        OR: [
          { lastActionAt: null },
          { lastActionAt: { lt: new Date(now.getTime() - staleDays) } },
        ],
      },
    }),
    prisma.lead.count({ where: { userId: uid, createdAt: { gte: weekAgo } } }),
    prisma.lead.count({ where: { userId: uid, temperature: "HOT" } }),
    prisma.lead.count({ where: { userId: uid, temperature: "HOT", createdAt: { lt: dayAgo } } }),
    prisma.lead.count({ where: { userId: uid, leadStatus: "CONVERTED", updatedAt: { gte: monthStart } } }),
    prisma.lead.count({ where: { userId: uid, createdAt: { gte: monthStart } } }),
    prisma.lead.groupBy({ by: ["source"], where: { userId: uid } }),
    // ── Initial leads for table ──
    prisma.lead.findMany({
      where: { userId: uid, leadStatus: { notIn: ["CONVERTED", "LOST"] } },
      orderBy: { score: "desc" },
      take: 20,
      select: {
        id: true, userId: true, email: true, name: true, phone: true,
        source: true, leadStatus: true, temperature: true, score: true,
        priority: true, tags: true, notes: true, converted: true,
        clientId: true, lastActionAt: true, createdAt: true, updatedAt: true,
        conversionProbability: true, aiSegment: true, metadata: true,
      },
    }),
    prisma.lead.count({ where: { userId: uid, leadStatus: { notIn: ["CONVERTED", "LOST"] } } }),
    // ── Chart data ──
    prisma.lead.findMany({
      where: { userId: uid, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, leadStatus: true },
    }),
    prisma.lead.findMany({
      where: { userId: uid },
      select: { leadStatus: true },
    }),
  ])

  // ── Build KPIs ──
  const kpis = {
    total: totalLeads,
    hot: potenciales,
    converted: convertedLeads,
    stalled: stalledLeads,
    newThisWeek,
    hotDelta: hotNow - hotYesterday,
    conversionRate: totalThisMonth > 0 ? Math.round((convertedThisMonth / totalThisMonth) * 100) : 0,
  }

  const sources = distinctSources.map((s) => s.source).filter(Boolean) as string[]

  // ── Build chart data ──
  const days = eachDayOfInterval({ start: thirtyDaysAgo, end: now })
  const dailyMap = new Map<string, number>()
  days.forEach((day) => {
    dailyMap.set(format(day, "dd MMM", { locale: es }), 0)
  })
  recentLeadsRaw.forEach((lead) => {
    const key = format(new Date(lead.createdAt), "dd MMM", { locale: es })
    if (dailyMap.has(key)) dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1)
  })
  const dailyArray = Array.from(dailyMap.entries()).map(([date, total]) => ({ date, total }))
  const dailyFiltered = dailyArray.filter((_, i) => i % 3 === 0 || i === dailyArray.length - 1)

  const statusMap = new Map<string, number>()
  allLeadsRaw.forEach((lead) => {
    const s = lead.leadStatus
    statusMap.set(s, (statusMap.get(s) ?? 0) + 1)
  })
  const byStatus = Array.from(statusMap.entries())
    .map(([status, value]) => ({
      name: STATUS_LABELS[status] ?? status,
      value,
      color: STATUS_COLORS[status] ?? "#9CA3AF",
    }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value)

  const chartInitial = { daily: dailyFiltered, byStatus }

  return (
    <LeadsClientShell>
      <div className="space-y-6">
        <LeadsHeader />
        <LeadsKpisClient
          initial={kpis}
          initialLeads={initialLeadsData as Lead[]}
          initialTotal={initialLeadsCount}
        >
          <LeadsFilters sources={sources} />
          <LeadsCharts initialData={chartInitial} />
        </LeadsKpisClient>
      </div>
    </LeadsClientShell>
  )
}
