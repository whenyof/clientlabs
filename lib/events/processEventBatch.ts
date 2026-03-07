/**
 * Process a batch of queued events (from processing list).
 * Idempotency: skip if eventId already in processed_events.
 * On success: ack and markEventProcessed.
 * On failure: nack and push to retry or dead letter.
 */

import { processEvent } from "./processEvent"
import {
  ackProcessedEvent,
  isEventProcessed,
  markEventProcessed,
  nackAndRetryOrDeadLetter,
  type ProcessingItem,
} from "@/lib/queue/eventsQueue"

export async function processEventBatch(
  items: ProcessingItem[]
): Promise<{ processed: number; failed: number }> {
  let processed = 0
  let failed = 0
  for (const { envelope, raw } of items) {
    if (envelope.eventId && (await isEventProcessed(envelope.eventId))) {
      await ackProcessedEvent(raw)
      continue
    }
    try {
      await processEvent(envelope.event)
      await ackProcessedEvent(raw)
      if (envelope.eventId) await markEventProcessed(envelope.eventId)
      processed += 1
    } catch (err) {
      failed += 1
      await nackAndRetryOrDeadLetter(raw, envelope).catch(() => {})
    }
  }
  return { processed, failed }
}
