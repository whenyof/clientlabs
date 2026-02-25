// ─────────────────────────────────────────────────────────────
// Intelligence Core — Aggregator Service
// ─────────────────────────────────────────────────────────────

import { BusinessMetricsInput, IntelligenceOutput } from "./types/intelligence.types"
import { computeForecast } from "./engines/forecast.engine"
import { computeConfidence } from "./engines/confidence.engine"
import { computeRisks } from "./engines/risk.engine"
import { calculateScoreV2 } from "./engines/score-v2.service"

/**
 * Runs the full Intelligence Core suite on the provided metrics.
 * This is a pure function, decoupled from DB or Session logic.
 */
export function runIntelligence(input: BusinessMetricsInput): IntelligenceOutput {
 const forecast = computeForecast(input)

 return {
 score: calculateScoreV2(input, forecast),
 forecast,
 confidence: computeConfidence(input),
 risks: computeRisks(input),
 ts: new Date().toISOString()
 }
}
