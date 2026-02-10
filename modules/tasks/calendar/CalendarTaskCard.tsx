"use client"

import { useRef, useCallback, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { snapMinutes } from "./calendar-snap"
import type { CalendarEvent } from "./calendar-event-types"
import type { Violation } from "./rules/conflict-rules"

const ROW_HEIGHT = 48

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-violet-500/90 hover:bg-violet-500 border-violet-400/50",
  DONE: "bg-emerald-600/80 hover:bg-emerald-600/90 border-emerald-500/50",
  CANCELLED: "bg-zinc-500/60 hover:bg-zinc-500/70 border-zinc-400/40",
}

const PRIORITY_BORDER: Record<string, string> = {
  HIGH: "border-l-4 border-l-rose-400",
  MEDIUM: "border-l-4 border-l-amber-400",
  LOW: "border-l-4 border-l-slate-400",
}

const CLICK_THRESHOLD_PX = 5

export type CalendarTaskCardProps = {
  event: CalendarEvent
  rowHeight?: number
  columnDate: Date
  violations?: Violation[]
  onClick: () => void
  onEventMove: (event: CalendarEvent, dropClientX: number, dropClientY: number) => void
  onEventResize: (event: CalendarEvent, newStart: Date, newEnd: Date) => void
  isSaving?: boolean
  className?: string
}

