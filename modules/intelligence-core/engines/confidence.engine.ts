// ─────────────────────────────────────────────────────────────
// Intelligence Core — Confidence Engine
// ─────────────────────────────────────────────────────────────

import { BusinessMetricsInput, ConfidenceResult } from "../types/intelligence.types"
import { calculateVolatility } from "../calculators"

export function computeConfidence(input: BusinessMetricsInput): ConfidenceResult {
 const { historicalDays, dailyRevenueSeries } = input
 const volatility = calculateVolatility(dailyRevenueSeries)
 const totalVolume = dailyRevenueSeries.reduce((a, b) => a + b, 0)

 // Score calculation (0-100)
 const historyComp = Math.min(100, (historicalDays / 90) * 100)
 const stabilityComp = Math.max(0, (1 - volatility) * 100)
 const score = Math.round((historyComp * 0.6) + (stabilityComp * 0.4))

 let level: ConfidenceResult["level"] = "LOW"

 if (historicalDays > 60 && volatility < 0.4) {
 level = "HIGH"
 } else if (historicalDays >= 14 && historicalDays <= 60) {
 level = "MEDIUM"
 } else if (historicalDays < 14 || totalVolume < 100) {
 level = "LOW"
 }

 return {
 level,
 score
 }
}
