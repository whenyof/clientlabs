import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LeadsTable } from "./components/LeadsTable"
import { CreateLeadButton } from "./components/CreateLeadButton"
import { LeadsKPIsSimple } from "./components/LeadsKPIsSimple"
import { WorkViews } from "./components/WorkViews"
import { LeadsFilters } from "./components/LeadsFilters"
import { ImportHistoryPanel } from "./components/ImportHistoryPanel"
import { AutomationsButton } from "./components/AutomationsButton"
import { ConnectWebButton } from "./components/ConnectWebButton"
import { Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { LeadStatus, LeadTemp } from "@prisma/client"

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

  /* ---------------- WHERE ---------------- */
  const where: any = {
    userId: session.user.id,
  }

  // Build leadStatus filter conditions
  const leadStatusConditions: any[] = []

  // Add explicit status filter if provided
  if (searchParams.status && searchParams.status !== "all") {
    leadStatusConditions.push({ leadStatus: searchParams.status as LeadStatus })
  }

  // Add exclusion filter for CONVERTED/LOST
  const excludeStatuses: LeadStatus[] = []
  if (searchParams.showConverted !== "true") excludeStatuses.push("CONVERTED")
  if (searchParams.showLost !== "true") excludeStatuses.push("LOST")

  if (excludeStatuses.length > 0) {
    leadStatusConditions.push({ leadStatus: { notIn: excludeStatuses } })
  }

  // Combine leadStatus conditions with AND
  if (leadStatusConditions.length > 0) {
    if (leadStatusConditions.length === 1) {
      // Single condition: apply directly
      Object.assign(where, leadStatusConditions[0])
    } else {
      // Multiple conditions: use AND
      where.AND = leadStatusConditions
    }
  }

  if (searchParams.temperature && searchParams.temperature !== "all") {
    where.temperature = searchParams.temperature as LeadTemp
  }

  if (searchParams.source && searchParams.source !== "all") {
    where.source = searchParams.source
  }

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      { email: { contains: searchParams.search, mode: "insensitive" } },
      { phone: { contains: searchParams.search, mode: "insensitive" } },
    ]
  }

  // Stale leads filter (>14 days without action)
  if (searchParams.stale === "true") {
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
    where.lastActionAt = { lt: fourteenDaysAgo }
    where.leadStatus = { notIn: ["CONVERTED", "LOST"] }
  }

  // Tags filter (multi-select)
  if (searchParams.tags) {
    const selectedTags = searchParams.tags.split(",").filter(Boolean)
    if (selectedTags.length > 0) {
      where.tags = { hasEvery: selectedTags }
    }
  }

  // Date filters (Hoy / Esta semana)
  if (searchParams.dateFilter) {
    const now = new Date()

    if (searchParams.dateFilter === "today") {
      // Today: from 00:00:00 to 23:59:59
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      }
    } else if (searchParams.dateFilter === "week") {
      // This week: from Monday 00:00 to Sunday 23:59:59
      const dayOfWeek = now.getDay()
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Monday is 1
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff, 0, 0, 0)
      const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6, 23, 59, 59)

      where.createdAt = {
        gte: monday,
        lte: sunday,
      }
    }
  }

  /* ---------------- SORT ---------------- */
  const sortBy = searchParams.sortBy || "score"
  const sortOrder = (searchParams.sortOrder || "desc") as "asc" | "desc"

  let orderBy: any = { score: "desc" }
  if (sortBy === "temperature") {
    orderBy = [{ temperature: sortOrder }, { score: "desc" }]
  } else if (sortBy === "score") {
    orderBy = { score: sortOrder }
  } else if (sortBy === "lastActionAt") {
    orderBy = { lastActionAt: sortOrder }
  } else if (sortBy === "createdAt") {
    orderBy = { createdAt: sortOrder }
  }

  /* ---------------- DATA ---------------- */
  let leads = await prisma.lead.findMany({
    where,
    orderBy,
    take: 100,
  })

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

  /* ---------------- RENDER ---------------- */
  return (
    <div className="space-y-6">
      {/* Strategic Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Pipeline de Oportunidades</h1>
          <p className="text-base text-white/60 max-w-2xl">
            Identifica, prioriza y convierte tus mejores oportunidades en clientes
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Connect Web Button - Blue/Cyan */}
          <ConnectWebButton />

          {/* Automations Button - Purple */}
          <AutomationsButton />

          {/* Create Lead Button - Primary */}
          <CreateLeadButton />
        </div>
      </div>

      {/* Main KPIs */}
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