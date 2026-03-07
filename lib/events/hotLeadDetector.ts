/**
 * Hot Lead Detection — runs after each event is stored.
 * Computes visitor score, checks hot conditions, publishes alert to live stream (once per 15 min per visitor).
 */

import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/security/redis"
import { computeVisitorScore } from "./intelligenceScoring"
import { publishCustomLiveEvent } from "@/lib/realtime/publishEvent"
import type { QueuedEvent } from "./types"

const HOT_LEAD_REDIS_KEY_PREFIX = "clientlabs:hotlead:"
const HOT_LEAD_TTL_SECONDS = 15 * 60 // 15 minutes

const HOT_SCORE_THRESHOLD = 60

function isHotLead(score: number, signals: Set<string>): boolean {
  if (score >= HOT_SCORE_THRESHOLD) return true
  if (signals.has("purchase")) return true
  if (signals.has("checkout_click") && signals.has("email_detected")) return true
  return false
}

export async function detectHotLead(event: QueuedEvent): Promise<void> {
  const { userId, visitor_id: visitorId, domain } = event

  const events = await prisma.event.findMany({
    where: {
      userId,
      visitorId,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { type: true, data: true, url: true },
  })

  const { score, signals } = computeVisitorScore(events)

  if (!isHotLead(score, signals)) return

  const key = `${HOT_LEAD_REDIS_KEY_PREFIX}${visitorId}`
  const existing = await redis.get(key).catch(() => null)
  if (existing != null) return

  await redis.setex(key, HOT_LEAD_TTL_SECONDS, "1").catch(() => {})

  const payload = {
    type: "hot_lead",
    visitorId,
    domain,
    score,
    signals: Array.from(signals),
    timestamp: new Date().toISOString(),
  }

  await publishCustomLiveEvent(userId, payload)
}
