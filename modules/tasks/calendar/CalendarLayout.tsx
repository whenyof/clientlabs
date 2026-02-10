"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { format, startOfWeek, startOfDay, endOfDay, endOfWeek } from "date-fns"
import { CalendarHeader } from "./CalendarHeader"
import { CalendarGrid } from "./CalendarGrid"
import { CalendarSidePanel } from "./CalendarSidePanel"
import { TaskDialog } from "@/components/tasks/TaskDialog"
import { parseCalendarEvents, type CalendarEvent, type CalendarEventAPI } from "./calendar-event-types"
import { updateCalendarTask } from "./calendar-api"
import { snapMinutes } from "./calendar-snap"
import { evaluateConflictRules, violationsByTaskId } from "./rules/conflict-rules"
import { computeSuggestions } from "./optimization/suggestions-engine"
import { OptimizationSuggestionsSection } from "./optimization/OptimizationSuggestionsSection"
import { PredictionsOperativasSection } from "./predictions/PredictionsOperativasSection"
import { DecisionesRecomendadasSection } from "./recommendations/DecisionesRecomendadasSection"
import type { CalendarTask } from "./types"
import type { ApiTaskRaw } from "./types"

const ROW_HEIGHT = 48

function toISO(date: Date): string {
  return date.toISOString()
}

function eventToCalendarTask(event: CalendarEvent): CalendarTask {
  const dayKey = format(event.start, "yyyy-MM-dd")
  const startMinutes = event.start.getHours() * 60 + event.start.getMinutes()
  const endMinutes = event.end.getHours() * 60 + event.end.getMinutes()
  const durationMinutes = Math.max(1, endMinutes - startMinutes)
  return {
    id: event.id,
    title: event.title,
    dueDate: toISO(event.start),
    dayKey,
    startMinutes,
    durationMinutes,
    endMinutes: startMinutes + durationMinutes,
    status: event.status as CalendarTask["status"],
    priority: event.priority as CalendarTask["priority"],
    assignedTo: event.assignedTo ?? null,
    clientName: event.clientName ?? null,
    leadName: event.leadName ?? null,
  }
}

function eventToApiTaskRaw(event: CalendarEvent): ApiTaskRaw {
  return {
    id: event.id,
    title: event.title,
    dueDate: toISO(event.start),
    status: event.status,
    priority: event.priority,
    assignedTo: event.assignedTo ?? null,
    Client: event.clientName ? { id: "", name: event.clientName } : null,
    Lead: event.leadName ? { id: "", name: event.leadName } : null,
  }
}

function resolveDropTarget(clientX: number, clientY: number): { columnDate: Date; startMinutes: number; assignedTo: string | null } | null {
  const el = document.elementFromPoint(clientX, clientY)
  const column = el?.closest?.("[data-column-id][data-column-type][data-column-date]")
  if (!column) return null
  const columnId = column.getAttribute("data-column-id")
  const columnType = column.getAttribute("data-column-type")
  const columnDateStr = column.getAttribute("data-column-date")
  if (!columnId || !columnType || !columnDateStr) return null
  const columnBody = column.querySelector("[data-column-body]")
  const rect = columnBody?.getBoundingClientRect?.()
  if (!rect) return null
  const y = clientY - rect.top
  const startMinutes = snapMinutes((y / ROW_HEIGHT) * 60)
  const base = new Date(columnDateStr + "T00:00:00")
  return {
    columnDate: base,
    startMinutes,
    assignedTo: columnType === "assignee" ? columnId : null,
  }
}

