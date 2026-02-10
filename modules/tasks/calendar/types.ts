/**
 * Calendar-specific task type. Not Prisma — optimized for grid and overlap detection.
 */
export type CalendarTaskStatus = "PENDING" | "DONE" | "CANCELLED"
export type CalendarTaskPriority = "LOW" | "MEDIUM" | "HIGH"

export type CalendarTask = {
  id: string
  title: string
  dueDate: string | null
  /** ISO date (YYYY-MM-DD) for the day this block is placed */
  dayKey: string
  /** Minutes from midnight (0–24*60) for block position */
  startMinutes: number
  /** Duration in minutes for block height */
  durationMinutes: number
  /** End minutes (startMinutes + durationMinutes) for overlap detection */
  endMinutes: number
  status: CalendarTaskStatus
  priority: CalendarTaskPriority
  assignedTo: string | null
  clientName: string | null
  leadName: string | null
  /** Overlap index when multiple tasks overlap (0 = first column) */
  overlapIndex?: number
  overlapTotal?: number
}

/** Raw task from API (GET /api/tasks). */
export type ApiTaskRaw = {
  id: string
  title: string
  description?: string | null
  dueDate?: string | null
  status?: string
  priority?: string
  type?: string
  assignedTo?: string | null
  clientId?: string | null
  leadId?: string | null
  estimatedMinutes?: number | null
  startedAt?: string | null
  completedAt?: string | null
  Client?: { id: string; name: string } | null
  Lead?: { id: string; name: string } | null
}

const DEFAULT_DURATION_MIN = 30
const MINUTES_PER_DAY = 24 * 60

function toDayKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function toMinutesFromMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes()
}

/**
 * Map API task to calendar task. Uses dueDate as start; duration from estimatedMinutes or default.
 */
export function mapApiTaskToCalendarTask(raw: ApiTaskRaw, dayKey: string): CalendarTask {
  const due = raw.dueDate ? new Date(raw.dueDate) : new Date()
  const startMinutes = toMinutesFromMidnight(due)
  const durationMinutes =
    raw.estimatedMinutes != null && raw.estimatedMinutes > 0
      ? Math.min(raw.estimatedMinutes, MINUTES_PER_DAY - startMinutes)
      : DEFAULT_DURATION_MIN
  const endMinutes = Math.min(startMinutes + durationMinutes, MINUTES_PER_DAY)

  return {
    id: raw.id,
    title: raw.title,
    dueDate: raw.dueDate ?? null,
    dayKey,
    startMinutes,
    durationMinutes,
    endMinutes,
    status: (raw.status as CalendarTaskStatus) ?? "PENDING",
    priority: (raw.priority as CalendarTaskPriority) ?? "MEDIUM",
    assignedTo: raw.assignedTo ?? null,
    clientName: raw.Client?.name ?? null,
    leadName: raw.Lead?.name ?? null,
  }
}

/**
 * Build calendar tasks for a range of days. One task can appear only on its due day.
 */
export function buildCalendarTasks(
  apiTasks: ApiTaskRaw[],
  dayKeys: string[]
): CalendarTask[] {
  const daySet = new Set(dayKeys)
  const result: CalendarTask[] = []

  for (const raw of apiTasks) {
    const due = raw.dueDate ? new Date(raw.dueDate) : null
    const key = due ? toDayKey(due) : toDayKey(new Date())
    if (!daySet.has(key)) continue
    result.push(mapApiTaskToCalendarTask(raw, key))
  }

  return result
}

/**
 * Compute overlap columns for tasks on the same day (by assignedTo or single column).
 */
export function assignOverlapColumns(tasks: CalendarTask[]): CalendarTask[] {
  const byDay = new Map<string, CalendarTask[]>()
  for (const t of tasks) {
    if (!byDay.has(t.dayKey)) byDay.set(t.dayKey, [])
    byDay.get(t.dayKey)!.push(t)
  }

  const out: CalendarTask[] = []
  for (const [, dayTasks] of byDay) {
    dayTasks.sort((a, b) => a.startMinutes - b.startMinutes)
    const columns: { end: number }[] = []

    for (const t of dayTasks) {
      let col = -1
      for (let i = 0; i < columns.length; i++) {
        if (columns[i].end <= t.startMinutes) {
          col = i
          break
        }
      }
      if (col < 0) {
        col = columns.length
        columns.push({ end: 0 })
      }
      columns[col].end = t.endMinutes

      out.push({
        ...t,
        overlapIndex: col,
        overlapTotal: columns.length,
      })
    }
  }

  return out
}
