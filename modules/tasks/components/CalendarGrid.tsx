"use client"

import { memo, useMemo, useState, useCallback } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  startOfDay,
} from "date-fns"
import { enUS } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { CalendarView } from "./CalendarToolbar"

export type CalendarTask = {
  id: string
  title: string
  dueDate: string | null
  priority: "LOW" | "MEDIUM" | "HIGH"
  status: string
  assignedTo?: string | null
  leadId?: string | null
  clientId?: string | null
  sourceModule?: string | null
  latitude?: number | null
  longitude?: number | null
}

const DRAG_TASK_ID_KEY = "calendar-task-id"
const DRAG_PREV_DUE_KEY = "calendar-prev-due"

type CalendarGridProps = {
  view: CalendarView
  currentDate: Date
  tasks: CalendarTask[]
  onTaskClick: (task: CalendarTask) => void
  onTaskReschedule?: (taskId: string, newDueDate: string) => void
  /** Dates (yyyy-MM-dd) that are workload-saturated; show red indicator */
  overloadedDayKeys?: Set<string>
  className?: string
}

function getEntityLabel(task: CalendarTask): string {
  if (task.leadId) return "LEAD"
  if (task.clientId) return "CLIENT"
  if (task.sourceModule) return task.sourceModule
  return "—"
}

function getPriorityStyles(priority: CalendarTask["priority"]): string {
  switch (priority) {
    case "HIGH":
      return "border-l-rose-500 bg-rose-500/5"
    case "MEDIUM":
      return "border-l-amber-500 bg-amber-500/5"
    default:
      return "border-l-slate-400 bg-slate-500/5"
  }
}

const CalendarTaskChip = memo(function CalendarTaskChip({
  task,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  task: CalendarTask
  onClick: () => void
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: () => void
  isDragging?: boolean
}) {
  const entityLabel = getEntityLabel(task)
  const priorityStyles = getPriorityStyles(task.priority)
  const canDrag = !!onDragStart

  return (
    <button
      type="button"
      draggable={canDrag}
      onDragStart={(e) => {
        if (!canDrag) return
        e.dataTransfer.setData(DRAG_TASK_ID_KEY, task.id)
        e.dataTransfer.setData(DRAG_PREV_DUE_KEY, task.dueDate ?? "")
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/plain", task.title)
        onDragStart?.(e)
      }}
      onDragEnd={() => onDragEnd?.()}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        "w-full rounded-r border-l-2 px-2 py-1 text-left text-xs transition-all duration-150",
        "hover:bg-violet-500/10 hover:border-l-violet-500",
        "truncate text-foreground cursor-grab active:cursor-grabbing",
        canDrag && "touch-none",
        isDragging && "opacity-40 scale-95 pointer-events-none",
        priorityStyles
      )}
    >
      <span className="mr-1 inline-block rounded bg-muted/80 px-1 font-medium text-muted-foreground">
        {entityLabel}
      </span>
      <span className="truncate font-medium">{task.title}</span>
    </button>
  )
})

type DragState = {
  draggedTaskId: string | null
  dropTargetKey: string | null
}

