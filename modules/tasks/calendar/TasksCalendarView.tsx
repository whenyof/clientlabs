"use client"

import { useState, useEffect, useMemo } from "react"
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns"
import { fetchTasks } from "@/lib/tasks-client"
import {
  buildCalendarTasks,
  assignOverlapColumns,
  type CalendarTask,
  type ApiTaskRaw,
} from "./types"
import { CalendarHeader } from "./CalendarHeader"
import { CalendarFilters, type CalendarFiltersState } from "./CalendarFilters"
import { CalendarGrid } from "../components/CalendarGrid"
import { CalendarSidePanel } from "./CalendarSidePanel"

const DEFAULT_FILTERS: CalendarFiltersState = {
  assignedTo: "all",
  status: "all",
  priority: "all",
}

function toDayKey(d: Date): string {
  return format(d, "yyyy-MM-dd")
}

export function TasksCalendarView() {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [viewMode, setViewMode] = useState<"day" | "week">("week")
  const [filters, setFilters] = useState<CalendarFiltersState>(DEFAULT_FILTERS)
  const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null)
  const [apiTasks, setApiTasks] = useState<ApiTaskRaw[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dayKeys = useMemo(() => {
    if (viewMode === "day") {
      return [toDayKey(currentDate)]
    }
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) =>
      toDayKey(addDays(weekStart, i))
    )
  }, [currentDate, viewMode])

  const from = dayKeys[0]
  const to = dayKeys[dayKeys.length - 1]

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params: Record<string, string> = {
      from: from ? `${from}T00:00:00.000Z` : "",
      to: to ? `${to}T23:59:59.999Z` : "",
    }
    if (filters.status !== "all") params.status = filters.status
    if (filters.priority !== "all") params.priority = filters.priority
    if (filters.assignedTo !== "all") params.assignedTo = filters.assignedTo

    fetchTasks(params)
      .then((data) => {
        if (cancelled) return
        setApiTasks((data as ApiTaskRaw[]) ?? [])
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error al cargar")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [from, to, filters.status, filters.priority, filters.assignedTo])

  const calendarTasks = useMemo(() => {
    const built = buildCalendarTasks(apiTasks, dayKeys)
    return assignOverlapColumns(built)
  }, [apiTasks, dayKeys])

  const assignees = useMemo(() => {
    const set = new Set<string>()
    calendarTasks.forEach((t) => set.add(t.assignedTo ?? "unassigned"))
    const list = Array.from(set)
    const options = [
      { id: "all", label: "Todos" },
      ...list.map((id) => ({
        id,
        label: id === "unassigned" ? "Sin asignar" : id,
      })),
    ]
    return options
  }, [calendarTasks])

  const assigneeOptions = useMemo(
    () =>
      assignees.map((a) => ({ value: a.id, label: a.label })),
    [assignees]
  )

  const gridAssignees = useMemo(() => {
    if (filters.assignedTo !== "all") {
      const a = assignees.find((x) => x.id === filters.assignedTo)
      return a ? [a] : assignees.filter((x) => x.id !== "all")
    }
    return assignees.filter((x) => x.id !== "all")
  }, [assignees, filters.assignedTo])

  const selectedApiTask = useMemo(() => {
    if (!selectedTask) return null
    return apiTasks.find((t) => t.id === selectedTask.id) ?? null
  }, [selectedTask, apiTasks])

  const handleSaved = () => {
    setSelectedTask(null)
    const params: Record<string, string> = {
      from: from ? `${from}T00:00:00.000Z` : "",
      to: to ? `${to}T23:59:59.999Z` : "",
    }
    if (filters.status !== "all") params.status = filters.status
    if (filters.priority !== "all") params.priority = filters.priority
    if (filters.assignedTo !== "all") params.assignedTo = filters.assignedTo
    fetchTasks(params).then((data) => setApiTasks((data as ApiTaskRaw[]) ?? []))
  }

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onDateChange={setCurrentDate}
      />
      <CalendarFilters
        filters={filters}
        onFiltersChange={setFilters}
        assigneeOptions={assigneeOptions}
      />
      <div className="relative flex-1 min-h-[480px] overflow-auto">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 text-destructive px-4 py-3 text-sm">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            Cargando calendario...
          </div>
        ) : (
          <CalendarGrid
            view={viewMode}
            currentDate={currentDate}
            tasks={calendarTasks as import("../components/CalendarGrid").CalendarTask[]}
            onTaskClick={(task) => setSelectedTask(task as unknown as CalendarTask)}
          />
        )}
      </div>
      <CalendarSidePanel
        open={!!selectedTask}
        task={selectedTask}
        apiTask={selectedApiTask}
        onClose={() => setSelectedTask(null)}
        onSaved={handleSaved}
      />
    </div>
  )
}
