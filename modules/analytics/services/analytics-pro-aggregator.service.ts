// ─────────────────────────────────────────────────────────────
// Analytics Pro — Unified Aggregator (Real Flow)
// ─────────────────────────────────────────────────────────────

import type {
 AnalyticsPeriod,
 AnalyticsProResponse,
 DateRange,
 Insight,
 InsightPriority,
 BusinessScore,
 ForecastMetrics
} from "../types/analytics-pro.types"
import * as repo from "../repositories/analytics-pro.repository"
import { getRevenueMetrics } from "./revenue.service"
import { buildFunnelV2 } from "./funnel-v2.service"
import { calculateLTV } from "./ltv.service"
import { calculateGrowth } from "../utils/comparison-engine"
import { getForecastMetrics } from "./forecast.service"
import { processInsightsV2 } from "../insights-engine-v2/insights-engine-v2.service"
import { runIntelligence } from "../../intelligence-core"

/** Resolves an AnalyticsPeriod into atomic startDate/endDate. */
function resolveRange(period: AnalyticsPeriod): DateRange {
 const endDate = new Date()
 endDate.setHours(23, 59, 59, 999)

 const startDate = new Date(endDate)
 startDate.setDate(startDate.getDate() - getDays(period))
 startDate.setHours(0, 0, 0, 0)

 return { startDate, endDate }
}

function getDays(p: AnalyticsPeriod): number {
 if (p === "7d") return 7
 if (p === "30d") return 30
 if (p === "90d") return 90
 return 365
}

function getPreviousRange(current: DateRange): DateRange {
 const diff = current.endDate.getTime() - current.startDate.getTime()
 return {
 startDate: new Date(current.startDate.getTime() - diff - 1),
 endDate: new Date(current.startDate.getTime() - 1),
 }
}

