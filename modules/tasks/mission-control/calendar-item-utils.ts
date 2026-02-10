import type { CalendarItem } from "@/modules/calendar/types/calendar-item"
import type { MissionControlCalendarItem } from "./types"

/**
 * Build a CalendarItem (store shape) from a display item.
 * Use overrides when doing optimistic updates (new start/end).
 */
export function displayItemToCalendarItem(
  item: MissionControlCalendarItem,
  overrides?: { start?: string; end?: string }
): CalendarItem {
  const start =
    overrides?.start ??
    (item.startAt ?? item.dueDate ?? new Date().toISOString())
  const minutes = item.estimatedMinutes ?? 30
  const end =
    overrides?.end ??
    (item.startAt
      ? new Date(new Date(item.startAt).getTime() + minutes * 60 * 1000).toISOString()
      : new Date(new Date(start).getTime() + minutes * 60 * 1000).toISOString())
  return {
    kind: item.kind,
    id: item.id,
    title: item.title,
    start,
    end,
    status: item.status,
    priority: item.priority,
    priorityScore: item.priorityScore ?? null,
    autoPriority: item.autoPriority ?? null,
    risk: item.risk ?? null,
    assignedTo: item.assignedTo ?? null,
    clientName: item.clientName ?? null,
    leadName: item.leadName ?? null,
    estimatedMinutes: item.estimatedMinutes ?? null,
    dueDate: item.dueDate ?? null,
    startAt: item.startAt ?? null,
  }
}
