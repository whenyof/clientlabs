/**
 * Redis-backed event queue for scalable ingestion.
 * Safe queue: RPOPLPUSH (lmove) moves events to events_processing; ack on success, retry/DLQ on failure.
 */

import * as crypto from "node:crypto"
import { redis } from "@/lib/security/redis"
import type { QueuedEvent, QueuedEventEnvelope } from "@/lib/events/types"
import {
  MAX_RETRIES,
  MAX_QUEUE_LENGTH,
  MAX_DLQ_LENGTH,
  PROCESSING_TIMEOUT_MS,
  PROCESSED_EVENTS_TTL_SEC,
} from "@/lib/events/constants"

const EVENTS_QUEUE_KEY = "events_queue"
const EVENTS_PROCESSING_KEY = "events_processing"
const EVENTS_RETRY_QUEUE_KEY = "events_retry_queue"
const EVENTS_DEAD_LETTER_KEY = "events_dead_letter"
const PROCESSED_EVENTS_KEY = "processed_events"

export type ProcessingItem = { envelope: QueuedEventEnvelope; raw: string }

/** Retry backoff delays (ms): retry 1→10s, 2→30s, 3→2m, 4→10m, 5→DLQ. */
const RETRY_DELAYS_MS = [10_000, 30_000, 2 * 60_000, 10 * 60_000]

/**
 * Enqueue events to the main queue. Each is stored as an envelope with eventId, retries: 0.
 * Rejects (returns 0) and logs if queue length would exceed MAX_QUEUE_LENGTH.
 */
export async function enqueueEvents(events: QueuedEvent[]): Promise<number> {
  if (events.length === 0) return 0
  const len = await getQueueLength()
  if (len >= MAX_QUEUE_LENGTH) {
    console.error("[queue] max queue size exceeded")
    return 0
  }
  const now = Date.now()
  const serialized = events.map((e) =>
    JSON.stringify({
      eventId: crypto.randomUUID(),
      event: e,
      retries: 0,
      createdAt: now,
    } as QueuedEventEnvelope)
  )
  const length = await redis.lpush(EVENTS_QUEUE_KEY, ...serialized)
  return length as number
}

/**
 * Move up to `limit` events from events_queue to events_processing (atomic RPOPLPUSH via lmove).
 * Returns items with parsed envelope and raw string for ack.
 * Corrupt JSON: move raw to events_dead_letter (never crash worker).
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
    if (raw == null) break
    const str = raw as string
    try {
      const envelope = JSON.parse(str) as QueuedEventEnvelope
      out.push({ envelope, raw: str })
    } catch {
      await redis.lrem(EVENTS_PROCESSING_KEY, 1, str)
      await redis.lpush(EVENTS_DEAD_LETTER_KEY, str)
    }
  }
  return out
}

/**
 * Remove a processed event from events_processing (on success).
 */
export async function ackProcessedEvent(raw: string): Promise<void> {
  await redis.lrem(EVENTS_PROCESSING_KEY, 1, raw)
}

/** Idempotency: check if eventId was already processed. */
export async function isEventProcessed(eventId: string): Promise<boolean> {
  const v = await redis.sismember(PROCESSED_EVENTS_KEY, eventId)
  return v === 1
}

/** Idempotency: mark event as processed; SET TTL 24h. */
export async function markEventProcessed(eventId: string): Promise<void> {
  await redis.sadd(PROCESSED_EVENTS_KEY, eventId)
  await redis.expire(PROCESSED_EVENTS_KEY, PROCESSED_EVENTS_TTL_SEC)
}

/**
 * On failure: remove from processing and push to retry queue (with backoff) or dead letter.
 */
export async function pushToRetryOrDeadLetter(envelope: QueuedEventEnvelope): Promise<void> {
  const nextRetries = envelope.retries + 1
  const delayMs = RETRY_DELAYS_MS[nextRetries - 1] ?? 0
  const nextRetryAt = Date.now() + delayMs
  const payload: QueuedEventEnvelope = { ...envelope, retries: nextRetries, nextRetryAt }
  const serialized = JSON.stringify(payload)
  if (nextRetries <= MAX_RETRIES) {
    await redis.lpush(EVENTS_RETRY_QUEUE_KEY, serialized)
  } else {
    await redis.lpush(EVENTS_DEAD_LETTER_KEY, serialized)
  }
}

