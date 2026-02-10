"use client"

import { useMemo, useState, useCallback, useEffect, useRef, memo, type ComponentType } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useDroppable, useDraggable } from "@dnd-kit/core"
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addYears,
  subYears,
  format,
  isSameDay,
  isWithinInterval,
  isSameMonth,
  eachDayOfInterval,
  addHours,
} from "date-fns"
import { es } from "date-fns/locale"
import { Bell, MapPin, Phone, Mail, CheckSquare, Check, AlertTriangle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getPriorityScoreLabel, getPriorityScoreBadgeClass, getAutoPriorityBorderClass, getAutoPriorityBadgeClass } from "@/modules/tasks/lib/priority-score-badge"
import type { MissionControlCalendarItem } from "./types"

const WEEK_STARTS_MONDAY = { weekStartsOn: 1 as const }

/** Used by MissionCalendar handleDragEnd to parse drop target. Must match droppable ids. */
export const DROPPABLE_DAY_PREFIX = "day-"

export type CalendarViewMode = "day" | "week" | "month" | "year" | "timeline"

const SCROLL_PROGRESS_THROTTLE_MS = 150
/** Scroll ratio [0,1] at which to trigger predictive prefetch (e.g. 0.8 = 80%). */
export const PREFETCH_SCROLL_RATIO = 0.8

type CalendarViewProps = {
  view: CalendarViewMode
  currentDate: Date
  tasks: MissionControlCalendarItem[]
  onTaskClick: (task: MissionControlCalendarItem) => void
  onDayClick?: (date: Date) => void
  onMonthClick?: (monthStart: Date) => void
  onDurationChange?: (taskId: string, estimatedMinutes: number) => void
  activeDragId?: string | null
  /** Called when scroll position changes (throttled). ratio in [0, 1]; use for prefetch at ~0.8. */
  onScrollProgress?: (ratio: number) => void
  className?: string
}

/** Date used for range filtering and for which day a task belongs (dueDate takes precedence). */
function getTaskDate(task: MissionControlCalendarItem): Date | null {
  const iso = task.dueDate ?? task.startAt
  if (!iso) return null
  return new Date(iso)
}

/** Time used for ordering and day-view position (startAt if set, else dueDate). */
function getTaskTimeDate(task: MissionControlCalendarItem): Date | null {
  const iso = task.startAt ?? task.dueDate
  if (!iso) return null
  return new Date(iso)
}

/** Day key (yyyy-MM-dd) for placement in week/month: based on dueDate. */
function getTaskDayKey(task: MissionControlCalendarItem): string | null {
  const d = getTaskDate(task)
  if (!d) return null
  return format(d, "yyyy-MM-dd")
}

function getTaskDurationMinutes(task: MissionControlCalendarItem): number {
  if (task.estimatedMinutes != null && task.estimatedMinutes > 0) {
    return task.estimatedMinutes
  }
  return DEFAULT_DURATION_MIN
}

function isTaskInRange(
  task: MissionControlCalendarItem,
  rangeStart: Date,
  rangeEnd: Date
): boolean {
  const d = getTaskDate(task)
  if (!d) return false
  return isWithinInterval(d, { start: rangeStart, end: rangeEnd })
}

/** Sort tasks by time ascending (startAt ?? dueDate). */
function sortTasksByTimeAsc(a: MissionControlCalendarItem, b: MissionControlCalendarItem): number {
  const ta = getTaskTimeDate(a)?.getTime() ?? 0
  const tb = getTaskTimeDate(b)?.getTime() ?? 0
  return ta - tb
}

/** Day/week view: height and position by duration and start time. Exported for drag-to-reschedule. */
export const PIXELS_PER_MINUTE = 1.2
const MIN_TASK_HEIGHT_PX = 24
const MINUTES_PER_PX = 1 / PIXELS_PER_MINUTE
const HOUR_ROW_HEIGHT_PX = 60 * PIXELS_PER_MINUTE // 72
const HOUR_ROW_COUNT = 24
const TOTAL_DAY_HEIGHT_PX = HOUR_ROW_COUNT * HOUR_ROW_HEIGHT_PX
const OVERSCAN_ROWS = 3
const DEFAULT_DURATION_MIN = 30
const MIN_DURATION_MIN = 15
const MAX_DURATION_MIN = 480

function roundDuration(minutes: number): number {
  const step = 15
  return Math.round(minutes / step) * step
}

/** Compute top (px), height (px), and column index for side-by-side overlapping tasks. */
function computeDayLayout(
  tasks: Array<{ task: MissionControlCalendarItem; startMinutes: number; endMinutes: number }>
): Array<{
  task: MissionControlCalendarItem
  top: number
  height: number
  columnIndex: number
  maxCols: number
}> {
  if (tasks.length === 0) return []
  const sorted = [...tasks].sort((a, b) => a.startMinutes - b.startMinutes)
  const columnEnd: number[] = []
  const result: Array<{
    task: MissionControlCalendarItem
    top: number
    height: number
    columnIndex: number
    maxCols: number
  }> = []
  for (const { task, startMinutes, endMinutes } of sorted) {
    const duration = endMinutes - startMinutes
    const height = Math.max(MIN_TASK_HEIGHT_PX, duration * PIXELS_PER_MINUTE)
    const top = startMinutes * PIXELS_PER_MINUTE
    let col = 0
    while (col < columnEnd.length && columnEnd[col] > startMinutes) col++
    if (col === columnEnd.length) columnEnd.push(0)
    columnEnd[col] = endMinutes
    result.push({
      task,
      top,
      height,
      columnIndex: col,
      maxCols: columnEnd.length,
    })
  }
  const maxCols = columnEnd.length
  result.forEach((r) => {
    r.maxCols = maxCols
  })
  return result
}

function statusToColor(status: string): string {
  const s = (status || "").toUpperCase()
  if (s === "DONE" || s === "COMPLETED") return "bg-emerald-500/20 border-emerald-500/40 text-emerald-200"
  if (s === "CANCELLED" || s === "CANCELED") return "bg-zinc-500/20 border-zinc-500/40 text-zinc-300"
  return "bg-violet-500/20 border-violet-500/40 text-violet-200"
}

