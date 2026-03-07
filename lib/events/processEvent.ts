/**
 * Main event processor — installation verification, store, parallelize processors, detect lead.
 * Safe for concurrent workers.
 */

import { INTERNAL_EVENT_TYPES } from "@/lib/events"
import { updateSdkInstallation } from "./sdkInstallationProcessor"
import { storeEvent } from "./storeEvent"
import { detectHotLead } from "./hotLeadDetector"
import { updateVisitor } from "./visitorProcessor"
import { updateSession } from "./sessionProcessor"
import { updateDailyStats } from "./statsProcessor"
import { detectLead } from "./leadProcessor"
import { publishLiveEvent } from "@/lib/realtime/publishEvent"
import type { QueuedEvent } from "./types"

const LIVE_EVENT_TYPES = new Set([
  "pageview",
  "button_click",
  "form_submit",
  "checkout_click",
  "purchase_detected",
  "lead_identified",
])

export async function processEvent(event: QueuedEvent): Promise<void> {
  await updateSdkInstallation(event)

  await storeEvent(event)

  await detectHotLead(event).catch(() => {})

  if (LIVE_EVENT_TYPES.has(event.type)) {
    publishLiveEvent(event.userId, event).catch(() => {})
  }

  const skipAnalytics = INTERNAL_EVENT_TYPES.has(event.type)
  await Promise.all([
    skipAnalytics ? Promise.resolve() : updateVisitor(event),
    skipAnalytics ? Promise.resolve() : updateSession(event),
    skipAnalytics
      ? Promise.resolve()
      : updateDailyStats(event).catch((err) => {
          console.error("[stats] failed:", err)
        }),
  ])

  await detectLead(event).catch((err) => {
    console.error("[lead] detect error:", err)
  })
}
