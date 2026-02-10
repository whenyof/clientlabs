/**
 * Tipo de ítem en el calendario unificado (tareas + recordatorios).
 */
export type CalendarItemKind = "TASK" | "REMINDER"

/**
 * Ítem unificado para el calendario: comparten id, start, end, status, title.
 * kind discrimina el origen; los campos opcionales dependen del tipo.
 */
export type CalendarItem = {
  kind: CalendarItemKind
  id: string
  title: string
  start: string
  end: string
  status: string
  /** Solo TASK */
  priority?: string
  /** Score calculado por prioridad automática; solo TASK */
  priorityScore?: number | null
  /** Engine classification: CRITICAL | IMPORTANT | NORMAL */
  autoPriority?: "CRITICAL" | "IMPORTANT" | "NORMAL" | null
  /** Risk flags: overlap, overload, impossible timing */
  risk?: { overlap: boolean; overload: boolean; impossibleTiming: boolean } | null
  assignedTo?: string | null
  clientName?: string | null
  leadName?: string | null
  estimatedMinutes?: number | null
  dueDate?: string | null
  startAt?: string | null
}
