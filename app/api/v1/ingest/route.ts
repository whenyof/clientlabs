import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ApiKeyType } from "@prisma/client"
import { buildCorsHeaders } from "@/lib/track/originValidator"
import { logger } from "@/lib/logger"
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
  api_key: string
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
 * Batched SDK events: { api_key, events: [{ type, visitorId, properties?, timestamp? }] }
 * Rate limited, 50KB max body, max 20 events, allowlisted types, UUID v4 visitorId.
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin")
  let corsHeaders = buildCorsHeaders(null, origin)

  const contentLength = Number(request.headers.get("content-length")) || 0
  if (contentLength > MAX_REQUEST_BYTES) {
    return withCors(NextResponse.json({ error: "Payload too large" }, { status: 413 }), corsHeaders)
  }

  let payload: SdkIngestPayload
  try {
    const body = await request.json()
    payload = body as SdkIngestPayload
  } catch {
    return withCors(NextResponse.json({ error: "Invalid JSON" }, { status: 400 }), corsHeaders)
  }

  if (contentLength <= 0) {
    const bodyBytes = safeByteLength(payload)
    if (bodyBytes === null || bodyBytes > MAX_REQUEST_BYTES) {
      return withCors(NextResponse.json({ error: "Payload too large" }, { status: 413 }), corsHeaders)
    }
  }

  const { api_key, events } = payload

  if (!api_key || typeof api_key !== "string") {
    return withCors(NextResponse.json({ error: "Bad Request" }, { status: 400 }), corsHeaders)
  }

  if (!Array.isArray(events) || events.length === 0) {
    return withCors(NextResponse.json({ error: "Bad Request: events must be a non-empty array" }, { status: 400 }), corsHeaders)
  }

  if (events.length > MAX_EVENTS_PER_REQUEST) {
    return withCors(NextResponse.json({ error: `Too many events: max ${MAX_EVENTS_PER_REQUEST}` }, { status: 400 }), corsHeaders)
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
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hash },
  })
  const now = Date.now()

  if (
    !apiKey ||
    apiKey.type !== ApiKeyType.public ||
    apiKey.revoked ||
    (apiKey.expiryDate && apiKey.expiryDate.getTime() <= now)
  ) {
    return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }), corsHeaders)
  }

  if (apiKey.domain && hostname !== apiKey.domain) {
    return withCors(NextResponse.json({ error: "Forbidden" }, { status: 403 }), corsHeaders)
  }

  corsHeaders = buildCorsHeaders(apiKey.domain, origin)

  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const rateCheck = await checkDistributedRateLimit(
    `v1ingest:${apiKey.userId}:${clientIp}`,
    RATE_LIMIT_REQUESTS,
    RATE_LIMIT_WINDOW_SECONDS
  )
  if (!rateCheck.allowed) {
    return withCors(
      NextResponse.json({ error: "Too Many Requests" }, { status: 429 }),
      corsHeaders
    )
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

  await enqueueEvents(validEvents)

  return withCors(
    NextResponse.json({ ok: true, processed: validEvents.length, skipped, queued: true }),
    corsHeaders
  )
}
