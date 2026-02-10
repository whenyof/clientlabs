/**
 * API response shape from GET /api/tasks/calendar (start/end are ISO strings).
 */
export type CalendarEventAPI = {
  id: string
  title: string
  start: string
  end: string
  status: string
  priority: string
  assignedTo?: string
  clientName?: string | null
  leadName?: string | null
}

/**
 * Calendar event with Date objects for layout (parsed from API).
 */
export type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  status: string
  priority: string
  assignedTo?: string
  clientName?: string | null
  leadName?: string | null
}

export function parseCalendarEvents(rows: CalendarEventAPI[]): CalendarEvent[] {
  return rows.map((row) => ({
    ...row,
    start: new Date(row.start),
    end: new Date(row.end),
  }))
}
