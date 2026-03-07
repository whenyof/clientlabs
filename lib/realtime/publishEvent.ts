/**
 * Publish live event to Redis for real-time dashboard stream.
 * Channel: clientlabs:events:{userId}
 * Queue: clientlabs:events:queue:{userId} (for SSE consumers using Upstash REST)
 */

import * as crypto from "node:crypto"
import { redis } from "@/lib/security/redis"

const CHANNEL_PREFIX = "clientlabs:events:"
const QUEUE_PREFIX = "clientlabs:events:queue:"
const QUEUE_MAX_LEN = 100

export interface LiveEventPayload {
  id: string
  type: string
  domain: string
  url: string
  visitorId: string
  timestamp: string
}

export async function publishLiveEvent(
  userId: string,
  event: { type: string; domain: string; visitor_id: string; timestamp: string; payload?: Record<string, unknown> }
): Promise<void> {
  const url =
    (event.payload && typeof event.payload.url === "string" && event.payload.url) ||
    event.domain ||
    ""

  const eventId = crypto.randomUUID()

  const payload: LiveEventPayload = {
    id: eventId,
    type: event.type,
    domain: event.domain,
    url,
    visitorId: event.visitor_id,
    timestamp: event.timestamp,
  }

  const channel = `${CHANNEL_PREFIX}${userId}`
  const message = JSON.stringify(payload)

  try {
    await redis.publish(channel, message)
    const queueKey = `${QUEUE_PREFIX}${userId}`
    await redis.lpush(queueKey, message)
    await redis.ltrim(queueKey, 0, QUEUE_MAX_LEN - 1)
  } catch {
    // non-blocking: do not fail event processing if realtime publish fails
  }
}

/**
 * Publish a custom payload to the user's live event stream (e.g. hot_lead).
 * Same channel and queue as publishLiveEvent.
 */
export async function publishCustomLiveEvent(
  userId: string,
  payload: Record<string, unknown>
): Promise<void> {
  const channel = `${CHANNEL_PREFIX}${userId}`
  const message = JSON.stringify(payload)
  try {
    await redis.publish(channel, message)
    const queueKey = `${QUEUE_PREFIX}${userId}`
    await redis.lpush(queueKey, message)
    await redis.ltrim(queueKey, 0, QUEUE_MAX_LEN - 1)
  } catch {
    // non-blocking
  }
}
