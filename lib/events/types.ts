/**
 * Event shape from the queue (job.data).
 * Enriched by the ingest layer with userId before being pushed to the queue.
 */
export interface QueuedEvent {
  type: string
  userId: string
  apiKey: string
  domain: string
  visitor_id: string
  session_id: string
  timestamp: string
  payload?: Record<string, unknown>
}

/**
 * Envelope stored in Redis for retry metadata and idempotency.
 */
export interface QueuedEventEnvelope {
  eventId?: string
  event: QueuedEvent
  retries: number
  createdAt: number
  /** When this event may be retried (backoff). */
  nextRetryAt?: number
}
