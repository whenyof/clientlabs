import { revenueScore } from "./revenue-score"
import { activityScore } from "./activity-score"
import { frequencyScore } from "./frequency-score"
import { loyaltyScore } from "./loyalty-score"

export interface ClientScoreInput {
  totalRevenue?: number | null
  daysSinceLastActivity?: number | null
  purchaseCount?: number | null
  yearsAsCustomer?: number | null
}

/**
 * Main scoring function
 * Combines all score dimensions and clamps result between 0 and 100
 */
export function calculateClientScore(input: ClientScoreInput): number {
  const revenue = revenueScore(input.totalRevenue ?? 0)
  const activity = activityScore(input.daysSinceLastActivity ?? null)
  const frequency = frequencyScore(input.purchaseCount ?? null)
  const loyalty = loyaltyScore(input.yearsAsCustomer ?? null)

  const total = revenue + activity + frequency + loyalty

  return Math.min(Math.max(Math.round(total), 0), 100)
}

/**
 * Utility adapter: converts a client entity to ClientScoreInput.
 * Supports Prisma Client (totalSpent, updatedAt, createdAt, Sale) and alternate shapes.
 */
export function mapClientToScoreInput(client: any): ClientScoreInput {
  const revenue =
    client?.totalRevenue ??
    client?.totalSpent ??
    client?.revenue ??
    client?.billingTotal ??
    0

  const purchaseCount =
    client?.purchaseCount ??
    client?.invoicesCount ??
    client?.ordersCount ??
    (Array.isArray(client?.Sale) ? client.Sale.length : undefined) ??
    0

  const lastTs =
    client?.lastActivity
      ? new Date(client.lastActivity).getTime()
      : client?.updatedAt || client?.createdAt
        ? new Date(client.updatedAt || client.createdAt).getTime()
        : null
  const daysSinceLastActivity = lastTs
    ? Math.floor((Date.now() - lastTs) / (1000 * 60 * 60 * 24))
    : null

  const yearsAsCustomer = client?.createdAt
    ? (Date.now() - new Date(client.createdAt).getTime()) /
      (1000 * 60 * 60 * 24 * 365)
    : null

  return {
    totalRevenue: revenue,
    purchaseCount,
    daysSinceLastActivity,
    yearsAsCustomer,
  }
}