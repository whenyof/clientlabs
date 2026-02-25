// ---------------------------------------------------------------------------
// Analytics Module — Orchestrator Service (API-facing)
// ---------------------------------------------------------------------------
// Single entry point for API routes / server actions.
// Delegates all computation to the aggregator — zero duplicated logic.
// ---------------------------------------------------------------------------

import type {
 AnalyticsResponse,
 AnalyticsTimeRange,
} from "@/modules/analytics/types/analytics.types";
import * as aggregator from "@/modules/analytics/services/analytics-aggregator.service";

/**
 * Returns the full analytics payload for a user within the given time range.
 *
 * @param userId - Multi-tenant user identifier.
 * @param range - One of "7d" | "30d" | "90d" | "12m".
 * @returns AnalyticsResponse containing overview KPIs, revenue series, and funnel.
 */
export async function getAnalytics(
 userId: string,
 range: AnalyticsTimeRange,
): Promise<AnalyticsResponse> {
 const [overview, revenueSeries, funnel] = await Promise.all([
 aggregator.getOverview(userId, range),
 aggregator.getRevenueSeries(userId, range),
 aggregator.getFunnel(userId, range),
 ]);

 return { overview, revenueSeries, funnel };
}
