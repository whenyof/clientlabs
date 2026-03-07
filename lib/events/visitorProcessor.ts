/**
 * Visitor processor — find or create AnalyticsVisitor by userId + visitorId.
 * Updates lastSeen only. sessionsCount is incremented in sessionProcessor when a new session is created.
 */

import { prisma } from "@/lib/prisma"
import type { QueuedEvent } from "./types"

export async function updateVisitor(event: QueuedEvent): Promise<void> {
  const ts = new Date(event.timestamp)

  const existing = await prisma.analyticsVisitor.findUnique({
    where: {
      userId_visitorId: {
        userId: event.userId,
        visitorId: event.visitor_id,
      },
    },
  })

  if (existing) {
    await prisma.analyticsVisitor.update({
      where: { id: existing.id },
      data: { lastSeen: ts, updatedAt: ts },
    })
    return
  }

  await prisma.analyticsVisitor.create({
    data: {
      userId: event.userId,
      visitorId: event.visitor_id,
      firstSeen: ts,
      lastSeen: ts,
    },
  })
}
