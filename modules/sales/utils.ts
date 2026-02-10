import type {
  Sale,
  SalesKPIs,
  SalesKPIsWithVariation,
  DateRangePreset,
  SalesChartPoint,
  SalesForecastResult,
  SalesForecastScenarioValue,
  SalesYoYMetrics,
  SalesYoYChartPoint,
} from "./types"

// --- Date normalization (single source of truth for Sales charts, reporting, YoY, forecast) ---

const DEV = typeof process !== "undefined" && process.env.NODE_ENV === "development"

/**
 * Parse any value to a valid Date or null. Handles: Date, ISO string, YYYY-MM-DD, timestamp.
 * Use this for every sale.saleDate read (server may send string after serialization).
 */
export function parseSaleDate(value: unknown): Date | null {
  if (value == null) return null
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value
  if (typeof value === "number") {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  if (typeof value !== "string") return null
  const s = value.trim()
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

/** Date key for daily granularity: YYYY-MM-DD (ISO date part only). */
export function getDateKeyDay(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** Date key for monthly granularity: YYYY-MM. */
export function getDateKeyMonth(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

/** Format YYYY-MM-DD key for chart label (day + short month). Returns "—" if key invalid. */
export function formatChartLabelDay(dateKey: string): string {
  if (!dateKey || typeof dateKey !== "string") return "—"
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey)
  if (!match) return "—"
  const [, y, m, d] = match
  const month = parseInt(m, 10)
  const day = parseInt(d, 10)
  if (month < 1 || month > 12 || day < 1 || day > 31) return "—"
  const shortMonths = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
  return `${day} ${shortMonths[month - 1]}`
}

/** Format YYYY-MM key for chart label (short month + 2-digit year). Returns "—" if key invalid. */
export function formatChartLabelMonth(dateKey: string): string {
  if (!dateKey || typeof dateKey !== "string") return "—"
  const match = /^(\d{4})-(\d{2})$/.exec(dateKey)
  if (!match) return "—"
  const [, y, m] = match
  const month = parseInt(m, 10)
  if (month < 1 || month > 12) return "—"
  const shortMonths = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
  const year2 = y!.slice(-2)
  return `${shortMonths[month - 1]} '${year2}`
}

/** Rango de fechas para comparativas. */
export type DateRange = { from: Date; to: Date }

/**
 * Periodo anterior de la misma duración.
 * prevTo = from - 1 ms, prevFrom = prevTo - duration.
 */
export function getPreviousPeriod(range: DateRange): DateRange {
  const { from, to } = range
  const durationMs = to.getTime() - from.getTime()
  const prevTo = new Date(from.getTime() - 1)
  const prevFrom = new Date(prevTo.getTime() - durationMs)
  return { from: prevFrom, to: prevTo }
}

/**
 * Mismo intervalo en el año anterior (YoY).
 */
export function getYearAgoPeriod(range: DateRange): DateRange {
  const { from, to } = range
  return {
    from: new Date(from.getFullYear() - 1, from.getMonth(), from.getDate(), from.getHours(), from.getMinutes(), from.getSeconds(), from.getMilliseconds()),
    to: new Date(to.getFullYear() - 1, to.getMonth(), to.getDate(), to.getHours(), to.getMinutes(), to.getSeconds(), to.getMilliseconds()),
  }
}

/**
 * Filter sales to those with valid saleDate in [from, to]. Invalid dates are skipped (dev log).
 */
export function filterSalesByRange(sales: Sale[], from: Date, to: Date): Sale[] {
  let invalidCount = 0
  const out = sales.filter((s) => {
    const d = parseSaleDate(s.saleDate)
    if (!d) {
      invalidCount++
      return false
    }
    return d >= from && d <= to
  })
  if (DEV && invalidCount > 0) {
    console.warn(`[Sales] filterSalesByRange: skipped ${invalidCount} sale(s) with invalid saleDate`)
  }
  return out
}

/**
 * Aggregate sales into chart points with safe labels. Single entry point for all Sales charts.
 * - day/week: label via formatChartLabelDay (date key YYYY-MM-DD)
 * - month: label via formatChartLabelMonth (date key YYYY-MM)
 * Reusable for reporting, forecast, YoY (same keys and formatters).
 */
export function aggregateSalesChartData(
  sales: Sale[],
  from: Date,
  to: Date,
  preset: DateRangePreset
): SalesChartPoint[] {
  const days = Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)) + 1

  if (days <= 31) {
    const map = new Map<string, { total: number; count: number }>()
    const cursor = new Date(from)
    while (cursor <= to) {
      map.set(getDateKeyDay(cursor), { total: 0, count: 0 })
      cursor.setDate(cursor.getDate() + 1)
    }
    for (const s of sales) {
      const d = parseSaleDate(s.saleDate)
      if (!d || d < from || d > to) continue
      const key = getDateKeyDay(d)
      const cur = map.get(key) ?? { total: 0, count: 0 }
      cur.total += Number(s.total)
      cur.count += 1
      map.set(key, cur)
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, { total, count }]) => ({
        label: formatChartLabelDay(date),
        date,
        revenue: total,
        count,
        avgTicket: count > 0 ? total / count : 0,
      }))
  }

  if (days <= 90) {
    const map = new Map<string, { total: number; count: number }>()
    const cursor = new Date(from)
    while (cursor <= to) {
      const sun = cursor.getDate() - cursor.getDay()
      const weekStart = new Date(cursor.getFullYear(), cursor.getMonth(), sun)
      const key = getDateKeyDay(weekStart)
      if (!map.has(key)) map.set(key, { total: 0, count: 0 })
      cursor.setDate(cursor.getDate() + 7)
    }
    for (const s of sales) {
      const d = parseSaleDate(s.saleDate)
      if (!d || d < from || d > to) continue
      const sun = d.getDate() - d.getDay()
      const weekStart = new Date(d.getFullYear(), d.getMonth(), sun)
      const key = getDateKeyDay(weekStart)
      const cur = map.get(key) ?? { total: 0, count: 0 }
      cur.total += Number(s.total)
      cur.count += 1
      map.set(key, cur)
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, { total, count }]) => ({
        label: "Sem. " + formatChartLabelDay(date),
        date,
        revenue: total,
        count,
        avgTicket: count > 0 ? total / count : 0,
      }))
  }

  const map = new Map<string, { total: number; count: number }>()
  const monthCursor = new Date(from.getFullYear(), from.getMonth(), 1)
  while (monthCursor <= to) {
    map.set(getDateKeyMonth(monthCursor), { total: 0, count: 0 })
    monthCursor.setMonth(monthCursor.getMonth() + 1)
  }
  for (const s of sales) {
    const d = parseSaleDate(s.saleDate)
    if (!d || d < from || d > to) continue
    const key = getDateKeyMonth(d)
    const cur = map.get(key) ?? { total: 0, count: 0 }
    cur.total += Number(s.total)
    cur.count += 1
    map.set(key, cur)
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, { total, count }]) => ({
      label: formatChartLabelMonth(date),
      date,
      revenue: total,
      count,
      avgTicket: count > 0 ? total / count : 0,
    }))
}

