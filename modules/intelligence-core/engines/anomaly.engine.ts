// ─────────────────────────────────────────────────────────────
// Intelligence Core — Anomaly Engine
// ─────────────────────────────────────────────────────────────

import { BusinessMetricsInput } from "../types/intelligence.types"

export interface AnomalyResult {
 hasAnomalies: boolean
 indices: number[]
 severity: "LOW" | "MEDIUM" | "HIGH"
}

export function detectAnomalies(input: BusinessMetricsInput): AnomalyResult {
 const series = input.dailyRevenueSeries
 if (series.length === 0) return { hasAnomalies: false, indices: [], severity: "LOW" }

 const average = series.reduce((a, b) => a + b, 0) / series.length
 const threshold = average * 2.5

 const anomalyIndices: number[] = []
 series.forEach((val, idx) => {
 if (average > 0 && val > threshold) {
 anomalyIndices.push(idx)
 }
 })

 return {
 hasAnomalies: anomalyIndices.length > 0,
 indices: anomalyIndices,
 severity: anomalyIndices.length > 3 ? "HIGH" : anomalyIndices.length > 0 ? "MEDIUM" : "LOW"
 }
}
