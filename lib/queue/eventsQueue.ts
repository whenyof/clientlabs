/**
 * Redis-backed event queue for scalable ingestion.
 * Safe queue: RPOPLPUSH (lmove) moves events to events_processing; ack on success, retry/DLQ on failure.
 */

import { redis } from "@/lib/security/redis"
import type { QueuedEvent, QueuedEventEnvelope } from "@/lib/events/types"
import {
  MAX_RETRIES,
  MAX_QUEUE_LENGTH,
  MAX_DLQ_LENGTH,
  PROCESSING_TIMEOUT_MS,
  PROCESSED_EVENTS_TTL_SEC,
} from "@/lib/events/constants"

/** Single queue key — shared by ingest (RPUSH) and worker (LMOVE). */
export const EVENTS_QUEUE_KEY = "clientlabs:events"

const EVENTS_PROCESSING_KEY = "events_processing"
const EVENTS_RETRY_QUEUE_KEY = "events_retry_queue"
const EVENTS_DEAD_LETTER_KEY = "events_dead_letter"
const PROCESSED_EVENTS_KEY = "processed_events"

export type ProcessingItem = { envelope: QueuedEventEnvelope; raw: string }

/** Retry backoff delays */
const RETRY_DELAYS_MS = [10_000, 30_000, 2 * 60_000, 10 * 60_000]

/**
 * Enqueue events to Redis queue
 */
export async function enqueueEvents(events: QueuedEvent[]): Promise<number> {
  if (!events?.length) return 0

  const currentLength = await getQueueLength()

  if (currentLength >= MAX_QUEUE_LENGTH) {
    console.error("[queue] max queue size exceeded")
    return 0
  }

  console.log("[queue] pushing to key:", EVENTS_QUEUE_KEY)

  for (const event of events) {
    await redis.rpush(EVENTS_QUEUE_KEY, JSON.stringify(event))
  }

  const queueLength = await redis.llen(EVENTS_QUEUE_KEY)

  console.log("[queue] redis length after push:", queueLength)
  console.log("[queue] pushed events:", events.length)

  return events.length
}

/**
 * Move events from queue → processing (safe queue pattern)
 */
export async function dequeueToProcessing(limit: number): Promise<ProcessingItem[]> {
  const out: ProcessingItem[] = []

  for (let i = 0; i < limit; i++) {
    const raw = await redis.lmove(
      EVENTS_QUEUE_KEY,
      EVENTS_PROCESSING_KEY,
      "right",
      "left"
    )

    if (!raw) break

    const rawString = raw as string

    try {
      const envelope = JSON.parse(rawString) as QueuedEventEnvelope
      out.push({ envelope, raw: rawString })
    } catch {
      console.error("[queue] corrupt event → DLQ")

      await redis.lrem(EVENTS_PROCESSING_KEY, 1, rawString)
      await redis.lpush(EVENTS_DEAD_LETTER_KEY, rawString)
    }
  }

  return out
}

/**
 * ACK processed event
 */
export async function ackProcessedEvent(raw: string): Promise<void> {
  await redis.lrem(EVENTS_PROCESSING_KEY, 1, raw)
}

/**
 * Idempotency check
 */
export async function isEventProcessed(eventId: string): Promise<boolean> {
  const result = await redis.sismember(PROCESSED_EVENTS_KEY, eventId)
  return result === 1
}

/**
 * Mark event processed
 */
export async function markEventProcessed(eventId: string): Promise<void> {
  await redis.sadd(PROCESSED_EVENTS_KEY, eventId)
  await redis.expire(PROCESSED_EVENTS_KEY, PROCESSED_EVENTS_TTL_SEC)
}

/**
 * Retry or DLQ logic
 */
export async function pushToRetryOrDeadLetter(
  envelope: QueuedEventEnvelope
): Promise<void> {
  const nextRetries = envelope.retries + 1
  const delayMs = RETRY_DELAYS_MS[nextRetries - 1] ?? 0

  const payload: QueuedEventEnvelope = {
    ...envelope,
    retries: nextRetries,
    nextRetryAt: Date.now() + delayMs,
  }

  const serialized = JSON.stringify(payload)

  if (nextRetries <= MAX_RETRIES) {
    await redis.lpush(EVENTS_RETRY_QUEUE_KEY, serialized)
  } else {
    await redis.lpush(EVENTS_DEAD_LETTER_KEY, serialized)
  }
}