export function formatSaleCurrency(amount: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** Returns [start, end] in local date (start 00:00, end 23:59:59.999). */
export function getDateRange(preset: DateRangePreset, custom?: { from: Date; to: Date }): { from: Date; to: Date } {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  if (preset === "custom" && custom) {
    const from = new Date(custom.from.getFullYear(), custom.from.getMonth(), custom.from.getDate(), 0, 0, 0, 0)
    const to = new Date(custom.to.getFullYear(), custom.to.getMonth(), custom.to.getDate(), 23, 59, 59, 999)
    return { from, to }
  }

  switch (preset) {
    case "today":
      return { from: todayStart, to: todayEnd }
    case "7d": {
      const from7 = new Date(todayStart)
      from7.setDate(from7.getDate() - 6)
      return { from: from7, to: todayEnd }
    }
    case "30d": {
      const from30 = new Date(todayStart)
      from30.setDate(from30.getDate() - 29)
      return { from: from30, to: todayEnd }
    }
    case "month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      return { from: start, to: end }
    }
    case "6m": {
      const start = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      return { from: start, to: end }
    }
    case "year": {
      const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      return { from: start, to: end }
    }
    default:
      return { from: todayStart, to: todayEnd }
  }
}

/** Previous period of same length for comparison. */
export function getPreviousDateRange(preset: DateRangePreset, custom?: { from: Date; to: Date }): { from: Date; to: Date } {
  const { from, to } = getDateRange(preset, custom)
  return getPreviousRangeFromRange(from, to)
}

