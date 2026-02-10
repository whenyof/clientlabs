import type { FinancialInsight } from "@/modules/finance/insights"
import type { FinancialAction } from "@/modules/finance/strategy"

// --- Cover ---
export type ReportCover = {
  company: string
  period: {
    from: Date
    to: Date
  }
  generatedAt: Date
}

// --- KPI Snapshot (numbers only; display layer formats) ---
export type ReportKPISnapshot = {
  income: number
  growth: number
  margin: number
  clients: number
  runway: number
}

// --- Historical comparison ---
export type PeriodComparison = {
  label: string
  current: number
  previous: number
  changePercent: number
}

export type ReportHistoricalComparison = {
  monthOverMonth?: PeriodComparison
  yearOverYear?: PeriodComparison
}

// --- Risks (insights with severity; ordered by severity) ---
export type ReportRisk = {
  id: string
  severity: "low" | "medium" | "high"
  type: string
  title: string
  explanation: string
  impactScore: number
}

// --- Opportunities (positive angle; ordered by impact) ---
export type ReportOpportunity = {
  id: string
  title: string
  description: string
  impactScore: number
  category: string
}

// --- Action plan (top strategic moves) ---
export type ReportActionItem = {
  id: string
  priority: number
  category: string
  title: string
  description: string
  estimatedImpact: number
  confidence: number
  difficulty: string
}

// --- Forecast ---
export type ReportForecast = {
  outlook: string
  trend: string
  horizon?: string
}

// --- Executive summary (narrative block) ---
export type ReportExecutiveSummary = {
  narrative: string
  headline?: string
  wins: string[]
  problems: string[]
  trendDirection: string
}

// --- Full report (structured object for later PDF render) ---
export type ExecutiveReport = {
  cover: ReportCover
  executiveSummary: ReportExecutiveSummary
  kpiSnapshot: ReportKPISnapshot
  historicalComparison: ReportHistoricalComparison
  risks: ReportRisk[]
  opportunities: ReportOpportunity[]
  actionPlan: ReportActionItem[]
  forecast: ReportForecast
}

// --- Builder input: all data the system already has ---
export type ExecutiveReportInput = {
  companyName: string
  periodFrom: Date
  periodTo: Date
  kpis: {
    income: number
    growth: number
    margin: number
    clients: number
    runway: number
  }
  comparisons?: {
    monthOverMonth?: { current: number; previous: number; label?: string }
    yearOverYear?: { current: number; previous: number; label?: string }
  }
  insights: FinancialInsight[]
  actions: FinancialAction[]
  predictions?: {
    outlook?: string
    trend?: string
    horizon?: string
  }
}
