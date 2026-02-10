import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { mapTaskToCalendarEvent, type CalendarEvent, type TaskForCalendar } from "../utils/mapTaskToCalendarEvent"
import { computeAutoPriority } from "./priority-engine"
import { detectRisks } from "./risk-detection.service"

/**
 * Where clause: tasks visible in [from, to].
 * - dueDate in range, or
 * - startAt/endAt overlap [from, to].
 */
function buildCalendarRangeWhere(
  userId: string,
  from: Date,
  to: Date
): Prisma.TaskWhereInput {
  const toEnd = new Date(to)
  toEnd.setHours(23, 59, 59, 999)
  return {
    userId,
    OR: [
      { dueDate: { gte: from, lte: toEnd } },
      {
        startAt: { not: null, lte: toEnd },
        OR: [{ endAt: { gte: from } }, { endAt: null }],
      },
    ],
  }
}

/**
 * Single source for calendar tasks: UI, API, IA and optimizers should use this.
 * Returns normalized calendar events (start/end as Date) for the given user and range.
 */
export async function getCalendarTasks(
  userId: string,
  from: Date,
  to: Date
): Promise<CalendarEvent[]> {
  const where = buildCalendarRangeWhere(userId, from, to)
  const rows = await prisma.task.findMany({
    where,
    orderBy: [
      { dueDate: { sort: "asc", nulls: "last" } },
      { startAt: { sort: "asc", nulls: "last" } },
      { routeOrder: { sort: "asc", nulls: "last" } },
    ],
    include: {
      Client: { select: { id: true, name: true, totalSpent: true, finalScore: true } },
      Lead: { select: { id: true, name: true } },
    },
  })
  const tasks = rows as (TaskForCalendar & { Client?: { id: string; name: string | null; totalSpent: number; finalScore: number } | null })[]
  const events: CalendarEvent[] = tasks.map((t) => {
    const ev = mapTaskToCalendarEvent(t)
    const clientIsVip = Boolean(
      t.Client && (Number(t.Client.totalSpent) > 1000 || Number(t.Client.finalScore) >= 50)
    )
    const { priority: autoPriority } = computeAutoPriority({
      dueDate: t.dueDate,
      status: t.status,
      type: t.type,
      slaMinutes: t.slaMinutes,
      sourceModule: t.sourceModule,
      clientIsVip,
    })
    const dueDate = t.dueDate ? new Date(t.dueDate) : null
    return { ...ev, autoPriority, dueDate }
  })

  const riskMap = detectRisks(
    events.map((e) => ({ id: e.id, start: e.start, end: e.end, dueDate: e.dueDate ?? undefined }))
  )
  return events.map((e) => ({
    ...e,
    risk: riskMap.get(e.id) ?? undefined,
  }))
}
