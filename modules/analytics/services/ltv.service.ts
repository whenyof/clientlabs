// ─────────────────────────────────────────────────────────────
// Analytics Pro — LTV Service
// ─────────────────────────────────────────────────────────────

import * as repo from "../repositories/analytics-pro.repository"
import type { DateRange } from "../types/analytics-pro.types"

export async function calculateLTV(
 userId: string,
 range: DateRange,
 paidRevenueCurrent: number
): Promise<number> {
 const clients = await repo.countUniquePaidClients(userId, range.startDate, range.endDate)

 if (clients <= 0 || paidRevenueCurrent <= 0) return 0

 const ltv = paidRevenueCurrent / clients
 return Math.round(ltv * 100) / 100
}
