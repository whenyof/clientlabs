/**
 * Event queue worker — processes job.data with the full event pipeline.
 * Wire this to your BullMQ Worker's process function.
 * Wrap in try/catch to prevent worker crash.
 */

import { processEvent } from "@/lib/events/processEvent"
import type { QueuedEvent } from "@/lib/events/types"

export type EventJobData = QueuedEvent

export async function handleEventJob(job: { data: EventJobData }): Promise<void> {
  try {
    await processEvent(job.data)
  } catch (error) {
    console.error("[eventWorker] processEvent failed:", error)
    throw error
  }
}
