import { Suspense } from "react"
import { prisma } from "@infra/database/prisma"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LeadsHeader } from "@domains/leads/components/LeadsHeader"
import { LeadsKpisClient } from "./components/LeadsKpisClient"
import { LeadsFilters } from "@domains/leads/components/LeadsFilters"
import { LeadsTable } from "@domains/leads/components/LeadsTable"
import { LeadsCharts } from "@domains/leads/components/LeadsCharts"
export const dynamic = "force-dynamic"

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

  // ── Calculate KPIs using efficient database queries ──
  const uid = session.user.id
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const staleDays = 7 * 24 * 60 * 60 * 1000

  const [totalLeads, hotLeads, convertedLeads, stalledLeads, newThisWeek, hotYesterday, convertedThisMonth, totalThisMonth, distinctSources] =
    await Promise.all([
      prisma.lead.count({ where: { userId: uid } }),
      prisma.lead.count({ where: { userId: uid, temperature: "HOT" } }),
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
      prisma.lead.count({ where: { userId: uid, temperature: "HOT", createdAt: { lt: dayAgo } } }),
      prisma.lead.count({ where: { userId: uid, leadStatus: "CONVERTED", updatedAt: { gte: monthStart } } }),
      prisma.lead.count({ where: { userId: uid, createdAt: { gte: monthStart } } }),
      prisma.lead.groupBy({ by: ["source"], where: { userId: uid } }),
    ])

  const kpis = {
    total: totalLeads,
    hot: hotLeads,
    converted: convertedLeads,
    stalled: stalledLeads,
    newThisWeek,
    hotDelta: hotLeads - hotYesterday,
    conversionRate: totalThisMonth > 0 ? Math.round((convertedThisMonth / totalThisMonth) * 100) : 0,
  }

  const sources = distinctSources.map((s) => s.source).filter(Boolean) as string[]

  return (
    <div className="space-y-6">
      <LeadsHeader />
      <LeadsKpisClient initial={kpis} />
      <Suspense fallback={<div className="h-12 animate-pulse rounded-xl bg-slate-100" />}>
        <LeadsFilters
          currentFilters={{
            status: searchParams.status ?? "all",
            temperature: searchParams.temperature ?? "all",
            source: searchParams.source ?? "all",
            search: searchParams.search ?? "",
            sortBy: searchParams.sortBy ?? "score",
            sortOrder: searchParams.sortOrder ?? "desc",
            showConverted: searchParams.showConverted === "true",
            showLost: searchParams.showLost === "true",
          }}
          sources={sources}
        />
      </Suspense>
      <LeadsCharts />
      <Suspense fallback={
        <div className="rounded-xl border border-slate-200 bg-white">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="h-14 animate-pulse border-b border-slate-100 last:border-0" />
          ))}
        </div>
      }>
        <LeadsTable />
      </Suspense>
    </div>
  )
}
