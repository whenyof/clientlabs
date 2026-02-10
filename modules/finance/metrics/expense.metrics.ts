import { getExpensesInRange } from "@/modules/finance/data"

/**
 * Total expenses in period. Sum of all expense amounts in range.
 */
export async function getTotalExpenses(
  userId: string,
  from: Date,
  to: Date
): Promise<number> {
  const expenses = await getExpensesInRange(userId, from, to)
  return expenses.reduce((sum, e) => sum + e.amount, 0)
}

/**
 * Expense distribution by category. Keys = category, values = total amount.
 * Only categories present in the period are included.
 */
export async function getExpenseDistribution(
  userId: string,
  from: Date,
  to: Date
): Promise<Record<string, number>> {
  const expenses = await getExpensesInRange(userId, from, to)
  const out: Record<string, number> = {}
  for (const e of expenses) {
    const key = e.category || "(sin categoría)"
    out[key] = (out[key] ?? 0) + e.amount
  }
  return out
}