/**
 * NACK logic
 */
export async function nackAndRetryOrDeadLetter(
  raw: string,
  envelope: QueuedEventEnvelope
): Promise<void> {
  await redis.lrem(EVENTS_PROCESSING_KEY, 1, raw)
  await pushToRetryOrDeadLetter(envelope)
}

/**
 * Queue lengths
 */

export async function getQueueLength(): Promise<number> {
  const n = await redis.llen(EVENTS_QUEUE_KEY)
  return typeof n === "number" ? n : Number(n)
}

export async function getProcessingQueueLength(): Promise<number> {
  const n = await redis.llen(EVENTS_PROCESSING_KEY)
  return typeof n === "number" ? n : Number(n)
}

export async function getRetryQueueLength(): Promise<number> {
  const n = await redis.llen(EVENTS_RETRY_QUEUE_KEY)
  return typeof n === "number" ? n : Number(n)
}

export async function getDeadLetterQueueLength(): Promise<number> {
  const n = await redis.llen(EVENTS_DEAD_LETTER_KEY)
  return typeof n === "number" ? n : Number(n)
}

const BLOCKING_POLL_INTERVAL_MS = 1000
const BLOCKING_POLL_TIMEOUT_MS = 5000

/**
 * Poll queue until events appear
 */
export async function blockingDequeueToProcessing(
  limit: number
): Promise<ProcessingItem[]> {
  const deadline = Date.now() + BLOCKING_POLL_TIMEOUT_MS

  while (Date.now() < deadline) {
    const batch = await dequeueToProcessing(limit)

    if (batch.length > 0) {
      return batch
    }

    await new Promise((r) => setTimeout(r, BLOCKING_POLL_INTERVAL_MS))
  }

  return []
}

/**
 * Retry worker dequeue
 */
export async function dequeueOneRetryEvent(): Promise<{
  envelope: QueuedEventEnvelope
  raw: string
} | null> {
  const raw = await redis.rpop(EVENTS_RETRY_QUEUE_KEY)

  if (!raw) return null

  try {
    const envelope = JSON.parse(raw as string) as QueuedEventEnvelope
    return { envelope, raw: raw as string }
  } catch {
    await redis.lpush(EVENTS_DEAD_LETTER_KEY, raw)
    return null
  }
}

/**
 * Push back to retry queue
 */
export async function pushBackToRetryQueue(raw: string): Promise<void> {
  await redis.rpush(EVENTS_RETRY_QUEUE_KEY, raw)
}

/**
 * Recover stuck events
 */
export async function recoverStuckProcessingEvents(): Promise<number> {
  const rawItems = await redis.lrange(EVENTS_PROCESSING_KEY, 0, -1)

  const now = Date.now()
  let recovered = 0

  for (const raw of rawItems) {
    try {
      const envelope = JSON.parse(raw as string) as QueuedEventEnvelope

      if (now - envelope.createdAt > PROCESSING_TIMEOUT_MS) {
        await redis.lrem(EVENTS_PROCESSING_KEY, 1, raw)
        await redis.rpush(EVENTS_QUEUE_KEY, raw)

        recovered++
      }
    } catch {
      await redis.lrem(EVENTS_PROCESSING_KEY, 1, raw)
      await redis.lpush(EVENTS_DEAD_LETTER_KEY, raw)
    }
  }

  return recovered
}

/**
 * Trim dead letter queue
 */
export async function cleanupDeadLetterQueue(): Promise<number> {
  const len = await getDeadLetterQueueLength()

  if (len <= MAX_DLQ_LENGTH) return 0

  await redis.ltrim(EVENTS_DEAD_LETTER_KEY, 0, MAX_DLQ_LENGTH - 1)

  return len - MAX_DLQ_LENGTH
}