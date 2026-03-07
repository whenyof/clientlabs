/**
 * GET /api/v1/leads/feed
 * Lead feed — latest 50 visitors with score, intent, last event.
 * Two queries: 1 raw SQL for visitors, 1 Prisma findMany for events. No N+1.
 */

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { computeVisitorScore } from "@/lib/events/intelligenceScoring"
import type { EventForScoring } from "@/lib/events/intelligenceScoring"

const VISITOR_LIMIT = 50
const EVENTS_PER_VISITOR = 100

/** Strongest signal for lastAction (priority order). */
const LAST_ACTION_PRIORITY = [
  "purchase",
  "submitted_email",
  "signup_click",
  "visited_pricing",
] as const

function lastActionFromSignals(signals: Set<string>): string | null {
  for (const signal of LAST_ACTION_PRIORITY) {
    if (signals.has(signal)) return signal
  }
  return null
}

type EventRow = {
  visitorId: string | null
  type: string
  data: unknown
  url: string
  domain: string | null
  createdAt: Date
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const userId = session.user.id

  const rows = await prisma.$queryRaw<{ visitorId: string; lastSeen: Date }[]>`
    SELECT "visitorId", MAX("createdAt") AS "lastSeen"
    FROM "Event"
    WHERE "userId" = ${userId}
      AND "visitorId" IS NOT NULL
    GROUP BY "visitorId"
    ORDER BY "lastSeen" DESC
    LIMIT ${VISITOR_LIMIT}
  `

  const visitorIds = rows.map((r) => r.visitorId)
  if (visitorIds.length === 0) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  const events = await prisma.event.findMany({
    where: {
      userId,
      visitorId: { in: visitorIds },
    },
    orderBy: { createdAt: "desc" },
    take: 5000,
    select: {
      visitorId: true,
      type: true,
      data: true,
      url: true,
      domain: true,
      createdAt: true,
    },
  })

  const eventsByVisitor = new Map<string, EventRow[]>()
  for (const event of events) {
    const vid = event.visitorId
    if (!vid) continue
    if (!eventsByVisitor.has(vid)) {
      eventsByVisitor.set(vid, [])
    }
    const list = eventsByVisitor.get(vid)!
    if (list.length < EVENTS_PER_VISITOR) {
      list.push(event)
    }
  }

  const feed = rows.map((row) => {
    const visitorId = row.visitorId
    const visitorEvents = eventsByVisitor.get(visitorId) ?? []
    const eventsForScoringSlice = visitorEvents.slice(0, EVENTS_PER_VISITOR)
    const lastEvent = visitorEvents[0] ?? null
    const domain = lastEvent?.domain ?? null

    const eventsForScoring: EventForScoring[] = eventsForScoringSlice.map((e) => ({
      type: e.type,
      data: e.data,
      url: e.url,
    }))
    const { score, signals } = computeVisitorScore(eventsForScoring)

    const intent = score < 20 ? "low" : score < 50 ? "medium" : "high"
    const scoreBucket = score < 20 ? "cold" : score < 50 ? "warm" : "hot"

    return {
      visitorId,
      shortId: visitorId.slice(-6),
      domain,
      score,
      intent,
      scoreBucket,
      lastEvent: lastEvent
        ? { type: lastEvent.type, createdAt: lastEvent.createdAt.toISOString() }
        : null,
      lastAction: lastActionFromSignals(signals),
      lastSeen: row.lastSeen?.toISOString() ?? null,
    }
  })

  return new Response(JSON.stringify(feed), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
