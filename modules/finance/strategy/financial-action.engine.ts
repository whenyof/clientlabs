import type { FinancialInsight } from "@/modules/finance/insights"

export type ActionCategory =
  | "pricing"
  | "cost"
  | "sales"
  | "operations"
  | "risk"

export type ActionDifficulty = "low" | "medium" | "high"

export type FinancialAction = {
  id: string
  priority: number
  category: ActionCategory
  title: string
  description: string
  estimatedImpact: number
  confidence: number
  difficulty: ActionDifficulty
}

const SEVERITY_WEIGHT: Record<string, number> = {
  low: 10,
  medium: 30,
  high: 50,
}

const IMPACT_INFLUENCE_FACTOR = 0.5

function computePriority(insight: FinancialInsight): number {
  const weight = SEVERITY_WEIGHT[insight.severity] ?? 20
  const influence = insight.impactScore * IMPACT_INFLUENCE_FACTOR
  return Math.round(weight + influence)
}

function makeActionId(insightId: string, slug: string): string {
  return `${insightId}-${slug}`
}

function baseAction(
  insight: FinancialInsight,
  slug: string,
  category: ActionCategory,
  title: string,
  description: string,
  estimatedImpact: number,
  confidence: number,
  difficulty: ActionDifficulty
): FinancialAction {
  const priority = computePriority(insight)
  return {
    id: makeActionId(insight.id, slug),
    priority,
    category,
    title,
    description,
    estimatedImpact: Math.max(0, Math.min(100, Math.round(estimatedImpact))),
    confidence: Math.max(0, Math.min(100, Math.round(confidence))),
    difficulty,
  }
}

function actionsForLowMargin(insight: FinancialInsight): FinancialAction[] {
  return [
    baseAction(
      insight,
      "price-simulation",
      "pricing",
      "Run price increase simulation",
      "Model margin impact of selective price increases on key products or tiers. Low risk way to test upside.",
      35,
      75,
      "low"
    ),
    baseAction(
      insight,
      "cost-optimization",
      "cost",
      "Launch cost optimization review",
      "Audit fixed and variable costs by category. Target 10–15% reduction in non-critical spend without affecting delivery.",
      45,
      65,
      "medium"
    ),
    baseAction(
      insight,
      "upsell-focus",
      "sales",
      "Focus on upsell and expansion",
      "Prioritize existing accounts for cross-sell and upsell. Higher margin than new acquisition.",
      30,
      70,
      "medium"
    ),
  ]
}

function actionsForRevenueDrop(insight: FinancialInsight): FinancialAction[] {
  return [
    baseAction(
      insight,
      "pipeline-recovery",
      "sales",
      "Activate pipeline recovery plan",
      "Re-engage stalled opportunities and late-stage deals. Short-cycle actions to restore revenue in 1–2 months.",
      40,
      70,
      "medium"
    ),
    baseAction(
      insight,
      "reactivation",
      "sales",
      "Launch churned or dormant reactivation",
      "Target churned or dormant clients with a focused offer. Lower CAC than cold acquisition.",
      25,
      60,
      "low"
    ),
    baseAction(
      insight,
      "campaign-burst",
      "sales",
      "Execute time-bound campaign burst",
      "Run a focused demand or promo campaign to create urgency and pull forward demand.",
      30,
      55,
      "medium"
    ),
  ]
}

function actionsForClientConcentration(insight: FinancialInsight): FinancialAction[] {
  return [
    baseAction(
      insight,
      "diversification",
      "risk",
      "Accelerate revenue diversification",
      "Set targets to reduce top-client revenue share. Grow second-tier accounts and new segments.",
      50,
      70,
      "high"
    ),
    baseAction(
      insight,
      "acquisition-targets",
      "sales",
      "Define acquisition targets in new segments",
      "Identify and qualify accounts in underpenetrated segments to balance concentration.",
      40,
      60,
      "medium"
    ),
    baseAction(
      insight,
      "reduce-dependency",
      "risk",
      "Reduce single-client dependency",
      "Contract and delivery structure to limit exposure. Renegotiate terms and payment profile where possible.",
      35,
      65,
      "high"
    ),
  ]
}

