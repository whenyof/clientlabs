import { prisma } from "@/lib/prisma"

/** Raw money-in row (Transaction type INCOME). */
export type MoneyInRow = {
  id: string
  amount: number
  date: Date
  category: string
  concept: string
  status: string
}

/** Raw money-out row (Transaction type EXPENSE). */
export type MoneyOutRow = {
  id: string
  amount: number
  date: Date
  category: string
  concept: string
  status: string
}

/**
 * Money in (income) in a date range (inclusive). Transaction type = INCOME.
 * Raw data for cashflow and forecasts.
 */
export async function getMoneyIn(
  userId: string,
  from: Date,
  to: Date
): Promise<MoneyInRow[]> {
  const rows = await prisma.transaction.findMany({
    where: {
      userId,
      type: "INCOME",
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
 * Money out (expenses) in a date range (inclusive). Transaction type = EXPENSE.
 * Raw data for cashflow and forecasts.
 */
export async function getMoneyOut(
  userId: string,
  from: Date,
  to: Date
): Promise<MoneyOutRow[]> {
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