/** Previous period of same length given explicit from/to. */
export function getPreviousRangeFromRange(from: Date, to: Date): { from: Date; to: Date } {
  const len = to.getTime() - from.getTime() + 1
  const toPrev = new Date(from.getTime() - 1)
  const fromPrev = new Date(toPrev.getTime() - len + 1)
  return { from: fromPrev, to: toPrev }
}

/** Same calendar period one year ago. Used for YoY comparison. */
export function getSamePeriodLastYear(from: Date, to: Date): { from: Date; to: Date } {
  const fromNorm = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 0, 0, 0, 0)
  const toNorm = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999)
  const fromPrev = new Date(fromNorm.getFullYear() - 1, fromNorm.getMonth(), fromNorm.getDate(), 0, 0, 0, 0)
  const toPrev = new Date(toNorm.getFullYear() - 1, toNorm.getMonth(), toNorm.getDate(), 23, 59, 59, 999)
  return { from: fromPrev, to: toPrev }
}

function yoyPctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? null : 0
  return Math.round(((current - previous) / previous) * 100)
}

/**
 * YoY metrics: current period vs same period last year. No division by zero.
 * Returns null variation when previous year had no data (show "—" or "Nuevo crecimiento" in UI).
 */
export function calculateYoYMetrics(params: {
  currentPeriodSales: Sale[]
  previousYearSales: Sale[]
}): SalesYoYMetrics {
  const { currentPeriodSales, previousYearSales } = params
  const revenue = currentPeriodSales.reduce((sum, s) => sum + Number(s.total), 0)
  const revenuePrevious = previousYearSales.reduce((sum, s) => sum + Number(s.total), 0)
  const count = currentPeriodSales.length
  const countPrevious = previousYearSales.length
  const avgTicket = count > 0 ? revenue / count : 0
  const avgTicketPrevious = countPrevious > 0 ? revenuePrevious / countPrevious : 0

  const hasPreviousData = revenuePrevious > 0 || countPrevious > 0

  return {
    revenue,
    revenuePrevious,
    revenueVarPct: yoyPctChange(revenue, revenuePrevious),
    salesCount: count,
    salesCountPrevious: countPrevious,
    salesCountVarPct: yoyPctChange(count, countPrevious),
    avgTicket,
    avgTicketPrevious,
    avgTicketVarPct: hasPreviousData ? yoyPctChange(avgTicket, avgTicketPrevious) : null,
    hasPreviousData,
  }
}

/**
 * Chart data for YoY: same calendar days, current vs previous year. One point per day in range.
 */
