// ─────────────────────────────────────────────────────────────
// Intelligence Core — Central Contracts
// ─────────────────────────────────────────────────────────────

export interface BusinessMetricsInput {
 leads: number
 sales: number
 issuedRevenue: number
 collectedRevenue: number
 overdueAmount: number
 uniquePaidClients: number
 previousIssuedRevenue: number
 previousCollectedRevenue: number
 historicalDays: number
 activeDays: number
 dailyRevenueSeries: number[]
 revenueByClient?: { clientId: string; total: number }[]
}

export interface ScoreResult {
 score: number
 category: string
 stage: string
}

export interface ForecastResult {
 projected30d: number
 slope: number
 volatility: number
 spikeDetected: boolean
 confidence: "HIGH" | "MEDIUM" | "LOW"
 // Legacy support (to be removed once fully migrated)
 projectedRevenue30d: number
}

export interface ForecastInputV2 {
 dailyRevenue: Array<{ date: Date; amount: number }>
 minHistoryDays: number
 periodDays: number
}

export interface ForecastOutputV2 {
 projected30d: number
 slope: number
 volatility: number
 spikeDetected: boolean
 confidence: "HIGH" | "MEDIUM" | "LOW"
}

export interface ConfidenceResult {
 level: "LOW" | "MEDIUM" | "HIGH"
 score: number
}

export interface RiskAlert {
 code: string
 severity: "LOW" | "MEDIUM" | "HIGH"
 message: string
 recommendation: string
}

export interface IntelligenceOutput {
 score: ScoreResult
 forecast: ForecastResult
 confidence: ConfidenceResult
 risks: RiskAlert[]
 ts: string // ISO Timestamp
}
