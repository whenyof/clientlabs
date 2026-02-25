"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAnalytics } from "@/modules/analytics/services/analytics.service";
import type {
 AnalyticsResponse,
 AnalyticsTimeRange,
} from "@/modules/analytics/types/analytics.types";
import { getAnalyticsPro } from "@/modules/analytics/services/analytics-pro-aggregator.service";
import type { BusinessScore, FunnelV2Response, Insight, ForecastMetrics, InsightsEngineV2Response } from "@/modules/analytics/types/analytics-pro.types";

// ── Secondary metrics types ────────────────────────────────────────────────

export interface SecondaryMetrics {
 /** Estimated Lifetime Value: total collected / unique paying clients */
 readonly ltv: number;
 /** Issued Revenue growth % vs previous period */
 readonly growth: number;
 /** Collected Revenue growth % vs previous period */
 readonly growthCollected: number;
 /** % of invoices that are paid */
 readonly paidRate: number;
 /** % of revenue that is paid (collected / issued) */
 readonly paidRatio: number;
 /** % of revenue that is overdue */
 readonly overdueRatio: number;
}

export interface AnalyticsDashboardData {
 readonly overview: AnalyticsResponse["overview"];
 readonly revenueSeries: AnalyticsResponse["revenueSeries"];
 readonly funnel: FunnelV2Response;
 readonly secondary: SecondaryMetrics;
 readonly score: BusinessScore;
 readonly insights: Insight[];
 readonly forecast: ForecastMetrics | null;
 readonly insightsV2: InsightsEngineV2Response | null;
}

// ── Main action ────────────────────────────────────────────────────────────

export async function getAnalyticsDashboard(
 timeRange: AnalyticsTimeRange = "30d",
): Promise<AnalyticsDashboardData | null> {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) return null;

 const userId = session.user.id;

 // Fetch core analytics (Legacy but updated repo) and Pro Analytics (New accounting)
 const [analytics, proData] = await Promise.all([
 getAnalytics(userId, timeRange),
 getAnalyticsPro(userId, timeRange as any)
 ]);

 // We unify the "Secondary" metrics using the high-accuracy data from Analytics Pro
 // This avoids discrepancies between different calculation layers.

 return {
 overview: analytics.overview,
 revenueSeries: analytics.revenueSeries,
 funnel: proData.funnel,
 secondary: {
 ltv: proData.ltv,
 growth: proData.revenue.growthIssued, // Growth of Issued Revenue
 growthCollected: proData.cashflow.growthCollected, // Growth of Collected Revenue
 paidRate: proData.paidRatio, // Using Ratio as the Rate for consistent UI
 paidRatio: proData.paidRatio,
 overdueRatio: proData.overdueRatio
 },
 score: proData.score,
 insights: proData.insights,
 forecast: proData.forecast,
 insightsV2: proData.insightsV2
 };
}
