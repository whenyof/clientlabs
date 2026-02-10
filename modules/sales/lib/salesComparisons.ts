/**
 * Sales range comparisons: current vs previous period, year-ago, historical average.
 * Pure functions over sales array. Reusable for KPIs and reporting.
 */

import type { Sale } from "../types"
import {
  filterSalesByRange,
  getPreviousRangeFromRange,
  getSamePeriodLastYear,
  parseSaleDate,
} from "../utils"

export type RangeAggregate = {
  revenue: number
  count: number
  ticket: number
}

export type RangeComparison = {
  current: RangeAggregate
  previous: RangeAggregate
  yearAgo: RangeAggregate | null
  average: RangeAggregate
}

/**
 * percentageChange(current, previous).
 * If previous === 0 returns null (avoid division by zero).
 */
export function percentageChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null
  return Math.round(((current - previous) / previous) * 100)
}

function amount(s: Sale): number {
  return Number(s.amount ?? s.total ?? 0)
}

/**
 * Aggregate sales in [from, to]: revenue, count, avg ticket.
 */
export function aggregateRange(sales: Sale[], from: Date, to: Date): RangeAggregate {
  const inRange = filterSalesByRange(sales, from, to)
  const revenue = inRange.reduce((sum, s) => sum + amount(s), 0)
  const count = inRange.length
  const ticket = count > 0 ? revenue / count : 0
  return {
    revenue: Number.isFinite(revenue) ? revenue : 0,
    count,
    ticket: Number.isFinite(ticket) ? ticket : 0,
  }
}

/**
 * Historical average: slice timeline into consecutive periods of same length as (from, to),
 * aggregate each period, then average. Returns null if fewer than 1 full period of data.
 */
function getHistoricalPeriodsAverage(
  sales: Sale[],
  from: Date,
  to: Date
): RangeAggregate | null {
  const sorted = sales
    .map((s) => parseSaleDate(s.saleDate))
    .filter((d): d is Date => d != null && !isNaN(d.getTime()))
  if (sorted.length === 0) return null
  const minTs = Math.min(...sorted.map((d) => d.getTime()))
  const maxTs = Math.max(...sorted.map((d) => d.getTime()))
  const periodLen = to.getTime() - from.getTime() + 1
  const rangeMs = maxTs - minTs + 1
  if (periodLen <= 0 || rangeMs < periodLen) return null

  const numPeriods = Math.floor(rangeMs / periodLen)
  if (numPeriods < 1) return null

  const periods: RangeAggregate[] = []
  for (let i = 0; i < numPeriods; i++) {
    const periodStart = new Date(minTs + i * periodLen)
    const periodEnd = new Date(minTs + (i + 1) * periodLen - 1)
    periods.push(aggregateRange(sales, periodStart, periodEnd))
  }

  const n = periods.length
  const sumRevenue = periods.reduce((a, p) => a + p.revenue, 0)
  const sumCount = periods.reduce((a, p) => a + p.count, 0)
  const sumTicket = periods.reduce((a, p) => a + p.ticket, 0)
  return {
    revenue: n > 0 ? sumRevenue / n : 0,
    count: n > 0 ? sumCount / n : 0,
    ticket: n > 0 ? sumTicket / n : 0,
  }
}

/**
 * Full comparison for a given range: current, previous equivalent, same period last year, historical average.
 * Uses existing utils for ranges. Safe: no NaN, null when no year-ago data.
 */
export function computeRangeComparison(
  sales: Sale[],
  from: Date,
  to: Date
): RangeComparison {
  const current = aggregateRange(sales, from, to)
  const { from: prevFrom, to: prevTo } = getPreviousRangeFromRange(from, to)
  const previous = aggregateRange(sales, prevFrom, prevTo)
  const { from: yoyFrom, to: yoyTo } = getSamePeriodLastYear(from, to)
  const yearAgoAgg = aggregateRange(sales, yoyFrom, yoyTo)
  const yearAgo =
    yearAgoAgg.revenue > 0 || yearAgoAgg.count > 0 ? yearAgoAgg : null
  const average = getHistoricalPeriodsAverage(sales, from, to) ?? {
    revenue: 0,
    count: 0,
    ticket: 0,
  }

  return {
    current,
    previous,
    yearAgo,
    average,
  }
}
