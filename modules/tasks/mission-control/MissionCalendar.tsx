"use client"

import { useMemo, useState, useCallback, useEffect, useRef, memo } from "react"
import { useRouter } from "next/navigation"
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import { MoreHorizontal, Calendar, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { TaskDialog } from "@/components/tasks/TaskDialog"
import { MissionTaskPanel } from "./MissionTaskPanel"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { MissionCalendarControlBar } from "./MissionCalendarControlBar"
import CalendarView from "./ClientCalendar"
import {
  CalendarTaskPreview,
  DROPPABLE_DAY_PREFIX,
  PIXELS_PER_MINUTE,
  getCalendarLabel,
  getNextDate,
  getPrevDate,
  getRangeForView,
  PREFETCH_SCROLL_RATIO,
  type CalendarViewMode,
} from "./CalendarView"
import type { MissionControlTask, MissionControlCalendarItem } from "./types"
import type { CalendarItem } from "@/modules/calendar/types/calendar-item"
import { displayItemToCalendarItem } from "./calendar-item-utils"
import { calendarEventStore } from "@/modules/tasks/store/calendar-event-store"
import { format } from "date-fns"

/** Convierte CalendarItem (GET /api/calendar/events) a MissionControlCalendarItem. */
function calendarItemToDisplayItem(ev: CalendarItem): MissionControlCalendarItem {
  const start = new Date(ev.start)
  const end = new Date(ev.end)
  const estimatedMinutes = Math.round((end.getTime() - start.getTime()) / 60_000)
  const base: MissionControlTask = {
    id: ev.id,
    title: ev.title,
    dueDate: ev.start,
    startAt: ev.start,
    estimatedMinutes: estimatedMinutes > 0 ? estimatedMinutes : 30,
    status: ev.status,
    priority: ev.priority ?? "MEDIUM",
    priorityScore: ev.priorityScore ?? null,
    autoPriority: ev.autoPriority ?? null,
    risk: ev.risk ?? null,
    assignedTo: ev.assignedTo ?? null,
    clientName: ev.clientName ?? null,
    leadName: ev.leadName ?? null,
  }
  return { ...base, kind: ev.kind }
}

const calendarContainerClass =
  "h-full flex flex-col min-h-0"
const calendarViewClassName = "h-full"

function getDayKey(task: MissionControlTask): string | null {
  const date = task.startAt ? task.startAt : task.dueDate
  if (!date) return null
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
}

function formatDayLabel(dayKey: string): string {
  const d = new Date(dayKey + "T12:00:00")
  const today = new Date()
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  const label = d.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
  return isToday ? `Hoy · ${label}` : label
}

function formatDateRangeLabel(dayKeys: string[]): string {
  if (dayKeys.length === 0) return "—"
  const first = new Date(dayKeys[0] + "T12:00:00")
  const last = new Date(dayKeys[dayKeys.length - 1] + "T12:00:00")
  const sameMonth = first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()
  if (sameMonth) {
    return `${first.toLocaleDateString("es-ES", { month: "short", day: "numeric" })}–${last.toLocaleDateString("es-ES", { day: "numeric", year: "numeric" })}`
  }
  return `${first.toLocaleDateString("es-ES", { month: "short", day: "numeric" })} – ${last.toLocaleDateString("es-ES", { month: "short", day: "numeric", year: "numeric" })}`
}

async function patchTask(
  taskId: string,
  body: {
    dueDate?: string
    startAt?: string
    endAt?: string
    assignedToId?: string | null
    estimatedMinutes?: number | null
  }
): Promise<boolean> {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.ok
}

/** Minutes from midnight (0–1440) from task start or due date. */
function getStartMinutesFromMidnight(task: MissionControlTask): number {
  const iso = task.startAt ?? task.dueDate
  if (!iso) return 0
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}

/** Build startAt/endAt for a day from minutes-from-midnight and duration. */
function buildStartEndForDay(
  dayKey: string,
  minutesFromMidnight: number,
  durationMinutes: number
): { startAt: string; endAt: string } {
  const start = new Date(dayKey + "T00:00:00")
  start.setMinutes(start.getMinutes() + minutesFromMidnight)
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000)
  return { startAt: start.toISOString(), endAt: end.toISOString() }
}

