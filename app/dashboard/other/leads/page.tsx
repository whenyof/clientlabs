import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LeadsTable } from "./components/LeadsTable"
import { CreateLeadButton } from "./components/CreateLeadButton"
import { LeadsKPIs } from "./components/LeadsKPIs"
import { LeadsFilters } from "./components/LeadsFilters"
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
  const leads = await prisma.lead.findMany({
    where,
    orderBy,
    take: 100,
  })

  const allLeads = await prisma.lead.findMany({
    where: { userId: session.user.id },
    select: { leadStatus: true, temperature: true },
  })

  const kpis = {
    total: allLeads.length,
    hot: allLeads.filter((l) => l.temperature === "HOT").length,
    warm: allLeads.filter((l) => l.temperature === "WARM").length,
    cold: allLeads.filter((l) => l.temperature === "COLD").length,
    converted: allLeads.filter((l) => l.leadStatus === "CONVERTED").length,
    lost: allLeads.filter((l) => l.leadStatus === "LOST").length,
  }

  const sources = await prisma.lead.findMany({
    where: { userId: session.user.id },
    select: { source: true },
    distinct: ["source"],
  })

  /* ---------------- RENDER ---------------- */
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Leads</h1>
          <p className="text-sm text-white/60">
            Gestiona y convierte contactos en oportunidades
          </p>
        </div>
        <CreateLeadButton />
      </div>

      <LeadsKPIs kpis={kpis} />

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