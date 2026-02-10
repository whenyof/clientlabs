/** Task shape for Mission Control (serializable from server). */
export type MissionControlTask = {
  id: string
  title: string
  dueDate: string | null
  startAt: string | null
  estimatedMinutes: number | null
  status: string
  priority: string
  /** Calculated priority score for badge (Crítica / Alta / Media / Baja). */
  priorityScore?: number | null
  /** Engine classification for border/badge: CRITICAL | IMPORTANT | NORMAL */
  autoPriority?: "CRITICAL" | "IMPORTANT" | "NORMAL" | null
  /** Risk flags: overlap, overload, impossible timing */
  risk?: { overlap: boolean; overload: boolean; impossibleTiming: boolean } | null
  assignedTo: string | null
  clientName?: string | null
  leadName?: string | null
}

/** Tipo de ítem en el calendario unificado. */
export type CalendarItemKind = "TASK" | "REMINDER"

/** Ítem del calendario: tarea o recordatorio (mismo render, diferenciación visual). */
export type MissionControlCalendarItem = MissionControlTask & {
  kind: CalendarItemKind
}
