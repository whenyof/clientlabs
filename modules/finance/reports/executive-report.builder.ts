import type {
  ExecutiveReport,
  ExecutiveReportInput,
  ReportCover,
  ReportKPISnapshot,
  ReportHistoricalComparison,
  ReportRisk,
  ReportOpportunity,
  ReportActionItem,
  ReportExecutiveSummary,
  ReportForecast,
} from "./executive-report.types"
import {
  buildExecutiveSummaryNarrative,
  buildExecutiveHeadline,
  deriveWins,
  deriveProblems,
  deriveTrendDirection,
  buildForecastNarrative,
} from "./executive-report.narrative"

const SEVERITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }
const TOP_ACTIONS_LIMIT = 10
const TOP_OPPORTUNITIES_LIMIT = 5

function buildCover(input: ExecutiveReportInput): ReportCover {
  return {
    company: input.companyName,
    period: { from: input.periodFrom, to: input.periodTo },
    generatedAt: new Date(),
  }
}

function buildKpiSnapshot(input: ExecutiveReportInput): ReportKPISnapshot {
  return {
    income: input.kpis.income,
    growth: input.kpis.growth,
    margin: input.kpis.margin,
    clients: input.kpis.clients,
    runway: input.kpis.runway,
  }
}

function buildHistoricalComparison(input: ExecutiveReportInput): ReportHistoricalComparison {
  const out: ReportHistoricalComparison = {}
  const comp = input.comparisons
  if (!comp) return out

  if (comp.monthOverMonth) {
    const { current, previous } = comp.monthOverMonth
    const changePercent = previous !== 0 ? ((current - previous) / previous) * 100 : 0
    out.monthOverMonth = {
      label: comp.monthOverMonth.label ?? "Month over month",
      current,
      previous,
      changePercent,
    }
  }
  if (comp.yearOverYear) {
    const { current, previous } = comp.yearOverYear
    const changePercent = previous !== 0 ? ((current - previous) / previous) * 100 : 0
    out.yearOverYear = {
      label: comp.yearOverYear.label ?? "Year over year",
      current,
      previous,
      changePercent,
    }
  }
  return out
}

function buildRisks(insights: FinancialInsight[]): ReportRisk[] {
  return [...insights]
    .sort((a, b) => {
      const sev = SEVERITY_ORDER[a.severity] ?? 2
      const sevB = SEVERITY_ORDER[b.severity] ?? 2
      if (sev !== sevB) return sev - sevB
      return b.impactScore - a.impactScore
    })
    .map((i) => ({
      id: i.id,
      severity: i.severity,
      type: i.type,
      title: i.title,
      explanation: i.explanation,
      impactScore: i.impactScore,
    }))
}

function buildOpportunities(actions: FinancialAction[]): ReportOpportunity[] {
  return [...actions]
    .sort((a, b) => b.estimatedImpact - a.estimatedImpact)
    .slice(0, TOP_OPPORTUNITIES_LIMIT)
    .map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      impactScore: a.estimatedImpact,
      category: a.category,
    }))
}

function buildActionPlan(actions: FinancialAction[]): ReportActionItem[] {
  return actions.slice(0, TOP_ACTIONS_LIMIT).map((a) => ({
    id: a.id,
    priority: a.priority,
    category: a.category,
    title: a.title,
    description: a.description,
    estimatedImpact: a.estimatedImpact,
    confidence: a.confidence,
    difficulty: a.difficulty,
  }))
}

function buildExecutiveSummary(input: ExecutiveReportInput): ReportExecutiveSummary {
  const kpis: ReportKPISnapshot = buildKpiSnapshot(input)
  const trendDirection = deriveTrendDirection(input.kpis.growth, input.kpis.margin)
  const wins = deriveWins(input.insights, [])
  const problems = deriveProblems(input.insights)
  const narrative = buildExecutiveSummaryNarrative({
    kpis,
    insights: input.insights,
    wins,
    problems,
    trendDirection,
  })
  const headline = buildExecutiveHeadline(kpis, trendDirection)
  return {
    narrative,
    headline,
    wins,
    problems,
    trendDirection,
  }
}

function buildForecast(input: ExecutiveReportInput): ReportForecast {
  const trendDirection = deriveTrendDirection(input.kpis.growth, input.kpis.margin)
  const kpis: ReportKPISnapshot = buildKpiSnapshot(input)
  const { outlook, trend } = buildForecastNarrative(
    input.predictions,
    trendDirection,
    kpis
  )
  return {
    outlook,
    trend,
    horizon: input.predictions?.horizon,
  }
}

/**
 * Builds the full executive report from available KPIs, comparisons, insights, actions, and optional predictions.
 * No UI, no PDF; returns a structured object ready for a future PDF or API render.
 */
export function buildExecutiveReport(input: ExecutiveReportInput): ExecutiveReport {
  const report: ExecutiveReport = {
    cover: buildCover(input),
    executiveSummary: buildExecutiveSummary(input),
    kpiSnapshot: buildKpiSnapshot(input),
    historicalComparison: buildHistoricalComparison(input),
    risks: buildRisks(input.insights),
    opportunities: buildOpportunities(input.actions),
    actionPlan: buildActionPlan(input.actions),
    forecast: buildForecast(input),
  }
  return report
}
