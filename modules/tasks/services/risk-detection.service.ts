/**
 * Risk detection per task: overlaps, overload, impossible timing.
 * Pure function over event-like items; no DB.
 */

export type EventForRisk = {
  id: string
  start: Date
  end: Date
  dueDate?: Date | null
}

export type TaskRiskFlags = {
  overlap: boolean
  overload: boolean
  impossibleTiming: boolean
}

const DEFAULT_DAY_CAP_MINUTES = 8 * 60 // 8h

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function overlaps(a: EventForRisk, b: EventForRisk): boolean {
  if (a.id === b.id) return false
  return a.start.getTime() < b.end.getTime() && a.end.getTime() > b.start.getTime()
}

/** Returns risk flags per event id. */
export function detectRisks(
  events: EventForRisk[],
  dayCapMinutes: number = DEFAULT_DAY_CAP_MINUTES
): Map<string, TaskRiskFlags> {
  const result = new Map<string, TaskRiskFlags>()

  for (const ev of events) {
    const overlap = events.some((other) => overlaps(ev, other))
    const impossibleTiming =
      ev.end.getTime() <= ev.start.getTime() ||
      (ev.dueDate != null && ev.start.getTime() > ev.dueDate.getTime())
    result.set(ev.id, { overlap, overload: false, impossibleTiming })
  }

  const minutesByDay = new Map<string, number>()
  for (const ev of events) {
    const start = ev.start.getTime()
    const end = ev.end.getTime()
    const durationMs = Math.max(0, end - start)
    const key = dayKey(ev.start)
    minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + durationMs / (60 * 1000))
  }

  const overloadedDays = new Set<string>()
  for (const [day, total] of minutesByDay) {
    if (total > dayCapMinutes) overloadedDays.add(day)
  }

  for (const ev of events) {
    const key = dayKey(ev.start)
    const flags = result.get(ev.id)!
    flags.overload = overloadedDays.has(key)
    result.set(ev.id, flags)
  }

  return result
}
