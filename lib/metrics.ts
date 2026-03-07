/**
 * In-Memory Metrics — Lightweight process-level counters.
 *
 * Not persisted to DB. Resets on process restart.
 * Used for internal observability via /api/internal/metrics.
 */

const startTime = Date.now()

const counters: Record<string, number> = {
    totalTrackRequests: 0,
    totalRevenueEvents: 0,
    totalRevenueDuplicates: 0,
    totalRevenueDeferred: 0,
    totalAnonymousEventsCreated: 0,
    totalSessionsCreated: 0,
    totalScoringEvents: 0,
    totalCronRuns: 0,
    totalIdentifyEvents: 0,
    totalRateLimited: 0,
}

export function increment(metric: string, amount = 1): void {
    if (metric in counters) {
        counters[metric] += amount
    } else {
        counters[metric] = amount
    }
}

export function getMetrics(): { uptimeSeconds: number; metrics: Record<string, number> } {
    return {
        uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
        metrics: { ...counters },
    }
}