/** Container classes by status: DONE = premium completion style, CANCELLED = gray, PENDING = normal. */
function getStatusContainerClasses(status: string): string {
  const s = (status || "").toUpperCase()
  if (s === "DONE" || s === "COMPLETED")
    return "opacity-75 bg-white/[0.02] border-white/[0.08] transition-all duration-200"
  if (s === "CANCELLED" || s === "CANCELED") return "bg-zinc-600/25 border-zinc-500/50 text-zinc-400"
  return ""
}

/** Title/text classes by status: DONE = strikethrough + muted. */
function getStatusTitleClasses(status: string): string {
  const s = (status || "").toUpperCase()
  if (s === "DONE" || s === "COMPLETED") return "line-through text-white/60"
  return ""
}

/** Barra de estado superior (3–4px): color por estado. */
function getStatusBarColor(task: MissionControlCalendarItem): string {
  const status = (task.status || "").toUpperCase()
  const due = task.dueDate ? new Date(task.dueDate) : null
  const overdue = status === "PENDING" && due != null && due < new Date()
  if (status === "DONE" || status === "COMPLETED") return "bg-emerald-500"
  if (overdue) return "bg-rose-500"
  if (status === "PENDING") return "bg-zinc-500"
  if (status === "CANCELLED") return "bg-zinc-600"
  return "bg-zinc-500"
}

function isOverdue(task: MissionControlCalendarItem): boolean {
  const status = (task.status || "").toUpperCase()
  if (status !== "PENDING") return false
  const due = task.dueDate ? new Date(task.dueDate) : null
  return due != null && due < new Date()
}

/** Schedule risk: overlap, overload, impossible timing. */
function hasScheduleRisk(task: MissionControlCalendarItem): boolean {
  const r = task.risk
  return Boolean(r && (r.overlap || r.overload || r.impossibleTiming))
}

function getScheduleRiskTooltip(task: MissionControlCalendarItem): string {
  const r = task.risk
  if (!r) return ""
  const parts: string[] = []
  if (r.overlap) parts.push("Solapamiento")
  if (r.overload) parts.push("Sobrecarga del día")
  if (r.impossibleTiming) parts.push("Horario imposible")
  return parts.join(" · ")
}

/** Rango horario HH:mm – HH:mm. */
function getTimeRangeLabel(task: MissionControlCalendarItem): string | null {
  const start = getTaskTimeDate(task)
  if (!start) return null
  const min = task.estimatedMinutes ?? 30
  const end = new Date(start.getTime() + min * 60 * 1000)
  return `${format(start, "HH:mm", { locale: es })} – ${format(end, "HH:mm", { locale: es })}`
}

/** Icono por tipo: visita, llamada, email, tarea. type no viene en API aún → TASK = check, REMINDER = bell. */
function getTypeIcon(task: MissionControlCalendarItem): ComponentType<{ className?: string }> {
  if (task.kind === "REMINDER") return Bell
  const t = (task as { type?: string }).type
  if (t === "MEETING") return MapPin
  if (t === "CALL") return Phone
  if (t === "EMAIL") return Mail
  return CheckSquare
}

/** Priority accent for task card top bar (subtle). */
function getPriorityAccent(priority: string): string {
  const p = (priority || "").toUpperCase()
  if (p === "HIGH") return "bg-rose-500/50"
  if (p === "MEDIUM") return "bg-amber-500/50"
  return "bg-slate-500/40"
}

function getAssigneeInitials(task: MissionControlCalendarItem): string {
  const a = task.assignedTo
  if (!a || typeof a !== "string") return "—"
  const parts = a.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2)
  if (parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase()
  return parts[0][0]?.toUpperCase() ?? "?"
}

/** Densidad automática según altura del bloque (solo render). */
function getDensityMode(heightPx: number): "full" | "summary" | "title" | "dot" {
  if (heightPx > 80) return "full"
  if (heightPx > 40) return "summary"
  if (heightPx >= 20) return "title"
  return "dot"
}

/** Barra de estado 3–4px + contenido según densidad. */
const STATUS_BAR_H = "h-1"

