export const maxDuration = 10
/**
 * API Route: POST /api/track — Institutional Public Ingestion
 * 
 * Hardened v12.0 — Public API Keys with Origin Verification.
 * Strictly enforces origin matching.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma, ApiKeyType } from '@prisma/client'
import { checkDistributedRateLimit } from '@/lib/security/distributedRateLimiter'
import { buildCorsHeaders } from '@/lib/track/originValidator'
import { getOrCreateSession, linkSessionsToLead } from '@/lib/session/sessionService'
import type { SessionContext } from '@/lib/session/sessionService'
import { logger } from '@/lib/logger'
import { increment } from '@/lib/metrics'
import { resolveLeadSource } from '@/lib/sources/resolveLeadSource'
import {
  isAllowedTrackEvent,
  MAX_EVENT_TYPE_LENGTH,
  MAX_PROPERTIES_BYTES,
  MAX_EVENT_BYTES,
  TIMESTAMP_MAX_FUTURE_MS,
  TIMESTAMP_MAX_AGE_MS,
  safeByteLength,
  normalizeEventType,
  isPlainObject,
  validatePropertiesFields,
} from '@/lib/events'
import * as crypto from 'node:crypto'
import { notifyNewLeadCaptured } from '@/lib/notify-new-lead'

const MAX_REQUEST_BYTES = 50 * 1024 // 50KB
const MAX_EVENTS_PER_REQUEST = 20
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

interface TrackEvent {
    eventType: string
    metadata: Record<string, unknown>
    timestamp: string
}

interface TrackPayload {
    publicKey: string
    visitorId: string
    events: TrackEvent[]
}

function getEventType(e: Record<string, unknown>): string {
    const raw = e.eventType ?? e.type
    return typeof raw === 'string' ? raw : ''
}

function isValidTrackEvent(event: unknown, now: number): event is TrackEvent {
    if (typeof event !== 'object' || event === null || Array.isArray(event)) return false
    const e = event as unknown as Record<string, unknown>
    const rawType = getEventType(e)
    if (!rawType) return false
    const eventType = normalizeEventType(rawType)
    if (eventType.length === 0 || eventType.length > MAX_EVENT_TYPE_LENGTH) return false
    if (!isAllowedTrackEvent(eventType)) return false
    if (e.metadata !== undefined) {
        if (!isPlainObject(e.metadata)) return false
        const size = safeByteLength(e.metadata)
        if (size === null || size > MAX_PROPERTIES_BYTES) return false
        if (!validatePropertiesFields(e.metadata)) return false
    }
    if (e.timestamp != null) {
        const ts = typeof e.timestamp === 'string' ? new Date(e.timestamp).getTime() : Number(e.timestamp)
        if (!Number.isFinite(ts)) return false
        if (ts > now + TIMESTAMP_MAX_FUTURE_MS || ts < now - TIMESTAMP_MAX_AGE_MS) return false
    }
    const eventSize = safeByteLength(e)
    if (eventSize === null || eventSize > MAX_EVENT_BYTES) return false
    return true
}

/* ── CORS Logic ── */
function withCors(response: NextResponse, corsHeaders: Record<string, string>): NextResponse {
    for (const [key, value] of Object.entries(corsHeaders)) {
        response.headers.set(key, value)
    }
    return response
}

export async function OPTIONS(request: NextRequest) {
    const origin = request.headers.get('origin')
    const corsHeaders = buildCorsHeaders('*', origin)
    return new NextResponse(null, { status: 204, headers: corsHeaders })
}