export function CalendarLayout() {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [viewMode, setViewMode] = useState<"day" | "week">("week")
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [savingEventIds, setSavingEventIds] = useState<Set<string>>(new Set())
  const [createSlot, setCreateSlot] = useState<{ start: Date; end: Date; assignedTo: string | null } | null>(null)

  const { from, to } = useMemo(() => {
    if (viewMode === "day") {
      const start = startOfDay(currentDate)
      const end = endOfDay(currentDate)
      return { from: toISO(start), to: toISO(end) }
    }
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    const end = endOfWeek(currentDate, { weekStartsOn: 1 })
    return { from: toISO(start), to: toISO(end) }
  }, [currentDate, viewMode])

  const fetchEvents = useCallback(() => {
    const url = `/api/tasks/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    return fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 401 ? "No autorizado" : "Error al cargar")
        return res.json()
      })
      .then((data: CalendarEventAPI[]) => setEvents(parseCalendarEvents(data ?? [])))
  }, [from, to])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchEvents()
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [fetchEvents])

  const selectedTask = useMemo(
    () => (selectedEvent ? eventToCalendarTask(selectedEvent) : null),
    [selectedEvent]
  )
  const selectedApiTask = useMemo(
    () => (selectedEvent ? eventToApiTaskRaw(selectedEvent) : null),
    [selectedEvent]
  )

  const handleEventMove = useCallback(
    (event: CalendarEvent, dropClientX: number, dropClientY: number) => {
      const target = resolveDropTarget(dropClientX, dropClientY)
      if (!target) return
      const durationMs = event.end.getTime() - event.start.getTime()
      const newStart = new Date(target.columnDate.getTime() + target.startMinutes * 60 * 1000)
      const newEnd = new Date(newStart.getTime() + durationMs)
      const newAssignedTo = target.assignedTo ?? event.assignedTo ?? undefined
      const previous = events.find((e) => e.id === event.id)
      if (!previous) return
      const optimistic: CalendarEvent = {
        ...previous,
        start: newStart,
        end: newEnd,
        assignedTo: newAssignedTo ?? previous.assignedTo,
      }
      setEvents((prev) => prev.map((e) => (e.id === event.id ? optimistic : e)))
      setSavingEventIds((prev) => new Set(prev).add(event.id))
      updateCalendarTask(event.id, {
        startAt: newStart.toISOString(),
        endAt: newEnd.toISOString(),
        assignedToId: newAssignedTo ?? null,
      })
        .then((res) => {
          if (!res.ok) throw new Error("Update failed")
          return fetchEvents()
        })
        .catch(() => {
          setEvents((prev) => prev.map((e) => (e.id === event.id ? previous : e)))
        })
        .finally(() => {
          setSavingEventIds((prev) => {
            const next = new Set(prev)
            next.delete(event.id)
            return next
          })
        })
    },
    [events, fetchEvents]
  )

  const handleEventResize = useCallback(
    (event: CalendarEvent, newStart: Date, newEnd: Date) => {
      const previous = events.find((e) => e.id === event.id)
      if (!previous) return
      const optimistic: CalendarEvent = { ...previous, start: newStart, end: newEnd }
      setEvents((prev) => prev.map((e) => (e.id === event.id ? optimistic : e)))
      setSavingEventIds((prev) => new Set(prev).add(event.id))
      updateCalendarTask(event.id, {
        startAt: newStart.toISOString(),
        endAt: newEnd.toISOString(),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Update failed")
          return fetchEvents()
        })
        .catch(() => {
          setEvents((prev) => prev.map((e) => (e.id === event.id ? previous : e)))
        })
        .finally(() => {
          setSavingEventIds((prev) => {
            const next = new Set(prev)
            next.delete(event.id)
            return next
          })
        })
    },
    [events, fetchEvents]
  )

  const handleCreateSlot = useCallback((params: { start: Date; end: Date; assignedTo: string | null }) => {
    setCreateSlot(params)
  }, [])

  const handleSaved = useCallback(() => {
    setSelectedEvent(null)
    fetchEvents()
  }, [fetchEvents])

  const handleCreateSuccess = useCallback(() => {
    setCreateSlot(null)
    fetchEvents()
  }, [fetchEvents])

  const createTaskPrefill = useMemo(() => {
    if (!createSlot) return undefined
    return {
      dueDate: createSlot.start.toISOString(),
      startAt: createSlot.start.toISOString(),
      endAt: createSlot.end.toISOString(),
      assignedToId: createSlot.assignedTo ?? undefined,
    }
  }, [createSlot])

  const violationsByTask = useMemo(() => {
    const violations = evaluateConflictRules(events)
    return violationsByTaskId(violations)
  }, [events])

  const suggestions = useMemo(() => computeSuggestions(events), [events])

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onDateChange={setCurrentDate}
      />

      <div className="relative flex-1 min-h-[480px] overflow-auto scroll-smooth">
        {error && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 text-destructive px-4 py-3 text-sm">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm animate-in fade-in duration-200">
            Cargando calendario…
          </div>
        ) : (
          <>
            <CalendarGrid
              viewMode={viewMode}
              currentDate={currentDate}
              events={events}
              violationsByTaskId={violationsByTask}
              onEventClick={setSelectedEvent}
              onEventMove={handleEventMove}
              onEventResize={handleEventResize}
              onCreateSlot={handleCreateSlot}
              savingEventIds={savingEventIds}
            />
            <PredictionsOperativasSection
              from={from}
              to={to}
              className="mt-4"
            />
            <DecisionesRecomendadasSection
              from={from}
              to={to}
              onApplied={fetchEvents}
              className="mt-4"
            />
            <OptimizationSuggestionsSection
              suggestions={suggestions}
              events={events}
              className="mt-4"
            />
          </>
        )}
      </div>

      <CalendarSidePanel
        open={!!selectedEvent}
        task={selectedTask}
        apiTask={selectedApiTask}
        onClose={() => setSelectedEvent(null)}
        onSaved={handleSaved}
      />

      <TaskDialog
        open={!!createSlot}
        onOpenChange={(open) => !open && setCreateSlot(null)}
        task={createTaskPrefill}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