function buildTasksByDay(tasks: MissionControlTask[]) {
  const byDay = new Map<string, MissionControlTask[]>()
  const keys: string[] = []
  const seen = new Set<string>()
  for (const t of tasks) {
    const key = getDayKey(t)
    if (!key) continue
    if (!byDay.has(key)) {
      byDay.set(key, [])
      if (!seen.has(key)) {
        seen.add(key)
        keys.push(key)
      }
    }
    byDay.get(key)!.push(t)
  }
  keys.sort()
  return { dayKeys: keys, tasksByDay: byDay }
}

function DroppableDayColumn({
  dayKey,
  isOver,
  label,
  onDayClick,
  children,
}: {
  dayKey: string
  isOver: boolean
  label: string
  onDayClick: () => void
  children: React.ReactNode
}) {
  const { setNodeRef, isOver: isOverDnd } = useDroppable({
    id: DAY_DROPPABLE_PREFIX + dayKey,
    data: { dayKey },
  })
  const over = isOver || isOverDnd

  return (
    <div
      ref={setNodeRef}
      role="button"
      tabIndex={0}
      onClick={onDayClick}
      onKeyDown={(e) =>
        e.key === "Enter" || e.key === " " ? onDayClick() : null
      }
      className={cn(
        "rounded-xl border p-4 flex flex-col gap-3 min-h-[120px] cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-transparent",
        over
          ? "border-violet-500 bg-violet-500/15"
          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5" />
        {label}
      </p>
      {over && (
        <p className="text-xs text-violet-300 font-medium animate-in fade-in duration-150">
          Soltar aquí · {label}
        </p>
      )}
      <div className="flex flex-col gap-2 flex-1">{children}</div>
    </div>
  )
}

function DraggableTaskCard({
  task,
  dayKey,
  isDragging,
  isSaving,
  onOpenPanel,
  onOpenMove,
}: {
  task: MissionControlTask
  dayKey: string
  isDragging: boolean
  isSaving: boolean
  onOpenPanel: (t: MissionControlTask) => void
  onOpenMove: (t: MissionControlTask) => void
}) {
  const { attributes, listeners, setNodeRef, isDragging: isDraggingState } =
    useDraggable({
      id: task.id,
      data: { task, sourceDayKey: dayKey },
    })

  const dragging = isDragging || isDraggingState

  return (
    <div
      ref={setNodeRef}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "group rounded-xl border border-white/10 px-3 py-2.5 text-white transition-all flex items-start justify-between gap-2",
        dragging && "opacity-50 border-violet-400",
        !dragging &&
          "bg-white/[0.03] hover:bg-white/[0.06]",
        isSaving && "opacity-80"
      )}
    >
      <button
        type="button"
        className="flex-1 text-left min-w-0 cursor-grab active:cursor-grabbing"
        {...listeners}
        {...attributes}
        onClick={(e) => {
          e.preventDefault()
          if (!isSaving) onOpenPanel(task)
        }}
      >
        <p className="text-sm font-medium truncate" title={task.title}>
          {task.title}
        </p>
        {task.startAt && (
          <p className="text-xs text-violet-200/90 mt-0.5">
            {formatTime(task.startAt)}
          </p>
        )}
      </button>
      {isSaving ? (
        <Loader2 className="w-4 h-4 shrink-0 animate-spin text-violet-300" />
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 opacity-70 hover:opacity-100 text-violet-200 hover:text-white hover:bg-violet-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
              <span className="sr-only">Menú</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-zinc-900 border-zinc-700 text-white"
          >
            <DropdownMenuItem
              className="text-zinc-200 focus:bg-zinc-800 focus:text-white"
              onSelect={(e) => {
                e.preventDefault()
                onOpenMove(task)
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Mover a…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

function TaskCardPreview({ task }: { task: MissionControlTask }) {
  return (
    <div className="rounded-lg border-2 border-violet-400 bg-violet-500/20 shadow-2xl shadow-black/40 px-3 py-2.5 text-white opacity-95 backdrop-blur-sm">
      <p className="text-sm font-medium truncate max-w-[200px]">{task.title}</p>
      {task.startAt && (
        <p className="text-xs text-violet-200/90 mt-0.5">
          {formatTime(task.startAt)}
        </p>
      )}
    </div>
  )
}

async function patchReminder(
  reminderId: string,
  body: { status?: string; start?: string; end?: string }
): Promise<boolean> {
  const res = await fetch(`/api/reminders/${reminderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.ok
}

export function MissionCalendar({
  events = [],
  initialRange,
  onRefresh,
  className,
  hideToolbar = false,
  controlledView,
  controlledCurrentDate,
  onViewChange: onViewChangeProp,
  onPrev: onPrevProp,
  onNext: onNextProp,
  onToday: onTodayProp,
  dateRangeLabel: dateRangeLabelProp,
}: {
  events?: CalendarItem[]
  initialRange?: { from: string; to: string }
  onRefresh?: () => void
  className?: string
  hideToolbar?: boolean
  controlledView?: CalendarViewMode
  controlledCurrentDate?: Date
  onViewChange?: (v: CalendarViewMode) => void
  onPrev?: () => void
  onNext?: () => void
  onToday?: () => void
  dateRangeLabel?: string
}) {
  const router = useRouter()
  const refresh = useCallback(() => {
    onRefresh?.()
    router.refresh()
  }, [onRefresh, router])

  const initialItems = useMemo(
    () => events.map(calendarItemToDisplayItem),
    [events]
  )

  const [internalDate, setInternalDate] = useState(() => new Date())
  const [internalView, setInternalView] = useState<CalendarViewMode>("week")
  const isControlled =
    hideToolbar &&
    controlledView !== undefined &&
    controlledCurrentDate !== undefined
  const view = isControlled ? controlledView : internalView
  const currentDate = isControlled ? controlledCurrentDate : internalDate
  const setCurrentDate = useCallback(
    (arg: Date | ((d: Date) => Date)) => {
      if (isControlled) return
      setInternalDate(arg)
    },
    [isControlled]
  )
  const setView = useCallback(
    (v: CalendarViewMode) => {
      if (isControlled && onViewChangeProp) onViewChangeProp(v)
      else setInternalView(v)
    },
    [isControlled, onViewChangeProp]
  )

  const rangeCacheRef = useRef<Map<string, MissionControlCalendarItem[]>>(new Map())
  const initialRangeKeyRef = useRef<string | null>(null)
  const storeSeededRef = useRef(false)
  const prefetchingKeysRef = useRef<Set<string>>(new Set())
  const [displayedTasks, setDisplayedTasks] = useState<MissionControlCalendarItem[]>(initialItems)

  // Seed calendar store with initial server events so optimistic updates and other consumers stay in sync
  useEffect(() => {
    if (!initialRange || !events.length || storeSeededRef.current) return
    storeSeededRef.current = true
    calendarEventStore.getState().addRange(
      { start: new Date(initialRange.from), end: new Date(initialRange.to) },
      events
    )
  }, [initialRange?.from, initialRange?.to, events])
  const [loadingRange, setLoadingRange] = useState(false)
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createPreselectedDate, setCreatePreselectedDate] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<MissionControlTask | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [moveTask, setMoveTask] = useState<MissionControlTask | null>(null)
  const [moveDate, setMoveDate] = useState("")
  const [moving, setMoving] = useState(false)

  const handlePrev = useCallback(
    () => (isControlled && onPrevProp ? onPrevProp() : setCurrentDate((d) => getPrevDate(view, d))),
    [isControlled, onPrevProp, view, setCurrentDate]
  )
  const handleNext = useCallback(
    () => (isControlled && onNextProp ? onNextProp() : setCurrentDate((d) => getNextDate(view, d))),
    [isControlled, onNextProp, view, setCurrentDate]
  )
  const handleToday = useCallback(
    () => (isControlled && onTodayProp ? onTodayProp() : setCurrentDate(new Date())),
    [isControlled, onTodayProp, setCurrentDate]
  )
  const dateRangeLabel =
    isControlled && dateRangeLabelProp != null ? dateRangeLabelProp : getCalendarLabel(view, currentDate)

  const currentRangeKey = useMemo(() => {
    const { start, end } = getRangeForView(view, currentDate)
    return `${start.toISOString()}_${end.toISOString()}`
  }, [view, currentDate])

  useEffect(() => {
    if (!initialRange) return
    const key = `${initialRange.from}_${initialRange.to}`
    rangeCacheRef.current.set(key, initialItems)
    initialRangeKeyRef.current = key
    const { start, end } = getRangeForView(view, currentDate)
    const initialStartMs = new Date(initialRange.from).getTime()
    const initialEndMs = new Date(initialRange.to).getTime()
    const rangeStartMs = start.getTime()
    const rangeEndMs = end.getTime()
    const visibleInInitial = rangeStartMs >= initialStartMs && rangeEndMs <= initialEndMs
    if (visibleInInitial) {
      const inRange = (t: MissionControlCalendarItem) => {
        const iso = t.startAt ?? t.dueDate
        if (!iso) return false
        const ms = new Date(iso).getTime()
        return ms >= rangeStartMs && ms <= rangeEndMs
      }
      const filtered = initialItems.filter(inRange)
      rangeCacheRef.current.set(currentRangeKey, filtered)
      setDisplayedTasks(filtered)
    }
  }, [initialRange?.from, initialRange?.to, initialItems, currentRangeKey, view, currentDate])

  useEffect(() => {
    const cached = rangeCacheRef.current.get(currentRangeKey)
    if (cached !== undefined) {
      setDisplayedTasks(cached)
      return
    }
    const { start, end } = getRangeForView(view, currentDate)
    setLoadingRange(true)
    const from = start.toISOString()
    const to = end.toISOString()
    fetch(`/api/calendar/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Fetch failed"))))
      .then((items: CalendarItem[]) => {
        const mapped = items.map(calendarItemToDisplayItem)
        rangeCacheRef.current.set(currentRangeKey, mapped)
        setDisplayedTasks(mapped)
      })
      .catch(() => {})
      .finally(() => setLoadingRange(false))
  }, [currentRangeKey, view, currentDate])

  const handleScrollProgress = useCallback(
    (ratio: number) => {
      if (ratio < PREFETCH_SCROLL_RATIO) return
      const nextDate = getNextDate(view, currentDate)
      const { start, end } = getRangeForView(view, nextDate)
      const nextRangeKey = `${start.toISOString()}_${end.toISOString()}`
      if (rangeCacheRef.current.has(nextRangeKey) || prefetchingKeysRef.current.has(nextRangeKey))
        return
      prefetchingKeysRef.current.add(nextRangeKey)
      const from = start.toISOString()
      const to = end.toISOString()
      fetch(`/api/calendar/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Fetch failed"))))
        .then((items: CalendarItem[]) => {
          const mapped = items.map(calendarItemToDisplayItem)
          rangeCacheRef.current.set(nextRangeKey, mapped)
          calendarEventStore.getState().addRange({ start, end }, items)
        })
        .catch(() => {})
        .finally(() => {
          prefetchingKeysRef.current.delete(nextRangeKey)
        })
    },
    [view, currentDate]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  )

  const activeTask = useMemo(() => {
    if (!activeId) return null
    return displayedTasks.find((t) => t.id === activeId) ?? null
  }, [activeId, displayedTasks])

  const createTaskPrefill = useMemo(() => {
    if (!createPreselectedDate) return undefined
    return { dueDate: createPreselectedDate + "T12:00:00.000Z" }
  }, [createPreselectedDate])

  const handleDayClick = useCallback((dayKey: string) => {
    setCreatePreselectedDate(dayKey)
    setCreateOpen(true)
  }, [])

  const handleCreateSuccess = useCallback(() => {
    setCreateOpen(false)
    setCreatePreselectedDate(null)
    refresh()
  }, [refresh])

  const handleOpenMove = useCallback((task: MissionControlTask) => {
    setMoveTask(task)
    setMoveDate(
      task.dueDate
        ? new Date(task.dueDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10)
    )
  }, [])

  const handleConfirmMove = useCallback(async () => {
    if (!moveTask || !moveDate) return
    const startAt = new Date(moveDate + "T12:00:00.000Z").toISOString()
    const dur = (moveTask.estimatedMinutes ?? 30) * 60 * 1000
    const endAt = new Date(new Date(startAt).getTime() + dur).toISOString()
    const optimisticTask = { ...moveTask, dueDate: startAt, startAt }
    const optimisticEvent = displayItemToCalendarItem(optimisticTask, {
      start: startAt,
      end: endAt,
    })
    calendarEventStore.getState().updateEvent(optimisticEvent)
    setDisplayedTasks((prev) =>
      prev.map((t) => (t.id === moveTask.id ? optimisticTask : t))
    )
    setMoving(true)
    try {
      const ok =
        moveTask.kind === "REMINDER"
          ? await patchReminder(moveTask.id, { start: startAt, end: endAt })
          : await patchTask(moveTask.id, { dueDate: startAt })
      if (ok) {
        toast.success(moveTask.kind === "REMINDER" ? "Recordatorio movido" : "Tarea movida")
        setMoveTask(null)
      } else {
        toast.error("Error al mover")
        calendarEventStore.getState().updateEvent(displayItemToCalendarItem(moveTask))
        setDisplayedTasks((prev) =>
          prev.map((t) => (t.id === moveTask.id ? moveTask : t))
        )
      }
    } catch {
      toast.error("Error al mover")
      calendarEventStore.getState().updateEvent(displayItemToCalendarItem(moveTask))
      setDisplayedTasks((prev) =>
        prev.map((t) => (t.id === moveTask.id ? moveTask : t))
      )
    } finally {
      setMoving(false)
    }
  }, [moveTask, moveDate])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over?.id ?? null)
  }, [])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over, delta } = event
      setActiveId(null)
      setOverId(null)

      if (!over || typeof over.id !== "string") return
      if (!over.id.startsWith(DROPPABLE_DAY_PREFIX)) return

      const targetDayKey = over.id.slice(DROPPABLE_DAY_PREFIX.length)
      const activeData = active.data.current as
        | { task: MissionControlCalendarItem; sourceDayKey?: string }
        | undefined
      if (!activeData?.task) return

      const taskId = activeData.task.id
      const previousTask = displayedTasks.find((t) => t.id === taskId)
      if (!previousTask) return

      const isSameDay = activeData.sourceDayKey === targetDayKey
      const isReminder = previousTask.kind === "REMINDER"

      if (isSameDay && delta.y !== 0) {
        const task = previousTask
        const durationMinutes = task.estimatedMinutes ?? 30
        const startMinutes = getStartMinutesFromMidnight(task)
        const currentTopPx = startMinutes * PIXELS_PER_MINUTE
        const taskHeightPx = Math.max(24, durationMinutes * PIXELS_PER_MINUTE)
        const maxTopPx = 24 * 60 * PIXELS_PER_MINUTE - taskHeightPx
        let newTopPx = currentTopPx + delta.y
        newTopPx = Math.max(0, Math.min(maxTopPx, newTopPx))
        const newMinutesFromMidnight = Math.round(newTopPx / PIXELS_PER_MINUTE)
        const clampedMinutes = Math.max(0, Math.min(24 * 60 - durationMinutes, newMinutesFromMidnight))
        const { startAt: newStartAt, endAt: newEndAt } = buildStartEndForDay(
          targetDayKey,
          clampedMinutes,
          durationMinutes
        )
        const optimisticTask = { ...task, startAt: newStartAt }
        const optimisticEvent = displayItemToCalendarItem(optimisticTask, {
          start: newStartAt,
          end: newEndAt,
        })
        calendarEventStore.getState().updateEvent(optimisticEvent)
        setDisplayedTasks((prev) =>
          prev.map((t) => (t.id === taskId ? optimisticTask : t))
        )
        setSavingTaskId(taskId)
        try {
          const ok = isReminder
            ? await patchReminder(taskId, { start: newStartAt, end: newEndAt })
            : await patchTask(taskId, { startAt: newStartAt, endAt: newEndAt })
          if (!ok) {
            toast.error("Error al mover")
            calendarEventStore.getState().updateEvent(displayItemToCalendarItem(previousTask))
            setDisplayedTasks((prev) =>
              prev.map((t) => (t.id === taskId ? previousTask : t))
            )
          }
        } catch {
          toast.error("Error al mover")
          calendarEventStore.getState().updateEvent(displayItemToCalendarItem(previousTask))
          setDisplayedTasks((prev) =>
            prev.map((t) => (t.id === taskId ? previousTask : t))
          )
        } finally {
          setSavingTaskId(null)
        }
        return
      }

      if (isSameDay) return

      const newDueDate = new Date(targetDayKey + "T12:00:00.000Z").toISOString()
      const durationMinutes = previousTask.estimatedMinutes ?? 30
      const newEndAt = new Date(new Date(newDueDate).getTime() + durationMinutes * 60 * 1000).toISOString()
      const optimisticTask = {
        ...previousTask,
        dueDate: newDueDate,
        startAt: newDueDate,
      }
      const optimisticEvent = displayItemToCalendarItem(optimisticTask, {
        start: newDueDate,
        end: newEndAt,
      })
      calendarEventStore.getState().updateEvent(optimisticEvent)
      setDisplayedTasks((prev) =>
        prev.map((t) => (t.id === taskId ? optimisticTask : t))
      )
      setSavingTaskId(taskId)

      try {
        const ok = isReminder
          ? await patchReminder(taskId, { start: newDueDate, end: newEndAt })
          : await patchTask(taskId, { dueDate: newDueDate })
        if (!ok) {
          toast.error("Error al mover")
          calendarEventStore.getState().updateEvent(displayItemToCalendarItem(previousTask))
          setDisplayedTasks((prev) =>
            prev.map((t) => (t.id === taskId ? previousTask : t))
          )
        }
      } catch {
        toast.error("Error al mover")
        calendarEventStore.getState().updateEvent(displayItemToCalendarItem(previousTask))
        setDisplayedTasks((prev) =>
          prev.map((t) => (t.id === taskId ? previousTask : t))
        )
      } finally {
        setSavingTaskId(null)
      }
    },
    [displayedTasks]
  )

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
    setOverId(null)
  }, [])

  const handleTaskClick = useCallback((t: MissionControlCalendarItem) => {
    setSelectedTask(t)
    setPanelOpen(true)
  }, [])

  const handleCalendarDayClick = useCallback(
    (date: Date) => {
      if (view === "month") {
        setCurrentDate(date)
        setView("day")
      } else if (view === "week" || view === "timeline") {
        setCurrentDate(date)
        setView("day")
      } else {
        setCreatePreselectedDate(format(date, "yyyy-MM-dd"))
        setCreateOpen(true)
      }
    },
    [view]
  )

  const handleMonthClick = useCallback((monthStart: Date) => {
    const year = monthStart.getFullYear()
    const month = monthStart.getMonth()
    setCurrentDate(new Date(year, month, 1))
    setView("month")
  }, [])

  const handleCreateDialogOpenChange = useCallback((open: boolean) => {
    setCreateOpen(open)
    if (!open) setCreatePreselectedDate(null)
  }, [])

  const handlePanelSaved = useCallback((updatedTask: MissionControlCalendarItem | undefined) => {
    if (!updatedTask) return
    calendarEventStore.getState().updateEvent(displayItemToCalendarItem(updatedTask))
    setDisplayedTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    )
  }, [])

  const handleMoveDialogOpenChange = useCallback((open: boolean) => {
    if (!open) setMoveTask(null)
  }, [])

  const handleMoveDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMoveDate(e.target.value)
  }, [])

  const handleCancelMove = useCallback(() => {
    setMoveTask(null)
  }, [])

  const handleDurationChange = useCallback(
    async (taskId: string, estimatedMinutes: number) => {
      const previousTask = displayedTasks.find((t) => t.id === taskId)
      if (!previousTask) return

      const optimisticTask = { ...previousTask, estimatedMinutes }
      const optimisticEvent = displayItemToCalendarItem(optimisticTask)
      calendarEventStore.getState().updateEvent(optimisticEvent)
      setDisplayedTasks((prev) =>
        prev.map((t) => (t.id === taskId ? optimisticTask : t))
      )
      setSavingTaskId(taskId)
      try {
        const ok = await patchTask(taskId, { estimatedMinutes })
        if (!ok) {
          toast.error("Error al actualizar duración")
          calendarEventStore.getState().updateEvent(displayItemToCalendarItem(previousTask))
          setDisplayedTasks((prev) =>
            prev.map((t) => (t.id === taskId ? previousTask : t))
          )
        }
      } catch {
        toast.error("Error al actualizar duración")
        calendarEventStore.getState().updateEvent(displayItemToCalendarItem(previousTask))
        setDisplayedTasks((prev) =>
          prev.map((t) => (t.id === taskId ? previousTask : t))
        )
      } finally {
        setSavingTaskId(null)
      }
    },
    [displayedTasks]
  )

  return (
    <>
      <section
        className={cn(calendarContainerClass, className)}
        aria-label="Calendario principal"
      >
        {!hideToolbar && (
          <MissionCalendarControlBar
            dateRangeLabel={dateRangeLabel}
            view={view}
            onViewChange={setView}
            onPrev={handlePrev}
            onNext={handleNext}
            onToday={handleToday}
          />
        )}

        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="h-full min-h-[300px] p-2">
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                <CalendarView
                  view={view}
                  currentDate={currentDate}
                  tasks={displayedTasks}
                  onTaskClick={handleTaskClick}
                  onDayClick={handleCalendarDayClick}
                  onMonthClick={handleMonthClick}
                  onDurationChange={handleDurationChange}
                  activeDragId={activeId}
                  onScrollProgress={handleScrollProgress}
                  className={calendarViewClassName}
                />
                <DragOverlay dropAnimation={null}>
                  {activeTask ? (
                    <div className="cursor-grabbing px-2 py-1.5 w-[200px]">
                      <CalendarTaskPreview task={activeTask} />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          </div>
        </div>
      </section>

      <TaskDialog
        open={createOpen}
        onOpenChange={handleCreateDialogOpenChange}
        task={createTaskPrefill}
        onSuccess={handleCreateSuccess}
      />

      <MissionTaskPanel
        task={selectedTask}
        open={panelOpen}
        onOpenChange={setPanelOpen}
        onSaved={handlePanelSaved}
      />

      <Dialog open={!!moveTask} onOpenChange={handleMoveDialogOpenChange}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Mover tarea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {moveTask && (
              <p className="text-sm text-zinc-400 truncate">&quot;{moveTask.title}&quot;</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="move-date" className="text-zinc-300">
                Nueva fecha
              </Label>
              <Input
                id="move-date"
                type="date"
                value={moveDate}
                onChange={handleMoveDateChange}
                className="bg-zinc-800 border-zinc-600 text-white"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              className="text-zinc-400 hover:text-white"
              onClick={handleCancelMove}
            >
              Cancelar
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={handleConfirmMove}
              disabled={moving || !moveDate}
            >
              {moving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Mover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