/* ── Ingestion Logic ── */
export async function POST(request: NextRequest) {
    const now = Date.now()
    const origin = request.headers.get('origin')
    let corsHeaders = buildCorsHeaders(null, origin)

    // Body size cap (50KB)
    const contentLength = Number(request.headers.get('content-length')) || 0
    if (contentLength > MAX_REQUEST_BYTES) {
        return withCors(NextResponse.json({ error: 'Payload too large' }, { status: 413 }), corsHeaders)
    }

    let payload: TrackPayload
    try {
        payload = (await request.json()) as TrackPayload
    } catch {
        return withCors(NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }), corsHeaders)
    }

    if (contentLength <= 0) {
        const bodyBytes = safeByteLength(payload)
        if (bodyBytes === null || bodyBytes > MAX_REQUEST_BYTES) {
            return withCors(NextResponse.json({ error: 'Payload too large' }, { status: 413 }), corsHeaders)
        }
    }

    try {
        const { publicKey, visitorId, events } = payload

        // 🛡️ Phase 1: HTTP Semantics (Bad Request for malformed payloads)
        if (!publicKey || !visitorId || !Array.isArray(events)) {
            return withCors(NextResponse.json({ error: 'Bad Request' }, { status: 400 }), corsHeaders)
        }
        if (events.length === 0) {
            return withCors(NextResponse.json({ error: 'Bad Request: events must not be empty' }, { status: 400 }), corsHeaders)
        }
        if (events.length > MAX_EVENTS_PER_REQUEST) {
            return withCors(NextResponse.json({ error: `Bad Request: max ${MAX_EVENTS_PER_REQUEST} events per request` }, { status: 400 }), corsHeaders)
        }

        // 🛡️ Phase 2: Strict UUID v4 Validation
        if (!UUID_V4_REGEX.test(visitorId)) {
            return withCors(NextResponse.json({ error: 'Bad Request' }, { status: 400 }), corsHeaders)
        }

        // 1. Authentication (SHA-256 Hash Generated ONCE)
        const hash = crypto.createHash("sha256").update(publicKey).digest("hex")

        // 2. Lookup ApiKey (Indexed by keyHash)
        const apiKey = await prisma.apiKey.findUnique({
            where: { keyHash: hash }
        })

        // SECURITY VALIDATION CHAIN (Fail-Fast)
        if (!apiKey ||
            apiKey.type !== ApiKeyType.public ||
            apiKey.revoked ||
            (apiKey.expiryDate && apiKey.expiryDate.getTime() <= now)
        ) {
            return withCors(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), corsHeaders)
        }

        // 3. Origin Verification (Strict matches)
        if (!origin) {
            return withCors(NextResponse.json({ error: 'Forbidden' }, { status: 403 }), corsHeaders)
        }

        let hostname: string
        try {
            hostname = new URL(origin).hostname
        } catch {
            return withCors(NextResponse.json({ error: 'Forbidden' }, { status: 403 }), corsHeaders)
        }

        // NO wildcard, NO endsWith. Coincidencia exacta.
        if (hostname !== apiKey.domain) {
            return withCors(NextResponse.json({ error: 'Forbidden' }, { status: 403 }), corsHeaders)
        }

        // 🛡️ All checks passed. 
        corsHeaders = buildCorsHeaders(apiKey.domain, origin)
        const userId = apiKey.userId

        // 4. Rate Limiting (Key Boundary)
        const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
        const rateCheck = await checkDistributedRateLimit(`track:${userId}:${clientIp}`, 100, 60)
        if (!rateCheck.allowed) {
            increment('totalRateLimited')
            return withCors(NextResponse.json({ error: 'Too Many Requests' }, { status: 429 }), corsHeaders)
        }

        // 5. Success Path Telemetry
        // High visibility usage without blocking main logic
        await prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsed: new Date() }
        }).catch(() => { })

        increment('totalTrackRequests')

        const validEvents = events.filter((e): e is TrackEvent => isValidTrackEvent(e, now))
        const skipped = events.length - validEvents.length

        // 6. Identity & Sessions
        const userAgent = request.headers.get('user-agent')
        const firstNonIdentify = validEvents.find((e) => normalizeEventType(getEventType(e as unknown as Record<string, unknown>)) !== 'identify') as TrackEvent | undefined
        const sessionCtx: SessionContext | null = firstNonIdentify ? {
            firstEvent: { eventType: normalizeEventType(getEventType(firstNonIdentify as unknown as Record<string, unknown>)), metadata: firstNonIdentify.metadata },
            userAgent,
        } : null

        let identifiedLead: { id: string } | null = null

        for (const event of validEvents) {
            const normType = normalizeEventType(getEventType(event as unknown as Record<string, unknown>))
            if (normType === 'identify') {
                const result = await handleIdentify(userId, visitorId, (event as TrackEvent).metadata)
                if (result) identifiedLead = result
            } else if (normType === 'sdk_loaded' || normType === 'sdk_heartbeat') {
                // 📡 Installation verification: update lastSeen for dashboard
                await prisma.sdkConnection.upsert({
                    where: {
                        userId_domain_apiKey: {
                            userId,
                            domain: hostname,
                            apiKey: publicKey
                        }
                    },
                    update: { lastSeen: new Date() },
                    create: {
                        userId,
                        domain: hostname,
                        apiKey: publicKey,
                        lastSeen: new Date()
                    }
                }).catch((e: any) => logger.error("sdk_track", "connection_update_fail", userId, { error: e.message }))
            }
        }

        const lead = identifiedLead

        let sessionId: string | undefined = undefined
        if (sessionCtx) {
            try {
                const sessionRes = await getOrCreateSession(userId, visitorId, lead?.id ?? null, sessionCtx)
                sessionId = sessionRes.sessionId
            } catch (err) {
                logger.error('track', 'session_failed', userId, { error: (err as Error).message })
            }
        }

        if (!lead) {
            const anonymousData = validEvents
                .filter((e) => normalizeEventType(getEventType(e as unknown as Record<string, unknown>)) !== 'identify')
                .map((e) => ({
                    visitorId, accountId: userId,
                    type: normalizeEventType(getEventType(e as unknown as Record<string, unknown>)),
                    data: { ...(e as TrackEvent).metadata, sdkTimestamp: (e as TrackEvent).timestamp } as Prisma.InputJsonValue,
                }))

            // anonymousEvent model removed from schema; skip persisting anonymous events
            return withCors(NextResponse.json({ matched: false, visitorId, processed: validEvents.length, skipped }), corsHeaders)
        }

        // 7. Event Scoring (skip internal verification events)
        const { LeadEventService } = await import('@/lib/events/leadEventService')
        const { INTERNAL_EVENT_TYPES } = await import('@/lib/events')
        const results = []

        for (const event of validEvents) {
            const normType = normalizeEventType(getEventType(event as unknown as Record<string, unknown>))
            if (normType === 'identify' || INTERNAL_EVENT_TYPES.has(normType)) continue

            try {
                const result = await LeadEventService.registerLeadEvent({
                    userId, leadId: lead.id,
                    eventType: normType,
                    eventSource: 'sdk',
                    sessionId,
                    metadata: { ...(event as TrackEvent).metadata, visitorId, sdkTimestamp: (event as TrackEvent).timestamp },
                })
                results.push({ eventType: normType, status: 'ok', scoreDelta: result.scoreBreakdown.effectiveDelta })
            } catch (err) {
                results.push({ eventType: normType, status: 'error' })
            }
        }

        return withCors(NextResponse.json({ matched: true, leadId: lead.id, results, processed: validEvents.length, skipped }), corsHeaders)

    } catch (error) {
        logger.error('track', 'unhandled_error', undefined, { error: (error as Error).message })
        return withCors(NextResponse.json({ error: 'Internal server error' }, { status: 500 }), corsHeaders)
    }
}

