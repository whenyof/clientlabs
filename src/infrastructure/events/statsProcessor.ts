/**
 * Daily stats processor — upsert DailyStats by userId + domain + day.
 * Pageviews increment on pageview; visitors/sessions increment only when first seen that day.
 */

import { startOfDay } from "date-fns"
import { prisma } from "@infra/database/prisma"
import type { QueuedEvent } from "@infra/events/types"

export async function updateDailyStats(event: QueuedEvent): Promise<void> {
  const ts = new Date(event.timestamp)
  const day = startOfDay(ts)
  const isPageview = event.type === "pageview"

  await prisma.$transaction(async (tx) => {
    await tx.dailyStats.upsert({
      where: {
        userId_domain_day: {
          userId: event.userId,
          domain: event.domain,
          day,
        },
      },
      create: {
        userId: event.userId,
        domain: event.domain,
        day,
        pageviews: 0,
        visitors: 0,
        sessions: 0,
        leads: 0,
      },
      update: {},
    })

    if (isPageview) {
      await tx.dailyStats.update({
        where: {
          userId_domain_day: {
            userId: event.userId,
            domain: event.domain,
            day,
          },
        },
        data: { pageviews: { increment: 1 } },
      })
    }

    // Idempotent per (user, domain, day, visitorId)
    const visitorKey = {
      userId: event.userId,
      domain: event.domain,
      day,
      visitorId: event.visitor_id,
    }
    const existingVisitor = await tx.dailyStatsVisitor.findUnique({
      where: { userId_domain_day_visitorId: visitorKey },
    })
    if (!existingVisitor) {
      await tx.dailyStatsVisitor.upsert({
        where: { userId_domain_day_visitorId: visitorKey },
        update: {},
        create: visitorKey,
      })
      await tx.dailyStats.update({
        where: {
          userId_domain_day: {
            userId: event.userId,
            domain: event.domain,
            day,
          },
        },
        data: { visitors: { increment: 1 } },
      })
    }

    // Idempotent per (user, domain, day, sessionId)
    const sessionKey = {
      userId: event.userId,
      domain: event.domain,
      day,
      sessionId: event.session_id,
    }
    const existingSession = await tx.dailyStatsSession.findUnique({
      where: { userId_domain_day_sessionId: sessionKey },
    })
    if (!existingSession) {
      await tx.dailyStatsSession.upsert({
        where: { userId_domain_day_sessionId: sessionKey },
        update: {},
        create: sessionKey,
      })
      await tx.dailyStats.update({
        where: {
          userId_domain_day: {
            userId: event.userId,
            domain: event.domain,
            day,
          },
        },
        data: { sessions: { increment: 1 } },
      })
    }
  })
}