/** Month view: 7 columns (weekdays), rows per week */
function MonthGrid({
  currentDate,
  tasks,
  onTaskClick,
  onTaskReschedule,
  dragState,
  onDragStart,
  onDragEnd,
  onDropTargetChange,
  overloadedDayKeys,
}: {
  currentDate: Date
  tasks: CalendarTask[]
  onTaskClick: (task: CalendarTask) => void
  onTaskReschedule?: (taskId: string, newDueDate: string) => void
  dragState: DragState
  onDragStart: (taskId: string) => void
  onDragEnd: () => void
  onDropTargetChange: (key: string | null) => void
  overloadedDayKeys?: Set<string>
}) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const totalDays = Math.ceil((calEnd.getTime() - calStart.getTime()) / (24 * 60 * 60 * 1000)) + 1
  const weeks = Math.ceil(totalDays / 7)

  const tasksByDay = useMemo(() => {
    const map = new Map<string, CalendarTask[]>()
    tasks.forEach((t) => {
      if (!t.dueDate) return
      const key = format(startOfDay(new Date(t.dueDate)), "yyyy-MM-dd")
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    })
    return map
  }, [tasks])

  const weekDayHeaders = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => format(addDays(calStart, i), "EEE", { locale: enUS }))
  }, [calStart])

  const gridDays = useMemo(() => {
    const out: Date[] = []
    let d = new Date(calStart)
    for (let i = 0; i < weeks * 7; i++) {
      out.push(new Date(d))
      d = addDays(d, 1)
    }
    return out
  }, [calStart, weeks])

  const handleDrop = useCallback(
    (e: React.DragEvent, dayKey: string) => {
      e.preventDefault()
      const taskId = e.dataTransfer.getData(DRAG_TASK_ID_KEY)
      if (taskId && onTaskReschedule) onTaskReschedule(taskId, dayKey)
      onDragEnd()
      onDropTargetChange(null)
    },
    [onTaskReschedule, onDragEnd, onDropTargetChange]
  )

  return (
    <div className="grid grid-cols-7 gap-px rounded-xl border border-border/80 bg-muted/20">
      {weekDayHeaders.map((label) => (
        <div
          key={label}
          className="bg-muted/40 px-2 py-2 text-center text-xs font-medium text-muted-foreground"
        >
          {label}
        </div>
      ))}
      {gridDays.map((day) => {
        const key = format(day, "yyyy-MM-dd")
        const dayTasks = tasksByDay.get(key) ?? []
        const inMonth = isSameMonth(day, currentDate)
        const isDropTarget = dragState.dropTargetKey === key
        const isOverloaded = overloadedDayKeys?.has(key)

        return (
          <div
            key={key}
            data-date-key={key}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = "move"
              onDropTargetChange(key)
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) onDropTargetChange(null)
            }}
            onDrop={(e) => handleDrop(e, key)}
            className={cn(
              "min-h-[100px] bg-card p-1.5 transition-colors duration-150",
              !inMonth && "bg-muted/20 text-muted-foreground",
              isDropTarget && "ring-2 ring-violet-500 ring-inset bg-violet-500/10 rounded"
            )}
          >
            <div className="mb-1 flex items-center justify-between gap-0.5">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                  isToday(day) && "bg-violet-500 text-white",
                  inMonth && !isToday(day) && "text-foreground",
                  !inMonth && "text-muted-foreground"
                )}
              >
                {format(day, "d")}
              </div>
              {isOverloaded && (
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-destructive"
                  title="Workload saturated"
                  aria-hidden
                />
              )}
            </div>
            <div className="space-y-0.5">
              {dayTasks.length === 0 ? null : (
                dayTasks.slice(0, 4).map((t) => (
                  <CalendarTaskChip
                    key={t.id}
                    task={t}
                    onClick={() => onTaskClick(t)}
                    onDragStart={() => onDragStart(t.id)}
                    onDragEnd={onDragEnd}
                    isDragging={dragState.draggedTaskId === t.id}
                  />
                ))
              )}
              {dayTasks.length > 4 && (
                <div className="truncate px-1 text-xs text-muted-foreground">
                  +{dayTasks.length - 4} more
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Week view: 7 day columns */
function WeekGrid({
  currentDate,
  tasks,
  onTaskClick,
  onTaskReschedule,
  dragState,
  onDragStart,
  onDragEnd,
  onDropTargetChange,
  overloadedDayKeys,
}: {
  currentDate: Date
  tasks: CalendarTask[]
  onTaskClick: (task: CalendarTask) => void
  onTaskReschedule?: (taskId: string, newDueDate: string) => void
  dragState: DragState
  onDragStart: (taskId: string) => void
  onDragEnd: () => void
  onDropTargetChange: (key: string | null) => void
  overloadedDayKeys?: Set<string>
}) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  const tasksByDay = useMemo(() => {
    const map = new Map<string, CalendarTask[]>()
    tasks.forEach((t) => {
      if (!t.dueDate) return
      const key = format(startOfDay(new Date(t.dueDate)), "yyyy-MM-dd")
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    })
    return map
  }, [tasks])

  const handleDrop = useCallback(
    (e: React.DragEvent, dayKey: string) => {
      e.preventDefault()
      const taskId = e.dataTransfer.getData(DRAG_TASK_ID_KEY)
      if (taskId && onTaskReschedule) onTaskReschedule(taskId, dayKey)
      onDragEnd()
      onDropTargetChange(null)
    },
    [onTaskReschedule, onDragEnd, onDropTargetChange]
  )

  return (
    <div className="grid grid-cols-7 gap-2 rounded-xl border border-border/80 bg-card overflow-hidden">
      {days.map((day) => {
        const key = format(day, "yyyy-MM-dd")
        const dayTasks = tasksByDay.get(key) ?? []
        const isDropTarget = dragState.dropTargetKey === key
        const isOverloaded = overloadedDayKeys?.has(key)

        return (
          <div
            key={key}
            data-date-key={key}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = "move"
              onDropTargetChange(key)
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) onDropTargetChange(null)
            }}
            onDrop={(e) => handleDrop(e, key)}
            className={cn(
              "flex min-h-[200px] flex-col border-r border-border/60 last:border-r-0 transition-colors duration-150",
              isDropTarget && "bg-violet-500/10 ring-2 ring-violet-500 ring-inset"
            )}
          >
            <div
              className={cn(
                "border-b border-border/60 px-2 py-2 text-center text-sm font-medium flex items-center justify-center gap-1",
                isToday(day) && "bg-violet-500/10 text-violet-600"
              )}
            >
              {format(day, "EEE", { locale: enUS })}
              {isOverloaded && (
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" title="Workload saturated" aria-hidden />
              )}
            </div>
            <div className="text-center text-xs text-muted-foreground">
              {format(day, "MMM d", { locale: enUS })}
            </div>
            <div className="flex-1 space-y-1 p-2">
              {dayTasks.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">No tasks</p>
              ) : (
                dayTasks.map((t) => (
                  <CalendarTaskChip
                    key={t.id}
                    task={t}
                    onClick={() => onTaskClick(t)}
                    onDragStart={() => onDragStart(t.id)}
                    onDragEnd={onDragEnd}
                    isDragging={dragState.draggedTaskId === t.id}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Day view: single day */
function DayGrid({
  currentDate,
  tasks,
  onTaskClick,
  onTaskReschedule,
  dragState,
  onDragStart,
  onDragEnd,
  onDropTargetChange,
  overloadedDayKeys,
}: {
  currentDate: Date
  tasks: CalendarTask[]
  onTaskClick: (task: CalendarTask) => void
  onTaskReschedule?: (taskId: string, newDueDate: string) => void
  dragState: DragState
  onDragStart: (taskId: string) => void
  onDragEnd: () => void
  onDropTargetChange: (key: string | null) => void
  overloadedDayKeys?: Set<string>
}) {
  const dayKey = format(currentDate, "yyyy-MM-dd")
  const isOverloaded = overloadedDayKeys?.has(dayKey)
  const dayTasks = useMemo(
    () => tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), currentDate)),
    [tasks, currentDate]
  )
  const isDropTarget = dragState.dropTargetKey === dayKey

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const taskId = e.dataTransfer.getData(DRAG_TASK_ID_KEY)
      if (taskId && onTaskReschedule) onTaskReschedule(taskId, dayKey)
      onDragEnd()
      onDropTargetChange(null)
    },
    [dayKey, onTaskReschedule, onDragEnd, onDropTargetChange]
  )

  return (
    <div
      data-date-key={dayKey}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        onDropTargetChange(dayKey)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) onDropTargetChange(null)
      }}
      onDrop={handleDrop}
      className={cn(
        "rounded-xl border border-border/80 bg-card p-4 transition-colors duration-150",
        isDropTarget && "ring-2 ring-violet-500 ring-inset bg-violet-500/10"
      )}
    >
      <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-2">
        <h3 className="text-lg font-semibold text-foreground">
          {format(currentDate, "EEEE, MMMM d, yyyy", { locale: enUS })}
        </h3>
        {isOverloaded && (
          <span className="h-2 w-2 rounded-full bg-destructive" title="Workload saturated" aria-hidden />
        )}
      </div>
      <div className="space-y-2">
        {dayTasks.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No tasks this day</p>
        ) : (
          dayTasks.map((t) => (
            <CalendarTaskChip
              key={t.id}
              task={t}
              onClick={() => onTaskClick(t)}
              onDragStart={() => onDragStart(t.id)}
              onDragEnd={onDragEnd}
              isDragging={dragState.draggedTaskId === t.id}
            />
          ))
        )}
      </div>
    </div>
  )
}

