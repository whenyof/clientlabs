/**
 * ClientLabs SDK — Transport Layer (Batching + Delivery)
 *
 * Queue events internally, flush when:
 * - 5 events accumulated
 * - 5 seconds since last flush
 * - beforeunload / visibilitychange (page closing)
 *
 * Delivery: navigator.sendBeacon (preferred) → fetch fallback.
 */

import type { TrackEvent, BatchPayload } from './types'

const SDK_VERSION = '1.1.0'
const BATCH_SIZE = 5
const FLUSH_INTERVAL_MS = 5_000

let queue: TrackEvent[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null
let accountId = ''
let publicKey = ''
let visitorId = ''
let endpoint = ''
let initialized = false

/**
 * Initialize the transport layer.
 */
export function initTransport(
    acct: string,
    key: string,
    visitor: string,
    ep: string
): void {
    accountId = acct
    publicKey = key
    visitorId = visitor
    endpoint = ep
    initialized = true

    // Flush on page unload
    if (typeof window !== 'undefined') {
        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                flush()
            }
        })
        window.addEventListener('pagehide', flush)
    }
}

/**
 * Enqueue an event. Triggers flush if batch size reached.
 */
export function enqueue(event: TrackEvent): void {
    if (!initialized) return
    queue.push(event)

    if (queue.length >= BATCH_SIZE) {
        flush()
    } else {
        scheduleFlush()
    }
}

/**
 * Schedule a flush after FLUSH_INTERVAL_MS if not already scheduled.
 */
function scheduleFlush(): void {
    if (flushTimer !== null) return
    flushTimer = setTimeout(() => {
        flushTimer = null
        flush()
    }, FLUSH_INTERVAL_MS)
}

/**
 * Flush the current queue immediately.
 */
export function flush(): void {
    if (flushTimer !== null) {
        clearTimeout(flushTimer)
        flushTimer = null
    }

    if (queue.length === 0) return

    const events = queue.splice(0)
    const payload: BatchPayload = {
        accountId,
        publicKey,
        visitorId,
        sdkVersion: SDK_VERSION,
        events,
    }

    send(payload)
}

/**
 * Get the current SDK version.
 */
export function getSdkVersion(): string {
    return SDK_VERSION
}

/**
 * Send a batch payload via sendBeacon (preferred) or fetch.
 */
function send(payload: BatchPayload): void {
    const body = JSON.stringify(payload)

    // Prefer sendBeacon for reliability on page unload
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([body], { type: 'application/json' })
        const sent = navigator.sendBeacon(endpoint, blob)
        if (sent) return
        // sendBeacon failed (payload too large, etc.) — fall through to fetch
    }

    // Fallback: fire-and-forget fetch
    try {
        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
            keepalive: true,
        }).catch(() => {
            // Silently discard — SDK must never throw
        })
    } catch {
        // Silently discard
    }
}
