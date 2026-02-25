// ─────────────────────────────────────────────────────────────
// Intelligence Core — General Forecast Engine (V2 Wrapper)
// ─────────────────────────────────────────────────────────────

import { BusinessMetricsInput, ForecastResult } from "../types/intelligence.types"
import { runForecastV2 } from "./forecast-v2.service"

/**
 * Modern wrapper for the Forecast Engine.
 * Adapts BusinessMetricsInput to the unified Forecast V2 logic.
 */
export function computeForecast(input: BusinessMetricsInput): ForecastResult {
 // Convert primitive dailyRevenueSeries (number[]) to ForecastInputV2
 const dailyRevenue = input.dailyRevenueSeries.map((amount, i) => ({
 date: new Date(Date.now() - (input.dailyRevenueSeries.length - i) * 24 * 60 * 60 * 1000),
 amount
 }))

 const output = runForecastV2({
 dailyRevenue,
 minHistoryDays: 14,
 periodDays: input.historicalDays
 })

 return {
 ...output,
 projectedRevenue30d: output.projected30d // Legacy field support
 }
}