/** Premium task card content: densidad automática por altura (>80 full, 40–80 summary, 20–40 title, <20 dot). */
const TaskCardContent = memo(function TaskCardContent({
  task,
  compact = false,
  /** Altura en px del bloque; si se pasa, se usa densidad automática. */
  blockHeight,
}: {
  task: MissionControlCalendarItem
  compact?: boolean
  blockHeight?: number
}) {
  const meta = task.clientName || task.leadName || null
  const timeRange = getTimeRangeLabel(task)
  const initials = getAssigneeInitials(task)
  const statusTitleClass = getStatusTitleClasses(task.status ?? "")
  const statusBarColor = getStatusBarColor(task)
  const TypeIcon = getTypeIcon(task)
  const isCompleted =
    (task.status ?? "").toUpperCase() === "DONE" || (task.status ?? "").toUpperCase() === "COMPLETED"
  const showRisk = isOverdue(task)
  const showScheduleRisk = hasScheduleRisk(task)
  const scheduleRiskTooltip = getScheduleRiskTooltip(task)
  const density = blockHeight != null ? getDensityMode(blockHeight) : null
  const priorityLabel = getPriorityScoreLabel(task.priorityScore ?? null)
  const priorityBadgeClass = getPriorityScoreBadgeClass(task.priorityScore ?? null)
  const autoPriority = task.autoPriority ?? null
  const autoBorderClass = getAutoPriorityBorderClass(autoPriority)
  const autoBadgeClass = getAutoPriorityBadgeClass(autoPriority)

  if (compact) {
    return (
      <>
        <div className={cn(STATUS_BAR_H, "rounded-t-xl shrink-0", statusBarColor)} aria-hidden />
        <div className="flex-1 min-w-0 px-2 py-1 flex flex-col justify-center overflow-hidden relative">
          <div className="flex items-center gap-1.5 min-w-0">
            {isCompleted ? (
              <Check className="w-3 h-3 text-emerald-400 shrink-0" aria-hidden />
            ) : (
              <TypeIcon className="w-3 h-3 text-zinc-400 shrink-0" />
            )}
            <span className={cn("text-[10px] font-semibold text-white truncate flex-1", statusTitleClass)}>
              {task.title}
            </span>
            {priorityLabel && (
              <span className={cn("shrink-0 text-[9px] px-1.5 py-0.5 rounded", priorityBadgeClass)}>
                {priorityLabel}
              </span>
            )}
            {autoPriority && (
              <span className={cn("shrink-0 text-[9px] px-1.5 py-0.5 rounded font-medium", autoBadgeClass)}>
                {autoPriority}
              </span>
            )}
            {showRisk && (
              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" aria-label="Retrasada" aria-hidden />
            )}
            {showScheduleRisk && (
              <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" aria-label={scheduleRiskTooltip} aria-hidden />
            )}
          </div>
          {meta && (
            <span className="text-[9px] text-white/70 truncate block mt-0.5 opacity-70">{meta}</span>
          )}
          {timeRange && (
            <span className="text-[9px] text-white/60 tabular-nums block mt-0.5">{timeRange}</span>
          )}
        </div>
        <div className="shrink-0 flex justify-end px-2 pb-1">
          <span
            className="h-4 w-4 rounded bg-white/10 text-[9px] flex items-center justify-center text-white/80 flex-shrink-0"
            title={task.assignedTo ?? undefined}
          >
            {initials}
          </span>
        </div>
      </>
    )
  }

  if (density === "dot") {
    const barColor = getStatusBarColor(task)
    return (
      <>
        <div className={cn(STATUS_BAR_H, "rounded-t-xl shrink-0", barColor)} aria-hidden />
        <div className="w-full h-full flex items-center justify-center min-h-0 gap-1" title={task.title}>
          {isCompleted ? (
            <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" aria-hidden />
          ) : (
            <TypeIcon className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
          )}
          {showRisk && <AlertTriangle className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
          {showScheduleRisk && <AlertCircle className="w-2.5 h-2.5 text-amber-400 shrink-0" aria-label={scheduleRiskTooltip} />}
        </div>
      </>
    )
  }

  if (density === "title") {
    return (
      <>
        <div className={cn(STATUS_BAR_H, "rounded-t-xl shrink-0", statusBarColor)} aria-hidden />
        <div className="flex-1 min-w-0 px-2 py-1 flex items-center gap-1.5 overflow-hidden relative">
          {isCompleted ? (
            <Check className="w-3 h-3 text-emerald-400 shrink-0" aria-hidden />
          ) : (
            <TypeIcon className="w-3 h-3 text-zinc-400 shrink-0" />
          )}
          <span className={cn("text-xs font-semibold text-white truncate flex-1", statusTitleClass)}>
            {task.title}
          </span>
          {priorityLabel && (
            <span className={cn("shrink-0 text-[9px] px-1.5 py-0.5 rounded", priorityBadgeClass)}>
              {priorityLabel}
            </span>
          )}
          {autoPriority && (
            <span className={cn("shrink-0 text-[9px] px-1.5 py-0.5 rounded font-medium", autoBadgeClass)}>
              {autoPriority}
            </span>
          )}
          {showRisk && <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" aria-label="Retrasada" />}
          {showScheduleRisk && <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" aria-label={scheduleRiskTooltip} />}
        </div>
      </>
    )
  }

  if (density === "summary") {
    return (
      <>
        <div className={cn(STATUS_BAR_H, "rounded-t-xl shrink-0", statusBarColor)} aria-hidden />
        <div className="flex-1 min-w-0 px-2 py-1 flex flex-col justify-center overflow-hidden">
          <div className="flex items-center gap-1.5 min-w-0">
            {isCompleted ? (
              <Check className="w-3 h-3 text-emerald-400 shrink-0" aria-hidden />
            ) : (
              <TypeIcon className="w-3 h-3 text-zinc-400 shrink-0" />
            )}
            <span className={cn("text-xs font-semibold text-white truncate flex-1", statusTitleClass)}>
              {task.title}
            </span>
            {priorityLabel && (
              <span className={cn("shrink-0 text-[9px] px-1.5 py-0.5 rounded", priorityBadgeClass)}>
                {priorityLabel}
              </span>
            )}
            {autoPriority && (
              <span className={cn("shrink-0 text-[9px] px-1.5 py-0.5 rounded font-medium", autoBadgeClass)}>
                {autoPriority}
              </span>
            )}
            {showRisk && <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" aria-label="Retrasada" />}
            {showScheduleRisk && <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" aria-label={scheduleRiskTooltip} />}
          </div>
          {meta && (
            <span className="text-[10px] text-white/70 truncate block mt-0.5 opacity-70">{meta}</span>
          )}
          {timeRange && (
            <span className="text-[10px] text-white/60 tabular-nums block mt-0.5">{timeRange}</span>
          )}
        </div>
        <div className="shrink-0 flex justify-end px-2 pb-1">
          <span
            className="h-5 w-5 rounded bg-white/10 text-[10px] flex items-center justify-center text-white/80 flex-shrink-0"
            title={task.assignedTo ?? undefined}
          >
            {initials}
          </span>
        </div>
      </>
    )
  }

  return (
    <>
      <div className={cn(STATUS_BAR_H, "rounded-t-xl shrink-0", statusBarColor)} aria-hidden />
      <div className="flex-1 min-w-0 px-3 py-2 flex flex-col justify-center overflow-hidden">
        <div className="flex items-center gap-2 min-w-0 relative">
          {isCompleted ? (
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden />
          ) : (
            <TypeIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          )}
          <span className={cn("text-sm font-semibold text-white truncate flex-1", statusTitleClass)}>
            {task.title}
          </span>
          {priorityLabel && (
            <span className={cn("shrink-0 text-[10px] px-2 py-0.5 rounded font-medium", priorityBadgeClass)}>
              {priorityLabel}
            </span>
          )}
          {autoPriority && (
            <span className={cn("shrink-0 text-[10px] px-2 py-0.5 rounded font-medium", autoBadgeClass)}>
              {autoPriority}
            </span>
          )}
          {showRisk && (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-label="Retrasada" aria-hidden />
          )}
          {showScheduleRisk && (
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-label={scheduleRiskTooltip} aria-hidden />
          )}
        </div>
        {meta && (
          <span className="text-xs text-white/70 truncate block mt-1 opacity-70">{meta}</span>
        )}
        {timeRange && (
          <span className="text-xs text-white/60 tabular-nums block mt-0.5">{timeRange}</span>
        )}
      </div>
      <div className="shrink-0 flex justify-end items-center px-3 pb-2 pt-0">
        <span
          className="h-5 w-5 rounded bg-white/10 text-[10px] flex items-center justify-center text-white/80 flex-shrink-0"
          title={task.assignedTo ?? undefined}
        >
          {initials}
        </span>
      </div>
    </>
  )
})

const TASK_CARD_CONTAINER_CLASS =
  "rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] hover:border-purple-400/40 hover:shadow-[0_0_20px_-6px_rgba(139,92,246,0.2)] transition-all cursor-pointer overflow-hidden flex flex-col justify-between min-w-0"

export function getRangeForView(view: CalendarViewMode, date: Date): { start: Date; end: Date } {
  switch (view) {
    case "day":
      return { start: startOfDay(date), end: endOfDay(date) }
    case "week":
    case "timeline":
      return {
        start: startOfWeek(date, WEEK_STARTS_MONDAY),
        end: endOfWeek(date, WEEK_STARTS_MONDAY),
      }
    case "month":
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
      }
    case "year":
      return {
        start: startOfYear(date),
        end: endOfYear(date),
      }
    default:
      return { start: startOfWeek(date, WEEK_STARTS_MONDAY), end: endOfWeek(date, WEEK_STARTS_MONDAY) }
  }
}

function filterTasksInRange(
  tasks: MissionControlCalendarItem[],
  rangeStart: Date,
  rangeEnd: Date
): MissionControlCalendarItem[] {
  return tasks.filter((t) => isTaskInRange(t, rangeStart, rangeEnd))
}

// --- DnD: droppable day cell ---
const DroppableDay = memo(function DroppableDay({
  dayKey,
  children,
  className,
  style,
}: {
  dayKey: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const droppableData = useMemo(() => ({ dayKey }), [dayKey])
  const { setNodeRef, isOver } = useDroppable({
    id: DROPPABLE_DAY_PREFIX + dayKey,
    data: droppableData,
  })
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "transition-colors duration-150",
        isOver && "ring-1 ring-violet-500/60 bg-violet-500/10 rounded-lg",
        className
      )}
    >
      {children}
    </div>
  )
})

// --- DnD: draggable task (use in all views) ---
const DraggableTaskCard = memo(function DraggableTaskCard({
  task,
  sourceDayKey,
  onTaskClick,
  isDragging,
  children,
  className,
  style,
}: {
  task: MissionControlCalendarItem
  sourceDayKey: string | null
  onTaskClick: (task: MissionControlCalendarItem) => void
  isDragging: boolean
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const draggableData = useMemo(
    () => ({ task, sourceDayKey: sourceDayKey ?? undefined }),
    [task.id, task, sourceDayKey]
  )
  const { attributes, listeners, setNodeRef, isDragging: dndDragging } = useDraggable({
    id: task.id,
    data: draggableData,
  })
  const dragging = isDragging || dndDragging
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onTaskClick(task)
    },
    [onTaskClick, task]
  )
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        dragging && "opacity-40 pointer-events-none",
        className
      )}
      style={style}
    >
      <button
        type="button"
        onClick={handleClick}
        className="w-full h-full text-left min-w-0"
      >
        {children}
      </button>
    </div>
  )
})

