/**
 * Automated risk detection for Sales dashboard.
 * Pure business logic from real metrics. No Prisma, no mock data.
 */

export type SalesRiskAlertType = "TARGET_RISK" | "MOMENTUM_DROP" | "TICKET_DROP"
export type SalesRiskSeverity = "HIGH" | "MEDIUM"

export type SalesRiskAlert = {
  type: SalesRiskAlertType
  severity: SalesRiskSeverity
  title: string
  description: string
  suggestion: string
}

export type SalesRiskMetrics = {
  revenueSoFar: number
  forecastBase: number
  monthlyTarget: number
  salesLast7Days: number
  salesPrevious7Days: number
  avgTicketCurrent: number
  avgTicketPrevious: number
}

const TARGET_RISK_THRESHOLD = 0.9
const MOMENTUM_DROP_THRESHOLD = 0.85
const TICKET_DROP_THRESHOLD = 0.85

/**
 * Detects business risks from current metrics. Returns alerts only when conditions are met.
 */
export function detectSalesRisks(metrics: SalesRiskMetrics): SalesRiskAlert[] {
  const alerts: SalesRiskAlert[] = []
  const {
    forecastBase,
    monthlyTarget,
    salesLast7Days,
    salesPrevious7Days,
    avgTicketCurrent,
    avgTicketPrevious,
  } = metrics

  if (monthlyTarget > 0 && forecastBase < monthlyTarget * TARGET_RISK_THRESHOLD) {
    alerts.push({
      type: "TARGET_RISK",
      severity: "HIGH",
      title: "Target at risk",
      description: "Current pace projects below 90% of monthly target.",
      suggestion: "Increase promotions or push high value deals.",
    })
  }

  if (
    salesPrevious7Days > 0 &&
    salesLast7Days < salesPrevious7Days * MOMENTUM_DROP_THRESHOLD
  ) {
    alerts.push({
      type: "MOMENTUM_DROP",
      severity: "MEDIUM",
      title: "Sales momentum drop",
      description: "Last 7 days volume is down vs previous 7 days.",
      suggestion: "Review pipeline and pending opportunities.",
    })
  }

  if (
    avgTicketPrevious > 0 &&
    avgTicketCurrent < avgTicketPrevious * TICKET_DROP_THRESHOLD
  ) {
    alerts.push({
      type: "TICKET_DROP",
      severity: "MEDIUM",
      title: "Average ticket drop",
      description: "Average ticket is down vs previous period.",
      suggestion: "Focus on upselling or bundles.",
    })
  }

  return alerts
}
