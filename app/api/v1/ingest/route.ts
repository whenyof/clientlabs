export const maxDuration = 30
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"


import { prisma } from "@/lib/prisma"
import { ApiKeyType } from "@prisma/client"
import { buildCorsHeaders } from "@/lib/track/originValidator"
import { checkDistributedRateLimit } from "@/lib/security/distributedRateLimiter"
import { enqueueEvents } from "@/lib/queue/eventsQueue"
import type { QueuedEvent } from "@/lib/events/types"
import {
  isAllowedIngestEvent,
  MAX_EVENT_TYPE_LENGTH,
  MAX_PROPERTIES_BYTES,
  MAX_EVENT_BYTES,
  TIMESTAMP_MAX_FUTURE_MS,
  TIMESTAMP_MAX_AGE_MS,
  safeByteLength,
  normalizeEventType,
  isPlainObject,
  validatePropertiesFields,
} from "@/lib/events"
import * as crypto from "node:crypto"

const MAX_REQUEST_BYTES = 50 * 1024 // 50KB
const MAX_EVENTS_PER_REQUEST = 20
const RATE_LIMIT_REQUESTS = 100
const RATE_LIMIT_WINDOW_SECONDS = 60

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type IngestEventItem = {
  type: string
  visitorId?: string
  visitor_id?: string
  properties?: Record<string, unknown>
  timestamp?: number
  session_id?: string
}

type SdkIngestPayload = {
  events: IngestEventItem[]
}

function withCors(response: NextResponse, corsHeaders: Record<string, string>): NextResponse {
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value)
  }
  return response
}