export function getYoYChartData(
  from: Date,
  to: Date,
  currentSales: Sale[],
  previousYearSales: Sale[]
): SalesYoYChartPoint[] {
  const fromNorm = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 0, 0, 0, 0)
  const toNorm = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999)
  const { from: fromPrev, to: toPrev } = getSamePeriodLastYear(fromNorm, toNorm)

  const currentMap = new Map<string, { total: number; count: number }>()
  const cursor = new Date(fromNorm)
  while (cursor <= toNorm) {
    currentMap.set(getDateKeyDay(cursor), { total: 0, count: 0 })
    cursor.setDate(cursor.getDate() + 1)
  }
  for (const s of currentSales) {
    const d = parseSaleDate(s.saleDate)
    if (!d || d < fromNorm || d > toNorm) continue
    const key = getDateKeyDay(d)
    const cur = currentMap.get(key) ?? { total: 0, count: 0 }
    cur.total += Number(s.total)
    cur.count += 1
    currentMap.set(key, cur)
  }

  const previousMap = new Map<string, { total: number; count: number }>()
  const cursorPrev = new Date(fromPrev)
  while (cursorPrev <= toPrev) {
    previousMap.set(getDateKeyDay(cursorPrev), { total: 0, count: 0 })
    cursorPrev.setDate(cursorPrev.getDate() + 1)
  }
  for (const s of previousYearSales) {
    const d = parseSaleDate(s.saleDate)
    if (!d || d < fromPrev || d > toPrev) continue
    const key = getDateKeyDay(d)
    const cur = previousMap.get(key) ?? { total: 0, count: 0 }
    cur.total += Number(s.total)
    cur.count += 1
    previousMap.set(key, cur)
  }

  const out: SalesYoYChartPoint[] = []
  const walk = new Date(fromNorm)
  while (walk <= toNorm) {
    const currentKey = getDateKeyDay(walk)
    const prevDate = new Date(walk.getFullYear() - 1, walk.getMonth(), walk.getDate())
    const prevKey = getDateKeyDay(prevDate)
    const curr = currentMap.get(currentKey) ?? { total: 0, count: 0 }
    const prev = previousMap.get(prevKey) ?? { total: 0, count: 0 }
    out.push({
      label: formatChartLabelDay(currentKey),
      date: currentKey,
      revenueCurrent: curr.total,
      revenuePrevious: prev.total,
      countCurrent: curr.count,
      countPrevious: prev.count,
    })
    walk.setDate(walk.getDate() + 1)
  }
  return out
}

export function computeSalesKPIs(sales: Sale[]): SalesKPIs {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthSales = sales.filter((s) => {
    const d = parseSaleDate(s.saleDate)
    return d != null && d >= startOfMonth
  })
  const monthRevenue = monthSales.reduce((sum, s) => sum + Number(s.total), 0)
  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0)
  const paidStatus = (s: Sale) =>
    (s.status || "").toUpperCase() === "PAGADO" || (s.status || "").toUpperCase() === "PAID"
  const paidCount = sales.filter(paidStatus).length
  const pendingCount = sales.length - paidCount
  const avgTicket = sales.length > 0 ? totalRevenue / sales.length : 0
  const paidPercent = sales.length > 0 ? Math.round((paidCount / sales.length) * 100) : 0

  return {
    totalSales: sales.length,
    totalRevenue,
    monthRevenue,
    avgTicket,
    paidCount,
    pendingCount,
    paidPercent,
  }
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  return Math.round(((current - previous) / previous) * 100)
}

/**
 * Executive KPIs: current period totals, previous period, deltas and percentages.
 * Single source for all Sales KPI UI. Reusable for Forecast and YoY.
 */
