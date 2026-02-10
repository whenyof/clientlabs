/**
 * Finance aggregator: single source of truth aligned with Sales and Providers panels.
 * - income: SAME prisma query as modules/sales/services/salesAnalytics aggregateSalesInPeriod
 * - expenses: SAME sources as Providers (ProviderPayment) + Transaction EXPENSE
 * No new tables. No new concepts. Read-only. Fallback 0.
 *
 * EXACT QUERIES (reused from Sales / Providers):
 *
 * 1) INCOME (Sales panel revenue):
 *    prisma.sale.aggregate({
 *      where: { userId, saleDate: { gte: from, lte: to }, status: { in: ["PAGADO", "PAID"] } },
 *      _sum: { total: true },
 *    })
 *
 * 2) EXPENSES - provider payments (Providers panel):
 *    prisma.providerPayment.aggregate({
 *      where: { userId, paymentDate: { gte: from, lte: to } },
 *      _sum: { amount: true },
 *    })
 *
 * 3) EXPENSES - transaction expenses:
 *    prisma.transaction.aggregate({
 *      where: { userId, type: "EXPENSE", date: { gte: from, lte: to } },
 *      _sum: { amount: true },
 *    })
 *
 * 4) PENDING (unpaid sales): same Sale model, status notIn ["PAGADO", "PAID"].
 */

import { prisma } from "@/lib/prisma"

/** Same paid statuses as modules/sales/services/salesAnalytics.ts aggregateSalesInPeriod */
const PAID_SALE_STATUSES = ["PAGADO", "PAID"] as const

export type FinanceSummary = {
  income: number
  expenses: number
  /** income - expenses (same as profit). */
  balance: number
  profit: number
  pendingIncome: number
}

function defaultMonthRange(): { from: Date; to: Date } {
  const now = new Date()
  return {
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
  }
}

function safeNum(n: number | null | undefined): number {
  if (n == null || !Number.isFinite(n)) return 0
  return n
}

/**
 * Income = sum of sales where status is PAID (same query as Sales panel).
 * Reuses exact filter from modules/sales/services/salesAnalytics.ts aggregateSalesInPeriod.
 */
async function aggregatePaidSalesRevenue(
  userId: string,
  from: Date,
  to: Date
): Promise<number> {
  const result = await prisma.sale.aggregate({
    where: {
      userId,
      saleDate: { gte: from, lte: to },
      status: { in: [...PAID_SALE_STATUSES] },
    },
    _sum: { total: true },
  })
  return safeNum(result._sum.total)
}

/**
 * Pending income = sum of sales in range with status NOT paid (receivables).
 */
async function aggregateUnpaidSalesTotal(
  userId: string,
  from: Date,
  to: Date
): Promise<number> {
  const result = await prisma.sale.aggregate({
    where: {
      userId,
      saleDate: { gte: from, lte: to },
      status: { notIn: [...PAID_SALE_STATUSES] },
    },
    _sum: { total: true },
  })
  return safeNum(result._sum.total)
}

/**
 * Expenses = provider payments in range + Transaction EXPENSE in range.
 * Same sources as Providers panel (payments) and finance data layer (Transaction).
 */
async function aggregateExpenses(userId: string, from: Date, to: Date): Promise<number> {
  const [providerPayments, transactionExpenses] = await Promise.all([
    prisma.providerPayment.aggregate({
      where: {
        userId,
        paymentDate: { gte: from, lte: to },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        userId,
        type: "EXPENSE",
        date: { gte: from, lte: to },
      },
      _sum: { amount: true },
    }),
  ])
  const fromProviders = safeNum(providerPayments._sum.amount)
  const fromTransactions = safeNum(transactionExpenses._sum.amount)
  return fromProviders + fromTransactions
}

/**
 * getFinanceSummary(userId, from?, to?)
 * Returns real totals from Sales (income) and Providers/expenses (expenses).
 * If from/to omitted, uses current month. Never returns null; missing data → 0.
 */
