import { getClientRevenue } from "@/modules/finance/data"

export type TopClientEntry = {
  clientId: string | null
  revenue: number
}

/**
 * Top clients by revenue in period. Sorted descending by revenue.
 * clientId is null for sales not linked to a client.
 */
export async function getTopClients(
  userId: string,
  from: Date,
  to: Date
): Promise<TopClientEntry[]> {
  const rows = await getClientRevenue(userId, from, to)
  const byClient = new Map<string | null, number>()
  for (const r of rows) {
    const id = r.clientId ?? null
    byClient.set(id, (byClient.get(id) ?? 0) + r.amount)
  }
  const entries: TopClientEntry[] = Array.from(byClient.entries()).map(
    ([clientId, revenue]) => ({ clientId, revenue })
  )
  entries.sort((a, b) => b.revenue - a.revenue)
  return entries
}

/**
 * Client concentration: revenue share of the top client (0–1).
 * Returns 0 when there is no revenue.
 */
export async function getClientConcentration(
  userId: string,
  from: Date,
  to: Date
): Promise<number> {
  const top = await getTopClients(userId, from, to)
  if (top.length === 0) return 0
  const total = top.reduce((sum, t) => sum + t.revenue, 0)
  if (total === 0) return 0
  return top[0].revenue / total
}
