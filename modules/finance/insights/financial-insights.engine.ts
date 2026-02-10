import {
  getTotalRevenue,
  getRevenueGrowth,
  getTotalExpenses,
  getProfitMargin,
  getClientConcentration,
  getBurnRate,
  getRunwayEstimate,
} from "@/modules/finance/metrics"

export type InsightSeverity = "low" | "medium" | "high"

export type FinancialInsight = {
  id: string
  severity: InsightSeverity
  type: string
  title: string
  explanation: string
  impactScore: number
}

export type FinancialInsightsInput = {
  userId: string
  from: Date
  to: Date
  previousFrom: Date
  previousTo: Date
  /** Optional. When provided, runway is computed and SHORT_RUNWAY can fire. */
  currentCash?: number
}

const THRESHOLD_REVENUE_DROP_PCT = -10
const THRESHOLD_EXPENSE_SPIKE_PCT = 15
const THRESHOLD_LOW_MARGIN_PCT = 20
const THRESHOLD_CLIENT_CONCENTRATION_PCT = 40
const THRESHOLD_ANOMALY_PCT = 30
const THRESHOLD_SHORT_RUNWAY_MONTHS = 3
const REVENUE_FLAT_BAND_PCT = 5

function makeId(type: string, index: number): string {
  return `${type}-${index}`
}

function clampImpact(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Runs all detection rules and returns insights. No DB, no UI, no formatting.
 * Uses only modules/finance/metrics.
 */
export async function getFinancialInsights(
  input: FinancialInsightsInput
): Promise<FinancialInsight[]> {
  const { userId, from, to, previousFrom, previousTo, currentCash } = input
  const insights: FinancialInsight[] = []
  let anomalyIndex = 0

  const [
    revenueGrowth,
    currentRevenue,
    previousRevenue,
    currentExpenses,
    previousExpenses,
    margin,
    concentration,
    burnCurrent,
    burnPrevious,
    runwayFromMetrics,
  ] = await Promise.all([
    getRevenueGrowth(userId, from, to, previousFrom, previousTo),
    getTotalRevenue(userId, from, to),
    getTotalRevenue(userId, previousFrom, previousTo),
    getTotalExpenses(userId, from, to),
    getTotalExpenses(userId, previousFrom, previousTo),
    getProfitMargin(userId, from, to),
    getClientConcentration(userId, from, to),
    getBurnRate(userId, from, to),
    getBurnRate(userId, previousFrom, previousTo),
    getRunwayEstimate(userId, from, to),
  ])

  const runway =
    currentCash != null && currentCash > 0 && burnCurrent > 0
      ? currentCash / burnCurrent
      : runwayFromMetrics

  const marginPct = margin * 100
  const concentrationPct = concentration * 100

  // --- REVENUE DROP: growth < -10% ---
  if (revenueGrowth < THRESHOLD_REVENUE_DROP_PCT) {
    const severity: InsightSeverity =
      revenueGrowth < -20 ? "high" : revenueGrowth < -10 ? "medium" : "low"
    const impact =
      severity === "high" ? 75 : severity === "medium" ? 50 : 25
    insights.push({
      id: makeId("revenue-drop", insights.length),
      severity,
      type: "REVENUE_DROP",
      title: "Revenue decline",
      explanation: `Revenue growth is ${revenueGrowth.toFixed(1)}% vs prior period. Requires attention.`,
      impactScore: clampImpact(impact),
    })
  }

  // --- EXPENSE SPIKE: expenses increased > 15% ---
  const expenseGrowthPct =
    previousExpenses > 0
      ? ((currentExpenses - previousExpenses) / previousExpenses) * 100
      : 0
  if (expenseGrowthPct > THRESHOLD_EXPENSE_SPIKE_PCT) {
    const severity: InsightSeverity =
      expenseGrowthPct > 30 ? "high" : expenseGrowthPct > 15 ? "medium" : "low"
    insights.push({
      id: makeId("expense-spike", insights.length),
      severity,
      type: "EXPENSE_SPIKE",
      title: "Expense spike",
      explanation: `Expenses increased ${expenseGrowthPct.toFixed(1)}% vs prior period.`,
      impactScore: clampImpact(severity === "high" ? 65 : severity === "medium" ? 45 : 20),
    })
  }

  // --- LOW MARGIN: margin < 20% ---
  if (marginPct < THRESHOLD_LOW_MARGIN_PCT && currentRevenue > 0) {
    const severity: InsightSeverity =
      marginPct < 10 ? "high" : marginPct < 20 ? "medium" : "low"
    insights.push({
      id: makeId("low-margin", insights.length),
      severity,
      type: "LOW_MARGIN",
      title: "Low profit margin",
      explanation: `Profit margin is ${marginPct.toFixed(1)}%. Below 20% target.`,
      impactScore: clampImpact(severity === "high" ? 70 : 50),
    })
  }

  // --- CLIENT RISK: top client concentration > 40% ---
  if (concentrationPct > THRESHOLD_CLIENT_CONCENTRATION_PCT) {
    const severity: InsightSeverity =
      concentrationPct > 60 ? "high" : "medium"
    insights.push({
      id: makeId("client-risk", insights.length),
      severity,
      type: "CLIENT_RISK",
      title: "High client concentration",
      explanation: `Top client represents ${concentrationPct.toFixed(0)}% of revenue. Loss of this client would materially impact revenue.`,
      impactScore: clampImpact(severity === "high" ? 80 : 55),
    })
  }

  // --- HIGH BURN: burn rate rising and revenue flat ---
  const revenueFlat =
    Math.abs(revenueGrowth) <= REVENUE_FLAT_BAND_PCT || previousRevenue === 0
  const burnRising = burnCurrent > burnPrevious && burnCurrent > 0
  if (burnRising && revenueFlat) {
    insights.push({
      id: makeId("high-burn", insights.length),
      severity: "high",
      type: "HIGH_BURN",
      title: "Burn rate rising with flat revenue",
      explanation: "Monthly burn is increasing while revenue is flat. Cash position may deteriorate.",
      impactScore: clampImpact(75),
    })
  }

  // --- SHORT RUNWAY: runway < 3 months (only when runway is known) ---
  if (runway > 0 && runway < THRESHOLD_SHORT_RUNWAY_MONTHS) {
    insights.push({
      id: makeId("short-runway", insights.length),
      severity: "high",
      type: "SHORT_RUNWAY",
      title: "Short runway",
      explanation: `Runway is ${runway.toFixed(1)} months at current burn. Urgent action required.`,
      impactScore: clampImpact(90),
    })
  }

  // --- ANOMALY: metric changes > 30% vs prior period ---
  const checks: { name: string; current: number; previous: number }[] = [
    { name: "revenue", current: currentRevenue, previous: previousRevenue },
    { name: "expenses", current: currentExpenses, previous: previousExpenses },
  ]
  for (const { name, current, previous } of checks) {
    if (previous === 0) continue
    const changePct = ((current - previous) / previous) * 100
    if (Math.abs(changePct) > THRESHOLD_ANOMALY_PCT) {
      insights.push({
        id: makeId("anomaly", anomalyIndex++),
        severity: Math.abs(changePct) > 50 ? "high" : "medium",
        type: "ANOMALY",
        title: `${name} anomaly`,
        explanation: `${name} changed ${changePct.toFixed(1)}% vs prior period. Verify data and drivers.`,
        impactScore: clampImpact(Math.abs(changePct) > 50 ? 55 : 35),
      })
    }
  }

  return insights
}
