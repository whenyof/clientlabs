import type { Task } from "@prisma/client"

/** Task as returned by Prisma findMany with include Client/Lead (optional). */
export type TaskForCalendar = Task & {
  Client?: { id: string; name: string } | null
  Lead?: { id: string; name: string } | null
}

/** Auto-classification from priority engine (CRITICAL | IMPORTANT | NORMAL). */
export type AutoPriority = "CRITICAL" | "IMPORTANT" | "NORMAL"

/** Risk flags from risk-detection.service (overlap, overload, impossible timing). */
export type TaskRiskFlags = {
  overlap: boolean
  overload: boolean
  impossibleTiming: boolean
}

/** Calendar event shape: normalized for calendar views, IA and optimizers. */
export type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  status: string
  priority: string
  priorityScore?: number | null
  /** Engine-classified priority for border/badge. */
  autoPriority?: AutoPriority | null
  /** Optional for risk detection (due before start). */
  dueDate?: Date | null
  /** Risk flags: overlap, overload, impossible timing. */
  risk?: TaskRiskFlags | null
  assignedTo?: string
  clientName?: string | null
  leadName?: string | null
}

const DEFAULT_DURATION_MINUTES = 30

/**
 * Normalizes a Prisma Task (with optional Client/Lead) to a calendar event.
 * - start: startAt ?? dueDate ?? fallback (start of current day)
 * - end: endAt ?? (start + estimatedMinutes) ?? (start + DEFAULT_DURATION_MINUTES)
 * - Ensures start/end are valid dates and start <= end.
 */
export function mapTaskToCalendarEvent(task: TaskForCalendar): CalendarEvent {
  const fallbackStart = new Date()
  fallbackStart.setMinutes(0, 0, 0)

  const rawStart = task.startAt ?? task.dueDate ?? fallbackStart
  const start = new Date(rawStart)
  if (Number.isNaN(start.getTime())) {
    start.setTime(fallbackStart.getTime())
  }

  let end: Date
  if (task.endAt) {
    end = new Date(task.endAt)
  } else {
    const minutes = task.estimatedMinutes ?? DEFAULT_DURATION_MINUTES
    end = new Date(start.getTime() + minutes * 60 * 1000)
  }
  if (Number.isNaN(end.getTime())) {
    end = new Date(start.getTime() + DEFAULT_DURATION_MINUTES * 60 * 1000)
  }

  if (end.getTime() <= start.getTime()) {
    end = new Date(start.getTime() + DEFAULT_DURATION_MINUTES * 60 * 1000)
  }

  return {
    id: task.id,
    title: task.title,
    start,
    end,
    status: task.status,
    priority: task.priority,
    ...(task.priorityScore != null ? { priorityScore: task.priorityScore } : {}),
    ...(task.assignedTo != null && task.assignedTo !== ""
      ? { assignedTo: task.assignedTo }
      : {}),
    ...(task.Client != null ? { clientName: task.Client.name } : {}),
    ...(task.Lead != null ? { leadName: task.Lead.name } : {}),
  }
}