/** Task preview for DragOverlay (matches premium calendar task card). */
export const CalendarTaskPreview = memo(function CalendarTaskPreview({
  task,
}: {
  task: MissionControlCalendarItem
}) {
  return (
    <div
      className={cn(
        TASK_CARD_CONTAINER_CLASS,
        task.kind === "REMINDER" && "border-dashed border-amber-500/40",
        getStatusContainerClasses(task.status ?? ""),
        getAutoPriorityBorderClass(task.autoPriority ?? null),
        "shadow-xl w-56 pointer-events-none"
      )}
    >
      <TaskCardContent task={task} />
    </div>
  )
})

// --- Day view: vertical hours timeline (with resize) ---
const DayView = memo(function DayView({
  date,
  tasks,
  onTaskClick,
  onDayClick,
  onDurationChange,
  activeDragId,
  onScrollProgress,
  className,
}: {
  date: Date
  tasks: MissionControlCalendarItem[]
  onTaskClick: (task: MissionControlCalendarItem) => void
  onDayClick?: (date: Date) => void
  onDurationChange?: (taskId: string, estimatedMinutes: number) => void
  activeDragId?: string | null
  onScrollProgress?: (ratio: number) => void
  className?: string
}) {
  const dayKey = format(date, "yyyy-MM-dd")
  const dayStart = startOfDay(date)
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => addHours(dayStart, i)), [dayStart])

  const [resizingTaskId, setResizingTaskId] = useState<string | null>(null)
  const [resizeStartY, setResizeStartY] = useState(0)
  const [resizeStartMinutes, setResizeStartMinutes] = useState(0)
  const [resizeCurrentMinutes, setResizeCurrentMinutes] = useState(0)

  const getResizeStartHandler = useCallback(
    (taskId: string, currentMinutes: number) => (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setResizingTaskId(taskId)
      setResizeStartY(e.clientY)
      setResizeStartMinutes(currentMinutes)
      setResizeCurrentMinutes(currentMinutes)
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    []
  )

  const handleResizeMove = useCallback(
    (e: PointerEvent) => {
      if (!resizingTaskId) return
      const deltaPx = e.clientY - resizeStartY
      const deltaMin = deltaPx * MINUTES_PER_PX
      const next = Math.min(
        MAX_DURATION_MIN,
        Math.max(MIN_DURATION_MIN, resizeStartMinutes + deltaMin)
      )
      setResizeCurrentMinutes(next)
    },
    [resizingTaskId, resizeStartY, resizeStartMinutes]
  )

  const handleResizeEnd = useCallback(() => {
    if (!resizingTaskId) return
    const rounded = roundDuration(resizeCurrentMinutes)
    onDurationChange?.(resizingTaskId, rounded)
    setResizingTaskId(null)
  }, [resizingTaskId, resizeCurrentMinutes, onDurationChange])

  useEffect(() => {
    if (!resizingTaskId) return
    document.addEventListener("pointermove", handleResizeMove)
    document.addEventListener("pointerup", handleResizeEnd)
    document.addEventListener("pointercancel", handleResizeEnd)
    return () => {
      document.removeEventListener("pointermove", handleResizeMove)
      document.removeEventListener("pointerup", handleResizeEnd)
      document.removeEventListener("pointercancel", handleResizeEnd)
    }
  }, [resizingTaskId, handleResizeMove, handleResizeEnd])

  const tasksWithLayout = useMemo(() => {
    const dayTasks = tasks
      .filter((task) => getTaskDayKey(task) === dayKey)
      .map((task) => {
        const tDate = getTaskTimeDate(task)
        if (!tDate) return null
        const startMinutes = tDate.getHours() * 60 + tDate.getMinutes()
        const duration = getTaskDurationMinutes(task)
        return {
          task,
          startMinutes,
          endMinutes: startMinutes + duration,
        }
      })
      .filter((x): x is NonNullable<typeof x> => x != null)
      .sort((a, b) => sortTasksByTimeAsc(a.task, b.task))
    return computeDayLayout(dayTasks)
  }, [tasks, dayKey])

  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollProgressThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastScrollRatioRef = useRef<number>(-1)
  useEffect(() => {
    const el = scrollRef.current
    const cb = onScrollProgress
    if (!el || !cb) return
    const handleScroll = () => {
      if (scrollProgressThrottleRef.current !== null) return
      scrollProgressThrottleRef.current = setTimeout(() => {
        scrollProgressThrottleRef.current = null
        const { scrollTop, scrollHeight, clientHeight } = el
        const maxScroll = Math.max(1, scrollHeight - clientHeight)
        const ratio = maxScroll > 0 ? scrollTop / maxScroll : 0
        if (ratio !== lastScrollRatioRef.current) {
          lastScrollRatioRef.current = ratio
          cb(ratio)
        }
      }, SCROLL_PROGRESS_THROTTLE_MS)
    }
    el.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      el.removeEventListener("scroll", handleScroll)
      if (scrollProgressThrottleRef.current !== null) {
        clearTimeout(scrollProgressThrottleRef.current)
        scrollProgressThrottleRef.current = null
      }
    }
  }, [onScrollProgress])

  const rowVirtualizer = useVirtualizer({
    count: HOUR_ROW_COUNT,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => HOUR_ROW_HEIGHT_PX,
    overscan: OVERSCAN_ROWS,
  })
  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalHeight = rowVirtualizer.getTotalSize()
  const visibleStart = virtualRows[0]?.start ?? 0
  const visibleEnd = virtualRows[virtualRows.length - 1]?.end ?? totalHeight
  const overscanPx = OVERSCAN_ROWS * HOUR_ROW_HEIGHT_PX
  const visibleTasks = useMemo(
    () =>
      tasksWithLayout.filter(
        ({ top, height }) =>
          top + height >= visibleStart - overscanPx && top <= visibleEnd + overscanPx
      ),
    [tasksWithLayout, visibleStart, visibleEnd, overscanPx]
  )

  return (
    <div className={cn("flex flex-col h-full min-h-0", className)}>
      <div className="shrink-0 px-3 py-2 border-b border-white/10">
        <h2 className="text-sm font-medium text-white">
          {format(date, "EEEE d MMMM yyyy", { locale: es })}
        </h2>
      </div>
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto">
        <DroppableDay dayKey={dayKey} className="relative min-h-full">
          <div className="relative" style={{ height: totalHeight }}>
            {virtualRows.map((virtualRow) => {
              const h = hours[virtualRow.index]
              return (
                <div
                  key={virtualRow.key}
                  className="absolute left-0 right-0 flex border-b border-white/5 py-0.5"
                  style={{
                    height: HOUR_ROW_HEIGHT_PX,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <span className="w-12 shrink-0 text-xs text-zinc-500 tabular-nums">
                    {format(h, "HH:mm")}
                  </span>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onDayClick?.(h)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onDayClick?.(h)}
                    className="flex-1 min-h-0 rounded border border-transparent hover:border-white/10 hover:bg-white/[0.02] transition-colors"
                    style={{ minHeight: HOUR_ROW_HEIGHT_PX - 4 }}
                  />
                </div>
              )
            })}
            <div
              className="absolute left-14 right-3 top-0 pointer-events-none"
              style={{ height: totalHeight }}
            >
              {visibleTasks.map(
                ({ task, top, height, columnIndex, maxCols }) => {
                  const isResizing = resizingTaskId === task.id
                  const displayMinutes = isResizing
                    ? resizeCurrentMinutes
                    : getTaskDurationMinutes(task)
                  const displayHeight = Math.max(
                    MIN_TASK_HEIGHT_PX,
                    displayMinutes * PIXELS_PER_MINUTE
                  )
                  const colPct = 100 / maxCols
                  const gapPct = 0.3
                  const widthPct = colPct - gapPct
                  const leftPct = columnIndex * colPct + gapPct / 2
                  return (
                    <div
                      key={task.id}
                      className="absolute flex flex-col rounded-lg overflow-hidden pointer-events-auto"
                      style={{
                        top: `${top}px`,
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        height: `${displayHeight}px`,
                        minHeight: MIN_TASK_HEIGHT_PX,
                      }}
                    >
                        <div
                          className={cn(
                            TASK_CARD_CONTAINER_CLASS,
                            task.kind === "REMINDER" && "border-dashed border-amber-500/40",
                            getStatusContainerClasses(task.status ?? ""),
                            getAutoPriorityBorderClass(task.autoPriority ?? null),
                            "flex-1 min-h-0 rounded-b-none flex flex-col h-full"
                          )}
                        >
                        <DraggableTaskCard
                          task={task}
                          sourceDayKey={dayKey}
                          onTaskClick={onTaskClick}
                          isDragging={activeDragId === task.id}
                          className="h-full w-full min-w-0 flex flex-col"
                        >
                          <TaskCardContent task={task} blockHeight={displayHeight} />
                        </DraggableTaskCard>
                      </div>
                      <div
                        role="separator"
                        aria-label="Redimensionar duración"
                        onPointerDown={getResizeStartHandler(task.id, getTaskDurationMinutes(task))}
                        className="h-1.5 shrink-0 cursor-ns-resize bg-white/20 hover:bg-violet-500/40 transition-colors rounded-b flex items-center justify-center touch-none pointer-events-auto"
                      >
                        <span className="w-8 border-t border-white/40 rounded-full" />
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          </div>
        </DroppableDay>
      </div>
    </div>
  )
})

// --- Week view: 7 columns Mon–Sun ---
const WeekView = memo(function WeekView({
  rangeStart,
  rangeEnd,
  tasks,
  onTaskClick,
  onDayClick,
  activeDragId,
  onScrollProgress,
  className,
}: {
  rangeStart: Date
  rangeEnd: Date
  tasks: MissionControlCalendarItem[]
  onTaskClick: (task: MissionControlCalendarItem) => void
  onDayClick?: (date: Date) => void
  activeDragId?: string | null
  onScrollProgress?: (ratio: number) => void
  className?: string
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const scrollProgressThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastScrollRatioRef = useRef<number>(-1)
  useEffect(() => {
    const el = scrollContainerRef.current
    const cb = onScrollProgress
    if (!el || !cb) return
    const handleScroll = () => {
      if (scrollProgressThrottleRef.current !== null) return
      scrollProgressThrottleRef.current = setTimeout(() => {
        scrollProgressThrottleRef.current = null
        const { scrollTop, scrollHeight, clientHeight } = el
        const maxScroll = Math.max(1, scrollHeight - clientHeight)
        const ratio = maxScroll > 0 ? scrollTop / maxScroll : 0
        if (ratio !== lastScrollRatioRef.current) {
          lastScrollRatioRef.current = ratio
          cb(ratio)
        }
      }, SCROLL_PROGRESS_THROTTLE_MS)
    }
    el.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      el.removeEventListener("scroll", handleScroll)
      if (scrollProgressThrottleRef.current !== null) {
        clearTimeout(scrollProgressThrottleRef.current)
        scrollProgressThrottleRef.current = null
      }
    }
  }, [onScrollProgress])

  const days = useMemo(
    () => eachDayOfInterval({ start: rangeStart, end: rangeEnd }),
    [rangeStart, rangeEnd]
  )

  // Auto scroll: earliest task minus 1h, or 08:00 if no tasks
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    let earliestMinutesFromMidnight: number
    if (tasks.length === 0) {
      earliestMinutesFromMidnight = 8 * 60 // 08:00
    } else {
      let minMin = 24 * 60
      for (const t of tasks) {
        const d = getTaskTimeDate(t)
        if (!d) continue
        const min = d.getHours() * 60 + d.getMinutes()
        if (min < minMin) minMin = min
      }
      earliestMinutesFromMidnight = minMin === 24 * 60 ? 8 * 60 : minMin
    }
    // Con tareas: 1h antes de la más temprana; sin tareas: 08:00 al tope
    const offsetMinutes = tasks.length === 0 ? 0 : 60
    const targetScrollTop = Math.max(
      0,
      (earliestMinutesFromMidnight - offsetMinutes) * PIXELS_PER_MINUTE
    )
    el.scrollTop = targetScrollTop
  }, [tasks, rangeStart, rangeEnd])

  const tasksByDay = useMemo(() => {
    const map = new Map<string, MissionControlCalendarItem[]>()
    for (const d of days) {
      const key = format(d, "yyyy-MM-dd")
      map.set(key, [])
    }
    for (const t of tasks) {
      const key = getTaskDayKey(t)
      if (!key || !map.has(key)) continue
      map.get(key)!.push(t)
    }
    map.forEach((list) => list.sort(sortTasksByTimeAsc))
    return map
  }, [tasks, days])

  const layoutByDay = useMemo(() => {
    const out = new Map<string, ReturnType<typeof computeDayLayout>>()
    for (const d of days) {
      const key = format(d, "yyyy-MM-dd")
      const dayTasks = (tasksByDay.get(key) ?? []).map((task) => {
        const tDate = getTaskTimeDate(task)
        if (!tDate) return null
        const startMinutes = tDate.getHours() * 60 + tDate.getMinutes()
        const duration = getTaskDurationMinutes(task)
        return { task, startMinutes, endMinutes: startMinutes + duration }
      })
      const valid = dayTasks.filter((x): x is NonNullable<typeof x> => x != null)
      out.set(key, computeDayLayout(valid))
    }
    return out
  }, [days, tasksByDay])

  const today = new Date()
  const weekTotalHeight = HOUR_ROW_COUNT * HOUR_ROW_HEIGHT_PX

  const rowVirtualizer = useVirtualizer({
    count: HOUR_ROW_COUNT,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => HOUR_ROW_HEIGHT_PX,
    overscan: OVERSCAN_ROWS,
  })
  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalHeight = rowVirtualizer.getTotalSize()
  const visibleStart = virtualRows[0]?.start ?? 0
  const visibleEnd = virtualRows[virtualRows.length - 1]?.end ?? totalHeight
  const overscanPx = OVERSCAN_ROWS * HOUR_ROW_HEIGHT_PX
  const visibleLayoutByDay = useMemo(() => {
    const out = new Map<string, ReturnType<typeof computeDayLayout>>()
    layoutByDay.forEach((layout, dayKey) => {
      out.set(
        dayKey,
        layout.filter(
          ({ top, height }) =>
            top + height >= visibleStart - overscanPx && top <= visibleEnd + overscanPx
        )
      )
    })
    return out
  }, [layoutByDay, visibleStart, visibleEnd, overscanPx])

  return (
    <div className={cn("flex flex-col h-full min-h-0", className)}>
      {/* Sticky header: hour scale label + Mon–Sun */}
      <div className="grid grid-cols-8 shrink-0 sticky top-0 z-10 border-b border-white/10 bg-gradient-to-b from-[#1E1F2B] to-[#242538]">
        <div className="border-r border-white/10 px-2 py-3 w-14 flex items-center justify-center">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Hora</span>
        </div>
        {days.map((d, i) => {
          const isToday = isSameDay(d, today)
          return (
            <div
              key={d.getTime()}
              className={cn(
                "border-l border-white/10 px-2 py-3 text-center min-w-0",
                i % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
              )}
            >
              <span className="text-xs text-zinc-500 block truncate">
                {format(d, "EEE", { locale: es })}
              </span>
              <span
                className={cn(
                  "text-base font-semibold tabular-nums block mt-0.5",
                  isToday ? "text-violet-400" : "text-white"
                )}
              >
                {format(d, "d")}
              </span>
            </div>
          )
        })}
      </div>
      {/* Body: virtualized hour rows + 7 day columns; only visible tasks rendered */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto grid grid-cols-8"
        style={{ minHeight: weekTotalHeight }}
      >
        <div
          className="sticky left-0 z-[1] shrink-0 border-r border-white/10 bg-[#1E1F2B] relative"
          style={{ height: totalHeight }}
        >
          {virtualRows.map((virtualRow) => (
            <div
              key={virtualRow.key}
              className="absolute left-0 right-0 flex items-center border-b border-white/5"
              style={{
                height: HOUR_ROW_HEIGHT_PX,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <span className="w-14 shrink-0 pl-1 text-xs text-zinc-500 tabular-nums">
                {format(addHours(rangeStart, virtualRow.index), "HH:mm")}
              </span>
            </div>
          ))}
        </div>
        {days.map((d, i) => {
          const key = format(d, "yyyy-MM-dd")
          const visibleLayout = visibleLayoutByDay.get(key) ?? []
          const isToday = isSameDay(d, today)
          return (
            <DroppableDay
              key={key}
              dayKey={key}
              className={cn(
                "min-h-0 overflow-hidden border-l border-white/10 first:border-l-0 relative",
                i % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
              )}
              style={{ height: totalHeight }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => onDayClick?.(d)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onDayClick?.(d)}
                className={cn(
                  "absolute inset-0 cursor-pointer transition-colors z-0",
                  "hover:bg-white/[0.02]",
                  isToday && "ring-1 ring-purple-500/30 ring-inset"
                )}
                aria-label={format(d, "d MMM", { locale: es })}
              />
              {/* Hour grid: single full-height block (lines align with virtualized time column) */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ height: totalHeight }}
              />
              {/* Task blocks: only those in visible vertical range */}
              <div
                className="absolute inset-0 p-1 z-[1] pointer-events-none"
                style={{ height: totalHeight }}
              >
                {visibleLayout.map(
                  ({ task, top, height, columnIndex, maxCols }) => {
                    const colPct = 100 / maxCols
                    const gapPct = 0.3
                    const widthPct = colPct - gapPct
                    const leftPct = columnIndex * colPct + gapPct / 2
                    return (
                      <div
                        key={task.id}
                        className="absolute flex flex-col rounded-lg overflow-hidden pointer-events-auto z-[1]"
                        style={{
                          top: `${top}px`,
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          height: `${height}px`,
                          minHeight: MIN_TASK_HEIGHT_PX,
                        }}
                      >
                        <div
                          className={cn(
                            TASK_CARD_CONTAINER_CLASS,
                            task.kind === "REMINDER" && "border-dashed border-amber-500/40",
                            getStatusContainerClasses(task.status ?? ""),
                            getAutoPriorityBorderClass(task.autoPriority ?? null),
                            "flex-1 min-h-0 flex flex-col h-full rounded-b-xl"
                          )}
                        >
                          <DraggableTaskCard
                            task={task}
                            sourceDayKey={key}
                            onTaskClick={onTaskClick}
                            isDragging={activeDragId === task.id}
                            className="h-full w-full min-w-0 flex flex-col"
                          >
                            <TaskCardContent task={task} blockHeight={height} />
                          </DraggableTaskCard>
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            </DroppableDay>
          )
        })}
      </div>
    </div>
  )
})

// --- Month view: classic grid 5–6 rows ---
const MonthView = memo(function MonthView({
  monthStart,
  selectedDate,
  tasks,
  onTaskClick,
  onDayClick,
  activeDragId,
  className,
}: {
  monthStart: Date
  selectedDate?: Date
  tasks: MissionControlCalendarItem[]
  onTaskClick: (task: MissionControlCalendarItem) => void
  onDayClick?: (date: Date) => void
  activeDragId?: string | null
  className?: string
}) {
  const calendarStart = startOfWeek(startOfMonth(monthStart), WEEK_STARTS_MONDAY)
  const calendarEnd = endOfWeek(endOfMonth(monthStart), WEEK_STARTS_MONDAY)
  const weeks = useMemo(() => {
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    const result: Date[][] = []
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7))
    }
    return result
  }, [calendarStart, calendarEnd])

  const tasksByDay = useMemo(() => {
    const map = new Map<string, MissionControlCalendarItem[]>()
    for (const row of weeks) {
      for (const d of row) {
        map.set(format(d, "yyyy-MM-dd"), [])
      }
    }
    for (const t of tasks) {
      const key = getTaskDayKey(t)
      if (!key || !map.has(key)) continue
      map.get(key)!.push(t)
    }
    map.forEach((list) => list.sort(sortTasksByTimeAsc))
    return map
  }, [tasks, weeks])

  const MONTH_DAY_VISIBLE = 3

  const weekDayLabels = useMemo(
    () =>
      eachDayOfInterval({
        start: calendarStart,
        end: addDays(calendarStart, 6),
      }).map((d) => format(d, "EEE", { locale: es })),
    [calendarStart]
  )

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="grid grid-cols-7 gap-px shrink-0 border-b border-white/10 bg-white/5">
        {weekDayLabels.map((label) => (
          <div
            key={label}
            className="px-1 py-1.5 text-center text-xs font-medium text-zinc-500 bg-white/[0.02]"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col">
          {weeks.map((week, wi) => (
            <div
              key={wi}
              className="flex-1 min-h-0 grid grid-cols-7 gap-px border-b border-white/5 bg-white/5"
            >
              {week.map((d) => {
                const key = format(d, "yyyy-MM-dd")
                const dayTasks = tasksByDay.get(key) ?? []
                const inMonth = isSameMonth(d, monthStart)
                const isToday = isSameDay(d, new Date())
                const isSelected = selectedDate && isSameDay(d, selectedDate)
                return (
                  <DroppableDay
                    key={key}
                    dayKey={key}
                    className={cn(
                      "min-h-0 h-full flex flex-col border-r border-white/5 last:border-r-0 cursor-pointer transition-colors",
                      inMonth ? "bg-white/[0.02] hover:bg-white/[0.04]" : "bg-white/[0.01]",
                      isToday && "ring-1 ring-violet-500/50 ring-inset",
                      isSelected && "ring-1 ring-violet-400 ring-inset bg-violet-500/10"
                    )}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => onDayClick?.(d)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onDayClick?.(d)}
                      className="h-full min-h-0 flex flex-col p-1.5 min-w-0"
                    >
                      <span
                        className={cn(
                          "text-xs tabular-nums shrink-0",
                          inMonth ? (isToday ? "text-violet-400 font-semibold" : isSelected ? "text-violet-300 font-medium" : "text-zinc-400") : "text-zinc-600"
                        )}
                      >
                        {format(d, "d")}
                      </span>
                      <div className="flex-1 min-h-0 flex flex-col gap-0.5 overflow-y-auto mt-0.5">
                        {dayTasks.slice(0, MONTH_DAY_VISIBLE).map((task) => (
                          <div key={task.id} className={cn(TASK_CARD_CONTAINER_CLASS, task.kind === "REMINDER" && "border-dashed border-amber-500/40", getStatusContainerClasses(task.status ?? ""), getAutoPriorityBorderClass(task.autoPriority ?? null), "shrink-0 w-full")}>
                            <DraggableTaskCard
                              task={task}
                              sourceDayKey={key}
                              onTaskClick={onTaskClick}
                              isDragging={activeDragId === task.id}
                              className="w-full min-w-0 flex flex-col"
                            >
                              <TaskCardContent task={task} compact />
                            </DraggableTaskCard>
                          </div>
                        ))}
                        {dayTasks.length > MONTH_DAY_VISIBLE && (
                          <span className="text-[10px] text-zinc-500 px-1 shrink-0">
                            +{dayTasks.length - MONTH_DAY_VISIBLE} más
                          </span>
                        )}
                      </div>
                    </div>
                  </DroppableDay>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

const CALENDAR_VIEW_DAY_CLASS = "h-full"
const CALENDAR_VIEW_WEEK_CLASS = "h-full"
const CALENDAR_VIEW_MONTH_CLASS = "h-full"
const CALENDAR_VIEW_YEAR_CLASS = "h-full"

const YEAR_MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

const YearView = memo(function YearView({
  yearDate,
  onMonthClick,
  className,
}: {
  yearDate: Date
  onMonthClick?: (monthStart: Date) => void
  className?: string
}) {
  const year = yearDate.getFullYear()
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(year, i, 1)
      return { date: d, label: YEAR_MONTH_NAMES[i] }
    })
  }, [year])

  return (
    <div className={cn("flex flex-col h-full min-h-0", className)}>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 p-3 overflow-y-auto min-h-0">
        {months.map(({ date, label }) => (
          <button
            key={label}
            type="button"
            onClick={() => onMonthClick?.(date)}
            className={cn(
              "rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20",
              "py-4 px-3 text-center transition-colors"
            )}
          >
            <span className="text-sm font-medium text-white">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
})

function CalendarViewInner({
  view,
  currentDate,
  tasks,
  onTaskClick,
  onDayClick,
  onMonthClick,
  onDurationChange,
  activeDragId,
  onScrollProgress,
  className,
}: CalendarViewProps) {
  const effectiveView = view === "timeline" ? "week" : view
  const currentDateTs = currentDate.getTime()
  const range = useMemo(
    () => getRangeForView(effectiveView, currentDate),
    [effectiveView, currentDateTs]
  )
  const { start: rangeStart, end: rangeEnd } = range
  const filteredTasks = useMemo(
    () => filterTasksInRange(tasks, rangeStart, rangeEnd),
    [tasks, rangeStart.getTime(), rangeEnd.getTime()]
  )
  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDateTs])

  return (
    <div className={cn("h-full w-full flex flex-col min-h-0", className)}>
      {effectiveView === "day" && (
        <DayView
          date={currentDate}
          tasks={filteredTasks}
          onTaskClick={onTaskClick}
          onDayClick={onDayClick}
          onDurationChange={onDurationChange}
          activeDragId={activeDragId}
          onScrollProgress={onScrollProgress}
          className={CALENDAR_VIEW_DAY_CLASS}
        />
      )}
      {effectiveView === "week" && (
        <WeekView
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          tasks={filteredTasks}
          onTaskClick={onTaskClick}
          onDayClick={onDayClick}
          activeDragId={activeDragId}
          onScrollProgress={onScrollProgress}
          className={CALENDAR_VIEW_WEEK_CLASS}
        />
      )}
      {effectiveView === "month" && (
        <MonthView
          monthStart={monthStart}
          selectedDate={currentDate}
          tasks={filteredTasks}
          onTaskClick={onTaskClick}
          onDayClick={onDayClick}
          activeDragId={activeDragId}
          className={CALENDAR_VIEW_MONTH_CLASS}
        />
      )}
      {effectiveView === "year" && (
        <YearView
          yearDate={currentDate}
          onMonthClick={onMonthClick}
          className={CALENDAR_VIEW_YEAR_CLASS}
        />
      )}
    </div>
  )
}

export const CalendarView = memo(CalendarViewInner)

// Helpers for control bar: navigate and format label
export function getCalendarLabel(view: CalendarViewMode, date: Date): string {
  switch (view) {
    case "day":
      return format(date, "d MMM yyyy", { locale: es })
    case "week":
    case "timeline": {
      const start = startOfWeek(date, WEEK_STARTS_MONDAY)
      const end = endOfWeek(date, WEEK_STARTS_MONDAY)
      return `${format(start, "d MMM", { locale: es })} – ${format(end, "d MMM yyyy", { locale: es })}`
    }
    case "month":
      return format(date, "MMMM yyyy", { locale: es })
    default:
      return format(date, "d MMM yyyy", { locale: es })
  }
}

export function getNextDate(view: CalendarViewMode, date: Date): Date {
  switch (view) {
    case "day":
      return addDays(date, 1)
    case "week":
    case "timeline":
      return addWeeks(date, 1)
    case "month":
      return addMonths(date, 1)
    case "year":
      return addYears(date, 1)
    default:
      return addWeeks(date, 1)
  }
}

export function getPrevDate(view: CalendarViewMode, date: Date): Date {
  switch (view) {
    case "day":
      return addDays(date, -1)
    case "week":
    case "timeline":
      return subWeeks(date, 1)
    case "month":
      return subMonths(date, 1)
    case "year":
      return subYears(date, 1)
    default:
      return subWeeks(date, 1)
  }
}
