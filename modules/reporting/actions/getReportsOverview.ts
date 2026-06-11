"use server"

import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

/**
 * Agregados REALES para el panel de Informes (alcance de lanzamiento).
 *
 * Solo métricas con fuente de datos real en Prisma, scoped por userId:
 *  - Ingresos = facturas PAID de tipo CUSTOMER por paidAt (misma definición
 *    que /api/dashboard/summary para que dashboard e informes cuadren).
 *  - Facturas emitidas / pagadas / vencidas + pendiente de cobro.
 *  - Leads creados / convertidos / tasa de conversión.
 *  - Clientes nuevos y totales. Proveedores activos y totales.
 *  - Serie mensual de ingresos (últimos 12 meses) y top clientes por ingresos.
 */

export type ReportsPeriod = "7d" | "30d" | "MTD" | "QTD" | "YTD"

export type ReportsOverview = {
  period: ReportsPeriod
  from: string
  to: string
  revenue: { current: number; previous: number }
  invoices: {
    issued: number
    paid: number
    overdue: number
    pendingAmount: number
    pendingCount: number
  }
  leads: {
    created: number
    converted: number
    conversionRate: number | null
    prevCreated: number
    prevConverted: number
  }
  clients: { total: number; newInPeriod: number; prevNew: number }
  providers: { total: number; active: number }
  monthlySeries: Array<{ month: string; revenue: number }>
  topClients: Array<{ name: string; revenue: number; count: number }>
}

function getPeriodRange(period: ReportsPeriod): { from: Date; to: Date } {
  const now = new Date()
  let from: Date
  if (period === "7d") from = new Date(now.getTime() - 7 * 86_400_000)
  else if (period === "30d") from = new Date(now.getTime() - 30 * 86_400_000)
  else if (period === "QTD") from = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
  else if (period === "YTD") from = new Date(now.getFullYear(), 0, 1)
  else from = new Date(now.getFullYear(), now.getMonth(), 1) // MTD
  return { from, to: now }
}

function getPreviousRange(period: ReportsPeriod, from: Date, to: Date): { from: Date; to: Date } {
  const span = to.getTime() - from.getTime()
  return { from: new Date(from.getTime() - span), to: new Date(from.getTime()) }
}

const VALID_PERIODS: ReportsPeriod[] = ["7d", "30d", "MTD", "QTD", "YTD"]

