// ─────────────────────────────────────────────────────────────
// Analytics Pro — Extended Types
// New types for score, insights, funnel steps, and the full
// Pro response. Coexists with existing analytics.types.ts.
// Updated with Insights Engine V2 support.
// ─────────────────────────────────────────────────────────────

import type { InsightsEngineV2Response } from "../insights-engine-v2/types/insights-v2.types"
export type { InsightsEngineV2Response }

export type AnalyticsPeriod = "7d" | "30d" | "90d" | "12m"

// ── Revenue ──────────────────────────────────────────────────

export type RevenueMetrics = {
 current: number
 previous: number
 growth: number
}

// ── Funnel ───────────────────────────────────────────────────

export type FunnelHealth = "GOOD" | "WARNING" | "CRITICAL"

export type FunnelStage = {
 label: string
 count: number
 percentageFromStart: number
 percentageFromPrevious: number
 dropOff: number
 health: FunnelHealth
}

export type FunnelV2Response = {
 stages: FunnelStage[]
 bottleneckStage: string | null
}

// ── Score ────────────────────────────────────────────────────

export type ScoreCategory = "LOW" | "MEDIUM" | "HIGH"
export type ScoreStage = "EARLY" | "GROWING" | "SCALING" | "OPTIMIZED"

export type BusinessScore = {
 score: number
 category: ScoreCategory
 stage: ScoreStage
}

// ── Insights ────────────────────────────────────────────────

export type InsightPriority = "HIGH" | "MEDIUM" | "LOW"

export type Insight = {
 priority: InsightPriority
 code: string
 message: string
 recommendation: string
}
// ── Forecast ────────────────────────────────────────────────
export type ForecastTrend = "ACCELERATING" | "STABLE" | "DECLINING"

export type ForecastMetrics = {
 projectedRevenue: number
 projectedGrowth: number
 trend: ForecastTrend
 history: number[] // Last 30 days daily revenue for the chart
 // V2 Fields
 projected30d?: number
 confidence?: "HIGH" | "MEDIUM" | "LOW"
 spikeDetected?: boolean
 volatility?: number
}

// ── Aggregated Response ─────────────────────────────────────

export type AnalyticsProResponse = {
 revenue: {
 issued: number
 collected: number
 previousIssued: number
 growthIssued: number
 }
 cashflow: {
 collected: number
 previousCollected: number
 growthCollected: number
 }
 leads: {
 total: number
 growth: number
 }
 conversion: number
 avgTicket: number
 paidRatio: number
 overdueRatio: number
 ltv: number
 funnel: FunnelV2Response
 score: BusinessScore
 insights: Insight[]
 forecast: ForecastMetrics | null
 // V2 Data
 insightsV2: InsightsEngineV2Response | null
}

// ── Date Range (internal) ───────────────────────────────────

export type DateRange = {
 startDate: Date
 endDate: Date
}