export function computeSalesKPIsWithVariation(
  salesCurrent: Sale[],
  salesPrevious: Sale[]
): SalesKPIsWithVariation {
  const revCur = salesCurrent.reduce((sum, s) => sum + Number(s.total), 0)
  const revPrev = salesPrevious.reduce((sum, s) => sum + Number(s.total), 0)
  const countCur = salesCurrent.length
  const countPrev = salesPrevious.length
  const avgCur = countCur > 0 ? revCur / countCur : 0
  const avgPrev = countPrev > 0 ? revPrev / countPrev : 0
  const paid = (s: Sale) =>
    (s.status || "").toUpperCase() === "PAGADO" || (s.status || "").toUpperCase() === "PAID"
  const paidCur = salesCurrent.filter(paid).length
  const paidPrev = salesPrevious.filter(paid).length
  const pctCur = countCur > 0 ? Math.round((paidCur / countCur) * 100) : 0
  const pctPrev = countPrev > 0 ? Math.round((paidPrev / countPrev) * 100) : 0

  let topClient: { name: string; total: number } | null = null
  const byClient = new Map<string, number>()
  for (const s of salesCurrent) {
    const name = (s.clientName || "").trim() || "Sin nombre"
    byClient.set(name, (byClient.get(name) ?? 0) + Number(s.total))
  }
  byClient.forEach((total, name) => {
    if (!topClient || total > topClient.total) topClient = { name, total }
  })

  return {
    totalRevenue: revCur,
    totalRevenuePrev: revPrev,
    totalRevenueDelta: revCur - revPrev,
    totalRevenueVar: pctChange(revCur, revPrev),
    totalSales: countCur,
    totalSalesPrev: countPrev,
    totalSalesVar: pctChange(countCur, countPrev),
    avgTicket: avgCur,
    avgTicketPrev: avgPrev,
    avgTicketVar: pctChange(avgCur, avgPrev),
    paidCount: paidCur,
    paidCountPrev: paidPrev,
    paidPercent: pctCur,
    paidPercentPrev: pctPrev,
    paidPercentVar: pctPrev > 0 || pctCur > 0 ? pctChange(pctCur, pctPrev) : null,
    topClient,
  }
}

const SCENARIO_CONSERVATIVE = 0.9
const SCENARIO_OPTIMISTIC = 1.1

function scenarioFromBase(baseRevenue: number, baseCount: number): {
  conservador: SalesForecastScenarioValue
  base: SalesForecastScenarioValue
  optimista: SalesForecastScenarioValue
} {
  return {
    conservador: { revenue: Math.round(baseRevenue * SCENARIO_CONSERVATIVE), count: Math.round(baseCount * SCENARIO_CONSERVATIVE) },
    base: { revenue: Math.round(baseRevenue), count: Math.round(baseCount) },
    optimista: { revenue: Math.round(baseRevenue * SCENARIO_OPTIMISTIC), count: Math.round(baseCount * SCENARIO_OPTIMISTIC) },
  }
}

/**
 * Deterministic sales forecast from historical data. No external AI.
 * Uses current period daily average; projects end of month, next 30d, next 90d.
 * Three scenarios: conservador (-10%), base, optimista (+10%).
 */
