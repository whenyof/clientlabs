// ─────────────────────────────────────────────────────────────
// Intelligence Core — Forecast Engine V2
// ─────────────────────────────────────────────────────────────

import { ForecastInputV2, ForecastOutputV2 } from "../types/intelligence.types"

/**
 * Advanced Revenue Forecast Engine (V2).
 * Standardized logic for all application projections.
 */
export function runForecastV2(input: ForecastInputV2): ForecastOutputV2 {
 const { dailyRevenue, minHistoryDays, periodDays } = input
 const historyCount = dailyRevenue.length

 // 1. Initial Data Prep & Metrics
 const rawAmounts = dailyRevenue.map(d => d.amount)
 const totalHistoryRevenue = rawAmounts.reduce((a, b) => a + b, 0)
 const meanRaw = historyCount > 0 ? totalHistoryRevenue / historyCount : 0

 // Calculate Standard Deviation for Anomaly Detection
 const variance = historyCount > 0
 ? rawAmounts.reduce((acc, val) => acc + Math.pow(val - meanRaw, 2), 0) / historyCount
 : 0
 const stdDev = Math.sqrt(variance)
 const anomalyThreshold = meanRaw + (2.5 * stdDev)

 // 2. Anomaly Detection & Cleaning
 const cleanSeries: number[] = []
 let spikeDetected = false
 const anomalyIndices: number[] = []

 rawAmounts.forEach((val, idx) => {
 if (meanRaw > 0 && val > anomalyThreshold && val > 100) { // Safety: avoid flagging tiny growth as anomaly
 spikeDetected = true
 anomalyIndices.push(idx)
 } else {
 cleanSeries.push(val)
 }
 })

 // 3. Moving Average Smoothing (Last 7 days window by default)
 const smoothedSeries = applyMovingAverage(cleanSeries, 7)

 // 4. Linear Regression (Least Squares) on cleaned/smoothed series
 // trend(x) = intercept + slope * x
 const { slope, intercept } = calculateRegression(smoothedSeries)

 // 5. Volatility Calculation (Coefficient of Variation)
 const volatility = meanRaw > 0 ? stdDev / meanRaw : 0

 // 6. Confidence Model
 let confidence: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM"

 if (historyCount < minHistoryDays || historyCount < 14) {
 confidence = "LOW"
 } else if (historyCount >= 60 && volatility < 0.4 && !spikeDetected) {
 confidence = "HIGH"
 } else if (spikeDetected || volatility > 0.8) {
 confidence = "LOW"
 }

 // 7. Projection logic with Safety Rules
 const lastDayIdx = Math.max(0, smoothedSeries.length - 1)
 const baselineDaily = smoothedSeries.length > 0 ? smoothedSeries[lastDayIdx] : meanRaw

 // Normalize slope per day
 let dailySlope = slope

 // Safety Rule: Cap growth slope to realistic ceiling (max 300% monthly equivalent = ~4% daily growth)
 const maxSlope = baselineDaily * 0.04
 if (dailySlope > maxSlope) {
 dailySlope = maxSlope
 }

 // Safety Rule: Dampen if high volatility
 let dampenedSlope = dailySlope
 if (volatility > 0.8) {
 dampenedSlope *= 0.7
 }

 // Project 30 days
 // projection = sum(idx from 1 to 30) of (baseline + dampenedSlope * idx)
 // Simplified: (baseline * 30) + (dampenedSlope * 30 * 15) // Arithmetic series progression
 let projected30d = (baselineDaily * 30) + (dampenedSlope * 30 * 15 * 0.5) // 0.5 for conservative linear growth

 // Absolute Floor
 projected30d = Math.max(0, projected30d)

 return {
 projected30d: Math.round(projected30d),
 slope: round(dailySlope),
 volatility: round(volatility),
 spikeDetected,
 confidence
 }
}

/** Pure math: Moving Average */
function applyMovingAverage(series: number[], window: number): number[] {
 if (series.length === 0) return []
 const result: number[] = []
 for (let i = 0; i < series.length; i++) {
 const start = Math.max(0, i - Math.floor(window / 2))
 const end = Math.min(series.length - 1, i + Math.floor(window / 2))
 const subset = series.slice(start, end + 1)
 const avg = subset.reduce((a, b) => a + b, 0) / subset.length
 result.push(avg)
 }
 return result
}

/** Pure math: Least Squares regression */
function calculateRegression(series: number[]): { slope: number; intercept: number } {
 const n = series.length
 if (n < 2) return { slope: 0, intercept: series[0] || 0 }

 let sumX = 0
 let sumY = 0
 let sumXY = 0
 let sumXX = 0

 for (let i = 0; i < n; i++) {
 sumX += i
 sumY += series[i]
 sumXY += i * series[i]
 sumXX += i * i
 }

 const denominator = (n * sumXX - sumX * sumX)
 const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0
 const intercept = (sumY / n) - (slope * (n - 1) / 2)

 return { slope, intercept }
}

function round(n: number): number {
 return Math.round(n * 100) / 100
}
