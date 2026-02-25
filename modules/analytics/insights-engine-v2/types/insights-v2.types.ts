// ─────────────────────────────────────────────────────────────
// Insights Engine V2 — Shared Types
// ─────────────────────────────────────────────────────────────

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW"

export type InsightSeverity = "CRITICAL" | "WARNING" | "INFO" | "POSITIVE"

export type InsightCategory = "FINANCIAL" | "COMMERCIAL" | "GROWTH"

export interface InsightV2 {
 category: InsightCategory
 severity: InsightSeverity
 message: string
 recommendation: string
 estimatedImpact: string
}

export interface ConfidenceMetrics {
 level: ConfidenceLevel
 score: number // 0-100
 indicators: {
 historicalDays: number
 activeDays: number
 totalEvents: number
 volumeScore: number
 }
}

export interface AdjustedScore {
 rawScore: number
 finalScore: number
 modifications: Array<{
 reason: string
 adjustment: number
 }>
}

export interface ExecutiveDecisionData {
 status: string
 description: string
 primaryIssue: string
 impactProjection: string
 confidenceLevel: ConfidenceLevel
 confidenceExplanation: string
 stabilityScore: number // 0-100 for the radial meter
 lastUpdated: string
}

export interface InsightsEngineV2Response {
 confidence: ConfidenceMetrics
 insights: InsightV2[]
 score: AdjustedScore
 executive: ExecutiveDecisionData | null
}
