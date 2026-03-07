/**
 * Session processor — find or create IngestSession by userId + sessionId.
 * Updates lastSeen, eventsCount, durationSeconds; pageviews += 1 when event type is pageview.
 * When a new session is created, increments visitor.sessionsCount.
 */

import { prisma } from "@/lib/prisma"
import type { QueuedEvent } from "./types"

export async function updateSession(event: QueuedEvent): Promise<void> {
  const ts = new Date(event.timestamp)
  const isPageview = event.type === "pageview"

  const existing = await prisma.ingestSession.findUnique({
    where: {
      userId_sessionId: {
        userId: event.userId,
        sessionId: event.session_id,
      },
    },
  })

  if (existing) {
    const durationSeconds = Math.max(
      0,
      Math.floor((ts.getTime() - existing.startedAt.getTime()) / 1000)
    )
    await prisma.ingestSession.update({
      where: { id: existing.id },
      data: {
        lastSeen: ts,
        updatedAt: ts,
        eventsCount: { increment: 1 },
        durationSeconds,
        ...(isPageview ? { pageviews: { increment: 1 } } : {}),
      },
    })
    return
  }

  await prisma.ingestSession.create({
    data: {
      userId: event.userId,
      sessionId: event.session_id,
      startedAt: ts,
      lastSeen: ts,
      pageviews: isPageview ? 1 : 0,
      eventsCount: 1,
    },
  })

  await prisma.analyticsVisitor.upsert({
    where: {
      userId_visitorId: {
        userId: event.userId,
        visitorId: event.visitor_id,
      },
    },
    create: {
      userId: event.userId,
      visitorId: event.visitor_id,
      firstSeen: ts,
      lastSeen: ts,
      sessionsCount: 1,
    },
    update: { sessionsCount: { increment: 1 } },
  })
}