function actionsForHighBurn(insight: FinancialInsight): FinancialAction[] {
  return [
    baseAction(
      insight,
      "reduce-fixed-costs",
      "cost",
      "Reduce fixed costs",
      "Review rent, software, and recurring commitments. Defer or cut non-essential fixed cost.",
      50,
      75,
      "medium"
    ),
    baseAction(
      insight,
      "freeze-hiring",
      "operations",
      "Freeze non-critical hiring",
      "Pause open roles except revenue-critical. Use contractors for variable demand.",
      40,
      85,
      "low"
    ),
    baseAction(
      insight,
      "renegotiate-suppliers",
      "cost",
      "Renegotiate key supplier terms",
      "Request extended terms, volume discounts, or temporary relief from main vendors.",
      35,
      60,
      "medium"
    ),
  ]
}

function actionsForShortRunway(insight: FinancialInsight): FinancialAction[] {
  return [
    baseAction(
      insight,
      "emergency-profitability",
      "operations",
      "Execute emergency profitability plan",
      "All hands plan to reach cash-flow break-even. Revenue pull-forward and cost cuts with clear owners and dates.",
      70,
      80,
      "high"
    ),
    baseAction(
      insight,
      "boost-cash-inflow",
      "sales",
      "Boost short-term cash inflow",
      "Accelerate collections, advance payments, or short-term financing. Improve working capital.",
      55,
      70,
      "medium"
    ),
    baseAction(
      insight,
      "cut-optional-expenses",
      "cost",
      "Cut optional and discretionary expenses",
      "Eliminate non-essential spend immediately. Preserve only revenue and delivery-critical items.",
      60,
      90,
      "low"
    ),
  ]
}

function actionsForExpenseSpike(insight: FinancialInsight): FinancialAction[] {
  return [
    baseAction(
      insight,
      "expense-audit",
      "cost",
      "Audit expense categories",
      "Review categories with largest increase. Confirm legitimacy and reclassify or cut where needed.",
      45,
      75,
      "low"
    ),
    baseAction(
      insight,
      "spend-controls",
      "operations",
      "Tighten spend controls",
      "Implement or reinforce approval limits and budget checks to prevent future spikes.",
      35,
      80,
      "low"
    ),
  ]
}

function actionsForAnomaly(insight: FinancialInsight): FinancialAction[] {
  return [
    baseAction(
      insight,
      "verify-data",
      "operations",
      "Verify data and drivers",
      "Confirm the anomaly is real and not data or timing issues. Document root cause before acting.",
      20,
      90,
      "low"
    ),
  ]
}

const INSIGHT_TO_ACTIONS: Record<string, (insight: FinancialInsight) => FinancialAction[]> = {
  LOW_MARGIN: actionsForLowMargin,
  REVENUE_DROP: actionsForRevenueDrop,
  CLIENT_RISK: actionsForClientConcentration,
  HIGH_BURN: actionsForHighBurn,
  SHORT_RUNWAY: actionsForShortRunway,
  EXPENSE_SPIKE: actionsForExpenseSpike,
  ANOMALY: actionsForAnomaly,
}

/**
 * Translates financial insights into prioritized, executable actions.
 * No UI, no DB, no formatting. Pure strategy logic.
 * Priority = severity weight + impactScore influence. Actions sorted by priority descending.
 */
export function getFinancialActions(insights: FinancialInsight[]): FinancialAction[] {
  const actions: FinancialAction[] = []
  for (const insight of insights) {
    const factory = INSIGHT_TO_ACTIONS[insight.type]
    if (factory) {
      actions.push(...factory(insight))
    }
  }
  actions.sort((a, b) => b.priority - a.priority)
  return actions
}
