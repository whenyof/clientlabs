import type { FinancialInsight } from "@/modules/finance/insights"
import type { ReportKPISnapshot } from "./executive-report.types"

/**
 * Narrative layer for the executive report. Produces human-readable prose from data.
 * No UI, no formatting (no currency/date strings). Tone: professional, clear, investor-ready.
 */

export type NarrativeInput = {
  kpis: ReportKPISnapshot
  insights: FinancialInsight[]
  wins: string[]
  problems: string[]
  trendDirection: string
}

function trendSentence(trend: string): string {
  if (!trend || trend === "neutral") return "Performance is stable relative to the prior period."
  if (trend === "improving") return "The business is on an improving trajectory."
  if (trend === "declining") return "The business is under pressure; corrective action is recommended."
  return trend
}

/**
 * Builds the executive summary narrative: how the company performed, wins, problems, trend.
 */
export function buildExecutiveSummaryNarrative(input: NarrativeInput): string {
  const { kpis, wins, problems, trendDirection } = input
  const parts: string[] = []

  parts.push(
    `Revenue for the period stands at ${kpis.income.toLocaleString("en-US", { maximumFractionDigits: 0 })} with ${kpis.growth >= 0 ? "" : "a "}year-over-year growth of ${kpis.growth.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%. `
  )
  parts.push(
    `Gross margin is ${(kpis.margin * 100).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%. `
  )
  if (kpis.runway > 0) {
    parts.push(
      `Runway is estimated at ${kpis.runway.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} months. `
    )
  }

  parts.push(trendSentence(trendDirection))
  parts.push(" ")

  if (wins.length > 0) {
    parts.push("Key wins: ")
    parts.push(wins.join(". "))
    parts.push(". ")
  }
  if (problems.length > 0) {
    parts.push("Risks and concerns: ")
    parts.push(problems.join(". "))
    parts.push(". ")
  }

  return parts.join("").trim()
}

/**
 * Derives a one-line headline from KPIs and trend.
 */
export function buildExecutiveHeadline(kpis: ReportKPISnapshot, trendDirection: string): string {
  if (trendDirection === "improving") return "Strong performance with positive momentum."
  if (trendDirection === "declining") return "Performance below expectations; action required."
  return "Stable period with focused execution."
}

/**
 * Extracts win bullets from insights (e.g. no critical risks) or explicit wins.
 */
export function deriveWins(insights: FinancialInsight[], explicitWins: string[]): string[] {
  const highRisks = insights.filter((i) => i.severity === "high")
  if (highRisks.length === 0 && insights.length > 0) {
    explicitWins.push("No critical risks detected in the period.")
  }
  return explicitWins
}

/**
 * Extracts problem bullets from high/medium insights.
 */
export function deriveProblems(insights: FinancialInsight[]): string[] {
  return insights
    .filter((i) => i.severity === "high" || i.severity === "medium")
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 5)
    .map((i) => i.title + ": " + i.explanation)
}

/**
 * Derives trend direction from growth and margin (simple heuristic).
 */
export function deriveTrendDirection(growth: number, margin: number): string {
  if (growth >= 5 && margin >= 0.2) return "improving"
  if (growth <= -10 || margin < 0.1) return "declining"
  return "neutral"
}

/**
 * Builds forecast outlook narrative from predictions or trend.
 */
export function buildForecastNarrative(
  predictions: { outlook?: string; trend?: string; horizon?: string } | undefined,
  trendDirection: string,
  kpis: ReportKPISnapshot
): { outlook: string; trend: string } {
  if (predictions?.outlook) {
    return {
      outlook: predictions.outlook,
      trend: predictions.trend ?? trendDirection,
    }
  }
  const base =
    "Outlook is based on current run rate and trend. No forward model is applied; consider adding scenario planning for board use."
  const trend =
    trendDirection === "improving"
      ? "Revenue and margin trajectory support continued improvement if execution holds."
      : trendDirection === "declining"
        ? "Without intervention, trend suggests further pressure on margin and growth."
        : "Stable conditions; focus on operational efficiency and pipeline conversion."
  return { outlook: base, trend }
}
