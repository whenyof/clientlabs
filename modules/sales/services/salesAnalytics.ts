/**
 * Motor central de analítica de ventas.
 * Calcula métricas actuales, periodo anterior y mismo periodo año pasado.
 * Alimenta: KPIs, insights, narrativa, simulador, export ejecutivo.
 * Solo ventas válidas (PAGADO / PAID). Tres consultas Prisma por ejecución.
 */

import { prisma } from "@/lib/prisma"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MetricComparison = {
  current: number
  previous: number
  yoy: number
  growthVsPrevious: number | null
  growthYoY: number | null
}

export type SalesComparisonsResult = {
  revenue: MetricComparison
  salesCount: MetricComparison
  avgTicket: MetricComparison
}

export type GetSalesComparisonsParams = {
  userId: string
  from: Date
  to: Date
}

/** Estado de venta considerado válido para métricas (pagado/completado). */
const PAID_STATUSES = ["PAGADO", "PAID"] as const

// ---------------------------------------------------------------------------
// Helpers: fechas
// ---------------------------------------------------------------------------

/**
 * Calcula el periodo anterior de la misma duración.
 * prevTo = from - 1 ms, prevFrom = prevTo - duration.
 */
function getPreviousPeriod(from: Date, to: Date): { from: Date; to: Date } {
  const durationMs = to.getTime() - from.getTime()
  const prevTo = new Date(from.getTime() - 1)
  const prevFrom = new Date(prevTo.getTime() - durationMs)
  return { from: prevFrom, to: prevTo }
}

/**
 * Mismo intervalo en el año anterior (YoY).
 */
function getYoYPeriod(from: Date, to: Date): { from: Date; to: Date } {
  return {
    from: new Date(from.getFullYear() - 1, from.getMonth(), from.getDate(), from.getHours(), from.getMinutes(), from.getSeconds(), from.getMilliseconds()),
    to: new Date(to.getFullYear() - 1, to.getMonth(), to.getDate(), to.getHours(), to.getMinutes(), to.getSeconds(), to.getMilliseconds()),
  }
}

/**
 * Crecimiento en porcentaje. Null si el denominador es 0.
 */
function growthPct(current: number, previous: number): number | null {
  if (previous === 0 || !Number.isFinite(current) || !Number.isFinite(previous)) return null
  return Math.round(((current - previous) / previous) * 100)
}

// ---------------------------------------------------------------------------
// Helpers: agregación Prisma
// ---------------------------------------------------------------------------

type PeriodAggregate = { revenue: number; count: number }

/**
 * Una sola consulta de agregación: suma de total y conteo por userId, rango de fechas y estado pagado.
 * Selecciona solo lo necesario; sin includes.
 */
async function aggregateSalesInPeriod(
  userId: string,
  from: Date,
  to: Date
): Promise<PeriodAggregate> {
  const result = await prisma.sale.aggregate({
    where: {
      userId,
      saleDate: { gte: from, lte: to },
      status: { in: [...PAID_STATUSES] },
    },
    _sum: { total: true },
    _count: true,
  })
  const revenue = result._sum.total ?? 0
  const count = result._count
  const safeRevenue = Number.isFinite(revenue) ? revenue : 0
  return { revenue: safeRevenue, count }
}

/**
 * Construye MetricComparison a partir de valores current, previous, yoy.
 */
function toMetricComparison(
  current: number,
  previous: number,
  yoy: number
): MetricComparison {
  return {
    current,
    previous,
    yoy,
    growthVsPrevious: growthPct(current, previous),
    growthYoY: growthPct(current, yoy),
  }
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Obtiene comparativas de ventas: periodo actual, anterior y mismo periodo año pasado.
 * Tres consultas Prisma (actual, previous, yoy). Solo ventas con status PAGADO/PAID.
 *
 * Preparado para ampliar con: revenue por cliente, por producto, cohortes, recurrencia.
 */
export async function getSalesComparisons(
  params: GetSalesComparisonsParams
): Promise<SalesComparisonsResult> {
  const { userId, from, to } = params
  const { from: prevFrom, to: prevTo } = getPreviousPeriod(from, to)
  const { from: yoyFrom, to: yoyTo } = getYoYPeriod(from, to)

  const [currentAgg, previousAgg, yoyAgg] = await Promise.all([
    aggregateSalesInPeriod(userId, from, to),
    aggregateSalesInPeriod(userId, prevFrom, prevTo),
    aggregateSalesInPeriod(userId, yoyFrom, yoyTo),
  ])

  const revenue = toMetricComparison(
    currentAgg.revenue,
    previousAgg.revenue,
    yoyAgg.revenue
  )

  const salesCount = toMetricComparison(
    currentAgg.count,
    previousAgg.count,
    yoyAgg.count
  )

  const avgTicketCurrent = currentAgg.count > 0 ? currentAgg.revenue / currentAgg.count : 0
  const avgTicketPrevious = previousAgg.count > 0 ? previousAgg.revenue / previousAgg.count : 0
  const avgTicketYoy = yoyAgg.count > 0 ? yoyAgg.revenue / yoyAgg.count : 0

  const avgTicket = toMetricComparison(
    Number.isFinite(avgTicketCurrent) ? avgTicketCurrent : 0,
    Number.isFinite(avgTicketPrevious) ? avgTicketPrevious : 0,
    Number.isFinite(avgTicketYoy) ? avgTicketYoy : 0
  )

  return {
    revenue,
    salesCount,
    avgTicket,
  }
}

// ---------------------------------------------------------------------------
// Puntos de extensión futura (no implementados)
// ---------------------------------------------------------------------------
//
// - revenueByClient(userId, from, to): Promise<Array<{ clientId/clientName, revenue }>>
// - revenueByProduct(userId, from, to): Promise<Array<{ product, revenue, count }>>
// - cohorts(userId, from, to): cohortes por mes de primera compra
// - recurrence(userId, from, to): tasa de recurrencia, clientes que repiten
//
// Misma base: getSalesComparisons + filtro status PAID + fechas. Reutilizar
// getPreviousPeriod / getYoYPeriod y aggregateSalesInPeriod o variantes con
// groupBy (clientId, product, etc.).
