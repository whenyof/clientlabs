import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
} from "date-fns"
import { prisma } from "@/lib/prisma"
import type { CalendarAvailabilityBlock, AvailabilityBlockType } from "../types/availability"

const DEFAULT_WORK_START_H = 9
const DEFAULT_WORK_END_H = 18

type OccupiedSlice = {
  start: number
  end: number
  type: AvailabilityBlockType
  taskId?: string
  reason?: string | null
}

function toTs(d: Date): number {
  return d.getTime()
}

function fromTs(ts: number): Date {
  return new Date(ts)
}

/** Get work window [start, end] for the given date using UserWorkingHours or defaults. */
async function getWorkWindow(userId: string, date: Date): Promise<{ start: Date; end: Date }> {
  const weekday = date.getDay()
  const row = await prisma.userWorkingHours.findFirst({
    where: { userId, weekday },
  })
  const dayStart = startOfDay(date)
  if (row) {
    const s = new Date(row.start)
    const e = new Date(row.end)
    const start = setMilliseconds(
      setSeconds(setMinutes(setHours(dayStart, s.getHours()), s.getMinutes()), s.getSeconds()),
      0
    )
    const end = setMilliseconds(
      setSeconds(setMinutes(setHours(dayStart, e.getHours()), e.getMinutes()), e.getSeconds()),
      0
    )
    return { start, end }
  }
  const start = setMinutes(setHours(dayStart, DEFAULT_WORK_START_H), 0)
  const end = setMinutes(setHours(dayStart, DEFAULT_WORK_END_H), 0)
  return { start, end }
}

/** Fetch time-off intervals overlapping [dayStart, dayEnd]. */
async function getTimeOffInRange(
  userId: string,
  dayStart: Date,
  dayEnd: Date
): Promise<OccupiedSlice[]> {
  const rows = await prisma.userTimeOff.findMany({
    where: {
      userId,
      start: { lt: dayEnd },
      end: { gt: dayStart },
    },
  })
  return rows.map((r) => ({
    start: Math.max(toTs(dayStart), toTs(r.start)),
    end: Math.min(toTs(dayEnd), toTs(r.end)),
    type: "TIME_OFF" as const,
    reason: r.reason,
  }))
}

/** Fetch calendar blocks overlapping [dayStart, dayEnd]. */
async function getBlocksInRange(
  userId: string,
  dayStart: Date,
  dayEnd: Date
): Promise<OccupiedSlice[]> {
  const rows = await prisma.calendarBlock.findMany({
    where: {
      userId,
      start: { lt: dayEnd },
      end: { gt: dayStart },
    },
  })
  return rows.map((r) => ({
    start: Math.max(toTs(dayStart), toTs(r.start)),
    end: Math.min(toTs(dayEnd), toTs(r.end)),
    type: "BLOCK" as const,
    reason: r.reason,
  }))
}

/** Fetch tasks overlapping the day (owner = userId), return occupied slices. */
async function getTasksInRange(
  userId: string,
  dayStart: Date,
  dayEnd: Date
): Promise<OccupiedSlice[]> {
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      status: { notIn: ["DONE", "CANCELLED"] },
      OR: [
        { dueDate: { gte: dayStart, lte: dayEnd } },
        {
          startAt: { not: null, lte: dayEnd },
          OR: [{ endAt: { gte: dayStart } }, { endAt: null }],
        },
      ],
    },
    select: { id: true, startAt: true, endAt: true, dueDate: true, estimatedMinutes: true },
  })
  const slices: OccupiedSlice[] = []
  const defaultDurationMs = 30 * 60 * 1000
  for (const t of tasks) {
    const start = t.startAt ?? t.dueDate ?? dayStart
    const startDate = new Date(start)
    const end = t.endAt
      ? new Date(t.endAt)
      : new Date(startDate.getTime() + (t.estimatedMinutes ?? 30) * 60 * 1000)
    const s = Math.max(toTs(dayStart), toTs(startDate))
    const e = Math.min(toTs(dayEnd), toTs(end))
    if (s < e) {
      slices.push({ start: s, end: e, type: "TASK", taskId: t.id })
    }
  }
  return slices
}

/** Merge overlapping occupied intervals and sort by start. */
function mergeOccupied(intervals: OccupiedSlice[]): OccupiedSlice[] {
  if (intervals.length === 0) return []
  const sorted = [...intervals].sort((a, b) => a.start - b.start)
  const merged: OccupiedSlice[] = [sorted[0]]
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i]
    const last = merged[merged.length - 1]
    if (cur.start <= last.end) {
      last.end = Math.max(last.end, cur.end)
      if (cur.taskId) last.taskId = cur.taskId
      if (cur.reason != null) last.reason = cur.reason
    } else {
      merged.push(cur)
    }
  }
  return merged
}

/** Build timeline: work window minus occupied = FREE gaps. Output ordered blocks. */
function buildTimeline(
  workStart: number,
  workEnd: number,
  occupied: OccupiedSlice[]
): CalendarAvailabilityBlock[] {
  const merged = mergeOccupied(occupied)
  const result: CalendarAvailabilityBlock[] = []
  let pos = workStart
  for (const m of merged) {
    if (m.start > pos) {
      result.push({
        start: fromTs(pos),
        end: fromTs(m.start),
        type: "FREE",
      })
    }
    result.push({
      start: fromTs(m.start),
      end: fromTs(m.end),
      type: m.type,
      taskId: m.taskId,
      reason: m.reason,
    })
    pos = Math.max(pos, m.end)
  }
  if (pos < workEnd) {
    result.push({
      start: fromTs(pos),
      end: fromTs(workEnd),
      type: "FREE",
    })
  }
  return result
}

/**
 * Obtiene la disponibilidad de un usuario para un día: bloques ocupados (tareas, bloqueos, ausencias)
 * y bloques libres dentro del horario laboral.
 * Base para huecos, riesgo y autoplanificador.
 */
export async function getUserAvailability(params: {
  userId: string
  date: Date
}): Promise<CalendarAvailabilityBlock[]> {
  const { userId, date } = params
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)

  const { start: workStart, end: workEnd } = await getWorkWindow(userId, date)
  const workStartTs = toTs(workStart)
  const workEndTs = toTs(workEnd)

  const [timeOff, blocks, tasks] = await Promise.all([
    getTimeOffInRange(userId, dayStart, dayEnd),
    getBlocksInRange(userId, dayStart, dayEnd),
    getTasksInRange(userId, dayStart, dayEnd),
  ])

  const allOccupied: OccupiedSlice[] = []
  for (const o of timeOff) {
    if (o.start < workEndTs && o.end > workStartTs) {
      allOccupied.push({
        start: Math.max(o.start, workStartTs),
        end: Math.min(o.end, workEndTs),
        type: "TIME_OFF",
        reason: o.reason,
      })
    }
  }
  for (const o of blocks) {
    if (o.start < workEndTs && o.end > workStartTs) {
      allOccupied.push({
        start: Math.max(o.start, workStartTs),
        end: Math.min(o.end, workEndTs),
        type: "BLOCK",
        reason: o.reason,
      })
    }
  }
  for (const o of tasks) {
    if (o.start < workEndTs && o.end > workStartTs) {
      allOccupied.push({
        start: Math.max(o.start, workStartTs),
        end: Math.min(o.end, workEndTs),
        type: "TASK",
        taskId: o.taskId,
      })
    }
  }

  return buildTimeline(workStartTs, workEndTs, allOccupied)
}
