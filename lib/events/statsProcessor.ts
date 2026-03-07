/**
 * Daily stats processor — upsert DailyStats by userId + domain + day.
 * Pageviews increment on pageview; visitors/sessions increment only when first seen that day.
 */

import { startOfDay } from "date-fns"
import { prisma } from "@/lib/prisma"
import type { QueuedEvent } from "./types"

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

    const visitorInsert = await tx.dailyStatsVisitor
      .create({
        data: {
          userId: event.userId,
          domain: event.domain,
          day,
          visitorId: event.visitor_id,
        },
      })
      .catch(() => null)

    if (visitorInsert) {
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

    const sessionInsert = await tx.dailyStatsSession
      .create({
        data: {
          userId: event.userId,
          domain: event.domain,
          day,
          sessionId: event.session_id,
        },
      })
      .catch(() => null)

    if (sessionInsert) {
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
