import { getSalesInRange } from "@/modules/finance/data"

/**
 * Total revenue in period. Sum of all sale amounts (total) in range.
 */
export async function getTotalRevenue(
  userId: string,
  from: Date,
  to: Date
): Promise<number> {
  const sales = await getSalesInRange(userId, from, to)
  return sales.reduce((sum, s) => sum + s.amount, 0)
}

/**
 * Revenue growth: (current - previous) / previous * 100.
 * Returns 0 when previous period has no revenue (avoids division by zero).
 */
export async function getRevenueGrowth(
  userId: string,
  from: Date,
  to: Date,
  previousFrom: Date,
  previousTo: Date
): Promise<number> {
  const [currentSales, previousSales] = await Promise.all([
    getSalesInRange(userId, from, to),
    getSalesInRange(userId, previousFrom, previousTo),
  ])
  const current = currentSales.reduce((sum, s) => sum + s.amount, 0)
  const previous = previousSales.reduce((sum, s) => sum + s.amount, 0)
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

/**
 * Average ticket: total revenue / number of sales.
 * Returns 0 when there are no sales.
 */
export async function getAverageTicket(
  userId: string,
  from: Date,
  to: Date
): Promise<number> {
  const sales = await getSalesInRange(userId, from, to)
  if (sales.length === 0) return 0
  const total = sales.reduce((sum, s) => sum + s.amount, 0)
  return total / sales.length
}
