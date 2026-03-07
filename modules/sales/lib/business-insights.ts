/**
 * Sales business insights engine.
 * Transforms raw metrics into executive conclusions. Pure calculation, no I/O.
 */

import type { Sale } from "../types"
import { getDateKeyDay, parseSaleDate } from "../utils"

export type BusinessInsightType = "positive" | "warning" | "neutral"

export type BusinessInsight = {
  type: BusinessInsightType
  title: string
  description: string
  action?: string
}

export type SalesByDayPoint = {
  dateKey: string
  revenue: number
  count: number
}

export type SalesByClientPoint = {
  clientName: string
  revenue: number
}

export type SalesInsightsMetrics = {
  totalRevenue: number
  totalSales: number
  averageTicket: number
  revenuePreviousPeriod: number
  salesPreviousPeriod: number
  averageTicketPreviousPeriod: number
  daysRemainingInPeriod: number
  monthlyTarget: number
  currentMonthRevenue: number
  salesByDay: SalesByDayPoint[]
  salesByClient: SalesByClientPoint[]
}

const MAX_INSIGHTS = 5
const REVENUE_DROP_THRESHOLD = 0.92
const AVG_TICKET_DROP_THRESHOLD = 0.92
const CLIENT_CONCENTRATION_WARNING = 0.4
const TARGET_ON_TRACK_MIN = 0.85
const TARGET_AT_RISK_MAX = 0.5

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  return Math.round(((current - previous) / previous) * 100)
}

/**
 * Generates up to 5 executive insights from current sales metrics.
 * Uses only provided metrics; no invented data.
 */
export function generateSalesInsights(metrics: SalesInsightsMetrics): BusinessInsight[] {
  const out: BusinessInsight[] = []
  const {
    totalRevenue,
    totalSales,
    averageTicket,
    revenuePreviousPeriod,
    salesPreviousPeriod,
    averageTicketPreviousPeriod,
    daysRemainingInPeriod,
    monthlyTarget,
    currentMonthRevenue,
    salesByDay,
    salesByClient,
  } = metrics

  const revenueVar = pctChange(totalRevenue, revenuePreviousPeriod)
  const avgTicketVar = averageTicketPreviousPeriod > 0
    ? pctChange(averageTicket, averageTicketPreviousPeriod)
    : null

  // 1) Growth vs previous period
  if (revenuePreviousPeriod > 0 && totalRevenue > revenuePreviousPeriod && revenueVar !== null) {
    out.push({
      type: "positive",
      title: "Revenue up vs previous period",
      description: `Revenue is ${revenueVar}% higher than the previous period.`,
      action: "Maintain focus on top-performing channels.",
    })
  }

  // 2) Drop vs previous period
  if (
    revenuePreviousPeriod > 0 &&
    totalRevenue < revenuePreviousPeriod * REVENUE_DROP_THRESHOLD &&
    revenueVar !== null
  ) {
    out.push({
      type: "warning",
      title: "Revenue down vs previous period",
      description: `Revenue is ${Math.abs(revenueVar)}% lower than the previous period.`,
      action: "Review pipeline and recent lost deals.",
    })
  }

  // 3) Average ticket change
  if (averageTicketPreviousPeriod > 0 && avgTicketVar !== null) {
    if (avgTicketVar > 5) {
      out.push({
        type: "positive",
        title: "Higher average ticket",
        description: `Average ticket is ${avgTicketVar}% above the previous period.`,
        action: "Replicate upsell and positioning with other segments.",
      })
    } else if (avgTicketVar < -8) {
      out.push({
        type: "warning",
        title: "Lower average ticket",
        description: `Average ticket is ${Math.abs(avgTicketVar)}% below the previous period.`,
        action: "Check mix of products and discount levels.",
      })
    }
  }

  // 4) Client revenue concentration
  if (totalRevenue > 0 && salesByClient.length > 0) {
    const top = salesByClient[0]
    const share = top.revenue / totalRevenue
    if (share >= CLIENT_CONCENTRATION_WARNING) {
      const pct = Math.round(share * 100)
      out.push({
        type: "warning",
        title: "High client concentration",
        description: `Top client represents ${pct}% of revenue.`,
        action: "Diversify pipeline and secure additional key accounts.",
      })
    }
  }

  // 5) Best performing day
  if (salesByDay.length > 0) {
    const best = salesByDay.reduce((a, b) => (b.revenue > a.revenue ? b : a), salesByDay[0])
    if (best.revenue > 0) {
      out.push({
        type: "neutral",
        title: "Best day in period",
        description: `${best.dateKey} had the highest revenue (${best.count} sale${best.count !== 1 ? "s" : ""}).`,
        action: "Align promotions or capacity to similar days.",
      })
    }
  }

  // 6) Probability of reaching target (monthly)
  if (monthlyTarget > 0 && daysRemainingInPeriod >= 0) {
    const progress = currentMonthRevenue / monthlyTarget
    const remaining = Math.max(0, monthlyTarget - currentMonthRevenue)
    const dailyRequired = daysRemainingInPeriod > 0 ? remaining / daysRemainingInPeriod : 0

    if (progress >= 1) {
      out.push({
        type: "positive",
        title: "Monthly target reached",
        description: "Current month revenue already meets or exceeds target.",
        action: "Focus on next month pipeline.",
      })
    } else if (daysRemainingInPeriod > 0) {
      if (progress >= TARGET_ON_TRACK_MIN) {
        out.push({
          type: "positive",
          title: "On track for monthly target",
          description: `At current pace, target is within reach (${Math.round(progress * 100)}% so far).`,
          action: "Sustain run rate to close the gap.",
        })
      } else if (progress < TARGET_AT_RISK_MAX && daysRemainingInPeriod <= 15) {
        out.push({
          type: "warning",
          title: "Monthly target at risk",
          description: `${Math.round(progress * 100)}% of target with ${daysRemainingInPeriod} days left.`,
          action: `Requires ~${Math.round(dailyRequired)} per day to close.`,
        })
      }
    }
  }

  // Priority: warning > positive > neutral; cap at MAX_INSIGHTS
  const order: BusinessInsightType[] = ["warning", "positive", "neutral"]
  const sorted = [...out].sort(
    (a, b) => order.indexOf(a.type) - order.indexOf(b.type)
  )
  return sorted.slice(0, MAX_INSIGHTS)
}