export const CalendarGrid = memo(function CalendarGrid({
  view,
  currentDate,
  tasks,
  onTaskClick,
  onTaskReschedule,
  overloadedDayKeys,
  className,
}: CalendarGridProps) {
  const [dragState, setDragState] = useState<DragState>({
    draggedTaskId: null,
    dropTargetKey: null,
  })

  const tasksWithDue = useMemo(
    () => tasks.filter((t): t is CalendarTask & { dueDate: string } => t.dueDate != null && t.dueDate !== ""),
    [tasks]
  )

  const handleDragStart = useCallback((taskId: string) => {
    setDragState({ draggedTaskId: taskId, dropTargetKey: null })
  }, [])

  const handleDragEnd = useCallback(() => {
    setDragState({ draggedTaskId: null, dropTargetKey: null })
  }, [])

  const handleDropTargetChange = useCallback((key: string | null) => {
    setDragState((prev) => ({ ...prev, dropTargetKey: key }))
  }, [])

  return (
    <div className={cn("min-h-[400px]", className)}>
      {view === "month" && (
        <MonthGrid
          currentDate={currentDate}
          tasks={tasksWithDue}
          onTaskClick={onTaskClick}
          onTaskReschedule={onTaskReschedule}
          dragState={dragState}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDropTargetChange={handleDropTargetChange}
          overloadedDayKeys={overloadedDayKeys}
        />
      )}
      {view === "week" && (
        <WeekGrid
          currentDate={currentDate}
          tasks={tasksWithDue}
          onTaskClick={onTaskClick}
          onTaskReschedule={onTaskReschedule}
          dragState={dragState}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDropTargetChange={handleDropTargetChange}
          overloadedDayKeys={overloadedDayKeys}
        />
      )}
      {view === "day" && (
        <DayGrid
          currentDate={currentDate}
          tasks={tasksWithDue}
          onTaskClick={onTaskClick}
          onTaskReschedule={onTaskReschedule}
          dragState={dragState}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDropTargetChange={handleDropTargetChange}
          overloadedDayKeys={overloadedDayKeys}
        />
      )}
    </div>
  )
})
