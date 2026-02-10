"use client"

import { useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { CalendarTaskCard } from "./CalendarTaskCard"
import { snapMinutes } from "./calendar-snap"
import type { CalendarEvent } from "./calendar-event-types"
import type { Violation } from "./rules/conflict-rules"

export const CALENDAR_ROW_HEIGHT = 48
export const CALENDAR_TOTAL_ROWS = 24

export type CalendarColumnProps = {
  columnId: string
  columnType: "assignee" | "day"
  columnDate: Date
  label: string
  events: CalendarEvent[]
  violationsByTaskId: Map<string, Violation[]>
  onEventClick: (event: CalendarEvent) => void
  onEventMove: (event: CalendarEvent, dropClientX: number, dropClientY: number) => void
  onEventResize: (event: CalendarEvent, newStart: Date, newEnd: Date) => void
  onCreateSlot: (params: { start: Date; end: Date; assignedTo: string | null }) => void
  savingEventIds?: Set<string>
  isToday?: boolean
  className?: string
}

export function CalendarColumn({
  columnId,
  columnType,
  columnDate,
  label,
  events,
  violationsByTaskId,
  onEventClick,
  onEventMove,
  onEventResize,
  onCreateSlot,
  savingEventIds = new Set(),
  isToday = false,
  className,
}: CalendarColumnProps) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const [selecting, setSelecting] = useState(false)
  const [selectStartY, setSelectStartY] = useState(0)
  const [selectEndY, setSelectEndY] = useState(0)

  const handleEmptyPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      const rect = bodyRef.current?.getBoundingClientRect()
      if (!rect) return
      const y = e.clientY - rect.top
      e.currentTarget.setPointerCapture(e.pointerId)
      setSelecting(true)
      setSelectStartY(y)
      setSelectEndY(y)
    },
    []
  )

  const handleEmptyPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!selecting) return
      const rect = bodyRef.current?.getBoundingClientRect()
      if (!rect) return
      const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top))
      setSelectEndY(y)
    },
    [selecting]
  )

  const handleEmptyPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!selecting) return
      e.currentTarget.releasePointerCapture(e.pointerId)
      const rect = bodyRef.current?.getBoundingClientRect()
      if (!rect) {
        setSelecting(false)
        return
      }
      const y1 = Math.min(selectStartY, selectEndY)
      const y2 = Math.max(selectStartY, selectEndY)
      const durationPx = y2 - y1
      const minDurationPx = (15 / 60) * CALENDAR_ROW_HEIGHT
      if (durationPx >= minDurationPx) {
        const startMinutes = snapMinutes((y1 / CALENDAR_ROW_HEIGHT) * 60)
        const endMinutes = snapMinutes((y2 / CALENDAR_ROW_HEIGHT) * 60)
        const effectiveEnd = Math.max(endMinutes, startMinutes + 15)
        const base = new Date(columnDate)
        base.setHours(0, 0, 0, 0)
        const start = new Date(base.getTime() + startMinutes * 60 * 1000)
        const end = new Date(base.getTime() + effectiveEnd * 60 * 1000)
        onCreateSlot({
          start,
          end,
          assignedTo: columnType === "assignee" ? columnId : null,
        })
      }
      setSelecting(false)
    },
    [selecting, selectStartY, selectEndY, columnDate, columnType, columnId, onCreateSlot]
  )

  const selectTop = Math.min(selectStartY, selectEndY)
  const selectHeight = Math.abs(selectEndY - selectStartY)

  return (
    <div
      className={cn(
        "flex-1 min-w-[160px] flex flex-col border-r border-border/60 last:border-r-0",
        className
      )}
      data-column-id={columnId}
      data-column-type={columnType}
      data-column-date={columnDate.toISOString().slice(0, 10)}
    >
      <div
        className={cn(
          "sticky top-0 z-10 border-b border-border/60 px-3 py-2.5 text-sm font-medium truncate backdrop-blur-sm",
          isToday && "bg-violet-500/15 text-violet-600",
          !isToday && "bg-background/95 text-foreground"
        )}
        style={{ height: CALENDAR_ROW_HEIGHT }}
      >
        {label}
      </div>
      <div
        ref={bodyRef}
        data-column-body
        className="relative bg-muted/5 flex-1"
        style={{ minHeight: CALENDAR_TOTAL_ROWS * CALENDAR_ROW_HEIGHT }}
      >
        {/* Empty zone for create-by-selection */}
        <div
          className="absolute inset-0 z-0"
          onPointerDown={handleEmptyPointerDown}
          onPointerMove={handleEmptyPointerMove}
          onPointerUp={handleEmptyPointerUp}
          onPointerCancel={() => setSelecting(false)}
          aria-hidden
        />
        {selecting && selectHeight >= 4 && (
          <div
            className="absolute left-1 right-1 z-10 rounded-md bg-violet-500/30 border border-violet-400/50 pointer-events-none transition-none"
            style={{
              top: selectTop,
              height: selectHeight,
            }}
          />
        )}
        {events.map((event) => (
          <CalendarTaskCard
            key={event.id}
            event={event}
            rowHeight={CALENDAR_ROW_HEIGHT}
            columnDate={columnDate}
            violations={violationsByTaskId.get(event.id) ?? []}
            onClick={() => onEventClick(event)}
            onEventMove={onEventMove}
            onEventResize={onEventResize}
            isSaving={savingEventIds.has(event.id)}
          />
        ))}
      </div>
    </div>
  )
}