export function CalendarTaskCard({
  event,
  rowHeight = ROW_HEIGHT,
  columnDate,
  violations = [],
  onClick,
  onEventMove,
  onEventResize,
  isSaving = false,
  className,
}: CalendarTaskCardProps) {
  const startMinutes = event.start.getHours() * 60 + event.start.getMinutes()
  const endMinutes = event.end.getHours() * 60 + event.end.getMinutes()
  const durationMinutes = Math.max(1, endMinutes - startMinutes)
  const top = (startMinutes / 60) * rowHeight
  const height = Math.max((durationMinutes / 60) * rowHeight, rowHeight * 0.5)
  const statusStyle = STATUS_STYLES[event.status] ?? STATUS_STYLES.PENDING
  const priorityStyle = PRIORITY_BORDER[event.priority] ?? PRIORITY_BORDER.MEDIUM
  const hasError = violations.some((v) => v.severity === "error")
  const hasWarning = violations.some((v) => v.severity === "warning")
  const violationBorder = hasError
    ? "ring-2 ring-red-500 border-red-500/80"
    : hasWarning
      ? "ring-2 ring-amber-500 border-amber-500/80"
      : ""
  const tooltipText = violations.length > 0 ? violations.map((v) => v.message).join("\n") : ""

  const [isDragging, setIsDragging] = useState(false)
  const [resizing, setResizing] = useState<"top" | "bottom" | null>(null)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const resizeStartRef = useRef<{ startMinutes: number; endMinutes: number; clientY: number } | null>(null)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0 || isSaving) return
      e.currentTarget.setPointerCapture(e.pointerId)
      dragStartRef.current = { x: e.clientX, y: e.clientY }
      setIsDragging(true)
    },
    [isSaving]
  )

  const handlePointerMove = useCallback(() => {}, [])

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (resizing) {
        const start = resizeStartRef.current
        if (start) {
          const deltaY = e.clientY - start.clientY
          const deltaMinutes = (deltaY / rowHeight) * 60
          const base = new Date(columnDate)
          base.setHours(0, 0, 0, 0)
          if (resizing === "top") {
            let newStartMinutes = snapMinutes(start.startMinutes + deltaMinutes)
            if (newStartMinutes >= start.endMinutes - 15) newStartMinutes = start.endMinutes - 15
            const newStart = new Date(base.getTime() + newStartMinutes * 60 * 1000)
            const newEnd = new Date(base.getTime() + start.endMinutes * 60 * 1000)
            onEventResize(event, newStart, newEnd)
          } else {
            let newEndMinutes = snapMinutes(start.endMinutes + deltaMinutes)
            if (newEndMinutes <= start.startMinutes + 15) newEndMinutes = start.startMinutes + 15
            const newStart = new Date(base.getTime() + start.startMinutes * 60 * 1000)
            const newEnd = new Date(base.getTime() + newEndMinutes * 60 * 1000)
            onEventResize(event, newStart, newEnd)
          }
        }
        e.currentTarget.releasePointerCapture(e.pointerId)
        setResizing(null)
        resizeStartRef.current = null
        return
      }
      if (isDragging) {
        e.currentTarget.releasePointerCapture(e.pointerId)
        const start = dragStartRef.current
        const dx = e.clientX - (start?.x ?? 0)
        const dy = e.clientY - (start?.y ?? 0)
        if (Math.hypot(dx, dy) >= CLICK_THRESHOLD_PX) {
          onEventMove(event, e.clientX, e.clientY)
        } else {
          onClick()
        }
        dragStartRef.current = null
        setIsDragging(false)
        return
      }
    },
    [isDragging, resizing, event, columnDate, rowHeight, onClick, onEventMove, onEventResize]
  )

  const handleResizeTopPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation()
      if (e.button !== 0 || isSaving) return
      e.currentTarget.setPointerCapture(e.pointerId)
      setResizing("top")
      resizeStartRef.current = {
        startMinutes: event.start.getHours() * 60 + event.start.getMinutes(),
        endMinutes: event.end.getHours() * 60 + event.end.getMinutes(),
        clientY: e.clientY,
      }
    },
    [event, isSaving]
  )

  const handleResizeBottomPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation()
      if (e.button !== 0 || isSaving) return
      e.currentTarget.setPointerCapture(e.pointerId)
      setResizing("bottom")
      resizeStartRef.current = {
        startMinutes: event.start.getHours() * 60 + event.start.getMinutes(),
        endMinutes: event.end.getHours() * 60 + event.end.getMinutes(),
        clientY: e.clientY,
      }
    },
    [event, isSaving]
  )

  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={(e) => {
        e.currentTarget.releasePointerCapture(e.pointerId)
        setIsDragging(false)
        setResizing(null)
        dragStartRef.current = null
        resizeStartRef.current = null
      }}
      title={tooltipText}
      className={cn(
        "absolute left-0.5 right-0.5 rounded-lg border text-left shadow-sm select-none touch-none",
        "transition-shadow duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-background",
        isDragging && "opacity-90 shadow-lg cursor-grabbing z-30",
        !isDragging && "cursor-grab hover:shadow-md",
        isSaving && "pointer-events-none opacity-70",
        violationBorder,
        statusStyle,
        priorityStyle,
        className
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        minHeight: 24,
      }}
    >
      {/* Resize handle top */}
      <div
        className="absolute left-0 right-0 top-0 h-2 cursor-n-resize rounded-t-lg hover:bg-white/20 transition-colors z-10"
        onPointerDown={handleResizeTopPointerDown}
        aria-hidden
      />
      <div className="px-2 py-1 h-full overflow-hidden flex flex-col justify-center pointer-events-none flex-1 min-w-0">
        <div className="flex items-start gap-1">
          <span className="text-xs font-medium text-white truncate block flex-1 min-w-0">{event.title}</span>
          {violations.length > 0 && (
            <AlertTriangle
              className={cn("shrink-0 w-3.5 h-3.5", hasError ? "text-red-200" : "text-amber-200")}
              aria-hidden
            />
          )}
        </div>
        {(event.clientName ?? event.leadName) && (
          <span className="text-[10px] text-white/80 truncate block">
            {event.clientName ?? event.leadName}
          </span>
        )}
      </div>
      {/* Resize handle bottom */}
      <div
        className="absolute left-0 right-0 bottom-0 h-2 cursor-s-resize rounded-b-lg hover:bg-white/20 transition-colors z-10"
        onPointerDown={handleResizeBottomPointerDown}
        aria-hidden
      />
      {isSaving && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
