/**
 * Finance KPI service. Single source of truth from real business data.
 * - income = paid sales + transaction INCOME
 * - expenses = transaction EXPENSE + provider payments
 * - pending = unpaid sales (receivables)
 * - profit = income - expenses
 * Never returns null; missing data → 0.
 */

import {
  getIncome,
  getExpenses,
  getPending,
  getProfit,
  getCashflow,
  getMonthlyTrend,
} from "@/modules/finance/finance-engine"

function growthRate(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / Math.abs(previous)) * 100
}

export type DateRange = { from: Date; to: Date }

export type FinanceKPIsResult = {
  income: number
  expenses: number
  pending: number
  profit: number
  cashflow: number
  burnRate: number
  growthRate: number
  incomeGrowth: number
  expenseGrowth: number
  profitGrowth: number
  monthlyTrend: Array<{ month: string; income: number; expenses: number; profit: number }>
}

const ZERO_MONTHLY_TREND = (): FinanceKPIsResult["monthlyTrend"] => {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return {
      month: d.toLocaleDateString("es-ES", { month: "short", year: "numeric" }),
      income: 0,
      expenses: 0,
      profit: 0,
    }
  })
}

function defaultMonthRange(): DateRange {
  const now = new Date()
  return {
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
  }
}

/**
 * Returns finance KPIs for the given user and date range from real data.
 * Optional previousRange is used to compute growth vs prior period.
 * All numeric fields are 0 when there is no data; monthlyTrend always has 6 points.
 *
 * Overload: getFinanceKPIs(userId, from?, to?) — when from/to omitted, uses current month.
 */
export async function getFinanceKPIs(
  userId: string,
  dateRangeOrFrom: DateRange | Date,
  previousRangeOrTo?: DateRange | Date
): Promise<FinanceKPIsResult> {
  let dateRange: DateRange
  let previousRange: DateRange | undefined

  if (
    dateRangeOrFrom &&
    typeof dateRangeOrFrom === "object" &&
    "from" in dateRangeOrFrom &&
    "to" in dateRangeOrFrom
  ) {
    dateRange = dateRangeOrFrom as DateRange
    previousRange = previousRangeOrTo as DateRange | undefined
  } else {
    const from = dateRangeOrFrom instanceof Date ? dateRangeOrFrom : undefined
    const to = previousRangeOrTo instanceof Date ? previousRangeOrTo : undefined
    dateRange =
      from && to
        ? { from, to }
        : defaultMonthRange()
    previousRange = undefined
  }
  const { from, to } = dateRange

  try {
    const [
      income,
      expenses,
      pending,
      profit,
      cashflow,
      monthlyTrend,
      prevIncome,
      prevExpenses,
      prevProfit,
    ] = await Promise.all([
      getIncome(userId, from, to),
      getExpenses(userId, from, to),
      getPending(userId, from, to),
      getProfit(userId, from, to),
      getCashflow(userId, from, to),
      getMonthlyTrend(userId),
      previousRange
        ? getIncome(userId, previousRange.from, previousRange.to)
        : Promise.resolve(0),
      previousRange
        ? getExpenses(userId, previousRange.from, previousRange.to)
        : Promise.resolve(0),
      previousRange
        ? (async () => {
            const i = await getIncome(userId, previousRange!.from, previousRange!.to)
            const e = await getExpenses(userId, previousRange!.from, previousRange!.to)
            return i - e
          })()
        : Promise.resolve(0),
    ])

    const safe = (n: number) => (typeof n === "number" && !Number.isNaN(n) ? n : 0)
    const incomeVal = safe(income)
    const expensesVal = safe(expenses)
    const profitVal = safe(profit)
    const burnRate = expensesVal
    const incomeGrowth = previousRange ? growthRate(incomeVal, safe(prevIncome)) : 0
    const expenseGrowth = previousRange ? growthRate(expensesVal, safe(prevExpenses)) : 0
    const profitGrowth = previousRange ? growthRate(profitVal, safe(prevProfit)) : 0
    const growthRateVal = profitGrowth

    const trend: FinanceKPIsResult["monthlyTrend"] =
      Array.isArray(monthlyTrend) && monthlyTrend.length > 0
        ? monthlyTrend.slice(0, 6).map((p) => ({
            month: String(p?.month ?? ""),
            income: safe(p?.income ?? 0),
            expenses: safe(p?.expenses ?? 0),
            profit: safe(p?.profit ?? 0),
          }))
        : ZERO_MONTHLY_TREND()
    const monthlyTrendOut =
      trend.length >= 6 ? trend : [...trend, ...ZERO_MONTHLY_TREND().slice(trend.length, 6)]

    // DEBUG: temporary log so we can verify real data is used (remove after verification)
    console.log("[getFinanceKPIs] computed", {
      userId,
      from: from.toISOString(),
      to: to.toISOString(),
      income: incomeVal,
      expenses: expensesVal,
      pending: safe(pending),
      profit: profitVal,
    })

    return {
      income: incomeVal,
      expenses: expensesVal,
      pending: safe(pending),
      profit: profitVal,
      cashflow: safe(cashflow),
      burnRate,
      growthRate: growthRateVal,
      incomeGrowth,
      expenseGrowth,
      profitGrowth,
      monthlyTrend: monthlyTrendOut,
    }
  } catch (err) {
    console.error("getFinanceKPIs error:", err)
    return {
      income: 0,
      expenses: 0,
      pending: 0,
      profit: 0,
      cashflow: 0,
      burnRate: 0,
      growthRate: 0,
      incomeGrowth: 0,
      expenseGrowth: 0,
      profitGrowth: 0,
      monthlyTrend: ZERO_MONTHLY_TREND(),
    }
  }
}