export async function getFinanceSummary(
  userId: string,
  from?: Date,
  to?: Date
): Promise<FinanceSummary> {
  const range =
    from && to ? { from, to } : defaultMonthRange()
  const { from: fromDate, to: toDate } = range

  try {
    const [income, expenses, pendingIncome] = await Promise.all([
      aggregatePaidSalesRevenue(userId, fromDate, toDate),
      aggregateExpenses(userId, fromDate, toDate),
      aggregateUnpaidSalesTotal(userId, fromDate, toDate),
    ])
    const profit = income - expenses
    const balance = profit
    return {
      income,
      expenses,
      balance,
      profit,
      pendingIncome,
    }
  } catch (err) {
    console.error("[finance-aggregator] getFinanceSummary error:", err)
    return {
      income: 0,
      expenses: 0,
      balance: 0,
      profit: 0,
      pendingIncome: 0,
    }
  }
}

export type MonthlyTrendPoint = {
  month: string
  income: number
  expenses: number
  profit: number
}

/** Last 6 months trend using getFinanceSummary for each month. Same source of truth. */
export async function getFinanceMonthlyTrend(
  userId: string
): Promise<MonthlyTrendPoint[]> {
  const now = new Date()
  const points: MonthlyTrendPoint[] = []
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
    const s = await getFinanceSummary(userId, monthStart, monthEnd)
    points.push({
      month: monthStart.toLocaleDateString("es-ES", { month: "short", year: "numeric" }),
      income: s.income,
      expenses: s.expenses,
      profit: s.profit,
    })
  }
  return points
}

export type ChartSeriesPoint = {
  date: string
  label: string
  income: number
  expense: number
  profit: number
}

/**
 * Chart series for the selected period. Uses getFinanceSummary per bucket — same source as KPIs.
 * day = 1 point (today), week = 7 days, month = 4–5 weeks, year = 12 months.
 */
export async function getFinanceChartSeries(
  userId: string,
  period: string
): Promise<ChartSeriesPoint[]> {
  const now = new Date()
  const toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  let buckets: { from: Date; to: Date; label: string }[] = []

  if (period === "today" || period === "day") {
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    buckets = [{ from, to: toDate, label: now.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" }) }]
  } else if (period === "week") {
    buckets = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const from = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
      const to = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
      buckets.push({
        from,
        to,
        label: from.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" }),
      })
    }
  } else if (period === "month") {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const days = Math.min(now.getDate(), monthEnd.getDate())
    const weekCount = Math.ceil(days / 7) || 1
    buckets = []
    for (let w = 0; w < weekCount; w++) {
      const wFrom = new Date(monthStart)
      wFrom.setDate(wFrom.getDate() + w * 7)
      const wTo = new Date(wFrom)
      wTo.setDate(wTo.getDate() + 6)
      if (wTo > monthEnd) wTo.setTime(monthEnd.getTime())
      if (wFrom <= monthEnd) {
        buckets.push({
          from: wFrom,
          to: wTo,
          label: `S${w + 1}`,
        })
      }
    }
    if (buckets.length === 0) {
      buckets = [{ from: monthStart, to: monthEnd, label: monthStart.toLocaleDateString("es-ES", { month: "short" }) }]
    }
  } else {
    // year: 12 months (Jan–Dec current year)
    buckets = []
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(now.getFullYear(), i, 1)
      const monthEnd = new Date(now.getFullYear(), i + 1, 0)
      buckets.push({
        from: monthStart,
        to: monthEnd,
        label: monthStart.toLocaleDateString("es-ES", { month: "short" }),
      })
    }
  }

  const series: ChartSeriesPoint[] = []
  for (const b of buckets) {
    const s = await getFinanceSummary(userId, b.from, b.to)
    series.push({
      date: b.from.toISOString(),
      label: b.label,
      income: s.income,
      expense: s.expenses,
      profit: s.profit,
    })
  }
  return series
}
