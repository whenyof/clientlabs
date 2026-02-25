// ─────────────────────────────────────────────────────────────
// Analytics Pro — Funnel V2 Service (Relational Cascade)
// ─────────────────────────────────────────────────────────────

import * as repo from "../repositories/analytics-pro.repository"
import type { FunnelV2Response, FunnelStage, FunnelHealth, DateRange } from "../types/analytics-pro.types"

/**
 * Builds the sales funnel with relational enforcement and health checking.
 */
export async function buildFunnelV2(
 userId: string,
 range: DateRange
): Promise<FunnelV2Response> {
 const { startDate, endDate } = range

 // 1. Fetch raw counts from repository
 const [leads, sales, invoices, paid] = await Promise.all([
 repo.countLeads(userId, startDate, endDate),
 repo.countSales(userId, startDate, endDate),
 repo.countInvoicesIssued(userId, startDate, endDate),
 repo.countInvoicesWithPayments(userId, startDate, endDate)
 ])

 // 2. Enforce relational cascade (Leads >= Sales >= Invoices >= Paid)
 // Business logic: You can't have more sales than leads, or more invoices than sales.
 const rLeads = leads
 const rSales = Math.min(rLeads, sales)
 const rInvoices = Math.min(rSales, invoices)
 const rPaid = Math.min(rInvoices, paid)

 const rawStages = [
 { label: "Leads", count: rLeads },
 { label: "Ventas", count: rSales },
 { label: "Facturas", count: rInvoices },
 { label: "Cobradas", count: rPaid }
 ]

 // 3. Calculate Percentages, Drop-offs and Health
 const stages: FunnelStage[] = rawStages.map((stage, i) => {
 const prevCount = i > 0 ? rawStages[i - 1].count : stage.count
 const startCount = rawStages[0].count

 const percentageFromStart = startCount > 0 ? (stage.count / startCount) * 100 : (i === 0 ? 100 : 0)
 const percentageFromPrevious = prevCount > 0 ? (stage.count / prevCount) * 100 : (i === 0 ? 100 : 0)
 const dropOff = i > 0 ? 100 - percentageFromPrevious : 0

 // Determination of Health per stage
 let health: FunnelHealth = "GOOD"
 if (i > 0) {
 if (percentageFromPrevious < 20) health = "CRITICAL"
 else if (percentageFromPrevious < 50) health = "WARNING"
 }

 return {
 label: stage.label,
 count: stage.count,
 percentageFromStart: round(percentageFromStart),
 percentageFromPrevious: round(percentageFromPrevious),
 dropOff: round(dropOff),
 health
 }
 })

 // 4. Bottleneck Detection
 // The bottleneck is the stage with the highest relative drop-off (excluding the first stage)
 let bottleneckStage: string | null = null
 let maxDropOff = -1

 for (let i = 1; i < stages.length; i++) {
 if (stages[i].dropOff > maxDropOff) {
 maxDropOff = stages[i].dropOff
 bottleneckStage = stages[i].label
 }
 }

 // Only set bottleneck if drop-off is significant (>30%)
 if (maxDropOff < 30) bottleneckStage = null

 return {
 stages,
 bottleneckStage
 }
}

function round(n: number): number {
 return Math.round(n * 100) / 100
}
