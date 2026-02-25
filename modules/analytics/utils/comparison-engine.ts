// ---------------------------------------------------------------------------
// Analytics Module — Comparison Engine
// ---------------------------------------------------------------------------
// Pure functions. Zero dependencies. Never returns NaN.
// ---------------------------------------------------------------------------

import type { KPIValue } from "@/modules/analytics/types/analytics.types";

/**
 * Calculates the percentage growth between current and previous values.
 * Handles zero cases to avoid division by zero and return logical growth.
 */
export function calculateGrowth(current: number, previous: number): number {
 if (previous === 0 && current === 0) return 0;
 if (previous === 0 && current > 0) return 100;
 if (previous > 0 && current === 0) return -100;

 const growth = ((current - previous) / previous) * 100;
 // Cap growth at 1000% as a defensive measure
 const rounded = Number(growth.toFixed(2));

 if (!Number.isFinite(rounded)) return 0;

 return Math.max(-100, Math.min(1000, rounded));
}

/**
 * Derives the trend direction from current vs previous values.
 */
function deriveTrend(current: number, previous: number): "up" | "down" | "neutral" {
 if (current > previous) return "up";
 if (current < previous) return "down";
 return "neutral";
}

/**
 * Builds a full `KPIValue` from the current and previous period values.
 *
 * @param current – metric value for the current period
 * @param previous – metric value for the preceding period of equal length
 * @returns A complete KPIValue with change percentage and trend.
 *
 * @example
 * calculateKPI(150, 100)
 * // → { value: 150, previousValue: 100, changePercentage: 50, trend: "up" }
 *
 * calculateKPI(80, 100)
 * // → { value: 80, previousValue: 100, changePercentage: -20, trend: "down" }
 *
 * calculateKPI(100, 0)
 * // → { value: 100, previousValue: 0, changePercentage: 0, trend: "up" }
 */
export function calculateKPI(current: number, previous: number): KPIValue {
 return {
 value: current,
 previousValue: previous,
 changePercentage: calculateGrowth(current, previous),
 trend: deriveTrend(current, previous),
 };
}
