// ---------------------------------------------------------------------------
// Analytics Module — Type Definitions
// ---------------------------------------------------------------------------
// Strict types for the entire analytics subsystem.
// No `any`. No `ts-ignore`. No optional cheating.
// ---------------------------------------------------------------------------

/**
 * Supported time ranges for analytics queries.
 * The aggregator converts these into concrete Date pairs automatically.
 */
export type AnalyticsTimeRange = "7d" | "30d" | "90d" | "12m";

/**
 * A single KPI value with its previous-period comparison.
 */
export interface KPIValue {
 /** Metric value for the current period. */
 readonly value: number;
 /** Metric value for the immediately preceding period of equal length. */
 readonly previousValue: number;
 /** Percentage change: ((current − previous) / previous) × 100. 0 when previous is 0. */
 readonly changePercentage: number;
 /** Direction of the change. */
 readonly trend: "up" | "down" | "neutral";
}

/**
 * High-level business overview — every metric carries its own comparison.
 */
export interface AnalyticsOverview {
 readonly revenue: KPIValue;
 readonly leads: KPIValue;
 readonly conversions: KPIValue;
 readonly averageTicket: KPIValue;
}

/**
 * A single data point in the revenue time series (for charts).
 */
export interface RevenueSeries {
 /** ISO date string (YYYY-MM-DD). */
 readonly date: string;
 /** Revenue on that date. */
 readonly revenue: number;
 /** Number of leads created on that date. */
 readonly leads: number;
}

/**
 * Simplified conversion funnel: leads → invoices → paid.
 */
export interface ConversionFunnel {
 /** Total leads in the period. */
 readonly leads: number;
 /** Total invoices created in the period (any status). */
 readonly invoices: number;
 /** Total invoices that reached PAID status. */
 readonly paid: number;
}

/**
 * Unified response returned by the analytics service.
 */
export interface AnalyticsResponse {
 readonly overview: AnalyticsOverview;
 readonly revenueSeries: RevenueSeries[];
 readonly funnel: ConversionFunnel;
}

// ── Internal helpers (not part of the public API contract) ─────────────────

/**
 * Concrete date range resolved from an AnalyticsTimeRange.
 * Used internally by the aggregator to query records.
 */
export interface ResolvedDateRange {
 readonly from: Date;
 readonly to: Date;
}
