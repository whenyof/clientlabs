// ─────────────────────────────────────────────────────────────
// Insights Engine V2 — Confidence Engine
// ─────────────────────────────────────────────────────────────

import type { ConfidenceMetrics, ConfidenceLevel } from "./types/insights-v2.types"

/**
 * Calculates the reliability of the current dataset.
 * Prevents making strong business claims when data is scarce or erratic.
 */
export function calculateConfidence(params: {
 historicalDays: number,
 activeDays: number,
 totalEvents: number,
 volumeScore: number
}): ConfidenceMetrics {
 const { historicalDays, activeDays, totalEvents, volumeScore } = params

 // 1. Calculate weighted reliability score
 // Weight: 30% Volume, 40% Regularity (active/historical), 30% Absolute Scale
 const regularity = historicalDays > 0 ? (activeDays / historicalDays) * 100 : 0
 const absoluteFactor = Math.min(100, (totalEvents / 20) * 100) // 20 events as stable baseline

 const confidenceScore = (volumeScore * 0.3) + (regularity * 0.4) + (absoluteFactor * 0.3)

 // 2. Determine Level
 let level: ConfidenceLevel = "LOW"
 if (confidenceScore >= 70) level = "HIGH"
 else if (confidenceScore >= 35) level = "MEDIUM"

 return {
 level,
 score: Math.round(confidenceScore),
 indicators: {
 historicalDays,
 activeDays,
 totalEvents,
 volumeScore
 }
 }
}
