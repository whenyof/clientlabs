import type { Sale } from "../types"

const REVENUE_DROP_FACTOR = 0.85
const AVG_TICKET_DROP_FACTOR = 0.9
const CLIENT_DEPENDENCY_THRESHOLD = 0.4
const MAX_INSIGHTS = 3

function amount(s: Sale): number {
  return Number(s.amount ?? s.total ?? 0)
}

export type InsightSeverity = "risk" | "warning" | "positive"

export type SalesInsight = {
  type: string
  message: string
  severity: InsightSeverity
  metricAffected: string
}

export type GetSalesInsightsData = {
  currentPeriodSales: Sale[]
  previousPeriodSales: Sale[]
}

function sumRevenue(sales: Sale[]): number {
  return sales.reduce((a, s) => a + amount(s), 0)
}

/**
 * Deterministic insights from current vs previous period.
 * Max 3 visible. Priority: RISK > WARNING > SUCCESS (positive).
 * Returns empty array when no relevant insights.
 */
export function getSalesInsights(data: GetSalesInsightsData): SalesInsight[] {
  const { currentPeriodSales, previousPeriodSales } = data
  const insights: SalesInsight[] = []

  const currentRevenue = sumRevenue(currentPeriodSales)
  const previousRevenue = sumRevenue(previousPeriodSales)
  const currentSales = currentPeriodSales.length
  const previousSales = previousPeriodSales.length
  const currentAvgTicket = currentSales > 0 ? currentRevenue / currentSales : 0
  const previousAvgTicket = previousSales > 0 ? previousRevenue / previousSales : 0

  // 1. Caída de ingresos: currentRevenue < previousRevenue * 0.85 → RISK
  if (previousRevenue > 0 && currentRevenue < previousRevenue * REVENUE_DROP_FACTOR) {
    const dropPct = Math.round(((previousRevenue - currentRevenue) / previousRevenue) * 100)
    insights.push({
      type: "REVENUE_DROP",
      message: `Los ingresos han caído un ${dropPct}% respecto al periodo anterior`,
      severity: "risk",
      metricAffected: "revenue",
    })
  }

  // 2. Ticket medio en riesgo: más ventas pero ticket medio < 90% del anterior → WARNING
  if (
    currentSales > previousSales &&
    previousAvgTicket > 0 &&
    currentAvgTicket < previousAvgTicket * AVG_TICKET_DROP_FACTOR
  ) {
    insights.push({
      type: "AVG_TICKET_RISK",
      message: "Estás vendiendo más, pero con menor ticket medio",
      severity: "warning",
      metricAffected: "avgTicket",
    })
  }

  // 3. Dependencia excesiva de un cliente: top client > 40% de ingresos → RISK
  if (currentRevenue > 0 && currentPeriodSales.length > 0) {
    const byClient = new Map<string, number>()
    for (const s of currentPeriodSales) {
      const name = s.clientName?.trim() || "Sin nombre"
      byClient.set(name, (byClient.get(name) ?? 0) + amount(s))
    }
    let maxRevenue = 0
    let maxClient = ""
    byClient.forEach((rev, name) => {
      if (rev > maxRevenue) {
        maxRevenue = rev
        maxClient = name
      }
    })
    const share = maxRevenue / currentRevenue
    if (share > CLIENT_DEPENDENCY_THRESHOLD) {
      const sharePct = Math.round(share * 100)
      insights.push({
        type: "CLIENT_DEPENDENCY",
        message: `Alta dependencia del cliente ${maxClient} (${sharePct}% de los ingresos)`,
        severity: "risk",
        metricAffected: "revenue",
      })
    }
  }

  // 4. Buen momentum: ingresos ↑ y ventas ↑ → SUCCESS (positive)
  if (currentRevenue > previousRevenue && currentSales > previousSales) {
    insights.push({
      type: "GOOD_MOMENTUM",
      message: "Buen momento: ingresos y volumen en crecimiento",
      severity: "positive",
      metricAffected: "revenue",
    })
  }

  const order: InsightSeverity[] = ["risk", "warning", "positive"]
  const sorted = [...insights].sort(
    (a, b) => order.indexOf(a.severity) - order.indexOf(b.severity)
  )
  return sorted.slice(0, MAX_INSIGHTS)
}
