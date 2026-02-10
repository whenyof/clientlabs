"use client"

import { useMemo } from "react"
import { format, startOfWeek, addDays, isToday } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { CalendarColumn, CALENDAR_ROW_HEIGHT, CALENDAR_TOTAL_ROWS } from "./CalendarColumn"
import type { CalendarEvent } from "./calendar-event-types"
import type { Violation } from "./rules/conflict-rules"

function toDayKey(d: Date): string {
  return format(d, "yyyy-MM-dd")
}

function eventBelongsToDay(event: CalendarEvent, dayKey: string): boolean {
  return toDayKey(event.start) === dayKey
}

function eventBelongsToAssignee(event: CalendarEvent, assigneeId: string): boolean {
  const assigned = event.assignedTo ?? "unassigned"
  return assigned === assigneeId
}

export type CalendarGridProps = {
  viewMode: "day" | "week"
  currentDate: Date
  events: CalendarEvent[]
  violationsByTaskId: Map<string, Violation[]>
  onEventClick: (event: CalendarEvent) => void
  onEventMove: (event: CalendarEvent, dropClientX: number, dropClientY: number) => void
  onEventResize: (event: CalendarEvent, newStart: Date, newEnd: Date) => void
  onCreateSlot: (params: { start: Date; end: Date; assignedTo: string | null }) => void
  savingEventIds?: Set<string>
  className?: string
}

export function CalendarGrid({
  viewMode,
  currentDate,
  events,
  violationsByTaskId,
  onEventClick,
  onEventMove,
  onEventResize,
  onCreateSlot,
  savingEventIds = new Set(),
  className,
}: CalendarGridProps) {
  const weekStart = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 1 }),
    [currentDate]
  )
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  const dayKeyForView = viewMode === "day" ? toDayKey(currentDate) : null
  const assignees = useMemo(() => {
    const set = new Set<string>()
    const toConsider = dayKeyForView ? events.filter((e) => eventBelongsToDay(e, dayKeyForView)) : events
    toConsider.forEach((e) => set.add(e.assignedTo ?? "unassigned"))
    return Array.from(set).map((id) => ({
      id,
      label: id === "unassigned" ? "Sin asignar" : id,
    }))
  }, [events, dayKeyForView])

  const columnDateDayView = currentDate

  return (
    <div className={cn("flex rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden", className)}>
      <div
        className="shrink-0 flex flex-col border-r border-border/60 bg-muted/20"
        style={{ width: 56 }}
      >
        <div
          className="sticky top-0 z-20 border-b border-border/60 bg-background/95 px-2 py-2.5 text-xs font-medium text-muted-foreground"
          style={{ height: CALENDAR_ROW_HEIGHT }}
        >
          Hora
        </div>
        <div className="relative" style={{ height: CALENDAR_TOTAL_ROWS * CALENDAR_ROW_HEIGHT }}>
          {Array.from({ length: 24 }, (_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 px-2 text-xs text-muted-foreground"
              style={{
                top: i * CALENDAR_ROW_HEIGHT,
                height: CALENDAR_ROW_HEIGHT,
                lineHeight: `${CALENDAR_ROW_HEIGHT}px`,
              }}
            >
              {format(new Date(2000, 0, 1, i, 0), "HH:mm")}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-x-auto min-w-0">
        {viewMode === "day" ? (
          assignees.length > 0 ? (
            assignees.map((a) => (
              <CalendarColumn
                key={a.id}
                columnId={a.id}
                columnType="assignee"
                columnDate={columnDateDayView}
                label={a.label}
                events={events.filter((e) => dayKeyForView && eventBelongsToDay(e, dayKeyForView) && eventBelongsToAssignee(e, a.id))}
                violationsByTaskId={violationsByTaskId}
                onEventClick={onEventClick}
                onEventMove={onEventMove}
                onEventResize={onEventResize}
                onCreateSlot={onCreateSlot}
                savingEventIds={savingEventIds}
              />
            ))
          ) : (
            <CalendarColumn
              columnId="unassigned"
              columnType="assignee"
              columnDate={columnDateDayView}
              label="Todos"
              events={dayKeyForView ? events.filter((e) => eventBelongsToDay(e, dayKeyForView)) : []}
              violationsByTaskId={violationsByTaskId}
              onEventClick={onEventClick}
              onEventMove={onEventMove}
              onEventResize={onEventResize}
              onCreateSlot={onCreateSlot}
              savingEventIds={savingEventIds}
            />
          )
        ) : (
          weekDays.map((day) => {
            const key = toDayKey(day)
            return (
              <CalendarColumn
                key={key}
                columnId={key}
                columnType="day"
                columnDate={day}
                label={format(day, "EEE d", { locale: es })}
                isToday={isToday(day)}
                events={events.filter((e) => eventBelongsToDay(e, key))}
                violationsByTaskId={violationsByTaskId}
                onEventClick={onEventClick}
                onEventMove={onEventMove}
                onEventResize={onEventResize}
                onCreateSlot={onCreateSlot}
                savingEventIds={savingEventIds}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
