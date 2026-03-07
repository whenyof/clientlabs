/**
 * Event queue and worker configuration.
 */

export const BATCH_SIZE = 200
export const WORKER_SLEEP_MS = 200
export const MAX_RETRIES = 5

/** Events in processing longer than this are moved back to main queue (recovery). */
export const PROCESSING_TIMEOUT_MS = 5 * 60 * 1000

/** Max main queue length; enqueue rejects/logs when exceeded. */
export const MAX_QUEUE_LENGTH = 1_000_000

/** Max dead letter queue length before LTRIM cleanup. */
export const MAX_DLQ_LENGTH = 100_000

/** Idempotency: processed_events SET TTL (seconds). */
export const PROCESSED_EVENTS_TTL_SEC = 24 * 60 * 60
