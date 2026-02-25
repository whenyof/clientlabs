// ─────────────────────────────────────────────────────────────
// Analytics Pro — Revenue Service (Redesigned)
// ─────────────────────────────────────────────────────────────

import type { RevenueMetrics, DateRange } from "../types/analytics-pro.types"
import * as repo from "../repositories/analytics-pro.repository"
import { calculateGrowth } from "../utils/comparison-engine"

export interface FullRevenueMetrics {
 issued: {
 current: number
 previous: number
 growth: number
 }
 paid: {
 current: number
 previous: number
 growth: number
 }
}

export async function getRevenueMetrics(
 userId: string,
 current: DateRange,
 previous: DateRange,
): Promise<FullRevenueMetrics> {
 const [
 issuedCurrent,
 issuedPrevious,
 paidCurrent,
 paidPrevious
 ] = await Promise.all([
 repo.getIssuedRevenue(userId, current.startDate, current.endDate),
 repo.getIssuedRevenue(userId, previous.startDate, previous.endDate),
 repo.getCollectedRevenue(userId, current.startDate, current.endDate),
 repo.getCollectedRevenue(userId, previous.startDate, previous.endDate),
 ])

 return {
 issued: {
 current: round(issuedCurrent),
 previous: round(issuedPrevious),
 growth: calculateGrowth(issuedCurrent, issuedPrevious),
 },
 paid: {
 current: round(paidCurrent),
 previous: round(paidPrevious),
 growth: calculateGrowth(paidCurrent, paidPrevious),
 }
 }
}

function round(n: number): number {
 return Math.round(n * 100) / 100
}