export async function getReportsOverview(rawPeriod: ReportsPeriod): Promise<ReportsOverview | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  const userId = session.user.id

  const period: ReportsPeriod = VALID_PERIODS.includes(rawPeriod) ? rawPeriod : "MTD"
  const { from, to } = getPeriodRange(period)
  const { from: prevFrom, to: prevTo } = getPreviousRange(period, from, to)
  const twelveMonthsAgo = new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1)

  const [
    revenueAgg,
    revenuePrevAgg,
    issuedCount,
    paidCount,
    overdueCount,
    pendingAgg,
    leadsCreated,
    leadsConverted,
    prevLeadsCreated,
    prevLeadsConverted,
    clientsTotal,
    clientsNew,
    clientsPrevNew,
    providersTotal,
    providersActive,
    monthlyRows,
    topClientRows,
  ] = await Promise.all([
    prisma.invoice.aggregate({
      where: { userId, type: "CUSTOMER", status: "PAID", paidAt: { gte: from, lte: to } },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: { userId, type: "CUSTOMER", status: "PAID", paidAt: { gte: prevFrom, lte: prevTo } },
      _sum: { total: true },
    }),
    prisma.invoice.count({
      where: { userId, type: "CUSTOMER", status: { in: ["SENT", "PAID", "OVERDUE"] }, issueDate: { gte: from, lte: to } },
    }),
    prisma.invoice.count({
      where: { userId, type: "CUSTOMER", status: "PAID", paidAt: { gte: from, lte: to } },
    }),
    prisma.invoice.count({ where: { userId, type: "CUSTOMER", status: "OVERDUE" } }),
    prisma.invoice.aggregate({
      where: { userId, type: "CUSTOMER", status: { in: ["SENT", "OVERDUE"] } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.lead.count({ where: { userId, createdAt: { gte: from, lte: to } } }),
    prisma.lead.count({ where: { userId, convertedAt: { gte: from, lte: to } } }),
    prisma.lead.count({ where: { userId, createdAt: { gte: prevFrom, lte: prevTo } } }),
    prisma.lead.count({ where: { userId, convertedAt: { gte: prevFrom, lte: prevTo } } }),
    prisma.client.count({ where: { userId } }),
    prisma.client.count({ where: { userId, createdAt: { gte: from, lte: to } } }),
    prisma.client.count({ where: { userId, createdAt: { gte: prevFrom, lte: prevTo } } }),
    prisma.provider.count({ where: { userId } }),
    prisma.provider.count({ where: { userId, status: "ACTIVE" } }),
    prisma.$queryRaw<Array<{ month: Date; revenue: unknown }>>`
      SELECT DATE_TRUNC('month', "paidAt") AS month, SUM("total") AS revenue
      FROM "Invoice"
      WHERE "userId" = ${userId}
        AND "status" = 'PAID' AND "type" = 'CUSTOMER'
        AND "paidAt" IS NOT NULL AND "paidAt" >= ${twelveMonthsAgo}
      GROUP BY DATE_TRUNC('month', "paidAt") ORDER BY month ASC
    `,
    prisma.invoice.groupBy({
      by: ["clientId"],
      where: { userId, type: "CUSTOMER", status: "PAID", paidAt: { gte: from, lte: to }, clientId: { not: null } },
      _sum: { total: true },
      _count: { _all: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
  ])

  // Serie mensual continua de 12 meses (rellena con 0 los meses sin cobros — vacío honesto)
  const revenueByMonth = new Map<string, number>()
  for (const row of monthlyRows) {
    const d = new Date(row.month)
    revenueByMonth.set(`${d.getFullYear()}-${d.getMonth()}`, Number(row.revenue ?? 0))
  }
  const monthlySeries: Array<{ month: string; revenue: number }> = []
  const monthFmt = new Intl.DateTimeFormat("es-ES", { month: "short" })
  for (let i = 11; i >= 0; i--) {
    const d = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1)
    monthlySeries.push({
      month: monthFmt.format(d).replace(".", ""),
      revenue: revenueByMonth.get(`${d.getFullYear()}-${d.getMonth()}`) ?? 0,
    })
  }

  // Nombres de los top clientes (scoped por userId)
  const topIds = topClientRows.map((r) => r.clientId).filter((id): id is string => !!id)
  const clientNames = topIds.length
    ? await prisma.client.findMany({
        where: { userId, id: { in: topIds } },
        select: { id: true, name: true, email: true },
      })
    : []
  const nameById = new Map(clientNames.map((c) => [c.id, c.name || c.email || "Cliente sin nombre"]))
  const topClients = topClientRows.map((r) => ({
    name: nameById.get(r.clientId as string) ?? "Cliente sin nombre",
    revenue: Number(r._sum.total ?? 0),
    count: r._count._all,
  }))

  const conversionRate = leadsCreated > 0 ? Number(((leadsConverted / leadsCreated) * 100).toFixed(1)) : null

  return {
    period,
    from: from.toISOString(),
    to: to.toISOString(),
    revenue: {
      current: Number(revenueAgg._sum.total ?? 0),
      previous: Number(revenuePrevAgg._sum.total ?? 0),
    },
    invoices: {
      issued: issuedCount,
      paid: paidCount,
      overdue: overdueCount,
      pendingAmount: Number(pendingAgg._sum.total ?? 0),
      pendingCount: pendingAgg._count,
    },
    leads: {
      created: leadsCreated,
      converted: leadsConverted,
      conversionRate,
      prevCreated: prevLeadsCreated,
      prevConverted: prevLeadsConverted,
    },
    clients: { total: clientsTotal, newInPeriod: clientsNew, prevNew: clientsPrevNew },
    providers: { total: providersTotal, active: providersActive },
    monthlySeries,
    topClients,
  }
}
