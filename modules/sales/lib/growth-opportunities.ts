/**
 * Growth Opportunity Engine for Sales dashboard.
 * Detects revenue opportunities from real metrics. No Prisma, pure calculation.
 */

export type GrowthOpportunityType =
  | "UPSELL"
  | "PREMIUM"
  | "CATEGORY"
  | "REACTIVATION"
  | "GROWTH"

export type GrowthOpportunityImpact = "HIGH" | "MEDIUM"

export type GrowthOpportunity = {
  type: GrowthOpportunityType
  impact: GrowthOpportunityImpact
  title: string
  description: string
  suggestion: string
}

export type GrowthOpportunityMetrics = {
  repeatCustomerRate: number
  avgTicket: number
  topCategoryShare: number
  inactiveCustomersCount: number
  revenueGrowthRate: number
  /** For PREMIUM: compare current avgTicket to this. Optional. */
  avgTicketHistorical?: number
  /** For REACTIVATION: trigger when inactiveCustomersCount > this. Default 5. */
  inactiveCustomersThreshold?: number
}

const UPSELL_RATE_MIN = 0.3
const CATEGORY_SHARE_MIN = 0.4
const GROWTH_RATE_MIN = 0.2
const DEFAULT_INACTIVE_THRESHOLD = 5

/**
 * Detects growth opportunities from current metrics. Returns only when conditions are met.
 */
export function detectGrowthOpportunities(
  metrics: GrowthOpportunityMetrics
): GrowthOpportunity[] {
  const opportunities: GrowthOpportunity[] = []
  const {
    repeatCustomerRate,
    avgTicket,
    topCategoryShare,
    inactiveCustomersCount,
    revenueGrowthRate,
    avgTicketHistorical = 0,
    inactiveCustomersThreshold = DEFAULT_INACTIVE_THRESHOLD,
  } = metrics

  if (repeatCustomerRate > UPSELL_RATE_MIN) {
    opportunities.push({
      type: "UPSELL",
      impact: "HIGH",
      title: "Upsell potential",
      description: "Repeat customer rate is above 30%. Strong base for expansion.",
      suggestion: "Offer bundles or higher-tier services.",
    })
  }

  if (avgTicketHistorical > 0 && avgTicket > avgTicketHistorical) {
    opportunities.push({
      type: "PREMIUM",
      impact: "MEDIUM",
      title: "Premium potential",
      description: "Average ticket is above historical average.",
      suggestion: "Test premium pricing or VIP offers.",
    })
  }

  if (topCategoryShare > CATEGORY_SHARE_MIN) {
    opportunities.push({
      type: "CATEGORY",
      impact: "HIGH",
      title: "Category dominance",
      description: "One category drives more than 40% of revenue.",
      suggestion: "Increase marketing in this segment.",
    })
  }

  if (inactiveCustomersCount > inactiveCustomersThreshold) {
    opportunities.push({
      type: "REACTIVATION",
      impact: "MEDIUM",
      title: "Reactivation opportunity",
      description: `${inactiveCustomersCount} customers inactive in current period.`,
      suggestion: "Launch email or WhatsApp campaign.",
    })
  }

  if (revenueGrowthRate > GROWTH_RATE_MIN) {
    opportunities.push({
      type: "GROWTH",
      impact: "HIGH",
      title: "Fast growth",
      description: "Revenue growth is above 20%. Momentum is strong.",
      suggestion: "Scale acquisition channels.",
    })
  }

  return opportunities
}