function isValidEventItem(ev: unknown, now: number): ev is IngestEventItem {
  if (typeof ev !== "object" || ev === null || Array.isArray(ev)) return false
  const o = ev as Record<string, unknown>

  const rawType = o.type
  if (typeof rawType !== "string") return false
  const type = normalizeEventType(rawType)
  if (type.length === 0 || type.length > MAX_EVENT_TYPE_LENGTH) return false
  if (!isAllowedIngestEvent(type)) return false

  const vid = o.visitorId ?? o.visitor_id
  if (typeof vid !== "string" || vid.length === 0) return false
  if (!UUID_V4_REGEX.test(vid)) return false

  if (o.properties !== undefined) {
    if (!isPlainObject(o.properties)) return false
    const size = safeByteLength(o.properties)
    if (size === null || size > MAX_PROPERTIES_BYTES) return false
    if (!validatePropertiesFields(o.properties)) return false
  }

  if (o.timestamp !== undefined && typeof o.timestamp !== "number" && typeof o.timestamp !== "string") return false
  if (o.timestamp != null) {
    const ts = Number(o.timestamp)
    if (!Number.isFinite(ts)) return false
    if (ts > now + TIMESTAMP_MAX_FUTURE_MS || ts < now - TIMESTAMP_MAX_AGE_MS) return false
  }

  const eventSize = safeByteLength(o)
  if (eventSize === null || eventSize > MAX_EVENT_BYTES) return false
  return true
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin")
  const corsHeaders = buildCorsHeaders("*", origin)
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

/**
 * POST /api/v1/ingest
 * Auth: x-api-key header, Authorization: Bearer <key>, body api_key/apiKey, or query api_key.
 * Body: { events: [{ type, visitorId, properties?, timestamp? }] }
 * Rate limited, 50KB max body, max 20 events, allowlisted types, UUID v4 visitorId.
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin")
  let corsHeaders = buildCorsHeaders(null, origin)

  try {
    const contentLength = Number(request.headers.get("content-length")) || 0
    if (contentLength > MAX_REQUEST_BYTES) {
      return withCors(NextResponse.json({ error: "Payload too large" }, { status: 413 }), corsHeaders)
    }

    const body = await request.json().catch(() => null)
    if (body == null || typeof body !== "object" || Array.isArray(body)) {
      return withCors(NextResponse.json({ error: "Invalid JSON" }, { status: 400 }), corsHeaders)
    }

    const payload = body as SdkIngestPayload & { api_key?: string; apiKey?: string }

    if (contentLength <= 0) {
      const bodyBytes = safeByteLength(payload)
      if (bodyBytes === null || bodyBytes > MAX_REQUEST_BYTES) {
        return withCors(NextResponse.json({ error: "Payload too large" }, { status: 413 }), corsHeaders)
      }
    }

    const headerKey =
      request.headers.get("x-api-key")?.trim() ||
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ||
      ""
    const queryKey = request.nextUrl.searchParams.get("api_key")?.trim() || ""
    const bodyKey = (
      typeof payload.api_key === "string"
        ? payload.api_key
        : typeof payload.apiKey === "string"
          ? payload.apiKey
          : ""
    ).trim()
    const api_key = headerKey || queryKey || bodyKey


    if (!api_key) {
      return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), corsHeaders)
    }

    const { events } = payload

    if (!Array.isArray(events) || events.length === 0) {
      return withCors(
        NextResponse.json({ error: "Bad Request: events must be a non-empty array" }, { status: 400 }),
        corsHeaders
      )
    }

    if (events.length > MAX_EVENTS_PER_REQUEST) {
      return withCors(
        NextResponse.json({ error: `Too many events: max ${MAX_EVENTS_PER_REQUEST}` }, { status: 400 }),
        corsHeaders
      )
    }

    if (!origin) {
      return withCors(NextResponse.json({ error: "Forbidden" }, { status: 403 }), corsHeaders)
    }

    let hostname: string
    try {
      hostname = new URL(origin).hostname
    } catch {
      return withCors(NextResponse.json({ error: "Forbidden" }, { status: 403 }), corsHeaders)
    }

    const hash = crypto.createHash("sha256").update(api_key).digest("hex")
    let keyRecord: any = null
    try {
      keyRecord = await prisma.apiKey.findUnique({
        where: { keyHash: hash },
      })
    } catch (dbError) {
      console.error("[ingest] DB lookup failed:", dbError)
      return withCors(
        NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 }),
        corsHeaders
      )
    }

    if (!keyRecord) {
      if (process.env.NODE_ENV === "development") {
        const devUserId =
          process.env.DEV_INGEST_USER_ID ??
          (await prisma.user.findFirst({ select: { id: true } }))?.id
        if (!devUserId) {
          console.warn("[ingest] no user in DB; cannot auto-create dev key")
          return withCors(
            NextResponse.json({ error: "API key not found", apiKey: api_key }, { status: 401 }),
            corsHeaders
          )
        }
        keyRecord = await prisma.apiKey.create({
          data: {
            userId: devUserId,
            keyHash: hash,
            name: "Auto-created dev key",
            type: ApiKeyType.public,
            domain: hostname,
            revoked: false,
          },
        })
      } else {
        return withCors(
          NextResponse.json({ error: "API key not found", apiKey: api_key }, { status: 401 }),
          corsHeaders
        )
      }
    }

    const now = Date.now()
    const isInactive =
      keyRecord.type !== ApiKeyType.public ||
      keyRecord.revoked ||
      (keyRecord.expiryDate != null && keyRecord.expiryDate.getTime() <= now)
    if (isInactive) {
      return withCors(
        NextResponse.json({ error: "API key inactive", apiKey: api_key }, { status: 401 }),
        corsHeaders
      )
    }

    if (keyRecord.domain && hostname !== keyRecord.domain) {
      return withCors(
        NextResponse.json(
          {
            error: "Domain not allowed",
            origin: request.headers.get("origin"),
            allowedDomain: keyRecord.domain,
          },
          { status: 401 }
        ),
        corsHeaders
      )
    }

    const apiKey = keyRecord

    corsHeaders = buildCorsHeaders(apiKey.domain, origin)

    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    let rateLimitAllowed = true
    try {
      const redisConfigured =
        process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
      if (redisConfigured && process.env.NODE_ENV === "production") {
        const rateCheck = await checkDistributedRateLimit(
          `v1ingest:${apiKey.userId}:${clientIp}`,
          RATE_LIMIT_REQUESTS,
          RATE_LIMIT_WINDOW_SECONDS
        )
        rateLimitAllowed = rateCheck.allowed
      }
    } catch (rateLimitError) {
      console.error("[ingest] Rate limit check failed, failing open:", rateLimitError)
      rateLimitAllowed = true // Nunca bloquear por fallo de Redis
    }
    if (!rateLimitAllowed) {
      return withCors(NextResponse.json({ error: "Too Many Requests" }, { status: 429 }), corsHeaders)
    }

    const userId = apiKey.userId
    const validEvents: QueuedEvent[] = []
    let skipped = 0

    for (const ev of events) {
      if (!isValidEventItem(ev, now)) {
        skipped += 1
        continue
      }

      const o = ev as Record<string, unknown>
      const type = normalizeEventType((o.type as string) ?? "")
      const visitorId = (o.visitorId ?? o.visitor_id) as string
      const props = isPlainObject(o.properties) ? o.properties : {}
      const sessionId = (props.session_id ?? o.session_id ?? "") as string
      const ts =
        o.timestamp != null
          ? typeof o.timestamp === "number"
            ? new Date(o.timestamp).toISOString()
            : new Date(Number(o.timestamp)).toISOString()
          : new Date().toISOString()

      validEvents.push({
        type,
        userId,
        apiKey: api_key,
        domain: hostname,
        visitor_id: visitorId,
        session_id: typeof sessionId === "string" ? sessionId : "",
        timestamp: ts,
        payload: props as Record<string, unknown>,
      })
    }

    let queued = false
    try {
      await enqueueEvents(validEvents)
      queued = true
    } catch (queueError) {
      console.error("[ingest] enqueueEvents failed:", queueError instanceof Error ? queueError.message : String(queueError))
    }

    return withCors(
      NextResponse.json({ ok: true, processed: validEvents.length, skipped, queued }),
      corsHeaders
    )
  } catch (error) {
    console.error("[ingest] Unhandled error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url,
      origin: request.headers.get("origin"),
    })

    return withCors(
      NextResponse.json({ error: "Internal server error" }, { status: 500 }),
      corsHeaders
    )
  }
}
