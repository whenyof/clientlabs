import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LeadsTable } from "@/modules/leads/components/LeadsTable"
import { CreateLeadButton } from "@/modules/leads/components/CreateLeadButton"
import { LeadsKPIsSimple } from "@/modules/leads/components/LeadsKPIsSimple"
import { WorkViews } from "@/modules/leads/components/WorkViews"
import { LeadsFilters } from "@/modules/leads/components/LeadsFilters"
import { ImportHistoryPanel } from "@/modules/leads/components/ImportHistoryPanel"
import { AutomationsButton } from "@/modules/leads/components/AutomationsButton"
import { ConnectWebButton } from "@/modules/leads/components/ConnectWebButton"
import { getSectorConfigByPath } from "@/config/sectors"
import { Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { LeadStatus, LeadTemp } from "@prisma/client"

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
  tags?: string
  reminderFilter?: string
  dateFilter?: string
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

  /* ---------------- WHERE (simplified) ---------------- */
  const where: any = {
    userId: session.user.id,
  }

  /* ---------------- SORT (simplified) ---------------- */
  const orderBy: any = { createdAt: "desc" }

  /* ---------------- DATA ---------------- */
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" }
  })
  
  console.log("DEBUG ALL LEADS:", leads.length)
  console.log("DEBUG ALL LEADS DATA:", leads)

  console.log("[dashboard] user:", session.user.id)
  console.log("[dashboard] leads:", leads.length)

  const allLeads = await prisma.lead.findMany({
    where: { userId: session.user.id },
    select: { leadStatus: true, temperature: true, lastActionAt: true, metadata: true, tags: true, createdAt: true },
  })

  const kpis = {
    total: allLeads.length,
    hot: allLeads.filter((l) => l.temperature === "HOT").length,
    warm: allLeads.filter((l) => l.temperature === "WARM").length,
    cold: allLeads.filter((l) => l.temperature === "COLD").length,
    converted: allLeads.filter((l) => l.leadStatus === "CONVERTED").length,
    lost: allLeads.filter((l) => l.leadStatus === "LOST").length,
    stale: allLeads.filter((l) => {
      if (!l.lastActionAt) return false
      const daysSince = Math.floor((Date.now() - new Date(l.lastActionAt).getTime()) / (1000 * 60 * 60 * 24))
      return daysSince > 14 && l.leadStatus !== "CONVERTED" && l.leadStatus !== "LOST"
    }).length,
    remindersToday: allLeads.filter((l) => {
      const metadata = (l.metadata as any) || {}
      const reminder = metadata.reminder
      if (!reminder || l.leadStatus === "CONVERTED" || l.leadStatus === "LOST") return false
      const reminderDate = new Date(reminder.date)
      const today = new Date()
      return reminderDate.toDateString() === today.toDateString()
    }).length,
    remindersWeek: allLeads.filter((l) => {
      const metadata = (l.metadata as any) || {}
      const reminder = metadata.reminder
      if (!reminder || l.leadStatus === "CONVERTED" || l.leadStatus === "LOST") return false
      const reminderDate = new Date(reminder.date)
      const today = new Date()
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      return reminderDate >= today && reminderDate <= weekFromNow
    }).length,
    remindersOverdue: allLeads.filter((l) => {
      const metadata = (l.metadata as any) || {}
      const reminder = metadata.reminder
      if (!reminder || l.leadStatus === "CONVERTED" || l.leadStatus === "LOST") return false
      const reminderDate = new Date(reminder.date)
      return reminderDate < new Date()
    }).length,
  }

  // Calculate date filter counts
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

  const dayOfWeek = now.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6, 23, 59, 59)

  const dateFilterCounts = {
    today: allLeads.filter(l => {
      if (!l.createdAt) return false
      const created = new Date(l.createdAt)
      return created >= startOfToday && created <= endOfToday
    }).length,
    week: allLeads.filter(l => {
      if (!l.createdAt) return false
      const created = new Date(l.createdAt)
      return created >= startOfWeek && created <= endOfWeek
    }).length,
  }

  const sources = await prisma.lead.findMany({
    where: { userId: session.user.id },
    select: { source: true },
    distinct: ["source"],
  })

  // Get all unique tags
  const allLeadsWithTags = await prisma.lead.findMany({
    where: { userId: session.user.id },
    select: { tags: true },
  })
  const allTags = Array.from(new Set(allLeadsWithTags.flatMap(l => l.tags || []))).sort()

  // Detect import batches from tags
  const batchTags = allTags.filter(tag => tag.startsWith("batch:"))
  const importBatches = batchTags.map(batchTag => {
    const date = batchTag.replace("batch:", "")
    const batchLeads = allLeads.filter(l => l.tags?.includes(batchTag))

    // Detect type from tags
    let type: "csv" | "excel" | "unknown" = "unknown"
    const hasCSV = batchLeads.some(l => l.tags?.includes("csv"))
    const hasExcel = batchLeads.some(l => l.tags?.includes("excel"))
    if (hasCSV) type = "csv"
    else if (hasExcel) type = "excel"

    return {
      date,
      type,
      totalLeads: batchLeads.length,
      batchTag,
    }
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Most recent first

  const config = getSectorConfigByPath('/dashboard/other/leads')
  const { labels } = config

  /* ---------------- RENDER ---------------- */
  return (
    <div className="space-y-8">
      {/* Header: título compacto + acciones (mismo patrón que Providers) */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight truncate">
            {labels.leads.pageTitle}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5 truncate max-w-xl">
            {labels.leads.pageSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          <ConnectWebButton />
          <AutomationsButton />
          <CreateLeadButton />
        </div>
      </div>

      {/* KPIs: máximo 4, misma estética que Providers */}
      <LeadsKPIsSimple kpis={kpis} />

      {/* Import History */}
      {importBatches.length > 0 && (
        <ImportHistoryPanel batches={importBatches} />
      )}

      <LeadsFilters
        currentFilters={{
          status: searchParams.status || "all",
          temperature: searchParams.temperature || "all",
          source: searchParams.source || "all",
          search: searchParams.search || "",
          sortBy: searchParams.sortBy || "score",
          sortOrder: searchParams.sortOrder || "desc",
          showConverted: searchParams.showConverted === "true",
          showLost: searchParams.showLost === "true",
        }}
        sources={sources.map((s) => s.source).filter(Boolean) as string[]}
      />

      <LeadsTable
        leads={leads}
        currentSort={{
          sortBy: searchParams.sortBy || "score",
          sortOrder: (searchParams.sortOrder || "desc") as "asc" | "desc",
        }}
      />
    </div>
  )
}