/**
 * Remove from processing and push to retry or DLQ. Call after ack (remove from processing).
 */
export async function nackAndRetryOrDeadLetter(
  raw: string,
  envelope: QueuedEventEnvelope
): Promise<void> {
  await redis.lrem(EVENTS_PROCESSING_KEY, 1, raw)
  await pushToRetryOrDeadLetter(envelope)
}

/** Main queue length (LLEN). */
export async function getQueueLength(): Promise<number> {
  const n = await redis.llen(EVENTS_QUEUE_KEY)
  return typeof n === "number" ? n : Number(n)
}

/** Processing list length (LLEN). */
export async function getProcessingQueueLength(): Promise<number> {
  const n = await redis.llen(EVENTS_PROCESSING_KEY)
  return typeof n === "number" ? n : Number(n)
}

/** Retry queue length (LLEN). */
export async function getRetryQueueLength(): Promise<number> {
  const n = await redis.llen(EVENTS_RETRY_QUEUE_KEY)
  return typeof n === "number" ? n : Number(n)
}

/** Dead letter queue length (LLEN). */
export async function getDeadLetterQueueLength(): Promise<number> {
  const n = await redis.llen(EVENTS_DEAD_LETTER_KEY)
  return typeof n === "number" ? n : Number(n)
}

const BLOCKING_POLL_INTERVAL_MS = 1000
const BLOCKING_POLL_TIMEOUT_MS = 5000

/**
 * Blocking dequeue: wait up to ~5s for events, then return batch.
 * Uses polling (Upstash REST has no true BRPOP); worker wakes when events exist.
 */
export async function blockingDequeueToProcessing(
  limit: number
): Promise<ProcessingItem[]> {
  const deadline = Date.now() + BLOCKING_POLL_TIMEOUT_MS
  while (Date.now() < deadline) {
    const batch = await dequeueToProcessing(limit)
    if (batch.length > 0) return batch
    await new Promise((r) => setTimeout(r, BLOCKING_POLL_INTERVAL_MS))
  }
  return []
}

/**
 * Pop one envelope from the retry queue (for retry worker). Simple RPOP.
 * Caller should push back if nextRetryAt > now (use pushBackToRetryQueue).
 */
export async function dequeueOneRetryEvent(): Promise<{
  envelope: QueuedEventEnvelope
  raw: string
} | null> {
  const raw = await redis.rpop(EVENTS_RETRY_QUEUE_KEY)
  if (raw == null) return null
  try {
    const envelope = JSON.parse(raw as string) as QueuedEventEnvelope
    return { envelope, raw: raw as string }
  } catch {
    await redis.lpush(EVENTS_DEAD_LETTER_KEY, raw)
    return null
  }
}

/** Push raw envelope back to the end of retry queue (for backoff: not yet time to retry). */
export async function pushBackToRetryQueue(raw: string): Promise<void> {
  await redis.rpush(EVENTS_RETRY_QUEUE_KEY, raw)
}

/**
 * Recovery: move events stuck in events_processing (older than PROCESSING_TIMEOUT_MS) back to events_queue.
 * Worker should call once every 60s.
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
        recovered += 1
      }
    } catch {
      // corrupt: move to DLQ
      await redis.lrem(EVENTS_PROCESSING_KEY, 1, raw)
      await redis.lpush(EVENTS_DEAD_LETTER_KEY, raw)
    }
  }
  return recovered
}

/**
 * If DLQ length > MAX_DLQ_LENGTH, trim oldest (keep newest 100k).
 */
export async function cleanupDeadLetterQueue(): Promise<number> {
  const len = await getDeadLetterQueueLength()
  if (len <= MAX_DLQ_LENGTH) return 0
  await redis.ltrim(EVENTS_DEAD_LETTER_KEY, 0, MAX_DLQ_LENGTH - 1)
  return len - MAX_DLQ_LENGTH
}
