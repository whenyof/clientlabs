/**
 * Event queue worker — blocking dequeue from Redis, process batches, ack or retry/DLQ.
 * Recovery every 60s; DLQ cleanup; watchdog; graceful exit after 100k events.
 * Run: npx tsx workers/eventQueueWorker.ts  (or npm run worker:events)
 */

import {
  blockingDequeueToProcessing,
  getQueueLength,
  getProcessingQueueLength,
  recoverStuckProcessingEvents,
  cleanupDeadLetterQueue,
} from "@/lib/queue/eventsQueue"
import { processEventBatch } from "@/lib/events/processEventBatch"
import { BATCH_SIZE, WORKER_SLEEP_MS } from "@/lib/events/constants"

export const metrics = {
  processedTotal: 0,
  failedTotal: 0,
  lastQueueLength: 0,
  lastProcessingLength: 0,
  lastBatchAt: 0,
  batchTimesMs: [] as number[],
  lastError: null as string | null,
}

const METRICS_WINDOW = 100
const LOG_INTERVAL_MS = 10_000
const RECOVERY_INTERVAL_MS = 60_000
const MEMORY_SAFETY_EXIT_AFTER = 100_000
const WATCHDOG_QUEUE_THRESHOLD = 10_000
const WATCHDOG_EPS_THRESHOLD = 5

let lastRecoveryAt = 0

async function runLoop(): Promise<void> {
  while (true) {
    if (metrics.processedTotal >= MEMORY_SAFETY_EXIT_AFTER) {
      console.log("[worker] restart recommended")
      process.exit(0)
    }
    try {
      const now = Date.now()
      if (now - lastRecoveryAt >= RECOVERY_INTERVAL_MS) {
        lastRecoveryAt = now
        const recovered = await recoverStuckProcessingEvents()
        if (recovered > 0) {
          console.log("[worker] recovery: moved %d stuck events back to queue", recovered)
        }
        const trimmed = await cleanupDeadLetterQueue()
        if (trimmed > 0) {
          console.log("[worker] DLQ cleanup: trimmed %d oldest items", trimmed)
        }
      }
      const items = await blockingDequeueToProcessing(BATCH_SIZE)
      if (items.length > 0) {
        const start = Date.now()
        const { processed, failed } = await processEventBatch(items)
        const elapsed = Date.now() - start
        metrics.processedTotal += processed
        metrics.failedTotal += failed
        metrics.lastBatchAt = Date.now()
        metrics.batchTimesMs.push(elapsed)
        if (metrics.batchTimesMs.length > METRICS_WINDOW)
          metrics.batchTimesMs.shift()
      } else {
        await new Promise((r) => setTimeout(r, WORKER_SLEEP_MS))
      }
      metrics.lastQueueLength = await getQueueLength()
      metrics.lastProcessingLength = await getProcessingQueueLength()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      metrics.lastError = msg
      console.error("[eventQueueWorker] batch failed:", err)
      metrics.failedTotal += 1
      await new Promise((r) => setTimeout(r, WORKER_SLEEP_MS))
    }
  }
}

let lastLogProcessed = 0
let lastLogAt = Date.now()

function eventsPerSecond(): number {
  const now = Date.now()
  const elapsedSec = (now - lastLogAt) / 1000
  if (elapsedSec <= 0) return 0
  const delta = metrics.processedTotal - lastLogProcessed
  lastLogProcessed = metrics.processedTotal
  lastLogAt = now
  return Math.round(delta / elapsedSec)
}

function avgBatchTimeMs(): number {
  if (metrics.batchTimesMs.length === 0) return 0
  const sum = metrics.batchTimesMs.reduce((a, b) => a + b, 0)
  return Math.round(sum / metrics.batchTimesMs.length)
}

function startMetricsLog(): void {
  setInterval(() => {
    const eps = eventsPerSecond()
    const avgBatch = avgBatchTimeMs()
    const processing = metrics.lastProcessingLength
    const queueLen = metrics.lastQueueLength
    if (queueLen > WATCHDOG_QUEUE_THRESHOLD && eps < WATCHDOG_EPS_THRESHOLD) {
      console.warn("[worker] throughput too low")
    }
    console.log(
      "[worker] queue=%d processing=%d processed=%d errors=%d eps=%d avg_batch_ms=%d last_error=%s",
      queueLen,
      processing,
      metrics.processedTotal,
      metrics.failedTotal,
      eps,
      avgBatch,
      metrics.lastError ?? "none"
    )
  }, LOG_INTERVAL_MS)
}

export { runLoop }

startMetricsLog()
runLoop().catch((e) => {
  console.error("[eventQueueWorker] fatal:", e)
  process.exit(1)
})
