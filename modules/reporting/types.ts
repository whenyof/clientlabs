/**
 * Executive Reporting module types.
 * Data shapes returned from server; no Prisma types in the module boundary.
 */

export type ReportingSale = {
  id: string
  total: number
  currency: string
  saleDate: string
  clientName: string
  clientId: string | null
  category: string | null
}

export type ReportingPeriodPreset = "day" | "7d" | "30d" | "6m" | "12m"

export type ReportingKPIs = {
  revenue: number
  sales: number
  avgTicket: number
  growthPercent: number | null
}

export type ChartPoint = {
  label: string
  revenue: number
  count: number
}

export type TopClient = {
  name: string
  revenue: number
  count: number
}

export type RevenueByType = {
  name: string
  value: number
  count: number
}

/** Monthly revenue point for history and forecast. */
export type MonthlyRevenuePoint = {
  label: string
  monthKey: string
  revenue: number
  isForecast?: boolean
}

/** One scenario (conservative / realistic / optimistic) as array of revenue values aligned to months. */
export type ForecastScenario = {
  label: string
  revenueByMonth: number[]
}

/** Full forecast data: historical months + future month keys and three scenario series. */
export type RevenueForecastData = {
  monthLabels: string[]
  historicalRevenue: number[]
  scenarios: {
    conservative: number[]
    realistic: number[]
    optimistic: number[]
  }
}

/** Year-over-Year period: YTD (same calendar range) or full year. */
export type YoYPeriodPreset = "ytd" | "full"

/** KPIs with current, previous and YoY % change. */
export type YoYKPIs = {
  revenueCurrent: number
  revenuePrevious: number
  revenueYoY: number | null
  salesCurrent: number
  salesPrevious: number
  salesYoY: number | null
  avgTicketCurrent: number
  avgTicketPrevious: number
  avgTicketYoY: number | null
}

/** One month in YoY chart: same month label, current year value, previous year value. */
export type YoYChartPoint = {
  label: string
  monthIndex: number
  currentYear: number
  previousYear: number
}
