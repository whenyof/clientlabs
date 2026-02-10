import { prisma } from "@/lib/prisma"

/** Raw client row for data access. No business logic. */
export type ClientRow = {
  id: string
  name: string | null
  email: string | null
  status: string
}

/**
 * Active clients for the user. status = ACTIVE.
 * Raw list for revenue attribution and reporting.
 */
export async function getActiveClients(userId: string): Promise<ClientRow[]> {
  const rows = await prisma.client.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
    },
    orderBy: { name: "asc" },
  })
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    status: r.status,
  }))
}

/** Raw sale row for client revenue: id, clientId, amount, date. */
export type ClientRevenueRow = {
  id: string
  clientId: string | null
  amount: number
  saleDate: Date
}

/**
 * Sales in range; each row has clientId and amount. Consumer sums by clientId for revenue.
 * No aggregation in this layer.
 */
export async function getClientRevenue(
  userId: string,
  from: Date,
  to: Date
): Promise<ClientRevenueRow[]> {
  const rows = await prisma.sale.findMany({
    where: {
      userId,
      saleDate: { gte: from, lte: to },
    },
    select: {
      id: true,
      clientId: true,
      total: true,
      saleDate: true,
    },
    orderBy: { saleDate: "asc" },
  })
  return rows.map((r) => ({
    id: r.id,
    clientId: r.clientId,
    amount: r.total,
    saleDate: r.saleDate,
  }))
}
