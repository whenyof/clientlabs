/**
 * ClientLabs SDK — Rate Limiter
 *
 * Sliding window: max 20 events per 60 seconds per visitor.
 * Excess events are silently discarded (no errors thrown).
 */

const MAX_EVENTS_PER_MINUTE = 20
const WINDOW_MS = 60_000

/** Timestamps of accepted events within the current window */
const timestamps: number[] = []

/**
 * Check if a new event is within the rate limit.
 * If allowed, records the timestamp and returns true.
 * If over limit, returns false (event should be discarded).
 */
export function isAllowed(): boolean {
    const now = Date.now()
    const cutoff = now - WINDOW_MS

    // Prune expired timestamps
    while (timestamps.length > 0 && timestamps[0] < cutoff) {
        timestamps.shift()
    }

    if (timestamps.length >= MAX_EVENTS_PER_MINUTE) {
        return false
    }

    timestamps.push(now)
    return true
}
