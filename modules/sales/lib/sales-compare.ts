import type { Sale } from "../types"

function amount(s: Sale): number {
  return Number(s.amount ?? s.total ?? 0)
}

/**
 * Variation % between current and previous. Returns null when previous is 0 and current > 0 (show "—").
 * Never returns NaN.
 */
function variationPct(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? null : 0
  return Math.round(((current - previous) / previous) * 100)
}

export type PeriodCompareMetrics = {
  revenue: number
  revenuePrev: number
  revenueVarPct: number | null
  count: number
  countPrev: number
  countVarPct: number | null
  avgTicket: number
  avgTicketPrev: number
  avgTicketVarPct: number | null
  growthPct: number | null
}

/**
 * Compare current period vs previous period (same length). Safe for 0 sales in either period.
 */
export function comparePeriods(
  currentSales: Sale[],
  previousSales: Sale[]
): PeriodCompareMetrics {
  const curRevenue = currentSales.reduce((a, s) => a + amount(s), 0)
  const prevRevenue = previousSales.reduce((a, s) => a + amount(s), 0)
  const curCount = currentSales.length
  const prevCount = previousSales.length
  const curAvg = curCount > 0 ? curRevenue / curCount : 0
  const prevAvg = prevCount > 0 ? prevRevenue / prevCount : 0

  return {
    revenue: curRevenue,
    revenuePrev: prevRevenue,
    revenueVarPct: variationPct(curRevenue, prevRevenue),
    count: curCount,
    countPrev: prevCount,
    countVarPct: variationPct(curCount, prevCount),
    avgTicket: curAvg,
    avgTicketPrev: prevAvg,
    avgTicketVarPct: prevAvg === 0 ? (curAvg > 0 ? null : 0) : variationPct(curAvg, prevAvg),
    growthPct: variationPct(curRevenue, prevRevenue),
  }
}
