import type {
  ReportingSale,
  ReportingPeriodPreset,
  ChartPoint,
  TopClient,
  RevenueByType,
  ReportingKPIs,
  RevenueForecastData,
  YoYPeriodPreset,
  YoYKPIs,
  YoYChartPoint,
} from "./types"

export function getReportingDateRange(preset: ReportingPeriodPreset): { from: Date; to: Date } {
  const now = new Date()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)

  switch (preset) {
    case "day":
      return { from: todayStart, to: todayEnd }
    case "7d": {
      const from = new Date(todayStart)
      from.setDate(from.getDate() - 6)
      return { from, to: todayEnd }
    }
    case "30d": {
      const from = new Date(todayStart)
      from.setDate(from.getDate() - 29)
      return { from, to: todayEnd }
    }
    case "6m": {
      const from = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0)
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      return { from, to }
    }
    case "12m": {
      const from = new Date(now.getFullYear() - 1, now.getMonth(), 1, 0, 0, 0, 0)
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      return { from, to }
    }
    default:
      return { from: todayStart, to: todayEnd }
  }
}

/** Previous period of same length for growth comparison. */
export function getReportingPreviousDateRange(
  preset: ReportingPeriodPreset
): { from: Date; to: Date } {
  const { from, to } = getReportingDateRange(preset)
  const len = to.getTime() - from.getTime() + 1
  const toPrev = new Date(from.getTime() - 1)
  const fromPrev = new Date(toPrev.getTime() - len + 1)
  return { from: fromPrev, to: toPrev }
}

export function filterSalesByDateRange(
  sales: ReportingSale[],
  from: Date,
  to: Date
): ReportingSale[] {
  return sales.filter((s) => {
    const d = new Date(s.saleDate)
    return d >= from && d <= to
  })
}

export function aggregateChartData(
  sales: ReportingSale[],
  from: Date,
  to: Date,
  preset: ReportingPeriodPreset
): ChartPoint[] {
  const points: ChartPoint[] = []
  const cursor = new Date(from)
  const end = new Date(to)

  if (preset === "day" || preset === "7d" || preset === "30d") {
    while (cursor <= end) {
      const dayStart = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), 0, 0, 0, 0)
      const dayEnd = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), 23, 59, 59, 999)
      const daySales = sales.filter((s) => {
        const d = new Date(s.saleDate)
        return d >= dayStart && d <= dayEnd
      })
      const revenue = daySales.reduce((sum, s) => sum + Number(s.total), 0)
      points.push({
        label: dayStart.toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
        revenue,
        count: daySales.length,
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    return points
  }

  if (preset === "6m" || preset === "12m") {
    const monthCursor = new Date(from.getFullYear(), from.getMonth(), 1, 0, 0, 0, 0)
    while (monthCursor <= end) {
      const monthStart = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1, 0, 0, 0, 0)
      const monthEnd = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0, 23, 59, 59, 999)
      const monthSales = sales.filter((s) => {
        const d = new Date(s.saleDate)
        return d >= monthStart && d <= monthEnd
      })
      const revenue = monthSales.reduce((sum, s) => sum + Number(s.total), 0)
      points.push({
        label: monthStart.toLocaleDateString("es-ES", { month: "short", year: "2-digit" }),
        revenue,
        count: monthSales.length,
      })
      monthCursor.setMonth(monthCursor.getMonth() + 1)
    }
  }
  return points
}