export function calculateSalesForecast(params: {
  sales: Sale[]
  from: Date
  to: Date
  salesPrevious?: Sale[]
}): SalesForecastResult {
  const { sales, from, to, salesPrevious = [] } = params
  const fromNorm = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 0, 0, 0, 0)
  const toNorm = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999)
  const daysInPeriod = Math.max(1, Math.round((toNorm.getTime() - fromNorm.getTime()) / (24 * 60 * 60 * 1000)) + 1)

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0)
  const totalCount = sales.length
  const dailyRevenue = totalRevenue / daysInPeriod
  const dailyCount = totalCount / daysInPeriod

  const prevRevenue = salesPrevious.reduce((sum, s) => sum + Number(s.total), 0)
  const prevCount = salesPrevious.length
  const daysPrev = daysInPeriod
  const dailyPrevRevenue = daysPrev > 0 ? prevRevenue / daysPrev : 0
  const dailyPrevCount = daysPrev > 0 ? prevCount / daysPrev : 0
  const trendRevenuePct = dailyPrevRevenue !== 0 ? Math.round(((dailyRevenue - dailyPrevRevenue) / dailyPrevRevenue) * 100) : null
  const trendCountPct = dailyPrevCount !== 0 ? Math.round(((dailyCount - dailyPrevCount) / dailyPrevCount) * 100) : null

  const canCompute = daysInPeriod >= 1 && (totalRevenue > 0 || totalCount > 0)

  const lastDayOfMonth = new Date(toNorm.getFullYear(), toNorm.getMonth() + 1, 0)
  const daysLeftInMonth = Math.max(0, Math.round((lastDayOfMonth.getTime() - toNorm.getTime()) / (24 * 60 * 60 * 1000)))
  const baseRevenueEOM = dailyRevenue * daysLeftInMonth
  const baseCountEOM = dailyCount * daysLeftInMonth
  const endOfMonth = scenarioFromBase(baseRevenueEOM, baseCountEOM)

  const baseRevenue30 = dailyRevenue * 30
  const baseCount30 = dailyCount * 30
  const next30 = scenarioFromBase(baseRevenue30, baseCount30)

  const baseRevenue90 = dailyRevenue * 90
  const baseCount90 = dailyCount * 90
  const next90 = scenarioFromBase(baseRevenue90, baseCount90)

  const historicalMap = new Map<string, { total: number; count: number }>()
  const cursor = new Date(fromNorm)
  while (cursor <= toNorm) {
    historicalMap.set(getDateKeyDay(cursor), { total: 0, count: 0 })
    cursor.setDate(cursor.getDate() + 1)
  }
  for (const s of sales) {
    const d = parseSaleDate(s.saleDate)
    if (!d || d < fromNorm || d > toNorm) continue
    const key = getDateKeyDay(d)
    const cur = historicalMap.get(key) ?? { total: 0, count: 0 }
    cur.total += Number(s.total)
    cur.count += 1
    historicalMap.set(key, cur)
  }

  const chartHistorical = Array.from(historicalMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, { total, count }]) => ({
      label: formatChartLabelDay(date),
      date,
      revenue: total,
      count,
      forecastRevenue: null as number | null,
      forecastCount: null as number | null,
    }))

  const forecastDays = 90
  const chartForecast: SalesForecastResult["chartData"] = []
  const forecastStart = new Date(toNorm.getFullYear(), toNorm.getMonth(), toNorm.getDate() + 1, 0, 0, 0, 0)
  for (let i = 0; i < forecastDays; i++) {
    const d = new Date(forecastStart)
    d.setDate(d.getDate() + i)
    const key = getDateKeyDay(d)
    chartForecast.push({
      label: formatChartLabelDay(key),
      date: key,
      revenue: 0,
      count: 0,
      forecastRevenue: dailyRevenue,
      forecastCount: dailyCount,
    })
  }

  const chartData = [...chartHistorical, ...chartForecast]

  return {
    canCompute,
    medias: {
      dailyRevenue,
      dailyCount,
      daysInPeriod,
      trendRevenuePct: trendRevenuePct ?? null,
      trendCountPct: trendCountPct ?? null,
    },
    projections: { endOfMonth, next30, next90 },
    chartData,
  }
}

export function getPaymentStatusLabel(
  status: string,
  labels: { paymentStatus?: Record<string, string> }
): string {
  const key = (status || "").toUpperCase()
  return labels.paymentStatus?.[key] ?? status ?? ""
}

/** Format saleDate for table (short month). Returns "—" if invalid. */
export function formatSaleDateDisplay(value: unknown): string {
  const d = parseSaleDate(value)
  if (!d) return "—"
  const day = String(d.getDate()).padStart(2, "0")
  const shortMonths = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
  return `${day} ${shortMonths[d.getMonth()]} ${d.getFullYear()}`
}

/** Format saleDate for side panel (full month name). Returns "—" if invalid. */
export function formatSaleDateDisplayLong(value: unknown): string {
  const d = parseSaleDate(value)
  if (!d) return "—"
  const fullMonths = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
  return `${d.getDate()} ${fullMonths[d.getMonth()]} ${d.getFullYear()}`
}
