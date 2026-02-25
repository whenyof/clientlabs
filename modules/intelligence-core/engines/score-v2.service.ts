// ─────────────────────────────────────────────────────────────
// Intelligence Core — Score V2 Engine
// ─────────────────────────────────────────────────────────────

import { ScoreResult, BusinessMetricsInput } from "../types/intelligence.types"
import { calculateGrowth, calculateMaxConcentration } from "../calculators"

/**
 * Refactored Business Score V2
 * Enterprise-grade, realistic, and conservative scoring.
 */
export function calculateScoreV2(
 input: BusinessMetricsInput,
 forecast: { volatility: number; spikeDetected: boolean }
): ScoreResult {
 // 1. ESTRUCTURA BASE (Weighted)

 // conversionScore (25%)
 const conversionRate = input.leads > 0 ? (input.sales / input.leads) : 0
 const conversionScore = Math.min(100, conversionRate * 100)

 // financialScore (25%)
 // Based on collected vs issued revenue
 const financialRate = input.issuedRevenue > 0 ? (input.collectedRevenue / input.issuedRevenue) : 0
 const financialScore = Math.min(100, financialRate * 100)

 // growthScore (20%)
 const growthValue = calculateGrowth(input.collectedRevenue, input.previousCollectedRevenue)
 let growthScore = Math.min(100, Math.max(0, growthValue))

 // E) Crecimiento artificial penalty
 if (forecast.spikeDetected === true && growthValue > 30) {
 growthScore = growthScore * 0.5
 }

 // stabilityScore (15%)
 // Stability is inverse of volatility (0 volatility = 100 stability)
 const stabilityScore = Math.max(0, (1 - forecast.volatility) * 100)

 // maturityScore (15%)
 // Scaled to 90 active days as full maturity baseline
 const maturityScore = Math.min(100, (input.activeDays / 90) * 100)

 // Weighted Total Score Calculation
 let score = (conversionScore * 0.25) +
 (financialScore * 0.25) +
 (growthScore * 0.20) +
 (stabilityScore * 0.15) +
 (maturityScore * 0.15)

 // 2. PENALIZACIONES OBLIGATORIAS

 // A) Bajo volumen
 // Si leads < 10 OR invoices < 5 (sales)
 if (input.leads < 10 || input.sales < 5) {
 score = Math.min(score, 75)
 }

 // B) Histórico insuficiente
 if (input.activeDays < 30) {
 score = Math.min(score, 85)
 }

 // C) Alta concentración
 // topClientShare > 0.6
 const topClientShare = input.revenueByClient && input.collectedRevenue > 0
 ? calculateMaxConcentration(input.revenueByClient, input.collectedRevenue) / 100
 : 0

 if (topClientShare > 0.6) {
 score -= 15
 }

 // D) Alta volatilidad
 if (forecast.volatility > 0.8) {
 score -= 10
 }

 // 3. CLAMP FINAL
 let finalScore = Math.max(0, Math.min(100, Math.round(score)))

 // 4. Optimized Category Constraints
 // Requirements to allow 90+ Score
 const canReachOptimized =
 input.leads >= 30 &&
 input.sales >= 10 &&
 input.activeDays >= 90 &&
 topClientShare < 0.4 &&
 forecast.volatility < 0.5

 if (!canReachOptimized && finalScore >= 90) {
 finalScore = 89
 }

 // 5. CATEGORIZACIÓN NUEVA
 let category = ""
 let stage = ""

 if (finalScore >= 90) {
 category = "OPTIMIZED"
 stage = "MATURE"
 } else if (finalScore >= 80) {
 category = "STRONG"
 stage = "SCALING"
 } else if (finalScore >= 65) {
 category = "STABLE"
 stage = "GROWING"
 } else if (finalScore >= 40) {
 category = "UNSTABLE"
 stage = "FORMING"
 } else {
 category = "CRITICAL"
 stage = "EARLY"
 }

 return {
 score: finalScore,
 category,
 stage
 }
}