async function handleIdentify(
    userId: string,
    visitorId: string,
    metadata: Record<string, unknown>
): Promise<{ id: string } | null> {
    const rawEmail = metadata.email as string | undefined
    const email = rawEmail?.toLowerCase().trim()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null

    const sanitizedName = (metadata.name as string | undefined)?.substring(0, 100)
    const sanitizedPhone = (metadata.phone as string | undefined)?.substring(0, 30)

    const existing = await prisma.lead.findFirst({
        where: { userId, email },
        select: { id: true },
    })

    const isNew = !existing
    const lead = existing
        ? await prisma.lead.update({
            where: { id: existing.id },
            data: { name: sanitizedName, phone: sanitizedPhone },
            select: { id: true },
        })
        : await prisma.lead.create({
            data: {
                userId,
                email,
                name: sanitizedName,
                phone: sanitizedPhone,
                source: "WEB",
            },
            select: { id: true },
        })

    await linkSessionsToLead(visitorId, userId, lead.id).catch(() => { })

    if (isNew) {
        notifyNewLeadCaptured(userId, {
            leadId: lead.id,
            leadName: sanitizedName,
            leadEmail: email,
            phone: sanitizedPhone,
            source: "WEB",
            pageUrl: metadata.pageUrl as string | undefined,
            utmSource: metadata.utmSource as string | undefined,
            utmMedium: metadata.utmMedium as string | undefined,
            utmCampaign: metadata.utmCampaign as string | undefined,
        })
    }

    return { id: lead.id }
}
