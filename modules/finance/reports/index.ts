export { buildExecutiveReport } from "./executive-report.builder"
export type {
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
  ReportExecutiveSummary,
} from "./executive-report.types"
export {
  buildExecutiveSummaryNarrative,
  buildForecastNarrative,
  deriveWins,
  deriveProblems,
  deriveTrendDirection,
  buildExecutiveHeadline,
} from "./executive-report.narrative"
export type { NarrativeInput } from "./executive-report.narrative"
