export const dynamic = "force-dynamic"
export const maxDuration = 30

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getCachedData, setCachedData } from "@/lib/redis-cache"

type PeriodKey = "7d" | "30d" | "MTD" | "QTD" | "YTD"
const VALID_PERIODS: PeriodKey[] = ["7d", "30d", "MTD", "QTD", "YTD"]

function getPeriodRange(period: PeriodKey) {
  const now = new Date()
  let from: Date
  if (period === "7d") {
    from = new Date(now.getTime() - 7 * 86_400_000)
  } else if (period === "30d") {
    from = new Date(now.getTime() - 30 * 86_400_000)
  } else if (period === "QTD") {
    from = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
  } else if (period === "YTD") {
    from = new Date(now.getFullYear(), 0, 1)
  } else {
    from = new Date(now.getFullYear(), now.getMonth(), 1)
  }
  const to = now
  const duration = to.getTime() - from.getTime()
  return {
    from,
    to,
    prevFrom: new Date(from.getTime() - duration),
    prevTo: new Date(from.getTime() - 1),
  }
}

// Unwraps a settled result; logs + returns fallback on rejection.
function ok<T>(r: PromiseSettledResult<T>, fallback: T, label: string): T {
  if (r.status === "rejected") {
    console.error(`[dashboard/summary] ${label}:`, r.reason)
    return fallback
  }
  return r.value
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const userId = session.user.id
  const raw = req.nextUrl.searchParams.get("period") ?? "MTD"
  const period = (VALID_PERIODS.includes(raw as PeriodKey) ? raw : "MTD") as PeriodKey

  const cacheKey = `dashboard-v6-${userId}-${period}`
  const cached = await getCachedData(cacheKey)
  if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } })

  const { from, to, prevFrom, prevTo } = getPeriodRange(period)
  const now = new Date()
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000)

  try {
    const results = await Promise.allSettled([
      /* 0  */ prisma.lead.count({ where: { userId, leadStatus: { in: ["QUALIFIED", "CONTACTED"] } } }),
      /* 1  */ prisma.client.count({ where: { userId } }),
      /* 2  */ prisma.invoice.aggregate({ where: { userId, status: { in: ["SENT", "OVERDUE"] }, type: "CUSTOMER" }, _sum: { total: true } }),
      /* 3  */ prisma.invoice.count({ where: { userId, status: { in: ["SENT", "OVERDUE"] }, type: "CUSTOMER" } }),
      /* 4  */ prisma.invoice.count({ where: { userId, status: "OVERDUE", type: "CUSTOMER" } }),
      /* 5  */ prisma.task.findMany({
        where: { userId, priority: "HIGH", status: { not: "DONE" } },
        orderBy: { dueDate: "asc" },
        take: 5,
        select: { id: true, title: true, dueDate: true, priority: true, type: true },
      }),
      /* 6  */ prisma.task.count({ where: { userId, dueDate: { lt: now }, status: { not: "DONE" } } }),
      /* 7  */ prisma.invoice.aggregate({ where: { userId, status: "PAID", type: "CUSTOMER", paidAt: { gte: from, lte: to } }, _sum: { total: true } }),
      /* 8  */ prisma.invoice.aggregate({ where: { userId, status: "PAID", type: "CUSTOMER", paidAt: { gte: prevFrom, lte: prevTo } }, _sum: { total: true } }),
      /* 9  */ prisma.lead.count({ where: { userId, createdAt: { gte: from, lte: to } } }),
      /* 10 */ prisma.lead.count({ where: { userId, createdAt: { gte: prevFrom, lte: prevTo } } }),
      /* 11 */ prisma.client.count({ where: { userId, createdAt: { gte: from, lte: to } } }),
      /* 12 */ prisma.client.count({ where: { userId, createdAt: { gte: prevFrom, lte: prevTo } } }),
      /* 13 */ prisma.lead.count({ where: { userId, convertedAt: { gte: from, lte: to } } }),
      /* 14 */ prisma.lead.count({ where: { userId, convertedAt: { gte: prevFrom, lte: prevTo } } }),
      /* 15 */ prisma.lead.groupBy({
        by: ["leadStatus"],
        where: { userId },
        _count: true,
        _sum: { estimatedValue: true },
      }),
      /* 16 */ prisma.lead.groupBy({
        by: ["source"],
        where: { userId },
        _count: true,
      }),
      /* 17 */ prisma.lead.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, leadStatus: true, createdAt: true },
      }),
      /* 18 */ prisma.lead.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, name: true, createdAt: true } }),
      /* 19 */ prisma.invoice.findMany({ where: { userId, status: "PAID" }, orderBy: { updatedAt: "desc" }, take: 3, select: { id: true, number: true, total: true, updatedAt: true } }),
      /* 20 */ prisma.task.findMany({ where: { userId, status: "DONE" }, orderBy: { updatedAt: "desc" }, take: 2, select: { id: true, title: true, updatedAt: true } }),
      /* 21 */ prisma.$queryRaw<Array<{ day: Date; cnt: number }>>`
        SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::int AS cnt
        FROM "Lead" WHERE "userId" = ${userId} AND "createdAt" >= ${thirtyDaysAgo}
        GROUP BY 1 ORDER BY 1 ASC`,
      /* 22 */ prisma.$queryRaw<Array<{ day: Date; cnt: number }>>`
        SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::int AS cnt
        FROM "Client" WHERE "userId" = ${userId} AND "createdAt" >= ${thirtyDaysAgo}
        GROUP BY 1 ORDER BY 1 ASC`,
      /* 23 */ prisma.$queryRaw<Array<{ day: Date; cnt: number }>>`
        SELECT DATE_TRUNC('day', "convertedAt") AS day, COUNT(*)::int AS cnt
        FROM "Lead" WHERE "userId" = ${userId} AND "convertedAt" >= ${thirtyDaysAgo}
        GROUP BY 1 ORDER BY 1 ASC`,
      /* 24 */ prisma.$queryRaw<Array<{ day: Date; rev: number }>>`
        SELECT DATE_TRUNC('day', "paidAt") AS day, COALESCE(SUM(CAST(total AS FLOAT)), 0) AS rev
        FROM "Invoice"
        WHERE "userId" = ${userId} AND "status" = 'PAID' AND "type" = 'CUSTOMER'
          AND "paidAt" >= ${thirtyDaysAgo}
        GROUP BY 1 ORDER BY 1 ASC`,
      /* 25-29 — top-3 leads per stage, scoped by userId (Prisma handles tenant + typing) */
      prisma.lead.findMany({ where: { userId, leadStatus: "NEW"       }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, name: true, client: { select: { companyName: true } } } }),
      prisma.lead.findMany({ where: { userId, leadStatus: "CONTACTED" }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, name: true, client: { select: { companyName: true } } } }),
      prisma.lead.findMany({ where: { userId, leadStatus: "QUALIFIED" }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, name: true, client: { select: { companyName: true } } } }),
      prisma.lead.findMany({ where: { userId, leadStatus: "CONVERTED" }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, name: true, client: { select: { companyName: true } } } }),
      prisma.lead.findMany({ where: { userId, leadStatus: "LOST"      }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, name: true, client: { select: { companyName: true } } } }),
      /* 30 — total PAID invoices from clients of CONVERTED leads (Prisma nested filter) */
      prisma.invoice.aggregate({
        where: {
          userId,
          status: "PAID",
          type: "CUSTOMER",
          Client: { leads: { some: { userId, leadStatus: "CONVERTED" } } },
        },
        _sum: { total: true },
      }),
      /* 31 — clients with recent invoices for dynamic health bar classification */
      prisma.client.findMany({
        where: { userId },
        select: {
          totalSpent: true,
          createdAt: true,
          Invoice: {
            where: { type: "CUSTOMER" },
            orderBy: { createdAt: "desc" },
            select: { status: true, createdAt: true },
          },
        },
      }),
    ])

    const zeroAgg = { _sum: { total: null } }
    const leadsActive          = ok(results[0],  0,       "leadsActive")
    const clientsActive        = ok(results[1],  0,       "clientsActive")
    const pendingInvoices      = ok(results[2],  zeroAgg, "pendingInvoices")
    const pendingCount         = ok(results[3],  0,       "pendingCount")
    const invoicesOverdue      = ok(results[4],  0,       "invoicesOverdue")
    const tasksHighList        = ok(results[5],  [],      "tasksHighList")
    const tasksOverdue         = ok(results[6],  0,       "tasksOverdue")
    const invoicedCurrent      = ok(results[7],  zeroAgg, "invoicedCurrent")
    const invoicedPrev         = ok(results[8],  zeroAgg, "invoicedPrev")
    const leadsCreatedCurrent  = ok(results[9],  0,       "leadsCreatedCurrent")
    const leadsCreatedPrev     = ok(results[10], 0,       "leadsCreatedPrev")
    const clientsCreatedCurrent= ok(results[11], 0,       "clientsCreatedCurrent")
    const clientsCreatedPrev   = ok(results[12], 0,       "clientsCreatedPrev")
    const conversionsCurrent   = ok(results[13], 0,       "conversionsCurrent")
    const conversionsPrev      = ok(results[14], 0,       "conversionsPrev")
    const pipelineGroups       = ok(results[15], [],      "pipelineGroups")
    const sourcesRaw           = ok(results[16], [],      "sourcesRaw")
    const leadsRecent          = ok(results[17], [],      "leadsRecent")
    const activityLeads        = ok(results[18], [],      "activityLeads")
    const activityInvoices     = ok(results[19], [],      "activityInvoices")
    const activityTasks        = ok(results[20], [],      "activityTasks")
    const leadsSparkRaw        = ok(results[21], [],      "sparkLeads")
    const clientsSparkRaw      = ok(results[22], [],      "sparkClients")
    const conversionsSparkRaw  = ok(results[23], [],      "sparkConversions")
    const revenueSparkRaw      = ok(results[24], [],      "sparkRevenue")
    type StageLead = { id: string; name: string | null; client: { companyName: string | null } | null }
    const stageNew       = ok(results[25], [] as StageLead[], "stageNEW")
    const stageContacted = ok(results[26], [] as StageLead[], "stageCONTACTED")
    const stageQualified = ok(results[27], [] as StageLead[], "stageQUALIFIED")
    const stageConverted = ok(results[28], [] as StageLead[], "stageCONVERTED")
    const stageLost      = ok(results[29], [] as StageLead[], "stageLOST")
    const wonAgg         = ok(results[30], zeroAgg,           "wonRevenue")

    // ── Client health bar (dynamic, per-run classification) ─────────────────
    type HealthClient = { totalSpent: number; createdAt: Date; Invoice: Array<{ status: string; createdAt: Date }> }
    const clientsForHealth = ok(results[31], [] as HealthClient[], "clientsHealth")

    const SIXTY_DAYS_MS = 60 * 86_400_000
    const THIRTY_DAYS_MS = 30 * 86_400_000
    let healthChurnAlto = 0, healthEnRiesgo = 0
    const healthyList: { totalSpent: number }[] = []

    for (const c of clientsForHealth) {
      const latestDate = c.Invoice.length > 0
        ? new Date(c.Invoice[0].createdAt)
        : new Date(c.createdAt)
      const elapsed = now.getTime() - latestDate.getTime()
      const hasOverdue = c.Invoice.some((i) => i.status === "OVERDUE")

      if (elapsed >= SIXTY_DAYS_MS) {
        healthChurnAlto++
      } else if (hasOverdue || elapsed >= THIRTY_DAYS_MS) {
        healthEnRiesgo++
      } else {
        healthyList.push({ totalSpent: c.totalSpent })
      }
    }

    healthyList.sort((a, b) => b.totalSpent - a.totalSpent)
    const hasRevenue = healthyList.some((c) => c.totalSpent > 0)
    const champBase  = Math.max(1, Math.floor(healthyList.length * 0.2))
    const champNum   = hasRevenue ? Math.min(champBase, healthyList.length) : 0
    const healthBar  = {
      champions:  champNum,
      saludables: healthyList.length - champNum,
      enRiesgo:   healthEnRiesgo,
      churnAlto:  healthChurnAlto,
    }

    // Build 30-day sparkline arrays (oldest → newest, UTC day keys)
    const toKey = (d: Date | string) => { const dt = new Date(d); return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth()+1).padStart(2,"0")}-${String(dt.getUTCDate()).padStart(2,"0")}` }
    const buildSpark30 = (raw: Array<{ day: Date; cnt?: number; rev?: number }>, field: "cnt" | "rev") => {
      const m = new Map(raw.map((r) => [toKey(r.day), Number((r as Record<string, unknown>)[field] ?? 0)]))
      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now); d.setUTCDate(d.getUTCDate() - (29 - i))
        return m.get(toKey(d)) ?? 0
      })
    }
    const sparklines = {
      leads:       buildSpark30(leadsSparkRaw as Array<{ day: Date; cnt: number }>,       "cnt"),
      clients:     buildSpark30(clientsSparkRaw as Array<{ day: Date; cnt: number }>,     "cnt"),
      conversions: buildSpark30(conversionsSparkRaw as Array<{ day: Date; cnt: number }>, "cnt"),
      revenue:     buildSpark30(revenueSparkRaw as Array<{ day: Date; rev: number }>,     "rev"),
    }

    // 12-month revenue chart via raw SQL (always trailing 12m, independent of period)
    type ChartRow = { month: Date | string; revenue: number | string }
    let revenueChartRaw: ChartRow[] = []
    try {
      revenueChartRaw = await prisma.$queryRaw<ChartRow[]>`
        SELECT
          DATE_TRUNC('month', "paidAt") AS month,
          COALESCE(SUM(CAST(total AS FLOAT)), 0) AS revenue
        FROM "Invoice"
        WHERE "userId" = ${userId}
          AND "status" = 'PAID'
          AND "type" = 'CUSTOMER'
          AND "paidAt" IS NOT NULL
          AND "paidAt" >= ${twelveMonthsAgo}
        GROUP BY DATE_TRUNC('month', "paidAt")
        ORDER BY month ASC
      `
    } catch (err) {
      console.error("[dashboard/summary] revenueChart:", err)
    }

    // Build pipeline map
    const pipelineMap = new Map<string, { count: number; estimatedValue: number }>()
    for (const row of pipelineGroups) {
      pipelineMap.set(row.leadStatus, {
        count: typeof row._count === "number" ? row._count : 0,
        estimatedValue: Number(row._sum.estimatedValue ?? 0),
      })
    }

    type FlatLead = { id: string; name: string | null; companyName: string | null }
    const flat = (raw: StageLead[]): FlatLead[] =>
      raw.map((l) => ({ id: l.id, name: l.name, companyName: l.client?.companyName ?? null }))
    const pipelineLeadsMap = new Map<string, FlatLead[]>([
      ["NEW",       flat(stageNew)],
      ["CONTACTED", flat(stageContacted)],
      ["QUALIFIED", flat(stageQualified)],
      ["CONVERTED", flat(stageConverted)],
      ["LOST",      flat(stageLost)],
    ])
    const wonRevenue = Number(wonAgg._sum.total ?? 0)

    const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"] as const
    const pipeline = STATUSES.map((status) => ({
      status,
      count: pipelineMap.get(status)?.count ?? 0,
      estimatedValue: pipelineMap.get(status)?.estimatedValue ?? 0,
      leads: pipelineLeadsMap.get(status) ?? [],
      wonRevenue: status === "CONVERTED" ? wonRevenue : undefined,
    }))

    const leadsByStatus = {
      NEW:       pipelineMap.get("NEW")?.count ?? 0,
      CONTACTED: pipelineMap.get("CONTACTED")?.count ?? 0,
      QUALIFIED: pipelineMap.get("QUALIFIED")?.count ?? 0,
      CONVERTED: pipelineMap.get("CONVERTED")?.count ?? 0,
      LOST:      pipelineMap.get("LOST")?.count ?? 0,
    }

    // Build 12-month chart filled with 0 for empty months
    const chartMap = new Map<string, number>()
    for (const row of revenueChartRaw) {
      const d = new Date(row.month)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      chartMap.set(key, Number(row.revenue))
    }
    const MONTHS_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    const revenueChart = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      return { month: MONTHS_ES[d.getMonth()], revenue: chartMap.get(key) ?? 0 }
    })

    const leadSources = sourcesRaw
      .filter((r) => r.source)
      .map((r) => ({ source: r.source as string, count: typeof r._count === "number" ? r._count : 0 }))
      .sort((a, b) => b.count - a.count)

    const result = {
      period,
      kpis: {
        leadsActive,
        clientsActive,
        pendingCobro: Number(pendingInvoices._sum.total ?? 0),
        pendingCobroCount: pendingCount,
        tasksHighPriorityCount: tasksHighList.length,
        tasksOverdue,
        invoicesOverdue,
        invoicedCurrent: Number(invoicedCurrent._sum.total ?? 0),
        invoicedPrev:    Number(invoicedPrev._sum.total ?? 0),
        leadsCreatedCurrent,
        leadsCreatedPrev,
        clientsCreatedCurrent,
        clientsCreatedPrev,
        conversionsCurrent,
        conversionsPrev,
      },
      leadsByStatus,
      pipeline,
      revenueChart,
      leadSources,
      leadsRecent,
      tasksHighPriority: tasksHighList,
      activityFeed: {
        leads:    activityLeads,
        invoices: activityInvoices,
        tasks:    activityTasks,
      },
      sparklines,
      healthBar,
      meta: {
        userName:    session.user.name ?? "",
        currentDate: now.toISOString(),
      },
    }

    await setCachedData(cacheKey, result, 60)
    return NextResponse.json(result)
  } catch (err) {
    console.error("[GET /api/dashboard/summary]:", err)
    return NextResponse.json({ error: "Error al cargar datos" }, { status: 500 })
  }
}
