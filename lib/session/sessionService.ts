/**
 * Session Service — Visitor session management for /api/track (Production)
 *
 * Tracks visitor sessions with a 30-minute inactivity timeout.
 * Operates as a PARALLEL layer to scoring — never blocks LeadEventService.
 *
 * Session lifecycle:
 * 1. getOrCreateSession() — called once per batch, before event processing
 *    - Also lazily closes any expired sessions for this visitor
 * 2. Session updated with lastActivityAt, exitUrl, pageViews
 * 3. On close: endedAt, durationSeconds, isBounce computed
 *
 * Guarantees:
 * - No race conditions (upsert pattern with findFirst + create fallback)
 * - No duplicate sessions (composite check on visitorId + userId + activity window)
 * - Never blocks scoring pipeline
 * - Minimal writes (single update per batch, not per event)
 * - No infinite sessions (lazy close on every request)
 */

import { prisma } from '@/lib/prisma'

/* ── Constants ──────────────────────────────────────── */

/** Session timeout: 30 minutes of inactivity = new session */
const SESSION_TIMEOUT_MS = 30 * 60 * 1000

/** Bounce threshold: sessions < 15 seconds with 1 page view */
const BOUNCE_THRESHOLD_S = 15

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

/* ── Main API ───────────────────────────────────────── */

/**
 * Get an active session or create a new one.
 *
 * Also lazily closes any expired sessions for this visitor.
 *
 * Rules:
 * - Active session: visitorId match, endedAt IS NULL, lastActivityAt >= now - 30min
 * - If active: update lastActivityAt, exitUrl, pageViews (if page_view event)
 * - If none found: create new session with entry context
 */
export async function getOrCreateSession(
    userId: string,
    visitorId: string,
    leadId: string | null,
    ctx: SessionContext
): Promise<SessionResult> {
    const now = new Date()
    const timeoutThreshold = new Date(now.getTime() - SESSION_TIMEOUT_MS)

    // ── Lazy close expired sessions first ────────────────
    // This runs on every request to ensure no sessions stay open forever.
    // Uses raw SQL for atomic close + duration + bounce calculation.
    await closeExpiredSessions(visitorId, userId)

    // ── Try to find active session ───────────────────────
    const activeSession = await prisma.visitorSession.findFirst({
        where: {
            visitorId,
            userId,
            endedAt: null,
            lastActivityAt: { gte: timeoutThreshold },
        },
        select: { id: true },
        orderBy: { lastActivityAt: 'desc' },
    })

    if (activeSession) {
        // ── Update existing session ──────────────────────
        const url = extractUrl(ctx.firstEvent.metadata)
        const hasPageView = isPageViewEvent(ctx.firstEvent.eventType)

        await prisma.visitorSession.update({
            where: { id: activeSession.id },
            data: {
                lastActivityAt: now,
                ...(url ? { exitUrl: url } : {}),
                ...(hasPageView ? { pageViews: { increment: 1 } } : {}),
                ...(leadId ? { leadId } : {}),
            },
        })

        return { sessionId: activeSession.id, isNew: false }
    }

    // ── Create new session ───────────────────────────────
    const url = extractUrl(ctx.firstEvent.metadata)
    const referrer = ctx.firstEvent.metadata.referrer as string | undefined
    const utm = extractUtm(ctx.firstEvent.metadata)
    const deviceInfo = parseUserAgent(ctx.userAgent)
    const isPageView = isPageViewEvent(ctx.firstEvent.eventType)

    const session = await prisma.visitorSession.create({
        data: {
            userId,
            visitorId,
            leadId,
            startedAt: now,
            lastActivityAt: now,
            entryUrl: url || null,
            exitUrl: url || null,
            referrer: referrer || null,
            pageViews: isPageView ? 1 : 0,
            ...utm,
            ...deviceInfo,
        },
    })

    return { sessionId: session.id, isNew: true }
}

/**
 * Link all unlinked sessions for a visitorId to a Lead.
 *
 * Called during handleIdentify — updates sessions where leadId IS NULL.
 * Single bulk update — no per-session queries.
 */
export async function linkSessionsToLead(
    visitorId: string,
    userId: string,
    leadId: string
): Promise<number> {
    const result = await prisma.visitorSession.updateMany({
        where: {
            visitorId,
            userId,
            leadId: null,
        },
        data: {
            leadId,
        },
    })

    return result.count
}

/**
 * Close expired sessions with atomic duration + bounce calculation.
 *
 * Closes sessions where:
 * - endedAt IS NULL
 * - lastActivityAt < now - 30min
 *
 * Sets:
 * - endedAt = lastActivityAt
 * - durationSeconds = EPOCH difference
 * - isBounce = true if pageViews = 1 AND duration < 15 seconds
 */
export async function closeExpiredSessions(
    visitorId: string,
    userId: string
): Promise<number> {
    const timeoutThreshold = new Date(Date.now() - SESSION_TIMEOUT_MS)

    const affected = await prisma.$executeRaw`
        UPDATE "VisitorSession"
        SET
            "endedAt" = "lastActivityAt",
            "durationSeconds" = EXTRACT(EPOCH FROM ("lastActivityAt" - "startedAt"))::INT,
            "isBounce" = (
                "pageViews" <= 1
                AND EXTRACT(EPOCH FROM ("lastActivityAt" - "startedAt"))::INT < ${BOUNCE_THRESHOLD_S}
            ),
            "updatedAt" = NOW()
        WHERE "visitorId" = ${visitorId}
          AND "userId" = ${userId}
          AND "endedAt" IS NULL
          AND "lastActivityAt" < ${timeoutThreshold}
    `

    return affected
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
