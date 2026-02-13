"use client"

import { useState, useCallback, useMemo, useEffect, useRef, memo } from "react"
import { useRouter } from "next/navigation"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay, isSameDay } from "date-fns"
import { CalendarToolbar, type CalendarView } from "./CalendarToolbar"
import { CalendarGrid, type CalendarTask } from "./CalendarGrid"
import { WorkloadSaturationIndicator } from "./WorkloadSaturationIndicator"
import { DelayRiskIndicator } from "./DelayRiskIndicator"
import { RedistributionSuggestionCard } from "./RedistributionSuggestionCard"
import { WorkforceRedistributionCard } from "./WorkforceRedistributionCard"
import { RouteOptimizerCard } from "./RouteOptimizerCard"
import { fetchTasks, updateTask } from "@/lib/tasks-client"
import { getWorkloadFlags, DEFAULT_THRESHOLDS } from "../lib/workloadSaturation"
import { getRedistributionSuggestions } from "../lib/redistributionSuggestions"
import { toast } from "sonner"

export type { CalendarTask } from "./CalendarGrid"

type TasksCalendarProps = {
  /** Called when user clicks a task; use to open side panel and set selected task */
  onTaskSelect?: (task: CalendarTask) => void
  /** Optional initial view */
  defaultView?: CalendarView
  className?: string
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function getRangeForView(view: CalendarView, date: Date): { from: string; to: string } {
  if (view === "month") {
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    return { from: toISODate(start), to: toISODate(end) }
  }
  if (view === "week") {
    const start = startOfWeek(date, { weekStartsOn: 1 })
    const end = endOfWeek(date, { weekStartsOn: 1 })
    return { from: toISODate(start), to: toISODate(end) }
  }
  const start = startOfDay(date)
  const end = endOfDay(date)
  return { from: toISODate(start), to: toISODate(end) }
}

/** Normalize API task to CalendarTask (dueDate can be string from API) */
function toCalendarTask(t: {
  id: string
  title: string
  dueDate?: string | null
  priority?: string
  status?: string
  assignedTo?: string | null
  leadId?: string | null
  clientId?: string | null
  sourceModule?: string | null
  latitude?: number | null
  longitude?: number | null
}): CalendarTask {
  return {
    id: t.id,
    title: t.title,
    dueDate: t.dueDate ?? null,
    priority: (t.priority as CalendarTask["priority"]) ?? "MEDIUM",
    status: t.status ?? "PENDING",
    assignedTo: t.assignedTo ?? null,
    leadId: t.leadId ?? null,
    clientId: t.clientId ?? null,
    sourceModule: t.sourceModule ?? null,
    latitude: t.latitude ?? null,
    longitude: t.longitude ?? null,
  }
}

function TasksCalendarComponent({
  onTaskSelect,
  defaultView = "month",
  className,
}: TasksCalendarProps) {
  const router = useRouter()
  const [view, setView] = useState<CalendarView>(defaultView)
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [tasks, setTasks] = useState<CalendarTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [movingId, setMovingId] = useState<string | null>(null)
  const tasksBeforeRescheduleRef = useRef<CalendarTask[]>([])

  const { from, to } = useMemo(
    () => getRangeForView(view, currentDate),
    [view, currentDate]
  )

  const fetchTasksInRange = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchTasks({ from, to })
      const normalized = (Array.isArray(list) ? list : []).map((t) => toCalendarTask(t as Parameters<typeof toCalendarTask>[0]))
      setTasks(normalized)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tasks")
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    fetchTasksInRange()
  }, [fetchTasksInRange])

  const handleTaskClick = useCallback(
    (task: CalendarTask) => {
      onTaskSelect?.(task)
    },
    [onTaskSelect]
  )

  const workloadFlags = useMemo(
    () => getWorkloadFlags(tasks, DEFAULT_THRESHOLDS),
    [tasks]
  )
  const overloadedDayKeys = useMemo(
    () => new Set(workloadFlags.overloadedDays.map((d) => d.date)),
    [workloadFlags.overloadedDays]
  )

  const redistributionSuggestions = useMemo(
    () =>
      getRedistributionSuggestions(tasks, workloadFlags.overloadedDays),
    [tasks, workloadFlags.overloadedDays]
  )

  const taskTitles = useMemo(
    () => Object.fromEntries(tasks.map((t) => [t.id, t.title])),
    [tasks]
  )

  /** Tasks for the current day (for route optimizer in day view) */
  const dayTasksForRoute = useMemo(
    () =>
      view === "day"
        ? tasks.filter(
            (t) => t.dueDate && isSameDay(new Date(t.dueDate), currentDate)
          )
        : [],
    [view, tasks, currentDate]
  )

  const handleTaskReschedule = useCallback(
    async (taskId: string, newDueDate: string) => {
      let previous: CalendarTask[] = []
      setTasks((prev) => {
        previous = [...prev]
        return prev.map((t) =>
          t.id === taskId ? { ...t, dueDate: newDueDate } : t
        )
      })
      tasksBeforeRescheduleRef.current = previous

      try {
        await updateTask(taskId, { dueDate: newDueDate })
        router.refresh()
      } catch {
        setTasks(tasksBeforeRescheduleRef.current)
        toast.error("Could not reschedule. Reverted.")
      }
    },
    [router]
  )

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <CalendarToolbar
          view={view}
          onViewChange={setView}
          currentDate={currentDate}
          onCurrentDateChange={setCurrentDate}
          className="flex-1"
        />
        {!loading && tasks.length > 0 && (
          <div className="flex shrink-0 items-center gap-1">
            <DelayRiskIndicator from={from} to={to} />
            <WorkloadSaturationIndicator tasks={tasks} />
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-border/80 bg-muted/10">
          <p className="text-sm text-muted-foreground">Loading tasks…</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/5">
          <p className="text-sm text-muted-foreground">No tasks in this range. Create one to see it here.</p>
        </div>
      ) : (
        <>
          {redistributionSuggestions.length > 0 && (
            <RedistributionSuggestionCard
              suggestions={redistributionSuggestions}
              onMove={async (s) => {
                setMovingId(s.taskId)
                try {
                  await handleTaskReschedule(s.taskId, s.to)
                } finally {
                  setMovingId(null)
                }
              }}
              movingId={movingId}
              className="mb-4"
            />
          )}
          {tasks.length > 0 && (
            <WorkforceRedistributionCard
              from={from}
              to={to}
              taskTitles={taskTitles}
              onApplied={fetchTasksInRange}
              className="mb-4"
            />
          )}
          {view === "day" && dayTasksForRoute.length > 0 && (
            <RouteOptimizerCard
              date={toISODate(currentDate)}
              tasks={dayTasksForRoute.map((t) => ({
                id: t.id,
                title: t.title,
                latitude: t.latitude ?? null,
                longitude: t.longitude ?? null,
              }))}
              onAccepted={fetchTasksInRange}
              className="mb-4"
            />
          )}
          <CalendarGrid
            view={view}
            currentDate={currentDate}
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onTaskReschedule={handleTaskReschedule}
            overloadedDayKeys={overloadedDayKeys}
          />
        </>
      )}
    </div>
  )
}

export const TasksCalendar = memo(TasksCalendarComponent)
