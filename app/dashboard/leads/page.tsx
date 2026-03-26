import { prisma } from "@infra/database/prisma"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LeadsHeader } from "@domains/leads/components/LeadsHeader"
import { LeadsKpisClient } from "./components/LeadsKpisClient"
import { LeadsFilters } from "@domains/leads/components/LeadsFilters"
import { LeadsTable } from "@domains/leads/components/LeadsTable"
export const dynamic = "force-dynamic"
export const revalidate = 10

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

  // ── Calculate KPIs using efficient database queries (NOT memory filtering) ──
  const [totalLeads, hotLeads, convertedLeads, stalledLeads, distinctSources] =
    await Promise.all([
      prisma.lead.count({ where: { userId: session.user.id } }),
      prisma.lead.count({
        where: { userId: session.user.id, temperature: "HOT" },
      }),
      prisma.lead.count({
        where: { userId: session.user.id, leadStatus: "CONVERTED" },
      }),
      prisma.lead.count({
        where: {
          userId: session.user.id,
          NOT: { leadStatus: { in: ["CONVERTED", "LOST"] } },
          OR: [
            { lastActionAt: null },
            {
              lastActionAt: {
                lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
              },
            },
          ],
        },
      }),
      prisma.lead.groupBy({
        by: ["source"],
        where: { userId: session.user.id },
      }),
    ])

  const kpis = {
    total: totalLeads,
    hot: hotLeads,
    converted: convertedLeads,
    stalled: stalledLeads,
  }

  const sources = distinctSources.map((s) => s.source).filter(Boolean) as string[]

  return (
    <div className="space-y-6">
      <LeadsHeader />
      <LeadsKpisClient initial={kpis} />
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
      <LeadsTable />
    </div>
  )
}
