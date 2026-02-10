import {
  getSalesInRange,
  getExpensesInRange,
  getProviderPaymentsInRange,
  getMoneyIn,
  getMoneyOut,
} from "@/modules/finance/data"

const PAID_SALE_STATUSES = new Set(["PAGADO", "PAID", "COMPLETED"])

function isPaidSale(status: string): boolean {
  return PAID_SALE_STATUSES.has((status || "").toUpperCase())
}

/**
 * Income from business data: paid Sales + Transaction INCOME in range.
 */
export async function getIncome(
  userId: string,
  from: Date,
  to: Date
): Promise<number> {
  const [sales, moneyIn] = await Promise.all([
    getSalesInRange(userId, from, to),
    getMoneyIn(userId, from, to),
  ])
  const fromSales = sales
    .filter((s) => isPaidSale(s.status))
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0)
  const fromTransactions = moneyIn.reduce((sum, r) => sum + r.amount, 0)
  return fromSales + fromTransactions
}

/**
 * Outgoing cost: Transaction EXPENSE + ProviderPayments in range.
 */
export async function getExpenses(
  userId: string,
  from: Date,
  to: Date
): Promise<number> {
  const [expenses, providerPayments] = await Promise.all([
    getExpensesInRange(userId, from, to),
    getProviderPaymentsInRange(userId, from, to),
  ])
  const fromTransactions = expenses.reduce((sum, e) => sum + e.amount, 0)
  const fromProviders = providerPayments.reduce((sum, p) => sum + p.amount, 0)
  return fromTransactions + fromProviders
}

/**
 * Profit = income - expenses.
 */
export async function getProfit(
  userId: string,
  from: Date,
  to: Date
): Promise<number> {
  const [income, expenses] = await Promise.all([
    getIncome(userId, from, to),
    getExpenses(userId, from, to),
  ])
  return income - expenses
}

/**
 * Cashflow = income - expenses (same as profit for this engine).
 */
export async function getCashflow(
  userId: string,
  from: Date,
  to: Date
): Promise<number> {
  return getProfit(userId, from, to)
}

/**
 * Pending receivables: sales in range with status not paid.
 */
export async function getPending(
  userId: string,
  from: Date,
  to: Date
): Promise<number> {
  const sales = await getSalesInRange(userId, from, to)
  return sales
    .filter((s) => !isPaidSale(s.status))
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0)
}

export type MonthlyTrendPoint = {
  month: string
  income: number
  expenses: number
  profit: number
}

/**
 * Last 6 months trend. Always returns 6 points; zeros when no data.
 */
export async function getMonthlyTrend(
  userId: string
): Promise<MonthlyTrendPoint[]> {
  const points: MonthlyTrendPoint[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
    const [income, expenses] = await Promise.all([
      getIncome(userId, monthStart, monthEnd),
      getExpenses(userId, monthStart, monthEnd),
    ])
    points.push({
      month: monthStart.toLocaleDateString("es-ES", { month: "short", year: "numeric" }),
      income,
      expenses,
      profit: income - expenses,
    })
  }
  return points
}

export type UnifiedMovement = {
  id: string
  type: "sale" | "expense" | "payment"
  date: Date
  amount: number
  label: string
  meta?: Record<string, unknown>
}

/**
 * Single chronological list: sales (income), provider payments and expenses (outgoing).
 * Sorted by date descending.
 */
export async function getUnifiedMovements(
  userId: string,
  from: Date,
  to: Date
): Promise<UnifiedMovement[]> {
  const [sales, expenses, providerPayments] = await Promise.all([
    getSalesInRange(userId, from, to),
    getExpensesInRange(userId, from, to),
    getProviderPaymentsInRange(userId, from, to),
  ])
  const items: UnifiedMovement[] = [
    ...sales.map((s) => ({
      id: `sale-${s.id}`,
      type: "sale" as const,
      date: s.createdAt,
      amount: s.amount,
      label: "Venta",
      meta: { clientId: s.clientId, status: s.status },
    })),
    ...expenses.map((e) => ({
      id: `expense-${e.id}`,
      type: "expense" as const,
      date: e.date,
      amount: -e.amount,
      label: e.concept || e.category,
      meta: { category: e.category },
    })),
    ...providerPayments.map((p) => ({
      id: `payment-${p.id}`,
      type: "payment" as const,
      date: p.paymentDate,
      amount: -p.amount,
      label: p.concept || "Pago proveedor",
      meta: { providerId: p.providerId },
    })),
  ]
  items.sort((a, b) => b.date.getTime() - a.date.getTime())
  return items
}
