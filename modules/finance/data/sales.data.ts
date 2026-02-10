import { prisma } from "@/lib/prisma"

/** Raw sale row for data access. No margins, growth, or display. */
export type SaleRow = {
  id: string
  amount: number
  createdAt: Date
  clientId: string | null
  status: string
}

/**
 * Sales in a date range (inclusive). Uses saleDate for filtering.
 * Minimal fields for KPIs, predictions, and reports.
 */
export async function getSalesInRange(
  userId: string,
  from: Date,
  to: Date
): Promise<SaleRow[]> {
  const rows = await prisma.sale.findMany({
    where: {
      userId,
      saleDate: { gte: from, lte: to },
    },
    select: {
      id: true,
      total: true,
      createdAt: true,
      clientId: true,
      status: true,
    },
    orderBy: { saleDate: "asc" },
  })
  return rows.map((r) => ({
    id: r.id,
    amount: r.total,
    createdAt: r.createdAt,
    clientId: r.clientId,
    status: r.status,
  }))
}

/**
 * Sales in range grouped by client (raw list; clientId present on each row).
 * Consumer can aggregate by clientId.
 */
export async function getSalesByClient(
  userId: string,
  from: Date,
  to: Date
): Promise<SaleRow[]> {
  return getSalesInRange(userId, from, to)
}

/**
 * Raw sales in range for average-ticket use. Same shape as getSalesInRange.
 * Consumer computes average from amount and count.
 */
export async function getAverageTicket(
  userId: string,
  from: Date,
  to: Date
): Promise<SaleRow[]> {
  return getSalesInRange(userId, from, to)
}
