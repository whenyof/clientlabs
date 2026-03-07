/**
 * Event queue worker main — FIFO consumer: LPOP from clientlabs:events.
 * Loaded by eventQueueWorker.ts after dotenv and Redis env check.
 */

import { redis } from "@/lib/security/redis"
import { EVENTS_QUEUE_KEY, getQueueLength } from "@/lib/queue/eventsQueue"
import { processEvent } from "@/lib/events/processEvent"
import type { QueuedEvent } from "@/lib/events/types"

export const metrics = {
  processedTotal: 0,
  failedTotal: 0,
  lastQueueLength: 0,
  lastBatchAt: 0,
  batchTimesMs: [] as number[],
  lastError: null as string | null,
}

const METRICS_WINDOW = 100
const LOG_INTERVAL_MS = 10_000
const MEMORY_SAFETY_EXIT_AFTER = 100_000
const WATCHDOG_QUEUE_THRESHOLD = 10_000
const WATCHDOG_EPS_THRESHOLD = 5

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Dequeue up to N events (FIFO)
 * Compatible with Upstash returning string OR object
 */
async function dequeueBatch(limit = 20): Promise<QueuedEvent[]> {
  const batch: QueuedEvent[] = []

  for (let i = 0; i < limit; i++) {
    const raw = await redis.lpop(EVENTS_QUEUE_KEY)

    if (!raw) break

    let parsed: unknown

    try {
      if (typeof raw === "string") {
        parsed = JSON.parse(raw) as unknown
      } else if (typeof raw === "object" && raw !== null) {
        parsed = raw
      } else {
        console.warn("[worker] invalid redis item")
        continue
      }

      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        console.warn("[worker] invalid event structure")
        continue
      }

      batch.push(parsed as QueuedEvent)

    } catch {
      console.warn("[worker] corrupt event skipped")
    }
  }

  return batch
}

/**
 * Main worker loop
 */
async function runLoop(): Promise<void> {
  console.log("🚀 ClientLabs event worker started")

  while (true) {
    try {

      if (metrics.processedTotal >= MEMORY_SAFETY_EXIT_AFTER) {
        console.log("[worker] restart recommended (memory safety)")
        process.exit(0)
      }

      const events = await dequeueBatch(20)

      if (events.length === 0) {
        await sleep(2000)
        continue
      }

      console.log(`[worker] processing batch: ${events.length}`)

      const start = Date.now()

      let processed = 0
      let failed = 0

      for (const event of events) {
        try {
          await processEvent(event)
          processed++
        } catch (err) {
          failed++
          metrics.lastError =
            err instanceof Error ? err.message : String(err)

          console.error("[worker] event failed:", err)
        }
      }

      const elapsed = Date.now() - start

      metrics.processedTotal += processed
      metrics.failedTotal += failed
      metrics.lastBatchAt = Date.now()

      metrics.batchTimesMs.push(elapsed)
      if (metrics.batchTimesMs.length > METRICS_WINDOW) {
        metrics.batchTimesMs.shift()
      }

      console.log(
        `[worker] processed=${processed} failed=${failed} time=${elapsed}ms`
      )

      metrics.lastQueueLength = await getQueueLength()

    } catch (err) {

      console.error("[worker] fatal loop error:", err)

      metrics.failedTotal++
      metrics.lastError = err instanceof Error ? err.message : String(err)

      await sleep(5000)
    }
  }
}

/**
 * Metrics helpers
 */

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

/**
 * Metrics watchdog
 */
function startMetricsLog(): void {
  setInterval(() => {

    const queueLen = metrics.lastQueueLength
    const eps = eventsPerSecond()
    const avgBatch = avgBatchTimeMs()

    if (queueLen > WATCHDOG_QUEUE_THRESHOLD && eps < WATCHDOG_EPS_THRESHOLD) {
      console.warn(
        `[worker] throughput warning queue=${queueLen} eps=${eps} avgBatch=${avgBatch}ms`
      )
    }

  }, LOG_INTERVAL_MS)
}

export { runLoop, startMetricsLog }