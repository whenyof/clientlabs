import { prisma } from "@/lib/prisma"
import { getCalendarTasks } from "@/modules/tasks/services/getCalendarTasks"

const WORK_START_HOUR = 9
const WORK_END_HOUR = 18
const DEFAULT_AVG_JOB_MINUTES = 60
const DEFAULT_REVENUE_PER_JOB = 80

export type MoneyOpportunityResult = {
  freeMinutes: number
  jobsThatFit: number
  potentialRevenue: number
  /** Number of days analyzed in the range. */
  daysAnalyzed: number
}

function startOfDay(d: Date): Date {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  return out
}

function endOfDay(d: Date): Date {
  const out = new Date(d)
  out.setHours(23, 59, 59, 999)
  return out
}

function workStart(d: Date): Date {
  const out = new Date(d)
  out.setHours(WORK_START_HOUR, 0, 0, 0)
  return out
}

function workEnd(d: Date): Date {
  const out = new Date(d)
  out.setHours(WORK_END_HOUR, 0, 0, 0)
  return out
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function clampToWorkDay(
  start: Date,
  end: Date,
  wStart: Date,
  wEnd: Date
): { start: Date; end: Date } | null {
  const s = Math.max(start.getTime(), wStart.getTime())
  const e = Math.min(end.getTime(), wEnd.getTime())
  if (s >= e) return null
  return { start: new Date(s), end: new Date(e) }
}

function mergeIntervals(intervals: { start: Date; end: Date }[]): { start: Date; end: Date }[] {
  if (intervals.length === 0) return []
  const sorted = [...intervals].sort((a, b) => a.start.getTime() - b.start.getTime())
  const out: { start: Date; end: Date }[] = [sorted[0]]
  for (let i = 1; i < sorted.length; i++) {
    const prev = out[out.length - 1]
    const curr = sorted[i]
    if (curr.start.getTime() <= prev.end.getTime()) {
      prev.end = new Date(Math.max(prev.end.getTime(), curr.end.getTime()))
    } else {
      out.push(curr)
    }
  }
  return out
}

/** Free minutes in a single day within working hours, given busy intervals (merged). */
function freeMinutesInDay(wStart: Date, wEnd: Date, merged: { start: Date; end: Date }[]): number {
  let free = (wEnd.getTime() - wStart.getTime()) / (60 * 1000)
  for (const b of merged) {
    const overlapStart = Math.max(b.start.getTime(), wStart.getTime())
    const overlapEnd = Math.min(b.end.getTime(), wEnd.getTime())
    if (overlapEnd > overlapStart) {
      free -= (overlapEnd - overlapStart) / (60 * 1000)
    }
  }
  return Math.max(0, Math.round(free * 100) / 100)
}

/**
 * Detects free time slots in the calendar within working hours (9–18),
 * then estimates how many jobs fit and potential revenue. Read-only.
 */
export async function getMoneyOpportunity(
  userId: string,
  from: Date,
  to: Date,
  options?: {
    avgJobMinutes?: number
    revenuePerJob?: number
  }
): Promise<MoneyOpportunityResult> {
  const toEnd = new Date(to)
  toEnd.setHours(23, 59, 59, 999)

  const [taskEvents, reminders] = await Promise.all([
    getCalendarTasks(userId, from, toEnd),
    prisma.reminder.findMany({
      where: {
        userId,
        start: { lte: toEnd },
        end: { gte: from },
      },
      select: { start: true, end: true },
    }),
  ])

  const busyByDay = new Map<string, { start: Date; end: Date }[]>()
  const addBusy = (start: Date, end: Date) => {
    const key = dayKey(start)
    const list = busyByDay.get(key) ?? []
    list.push({ start: new Date(start), end: new Date(end) })
    busyByDay.set(key, list)
  }

  for (const ev of taskEvents) {
    const start = ev.start instanceof Date ? ev.start : new Date(ev.start)
    const end = ev.end instanceof Date ? ev.end : new Date(ev.end)
    addBusy(start, end)
  }
  for (const r of reminders) {
    addBusy(r.start, r.end)
  }

  let totalFreeMinutes = 0
  const rangeStart = startOfDay(from)
  const rangeEnd = endOfDay(to)
  let daysAnalyzed = 0
  for (let d = new Date(rangeStart); d.getTime() <= rangeEnd.getTime(); d.setDate(d.getDate() + 1)) {
    const day = new Date(d)
    const wStart = workStart(day)
    const wEnd = workEnd(day)
    const intervals = busyByDay.get(dayKey(day)) ?? []
    const merged = mergeIntervals(intervals)
    totalFreeMinutes += freeMinutesInDay(wStart, wEnd, merged)
    daysAnalyzed++
  }

  const avgJobMinutes = options?.avgJobMinutes ?? (await getAverageJobMinutes(userId))
  const revenuePerJob = options?.revenuePerJob ?? DEFAULT_REVENUE_PER_JOB
  const jobsThatFit = avgJobMinutes > 0 ? Math.floor(totalFreeMinutes / avgJobMinutes) : 0
  const potentialRevenue = Math.round(jobsThatFit * revenuePerJob)

  return {
    freeMinutes: Math.round(totalFreeMinutes),
    jobsThatFit,
    potentialRevenue,
    daysAnalyzed,
  }
}

async function getAverageJobMinutes(userId: string): Promise<number> {
  const agg = await prisma.task.aggregate({
    where: { userId, estimatedMinutes: { not: null } },
    _avg: { estimatedMinutes: true },
    _count: { id: true },
  })
  if (agg._count.id === 0 || agg._avg.estimatedMinutes == null) return DEFAULT_AVG_JOB_MINUTES
  return Math.round(agg._avg.estimatedMinutes)
}
