/**
 * Retry worker — consumes events_retry_queue with backoff; on failure pushes to retry or dead letter.
 * Skips events where Date.now() < nextRetryAt (pushes back to end of retry queue).
 * Run: npx tsx workers/eventRetryWorker.ts
 */

import {
  dequeueOneRetryEvent,
  markEventProcessed,
  pushBackToRetryQueue,
  pushToRetryOrDeadLetter,
} from "@/lib/queue/eventsQueue"
import { processEvent } from "@/lib/events/processEvent"

const RETRY_LOOP_SLEEP_MS = 1000

async function runLoop(): Promise<void> {
  while (true) {
    try {
      const item = await dequeueOneRetryEvent()
      if (item) {
        const { envelope, raw } = item
        if (
          envelope.nextRetryAt != null &&
          Date.now() < envelope.nextRetryAt
        ) {
          await pushBackToRetryQueue(raw)
          continue
        }
        try {
          await processEvent(envelope.event)
          if (envelope.eventId) await markEventProcessed(envelope.eventId)
        } catch {
          await pushToRetryOrDeadLetter(envelope).catch(() => {})
        }
      }
    } catch (err) {
      console.error("[eventRetryWorker] iteration failed:", err)
    }
    await new Promise((r) => setTimeout(r, RETRY_LOOP_SLEEP_MS))
  }
}

runLoop().catch((e) => {
  console.error("[eventRetryWorker] fatal:", e)
  process.exit(1)
})
