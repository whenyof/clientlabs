/**
 * Session Service — Visitor session management for /api/track (Production)
 *
 * NOTE: VisitorSession table was removed from schema. This service now returns
 * a deterministic sessionId from visitorId so /api/track and event pipeline
 * continue to work; session persistence is no-op.
 */

import { randomUUID } from 'crypto'

/* ── Types ──────────────────────────────────────────── */

export interface SessionContext {
    /** First event in the batch — used for URL/referrer/UTM extraction */
    firstEvent: {
        eventType: string
        metadata: Record<string, unknown>
    }
    /** User-Agent header from the request */
    userAgent: string | null
}

export interface SessionResult {
    sessionId: string
    isNew: boolean
}

/* ── In-memory session key (no VisitorSession table) ─── */
const sessionIdByVisitor = new Map<string, { sessionId: string; until: number }>()
const SESSION_TTL_MS = 30 * 60 * 1000

/**
 * Get an active session or create a new one.
 * Returns a sessionId for the event pipeline; no DB persistence.
 */
export async function getOrCreateSession(
    userId: string,
    visitorId: string,
    _leadId: string | null,
    _ctx: SessionContext
): Promise<SessionResult> {
    const key = `${userId}:${visitorId}`
    const now = Date.now()
    const existing = sessionIdByVisitor.get(key)
    if (existing && existing.until > now) {
        existing.until = now + SESSION_TTL_MS
        return { sessionId: existing.sessionId, isNew: false }
    }
    const sessionId = randomUUID()
    sessionIdByVisitor.set(key, { sessionId, until: now + SESSION_TTL_MS })
    return { sessionId, isNew: true }
}

/**
 * No-op: VisitorSession table removed; link not persisted.
 */
export async function linkSessionsToLead(
    _visitorId: string,
    _userId: string,
    _leadId: string
): Promise<number> {
    return 0
}

/**
 * No-op: VisitorSession table removed.
 */
export async function closeExpiredSessions(
    _visitorId: string,
    _userId: string
): Promise<number> {
    return 0
}

/* ── Utilities ──────────────────────────────────────── */

function isPageViewEvent(eventType: string): boolean {
    return eventType === 'page_view' ||
        eventType === 'pricing_page_view' ||
        eventType === 'features_page_view'
}

function extractUrl(metadata: Record<string, unknown>): string | null {
    const url = metadata.url as string | undefined
    if (url && typeof url === 'string' && url.length > 0) {
        return url.substring(0, 2048)
    }
    return null
}

function extractUtm(metadata: Record<string, unknown>): Record<string, string | null> {
    const get = (key: string): string | null => {
        // Check direct metadata keys (from SDK UTM plugin)
        const camelKey = 'utm' + key.charAt(0).toUpperCase() + key.slice(1)
        const directVal = metadata[camelKey] || metadata[key]
        if (directVal && typeof directVal === 'string' && directVal.length > 0) {
            return directVal.substring(0, 255)
        }

        // Fallback: parse from URL query params
        const url = metadata.url as string | undefined
        if (url) {
            try {
                const parsed = new URL(url)
                const param = parsed.searchParams.get('utm_' + key)
                return param ? param.substring(0, 255) : null
            } catch {
                return null
            }
        }

        return null
    }

    return {
        utmSource: get('source'),
        utmMedium: get('medium'),
        utmCampaign: get('campaign'),
        utmTerm: get('term'),
        utmContent: get('content'),
    }
}

function parseUserAgent(ua: string | null): {
    device: string | null
    browser: string | null
    os: string | null
} {
    if (!ua) return { device: null, browser: null, os: null }

    let device: string = 'Desktop'
    if (/Mobile|Android|iPhone|iPad/i.test(ua)) {
        device = /iPad|Tablet/i.test(ua) ? 'Tablet' : 'Mobile'
    }

    let browser: string | null = null
    if (/Edg\//i.test(ua)) browser = 'Edge'
    else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) browser = 'Opera'
    else if (/Chrome\//i.test(ua)) browser = 'Chrome'
    else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari'
    else if (/Firefox\//i.test(ua)) browser = 'Firefox'

    let os: string | null = null
    if (/Windows/i.test(ua)) os = 'Windows'
    else if (/Mac OS X|macOS/i.test(ua)) os = 'macOS'
    else if (/Android/i.test(ua)) os = 'Android'
    else if (/iPhone|iPad|iOS/i.test(ua)) os = 'iOS'
    else if (/Linux/i.test(ua)) os = 'Linux'

    return { device, browser, os }
}
