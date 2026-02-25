// ─────────────────────────────────────────────────────────────
// Analytics Pro — Score Service (Redesigned)
// ─────────────────────────────────────────────────────────────

import type { BusinessScore } from "../types/analytics-pro.types"

export interface ScoreInputs {
 conversion: number
 paidRatio: number
 overdueRatio: number
 growth: number
 ltv: number
 activityFactor: number // 0-10 based on business activity
}

export function calculateBusinessScore(inputs: ScoreInputs): BusinessScore {
 const { conversion, paidRatio, overdueRatio, growth, ltv, activityFactor } = inputs

 // 1. Base weights (total 100)
 const conversionPoints = Math.min(25, (conversion / 15) * 25) // Max 25 pts at 15% conversion
 const growthPoints = Math.min(25, Math.max(0, (growth / 20) * 25)) // Max 25 pts at 20% growth
 const paidPoints = (paidRatio / 100) * 20 // Max 20 pts at 100% paid
 const activityPoints = Math.min(10, activityFactor) // Max 10 pts
 const ltvPoints = Math.min(20, (ltv / 500) * 20) // Max 20 pts at 500€ LTV

 // 2. Penalties
 const overduePenalty = (overdueRatio / 100) * 20 // Max -20 pts at 100% overdue

 // 3. Final calculation
 let rawScore = conversionPoints + growthPoints + paidPoints + activityPoints + ltvPoints - overduePenalty

 // Guard: Max 100, Min 0
 const score = Math.round(Math.max(0, Math.min(100, rawScore)))

 return {
 score,
 category: score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW",
 stage: determineStage(score, growth)
 }
}

function determineStage(score: number, growth: number): "EARLY" | "GROWING" | "SCALING" | "OPTIMIZED" {
 if (score >= 85 && growth > 15) return "OPTIMIZED"
 if (score >= 65 && growth > 5) return "SCALING"
 if (score >= 40) return "GROWING"
 return "EARLY"
}
