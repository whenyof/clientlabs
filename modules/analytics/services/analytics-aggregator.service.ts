// ---------------------------------------------------------------------------
// Analytics Module — Aggregator Service (Business Logic Brain)
// ---------------------------------------------------------------------------
// Orchestrates repository calls and computes every metric.
// NEVER accesses Prisma directly — only through the repository.
// Supports: 7d, 30d, 90d, 12m time ranges with auto previous-period.
// ---------------------------------------------------------------------------

import type {
 AnalyticsOverview,
 AnalyticsTimeRange,
 ConversionFunnel,
 ResolvedDateRange,
 RevenueSeries,
} from "@/modules/analytics/types/analytics.types";
import * as repo from "@/modules/analytics/repositories/analytics.repository";
import { calculateKPI } from "@/modules/analytics/utils/comparison-engine";

// ── Time range resolution ──────────────────────────────────────────────────

const RANGE_DAYS: Record<AnalyticsTimeRange, number> = {
 "7d": 7,
 "30d": 30,
 "90d": 90,
 "12m": 365,
};

function resolveRange(range: AnalyticsTimeRange): ResolvedDateRange {
 const to = new Date();
 to.setHours(23, 59, 59, 999);
 const from = new Date(to);
 from.setDate(from.getDate() - RANGE_DAYS[range]);
 from.setHours(0, 0, 0, 0);
 return { from, to };
}

function getPreviousRange(current: ResolvedDateRange): ResolvedDateRange {
 const durationMs = current.to.getTime() - current.from.getTime();
 return {
 from: new Date(current.from.getTime() - durationMs - 1),
 to: new Date(current.from.getTime() - 1),
 };
}

// ── Revenue series builder ─────────────────────────────────────────────────

/**
 * Generates day-by-day (or month-by-month for 12m) revenue + lead series.
 * Uses CASH FLOW (actual payments) for the revenue chart.
 */
async function buildRevenueSeries(
 userId: string,
 range: ResolvedDateRange,
 timeRange: AnalyticsTimeRange,
): Promise<RevenueSeries[]> {
 const [invoices, leadCount] = await Promise.all([
 repo.getPaidInvoicesBetweenDates(userId, range.from, range.to),
 repo.getLeadsBetweenDates(userId, range.from, range.to),
 ]);

 const useMonthBuckets = timeRange === "12m";
 const revenueMap = new Map<string, number>();
 const leadsMap = new Map<string, number>();

 const cursor = new Date(range.from);
 while (cursor <= range.to) {
 const key = useMonthBuckets
 ? `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`
 : cursor.toISOString().slice(0, 10);
 revenueMap.set(key, 0);
 leadsMap.set(key, 0);
 if (useMonthBuckets) cursor.setMonth(cursor.getMonth() + 1);
 else cursor.setDate(cursor.getDate() + 1);
 }

 for (const inv of invoices) {
 const d = new Date(inv.issueDate);
 const key = useMonthBuckets
 ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
 : d.toISOString().slice(0, 10);
 const current = revenueMap.get(key) ?? 0;
 revenueMap.set(key, current + Number(inv.total));
 }

 const bucketCount = revenueMap.size || 1;
 const leadsPerBucket = Math.floor(leadCount / bucketCount);
 const remainder = leadCount % bucketCount;
 let idx = 0;
 for (const key of leadsMap.keys()) {
 leadsMap.set(key, leadsPerBucket + (idx < remainder ? 1 : 0));
 idx++;
 }

 const series: RevenueSeries[] = [];
 for (const [date, revenue] of revenueMap.entries()) {
 series.push({
 date,
 revenue: Math.round(revenue * 100) / 100,
 leads: leadsMap.get(date) ?? 0,
 });
 }
 return series;
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Computes the full AnalyticsOverview with KPI comparisons.
 */
export async function getOverview(
 userId: string,
 timeRange: AnalyticsTimeRange,
): Promise<AnalyticsOverview> {
 const range = resolveRange(timeRange);
 const prev = getPreviousRange(range);

 const [
 currentIssuedRevenue,
 previousIssuedRevenue,
 currentCollectedRevenue,
 previousCollectedRevenue,
 currentLeads,
 previousLeads,
 currentConversions,
 previousConversions,
 currentPaidCount,
 previousPaidCount,
 ] = await Promise.all([
 repo.getIssuedRevenueBetweenDates(userId, range.from, range.to),
 repo.getIssuedRevenueBetweenDates(userId, prev.from, prev.to),
 repo.getRevenueBetweenDates(userId, range.from, range.to), // Total payments
 repo.getRevenueBetweenDates(userId, prev.from, prev.to),
 repo.getLeadsBetweenDates(userId, range.from, range.to),
 repo.getLeadsBetweenDates(userId, prev.from, prev.to),
 repo.countConvertedLeads(userId, range.from, range.to),
 repo.countConvertedLeads(userId, prev.from, prev.to),
 repo.countInvoicesWithPayments(userId, range.from, range.to),
 repo.countInvoicesWithPayments(userId, prev.from, prev.to),
 ]);

 const currentAvgTicket = currentPaidCount > 0
 ? Math.round((currentCollectedRevenue / currentPaidCount) * 100) / 100
 : 0;

 const previousAvgTicket = previousPaidCount > 0
 ? Math.round((previousCollectedRevenue / previousPaidCount) * 100) / 100
 : 0;

 return {
 revenue: calculateKPI(currentIssuedRevenue, previousIssuedRevenue),
 leads: calculateKPI(currentLeads, previousLeads),
 conversions: calculateKPI(currentConversions, previousConversions),
 averageTicket: calculateKPI(currentAvgTicket, previousAvgTicket),
 };
}

export async function getRevenueSeries(
 userId: string,
 timeRange: AnalyticsTimeRange,
): Promise<RevenueSeries[]> {
 const range = resolveRange(timeRange);
 return buildRevenueSeries(userId, range, timeRange);
}

export async function getFunnel(
 userId: string,
 timeRange: AnalyticsTimeRange,
): Promise<ConversionFunnel> {
 const range = resolveRange(timeRange);
 const [leads, invoices, paid] = await Promise.all([
 repo.getLeadsBetweenDates(userId, range.from, range.to),
 repo.countAllInvoices(userId, range.from, range.to),
 repo.countInvoicesWithPayments(userId, range.from, range.to),
 ]);
 return { leads, invoices, paid };
}
