import { prisma } from "@/lib/prisma"

/** Raw expense row (Transaction type EXPENSE). No derived metrics. */
export type ExpenseRow = {
  id: string
  amount: number
  date: Date
  category: string
  concept: string
  status: string
}

/**
 * Expenses in a date range (inclusive). Transaction type = EXPENSE.
 * Raw list for reporting and risk engines.
 */
export async function getExpensesInRange(
  userId: string,
  from: Date,
  to: Date
): Promise<ExpenseRow[]> {
  const rows = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: from, lte: to },
    },
    select: {
      id: true,
      amount: true,
      date: true,
      category: true,
      concept: true,
      status: true,
    },
    orderBy: { date: "asc" },
  })
  return rows.map((r) => ({
    id: r.id,
    amount: r.amount,
    date: r.date,
    category: r.category,
    concept: r.concept,
    status: r.status,
  }))
}

/**
 * Expenses in range with category on each row. Consumer can group by category.
 */
export async function getExpensesByCategory(
  userId: string,
  from: Date,
  to: Date
): Promise<ExpenseRow[]> {
  return getExpensesInRange(userId, from, to)
}
