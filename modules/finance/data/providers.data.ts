import { prisma } from "@/lib/prisma"

/** Raw provider payment row. Data access only. */
export type ProviderPaymentRow = {
  id: string
  providerId: string
  amount: number
  paymentDate: Date
  concept: string | null
  status: string
}

/**
 * Provider payments in a date range (inclusive). Filtered by paymentDate.
 * Raw data for cashflow and provider analytics.
 */
export async function getProviderPaymentsInRange(
  userId: string,
  from: Date,
  to: Date
): Promise<ProviderPaymentRow[]> {
  const rows = await prisma.providerPayment.findMany({
    where: {
      userId,
      paymentDate: { gte: from, lte: to },
    },
    select: {
      id: true,
      providerId: true,
      amount: true,
      paymentDate: true,
      concept: true,
      status: true,
    },
    orderBy: { paymentDate: "asc" },
  })
  return rows.map((r) => ({
    id: r.id,
    providerId: r.providerId,
    amount: r.amount,
    paymentDate: r.paymentDate,
    concept: r.concept,
    status: r.status,
  }))
}
