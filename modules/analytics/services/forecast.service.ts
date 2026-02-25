// ─────────────────────────────────────────────────────────────
// Analytics Pro — Intelligent Forecast Service (V2 Integration)
// ─────────────────────────────────────────────────────────────

import * as repo from "../repositories/analytics-pro.repository"
import type { ForecastMetrics } from "../types/analytics-pro.types"
import { runForecastV2 } from "@/modules/intelligence-core"

/**
 * Calculates a 30-day revenue projection using the unified Forecast Engine V2.
 */
export async function getForecastMetrics(
 userId: string,
 from: Date,
 to: Date
): Promise<ForecastMetrics | null> {
 // 1. Get daily revenue data from repository
 const dailyMap = await repo.getDailyCollectedRevenue(userId, from, to)

 // 2. Prepare standardized sequence for the projection engine
 const history: Array<{ date: Date; amount: number }> = []
 const rawSeries: number[] = []
 const cursor = new Date(from)
 let totalCollected = 0

 while (cursor <= to) {
 const key = cursor.toISOString().slice(0, 10)
 const dayValue = dailyMap.get(key) || 0

 history.push({
 date: new Date(cursor),
 amount: dayValue
 })
 rawSeries.push(dayValue)
 totalCollected += dayValue
 cursor.setDate(cursor.getDate() + 1)
 }

 if (totalCollected === 0 && history.length < 7) return null

 // 3. Execute Unified Forecast Engine V2
 const forecast = runForecastV2({
 dailyRevenue: history,
 minHistoryDays: 30,
 periodDays: history.length
 })

 // 4. Map V2 Output to Analytics contract
 const projectedGrowth = totalCollected > 0
 ? ((forecast.projected30d - totalCollected) / totalCollected) * 100
 : 0

 let trend: "ACCELERATING" | "STABLE" | "DECLINING" = "STABLE"
 if (forecast.slope > 0.05) trend = "ACCELERATING"
 else if (forecast.slope < -0.05) trend = "DECLINING"

 return {
 projectedRevenue: forecast.projected30d,
 projectedGrowth: Math.round(projectedGrowth * 100) / 100,
 trend,
 history: rawSeries,
 // V2 Fields
 projected30d: forecast.projected30d,
 confidence: forecast.confidence,
 spikeDetected: forecast.spikeDetected,
 volatility: forecast.volatility
 }
}