const DEFAULT_MONTHLY_TARGET = 25_000

function amount(s: Sale): number {
  return Number((s as Sale & { amount?: number | null }).amount ?? s.total ?? 0)
}

/**
 * Builds metrics for the insights engine from dashboard data.
 * Use real values already calculated (e.g. from SalesView).
 */
export function buildSalesInsightsMetrics(
  currentPeriodSales: Sale[],
  previousPeriodSales: Sale[],
  opts: {
    currentMonthRevenue: number
    daysRemainingInMonth: number
    monthlyTarget?: number
    periodFrom?: Date
    periodTo?: Date
  }
): SalesInsightsMetrics {
  const totalRevenue = currentPeriodSales.reduce((a, s) => a + amount(s), 0)
  const totalSales = currentPeriodSales.length
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0
  const revenuePreviousPeriod = previousPeriodSales.reduce((a, s) => a + amount(s), 0)
  const salesPreviousPeriod = previousPeriodSales.length
  const averageTicketPreviousPeriod =
    salesPreviousPeriod > 0 ? revenuePreviousPeriod / salesPreviousPeriod : 0

  const salesByDayMap = new Map<string, { revenue: number; count: number }>()
  for (const s of currentPeriodSales) {
    const d = parseSaleDate(s.saleDate)
    if (!d) continue
    const key = getDateKeyDay(d)
    const cur = salesByDayMap.get(key) ?? { revenue: 0, count: 0 }
    cur.revenue += amount(s)
    cur.count += 1
    salesByDayMap.set(key, cur)
  }
  const salesByDay: SalesByDayPoint[] = Array.from(salesByDayMap.entries())
    .map(([dateKey, v]) => ({ dateKey, revenue: v.revenue, count: v.count }))
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))

  const salesByClientMap = new Map<string, number>()
  for (const s of currentPeriodSales) {
    const name = s.clientName?.trim() || "Sin nombre"
    salesByClientMap.set(name, (salesByClientMap.get(name) ?? 0) + amount(s))
  }
  const salesByClient: SalesByClientPoint[] = Array.from(salesByClientMap.entries())
    .map(([clientName, revenue]) => ({ clientName, revenue }))
    .sort((a, b) => b.revenue - a.revenue)

  return {
    totalRevenue,
    totalSales,
    averageTicket,
    revenuePreviousPeriod,
    salesPreviousPeriod,
    averageTicketPreviousPeriod,
    daysRemainingInPeriod: opts.daysRemainingInMonth,
    monthlyTarget: opts.monthlyTarget ?? DEFAULT_MONTHLY_TARGET,
    currentMonthRevenue: opts.currentMonthRevenue,
    salesByDay,
    salesByClient,
  }
}
