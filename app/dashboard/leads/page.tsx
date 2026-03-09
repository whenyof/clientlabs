import { prisma } from "@infra/database/prisma"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LeadsHeader } from "@domains/leads/components/LeadsHeader"
import { LeadsKPIs } from "@domains/leads/components/LeadsKPIs"
import { LeadsFilters } from "@domains/leads/components/LeadsFilters"
import { LeadsTable } from "@domains/leads/components/LeadsTable"
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

  const allLeads = await prisma.lead.findMany({
    where: { userId: session.user.id },
    select: { leadStatus: true, temperature: true, lastActionAt: true },
  })

  const kpis = {
    total: allLeads.length,
    hot: allLeads.filter((l) => l.temperature === "HOT").length,
    converted: allLeads.filter((l) => l.leadStatus === "CONVERTED").length,
    stalled: allLeads.filter((l) => {
      if (!l.lastActionAt) return true
      const days = Math.floor(
        (Date.now() - new Date(l.lastActionAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      return days > 14 && l.leadStatus !== "CONVERTED" && l.leadStatus !== "LOST"
    }).length,
  }

  const sources = await prisma.lead.findMany({
    where: { userId: session.user.id },
    select: { source: true },
    distinct: ["source"],
  })

  return (
    <div className="space-y-6">
      <LeadsHeader />
      <LeadsKPIs kpis={kpis} />
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
        sources={sources.map((s) => s.source).filter(Boolean) as string[]}
      />
      <LeadsTable />
    </div>
  )
}
