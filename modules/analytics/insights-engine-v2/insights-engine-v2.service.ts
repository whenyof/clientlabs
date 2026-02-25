// ─────────────────────────────────────────────────────────────
// Insights Engine V2 — Main Orchestrator
// ─────────────────────────────────────────────────────────────

import { calculateConfidence } from "./confidence.service"
import { getFinancialInsights } from "./insight-rules/financial.rules"
import { getCommercialInsights } from "./insight-rules/commercial.rules"
import { getGrowthInsights } from "./insight-rules/growth.rules"
import type { InsightsEngineV2Response, InsightV2, ExecutiveDecisionData, AdjustedScore } from "./types/insights-v2.types"

import { runForecastV2, calculateScoreV2 } from "@/modules/intelligence-core"

export async function processInsightsV2(params: {
 baseScore: number,
 leadsTotal: number,
 leadsGrowth: number,
 conversionRate: number,
 paidRatio: number,
 overdueRatio: number,
 revenueGrowth: number,
 dailyRevenue: number[], // History from last nodes
 clientRevenueMap: Map<string, number>, // Client concentration
 historicalDays: number,
 activeDays: number
}): Promise<InsightsEngineV2Response> {

 // 1. Calculate Metrics using the Unified Engine
 const historySeries = params.dailyRevenue.map((v, i) => ({
 date: new Date(Date.now() - (params.dailyRevenue.length - i) * 24 * 60 * 60 * 1000),
 amount: v
 }))

 const forecast = runForecastV2({
 dailyRevenue: historySeries,
 minHistoryDays: 14,
 periodDays: params.historicalDays
 })

 const totalCollected = params.dailyRevenue.reduce((a, b) => a + b, 0)

 const clientValues = Array.from(params.clientRevenueMap.values())
 const maxClientVal = Math.max(...clientValues, 0)
 const maxConcentration = totalCollected > 0 ? (maxClientVal / totalCollected) * 100 : 0

 // V2 replacements
 const volatilityIndex = forecast.volatility
 const spikeDetected = forecast.spikeDetected
 const maxDay = Math.max(...params.dailyRevenue, 0)
 const maxDailySpike = totalCollected > 0 ? (maxDay / totalCollected) * 100 : 0

 // 2. Confidence
 const confidence = calculateConfidence({
 historicalDays: params.historicalDays,
 activeDays: params.activeDays,
 totalEvents: params.dailyRevenue.filter(v => v > 0).length,
 volumeScore: Math.min(100, (totalCollected / 5000) * 100)
 })

 // 3. Adjusted Score V2 (Intelligence Core Integration)
 const scoreResult = calculateScoreV2({
 leads: params.leadsTotal,
 sales: Math.round(params.leadsTotal * params.conversionRate), // Invoices estimate
 issuedRevenue: totalCollected, // Simplified for this context
 collectedRevenue: totalCollected,
 overdueAmount: totalCollected * params.overdueRatio,
 uniquePaidClients: params.clientRevenueMap.size,
 previousIssuedRevenue: totalCollected / (1 + params.revenueGrowth / 100),
 previousCollectedRevenue: totalCollected / (1 + params.revenueGrowth / 100),
 historicalDays: params.historicalDays,
 activeDays: params.activeDays,
 dailyRevenueSeries: params.dailyRevenue,
 revenueByClient: Array.from(params.clientRevenueMap.entries()).map(([clientId, total]) => ({ clientId, total }))
 }, {
 volatility: volatilityIndex,
 spikeDetected
 })

 // Map to legacy AdjustedScore contract for UI compatibility
 const score: AdjustedScore = {
 rawScore: params.baseScore,
 finalScore: scoreResult.score,
 modifications: [] // Reasons are now internalized in V2
 }

 // 4. Insights Generation
 const insights: InsightV2[] = [
 ...getFinancialInsights({
 paidRatio: params.paidRatio,
 overdueRatio: params.overdueRatio,
 maxConcentration
 }),
 ...getCommercialInsights({
 leadsTotal: params.leadsTotal,
 conversionRate: params.conversionRate,
 leadsGrowth: params.leadsGrowth
 }),
 ...getGrowthInsights({
 maxDailySpike,
 volatilityIndex,
 revenueGrowth: params.revenueGrowth
 })
 ]

 // 5. Synthesis for Executive Decision
 const criticalInsight = insights.find(i => i.severity === "CRITICAL")
 const warningInsight = insights.find(i => i.severity === "WARNING")
 const primaryIssue = criticalInsight?.message || warningInsight?.message || "Operación Estable"

 const executive: ExecutiveDecisionData = {
 status: score.finalScore > 75 ? "CRECIMIENTO SALUDABLE" : score.finalScore > 40 ? "ATENCIÓN REQUERIDA" : "RIESGO OPERATIVO",
 description: `El negocio presenta un índice de salud del ${score.finalScore}%. ${insights.length > 0 ? "Existen áreas de mejora detectadas en la captación y flujo." : "La consistencia de datos es positiva."}`,
 primaryIssue,
 impactProjection: criticalInsight ? criticalInsight.estimatedImpact : "Estabilidad en los próximos 30 días",
 confidenceLevel: confidence.level,
 confidenceExplanation: confidence.level === "HIGH"
 ? "Datos consolidados y recurrentes."
 : confidence.level === "MEDIUM"
 ? "Volumen suficiente pero con variabilidad."
 : "Se requiere más historial para decisiones críticas.",
 stabilityScore: Math.round(Math.max(0, 100 - (volatilityIndex * 100))),
 lastUpdated: new Date().toISOString()
 }

 return {
 confidence,
 insights,
 score,
 executive: confidence.level !== "LOW" ? executive : null
 }
}