/** Orchestrates the relational analytics computation using Real Accounting rules. */
export async function getAnalyticsPro(
 userId: string,
 period: AnalyticsPeriod = "30d",
): Promise<AnalyticsProResponse> {
 const currentRange = resolveRange(period)
 const prevRange = getPreviousRange(currentRange)

 // 1. Parallel collection from Unified Repository
 const [
 revenueMetrics,
 funnel,
 leadsCountPrev,
 totalInvoicesCurrent,
 paidInvoicesCountCurrent,
 overdueInvoicesCountCurrent,
 clientRevenueMap,
 overdueRevenueAmount,
 ] = await Promise.all([
 getRevenueMetrics(userId, currentRange, prevRange),
 buildFunnelV2(userId, currentRange),
 repo.countLeads(userId, prevRange.startDate, prevRange.endDate),
 repo.countInvoicesIssued(userId, currentRange.startDate, currentRange.endDate),
 repo.countInvoicesWithPayments(userId, currentRange.startDate, currentRange.endDate),
 repo.countOverdueInvoices(userId, currentRange.startDate, currentRange.endDate),
 repo.getRevenueByClient(userId, currentRange.startDate, currentRange.endDate),
 repo.getOverdueRevenue(userId, currentRange.startDate, currentRange.endDate),
 ])

 // 2. Metrics Separation (Accounting Logic)
 const issuedRevenue = {
 current: revenueMetrics.issued.current,
 previous: revenueMetrics.issued.previous,
 growth: revenueMetrics.issued.growth
 }

 const collectedRevenue = {
 current: revenueMetrics.paid.current,
 previous: revenueMetrics.paid.previous,
 growth: revenueMetrics.paid.growth
 }

 // 3. Sequential Calculation for Dependent Services
 const ltv = await calculateLTV(userId, currentRange, collectedRevenue.current)

 // 4. Consistent metric extraction from Funnel
 const currentLeads = funnel.stages.find(s => s.label === "Leads")?.count ?? 0
 const currentSales = funnel.stages.find(s => s.label === "Ventas")?.count ?? 0

 // 5. Derived Relational KPIs
 const conversion = currentLeads > 0 ? (currentSales / currentLeads) * 100 : 0
 const paidRatio = issuedRevenue.current > 0 ? (collectedRevenue.current / issuedRevenue.current) * 100 : 0
 const overdueRatio = totalInvoicesCurrent > 0 ? (overdueInvoicesCountCurrent / totalInvoicesCurrent) * 100 : 0
 const avgTicket = paidInvoicesCountCurrent > 0 ? collectedRevenue.current / paidInvoicesCountCurrent : 0

 // 6. Intelligence Core Integration (CRITICAL)
 const forecastRaw = await getForecastMetrics(userId, currentRange.startDate, currentRange.endDate)

 const intelligence = runIntelligence({
 leads: currentLeads,
 sales: currentSales,
 issuedRevenue: issuedRevenue.current,
 collectedRevenue: collectedRevenue.current,
 overdueAmount: overdueRevenueAmount,
 uniquePaidClients: paidInvoicesCountCurrent,
 previousIssuedRevenue: issuedRevenue.previous,
 previousCollectedRevenue: collectedRevenue.previous,
 historicalDays: getDays(period),
 activeDays: forecastRaw?.history?.filter(v => v > 0).length || 0,
 dailyRevenueSeries: forecastRaw?.history || [],
 revenueByClient: Array.from(clientRevenueMap.entries()).map(([clientId, total]) => ({ clientId, total }))
 })

 // 7. Mapping Intelligence back to AnalyticsProResponse
 const score: BusinessScore = {
 score: intelligence.score.score,
 category: intelligence.score.category as any,
 stage: intelligence.score.stage as any
 }

 const insights: Insight[] = intelligence.risks.map(risk => ({
 priority: risk.severity as InsightPriority,
 code: risk.code,
 message: risk.message,
 recommendation: risk.recommendation
 }))

 const forecast: ForecastMetrics | null = forecastRaw && intelligence.forecast.projected30d > 0 ? {
 projectedRevenue: intelligence.forecast.projected30d,
 projectedGrowth: calculateGrowth(intelligence.forecast.projected30d, collectedRevenue.current),
 trend: intelligence.forecast.slope > 0.05 ? "ACCELERATING" : intelligence.forecast.slope < -0.05 ? "DECLINING" : "STABLE",
 history: forecastRaw.history,
 // Propagate V2 fields
 projected30d: intelligence.forecast.projected30d,
 confidence: intelligence.forecast.confidence,
 spikeDetected: intelligence.forecast.spikeDetected,
 volatility: intelligence.forecast.volatility
 } : null

 // 8. Insights Engine V2 (Advanced)
 const insightsV2 = await processInsightsV2({
 baseScore: score.score,
 leadsTotal: currentLeads,
 leadsGrowth: calculateGrowth(currentLeads, leadsCountPrev),
 conversionRate: conversion,
 paidRatio,
 overdueRatio,
 revenueGrowth: issuedRevenue.growth,
 dailyRevenue: forecastRaw?.history || [],
 clientRevenueMap: clientRevenueMap,
 historicalDays: getDays(period),
 activeDays: forecastRaw?.history?.filter(v => v > 0).length || 0
 })

 // 9. Final Assembly
 return {
 revenue: {
 issued: round(issuedRevenue.current),
 collected: round(collectedRevenue.current),
 previousIssued: round(issuedRevenue.previous),
 growthIssued: issuedRevenue.growth
 },
 cashflow: {
 collected: round(collectedRevenue.current),
 previousCollected: round(collectedRevenue.previous),
 growthCollected: collectedRevenue.growth
 },
 leads: {
 total: currentLeads,
 growth: calculateGrowth(currentLeads, leadsCountPrev),
 },
 conversion: round(conversion),
 avgTicket: round(avgTicket),
 paidRatio: Math.min(100, round(paidRatio)),
 overdueRatio: round(overdueRatio),
 ltv: round(ltv),
 funnel,
 score,
 insights,
 forecast,
 insightsV2
 }
}

function round(n: number): number {
 return Math.round(n * 100) / 100
}
