import { getSalesInRange } from "@/modules/finance/data"
import { getExpensesInRange } from "@/modules/finance/data"

/**
 * Net profit in period: total revenue minus total expenses.
 */
export async function getNetProfit(
  userId: string,
  from: Date,
  to: Date
): Promise<number> {
  const [sales, expenses] = await Promise.all([
    getSalesInRange(userId, from, to),
    getExpensesInRange(userId, from, to),
  ])
  const revenue = sales.reduce((sum, s) => sum + s.amount, 0)
  const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0)
  return revenue - expenseTotal
}

/**
 * Profit margin: profit / revenue. Returns 0 when revenue is 0.
 */
export async function getProfitMargin(
  userId: string,
  from: Date,
  to: Date
): Promise<number> {
  const [sales, expenses] = await Promise.all([
    getSalesInRange(userId, from, to),
    getExpensesInRange(userId, from, to),
  ])
  const revenue = sales.reduce((sum, s) => sum + s.amount, 0)
  if (revenue === 0) return 0
  const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0)
  return (revenue - expenseTotal) / revenue
}