export function computeTopClients(sales: ReportingSale[], limit: number = 5): TopClient[] {
  const byClient = new Map<string, { revenue: number; count: number }>()
  for (const s of sales) {
    const name = s.clientName?.trim() || "Sin nombre"
    const cur = byClient.get(name) ?? { revenue: 0, count: 0 }
    cur.revenue += Number(s.total)
    cur.count += 1
    byClient.set(name, cur)
  }
  return Array.from(byClient.entries())
    .map(([name, { revenue, count }]) => ({ name, revenue, count }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}

export function computeRevenueByType(sales: ReportingSale[]): RevenueByType[] {
  const byType = new Map<string, { value: number; count: number }>()
  for (const s of sales) {
    const type = (s.category && String(s.category).trim()) || "Sin categoría"
    const cur = byType.get(type) ?? { value: 0, count: 0 }
    cur.value += Number(s.total)
    cur.count += 1
    byType.set(type, cur)
  }
  return Array.from(byType.entries())
    .map(([name, { value, count }]) => ({ name, value, count }))
    .sort((a, b) => b.value - a.value)
}

export function formatReportingCurrency(amount: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function computeGrowthPercent(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  return Math.round(((current - previous) / previous) * 100)
}

export function computeReportingKPIs(
  salesCurrent: ReportingSale[],
  salesPrevious: ReportingSale[]
): ReportingKPIs {
  const revenue = salesCurrent.reduce((sum, s) => sum + Number(s.total), 0)
  const revenuePrev = salesPrevious.reduce((sum, s) => sum + Number(s.total), 0)
  const count = salesCurrent.length
  const avgTicket = count > 0 ? revenue / count : 0
  const growthPercent = computeGrowthPercent(revenue, revenuePrev)
  return {
    revenue,
    sales: count,
    avgTicket,
    growthPercent,
  }
}

// --- Revenue forecasting (moving average + linear trend, no ML) ---

const FORECAST_HISTORY_MONTHS = 12
const FORECAST_AHEAD_MONTHS = 6
const CONSERVATIVE_FACTOR = 0.9
const OPTIMISTIC_FACTOR = 1.1

/**
 * Aggregate sales into monthly revenue for the last N months (including current).
 */
export function monthlyRevenueFromSales(
  sales: ReportingSale[],
  months: number = FORECAST_HISTORY_MONTHS
): { label: string; monthKey: string; revenue: number }[] {
  const now = new Date()
  const result: { label: string; monthKey: string; revenue: number }[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1, 0, 0, 0, 0)
    const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
    const monthSales = sales.filter((s) => {
      const date = new Date(s.saleDate)
      return date >= start && date <= end
    })
    const revenue = monthSales.reduce((sum, s) => sum + Number(s.total), 0)
    const monthKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`
    result.push({
      label: start.toLocaleDateString("es-ES", { month: "short", year: "2-digit" }),
      monthKey,
      revenue,
    })
  }
  return result
}

/**
 * Simple linear regression (least squares) on series y[0..n-1].
 * Returns { slope, intercept } so that trend(x) = intercept + slope * x.
 */
function linearTrend(y: number[]): { slope: number; intercept: number } {
  const n = y.length
  if (n === 0) return { slope: 0, intercept: 0 }
  const xMean = (n - 1) / 2
  let yMean = 0
  for (let i = 0; i < n; i++) yMean += y[i]
  yMean /= n
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    const xDiff = i - xMean
    num += xDiff * (y[i] - yMean)
    den += xDiff * xDiff
  }
  const slope = den === 0 ? 0 : num / den
  const intercept = yMean - slope * xMean
  return { slope, intercept }
}

/**
 * Moving average of order window (centered where possible, else trailing).
 */
export function movingAverage(values: number[], window: number): number[] {
  if (window < 1 || values.length === 0) return values
  const out: number[] = []
  const half = Math.floor(window / 2)
  for (let i = 0; i < values.length; i++) {
    let sum = 0
    let count = 0
    for (let j = i - half; j <= i + half; j++) {
      if (j >= 0 && j < values.length) {
        sum += values[j]
        count++
      }
    }
    out.push(count > 0 ? sum / count : values[i])
  }
  return out
}

/**
 * Build forecast data from historical monthly revenue.
 * Uses linear trend on recent history; projects FORECAST_AHEAD_MONTHS with 3 scenarios.
 */
export function computeRevenueForecast(
  monthlyHistory: { label: string; monthKey: string; revenue: number }[]
): RevenueForecastData | null {
  if (monthlyHistory.length < 2) return null
  const revenue = monthlyHistory.map((m) => m.revenue)
  const { slope, intercept } = linearTrend(revenue)
  const n = revenue.length
  const lastRevenue = revenue[n - 1]

  const monthLabels = monthlyHistory.map((m) => m.label)
  const historicalRevenue = [...revenue]

  const conservative: number[] = []
  const realistic: number[] = []
  const optimistic: number[] = []

  for (let i = 1; i <= FORECAST_AHEAD_MONTHS; i++) {
    const trendValue = intercept + slope * (n - 1 + i)
    const projected = Math.max(0, trendValue)
    realistic.push(Math.round(projected))
    conservative.push(Math.round(projected * CONSERVATIVE_FACTOR))
    optimistic.push(Math.round(projected * OPTIMISTIC_FACTOR))
    monthLabels.push(
      new Date(new Date().getFullYear(), new Date().getMonth() + i, 1).toLocaleDateString("es-ES", {
        month: "short",
        year: "2-digit",
      })
    )
  }

  return {
    monthLabels,
    historicalRevenue,
    scenarios: {
      conservative,
      realistic,
      optimistic,
    },
  }
}

// --- Year-over-Year ---

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

/**
 * Same calendar period: current year vs previous year.
 * - ytd: 1 Jan - today (current year) vs 1 Jan - same day last year
 * - full: 1 Jan - 31 Dec (current year, to date) vs 1 Jan - 31 Dec (previous year)
 */
export function getYoyDateRanges(
  period: YoYPeriodPreset
): { current: { from: Date; to: Date }; previous: { from: Date; to: Date } } {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const d = now.getDate()

  if (period === "ytd") {
    const currentFrom = new Date(y, 0, 1, 0, 0, 0, 0)
    const currentTo = new Date(y, m, d, 23, 59, 59, 999)
    const previousFrom = new Date(y - 1, 0, 1, 0, 0, 0, 0)
    const previousTo = new Date(y - 1, m, Math.min(d, new Date(y - 1, m + 1, 0).getDate()), 23, 59, 59, 999)
    return { current: { from: currentFrom, to: currentTo }, previous: { from: previousFrom, to: previousTo } }
  }

  const currentFrom = new Date(y, 0, 1, 0, 0, 0, 0)
  const currentTo = new Date(y, m, d, 23, 59, 59, 999)
  const previousFrom = new Date(y - 1, 0, 1, 0, 0, 0, 0)
  const previousTo = new Date(y - 1, 11, 31, 23, 59, 59, 999)
  return { current: { from: currentFrom, to: currentTo }, previous: { from: previousFrom, to: previousTo } }
}

/**
 * Monthly buckets for YoY chart. Same month labels (Ene..Dic or Ene..current month for YTD).
 * currentYear and previousYear revenue per month.
 */
export function aggregateYoYChartData(
  salesCurrent: ReportingSale[],
  salesPrevious: ReportingSale[],
  period: YoYPeriodPreset
): YoYChartPoint[] {
  const now = new Date()
  const endMonth = period === "ytd" ? now.getMonth() : 11
  const points: YoYChartPoint[] = []

  for (let monthIndex = 0; monthIndex <= endMonth; monthIndex++) {
    const curStart = new Date(now.getFullYear(), monthIndex, 1, 0, 0, 0, 0)
    const curEnd = new Date(now.getFullYear(), monthIndex + 1, 0, 23, 59, 59, 999)
    const prevStart = new Date(now.getFullYear() - 1, monthIndex, 1, 0, 0, 0, 0)
    const prevEnd = new Date(now.getFullYear() - 1, monthIndex + 1, 0, 23, 59, 59, 999)

    const curRevenue = salesCurrent
      .filter((s) => {
        const date = new Date(s.saleDate)
        return date >= curStart && date <= curEnd
      })
      .reduce((sum, s) => sum + Number(s.total), 0)
    const prevRevenue = salesPrevious
      .filter((s) => {
        const date = new Date(s.saleDate)
        return date >= prevStart && date <= prevEnd
      })
      .reduce((sum, s) => sum + Number(s.total), 0)

    points.push({
      label: MONTH_NAMES[monthIndex],
      monthIndex,
      currentYear: curRevenue,
      previousYear: prevRevenue,
    })
  }
  return points
}

export function computeYoYKPIs(
  salesCurrent: ReportingSale[],
  salesPrevious: ReportingSale[]
): YoYKPIs {
  const revenueCurrent = salesCurrent.reduce((sum, s) => sum + Number(s.total), 0)
  const revenuePrevious = salesPrevious.reduce((sum, s) => sum + Number(s.total), 0)
  const salesCurrentCount = salesCurrent.length
  const salesPreviousCount = salesPrevious.length
  const avgTicketCurrent = salesCurrentCount > 0 ? revenueCurrent / salesCurrentCount : 0
  const avgTicketPrevious = salesPreviousCount > 0 ? revenuePrevious / salesPreviousCount : 0

  return {
    revenueCurrent,
    revenuePrevious,
    revenueYoY: computeGrowthPercent(revenueCurrent, revenuePrevious),
    salesCurrent: salesCurrentCount,
    salesPrevious: salesPreviousCount,
    salesYoY: computeGrowthPercent(salesCurrentCount, salesPreviousCount),
    avgTicketCurrent,
    avgTicketPrevious,
    avgTicketYoY: computeGrowthPercent(avgTicketCurrent, avgTicketPrevious),
  }
}
