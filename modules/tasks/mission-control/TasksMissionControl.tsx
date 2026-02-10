"use client"

import { useCallback, useState, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { MissionControlHeader } from "./MissionControlHeader"
import { MissionCalendar } from "./MissionCalendar"
import { TodayPanel } from "./TodayPanel"
import { MoneyOpportunityPanel } from "./MoneyOpportunityPanel"
import { getCalendarLabel, getPrevDate, getNextDate } from "./CalendarView"
import type { CalendarItem } from "@/modules/calendar/types/calendar-item"
import type { CalendarViewMode } from "./CalendarView"

function formatTime(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false })
}

function getPriorityLevel(t: CalendarItem): "high" | "medium" | "low" {
  const auto = t.autoPriority?.toUpperCase()
  if (auto === "CRITICAL") return "high"
  if (auto === "IMPORTANT") return "medium"
  const p = (t.priority ?? "").toUpperCase()
  if (p === "HIGH" || p === "URGENT") return "high"
  if (p === "MEDIUM" || p === "NORMAL") return "medium"
  return "low"
}

/**
 * Layout: calendar dominant (left), Today Command Center (right).
 * - Top: existing header (title, navigation, new task).
 * - Main: 2-column grid [calendar | today column].
 * - Left: CalendarView only, full height.
 * - Right: scrollable stack — Hoy, next task, timeline, stats, intelligence.
 */
export function TasksMissionControl({
  events = [],
  initialRange,
  className,
}: {
  events?: CalendarItem[]
  initialRange?: { from: string; to: string }
  className?: string
}) {
  const router = useRouter()
  const onRefresh = useCallback(() => router.refresh(), [router])
  const calendarRef = useRef<HTMLDivElement>(null)

  const taskExplorerRef = useRef<HTMLDivElement | null>(null)

  const [view, setView] = useState<CalendarViewMode>("week")
  const [currentDate, setCurrentDate] = useState(
    () => (initialRange?.from ? new Date(initialRange.from) : new Date())
  )
  const dateRangeLabel = useMemo(() => getCalendarLabel(view, currentDate), [view, currentDate])
  const handlePrev = useCallback(() => setCurrentDate((d) => getPrevDate(view, d)), [view])
  const handleNext = useCallback(() => setCurrentDate((d) => getNextDate(view, d)), [view])
  const handleToday = useCallback(() => setCurrentDate(new Date()), [])

  const scrollToCalendar = useCallback(() => {
    calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const handleComplete = useCallback(
    async (e: React.MouseEvent, task: CalendarItem) => {
      e.stopPropagation()
      const isReminder = task.kind === "REMINDER"
      const url = isReminder ? `/api/reminders/${task.id}` : `/api/tasks/${task.id}`
      const body = isReminder ? { status: "DONE" } : { status: "DONE" }
      const ok = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.ok)
      if (ok) onRefresh()
    },
    [onRefresh]
  )

  const handleUnschedule = useCallback(
    async (e: React.MouseEvent, task: CalendarItem) => {
      e.stopPropagation()
      const isReminder = task.kind === "REMINDER"
      const url = isReminder ? `/api/reminders/${task.id}` : `/api/tasks/${task.id}`
      const body = isReminder ? { start: null, end: null } : { startAt: null, endAt: null }
      const ok = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.ok)
      if (ok) onRefresh()
    },
    [onRefresh]
  )

  const handleOpenTask = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    scrollToCalendar()
  }, [scrollToCalendar])

  type TaskFilterId = "all" | "pending" | "completed" | "risk" | "occupied" | "overdue"
  const [taskFilter, setTaskFilter] = useState<TaskFilterId>("all")

  const handleKpiClick = useCallback((filter: TaskFilterId) => {
    setTaskFilter(filter)
    taskExplorerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const taskFilterLabel = useMemo(() => {
    switch (taskFilter) {
      case "pending":
        return "Pendientes"
      case "completed":
        return "Completadas"
      case "risk":
        return "En riesgo"
      case "occupied":
        return "Ocupación"
      case "overdue":
        return "Atrasadas"
      default:
        return "Todas"
    }
  }, [taskFilter])

  const todayKey = useMemo(
    () =>
      `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`,
    [currentDate]
  )

  const kpis = useMemo(() => {
    const items = events ?? []
    const now = Date.now()

    const isItemToday = (t: CalendarItem) => {
      const iso = t.startAt ?? t.start
      if (!iso) return false
      const d = new Date(iso)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      return key === todayKey
    }

    const isCompleted = (t: CalendarItem) => {
      const s = (t.status ?? "").toUpperCase()
      return s === "DONE" || s === "COMPLETED"
    }

    const todayItems = items.filter(isItemToday)
    const pendingToday = todayItems.filter((t) => !isCompleted(t)).length
    const completedToday = todayItems.filter(isCompleted).length

    const overdue = items.filter((t) => {
      if (isCompleted(t)) return false
      const endIso = t.dueDate ?? t.end
      if (!endIso) return false
      return new Date(endIso).getTime() < now
    }).length

    const atRisk = items.filter(
      (t) =>
        t.risk &&
        (t.risk.overlap || t.risk.overload || t.risk.impossibleTiming)
    ).length

    const todayMinutes = todayItems.reduce(
      (sum, t) => sum + (t.estimatedMinutes ?? 0),
      0
    )
    const WORKDAY_MINUTES = 8 * 60
    const occupationPct = Math.min(
      100,
      Math.round((todayMinutes / WORKDAY_MINUTES) * 100)
    )

    return {
      pendingToday,
      completedToday,
      overdue,
      atRisk,
      occupationPct,
    }
  }, [events, todayKey])

  const filteredTasks = useMemo(() => {
    const items = events ?? []
    const isCompleted = (t: CalendarItem) => {
      const s = (t.status ?? "").toUpperCase()
      return s === "DONE" || s === "COMPLETED"
    }
    const isItemToday = (t: CalendarItem) => {
      const iso = t.startAt ?? t.start
      if (!iso) return false
      const d = new Date(iso)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      return key === todayKey
    }
    if (taskFilter === "pending") {
      return items.filter((t) => !isCompleted(t))
    }
    if (taskFilter === "completed") {
      return items.filter(isCompleted)
    }
    if (taskFilter === "risk") {
      return items.filter(
        (t) =>
          t.risk &&
          (t.risk.overlap || t.risk.overload || t.risk.impossibleTiming)
      )
    }
    if (taskFilter === "overdue") {
      const now = Date.now()
      return items.filter((t) => {
        if (isCompleted(t)) return false
        const endIso = t.dueDate ?? t.end
        if (!endIso) return false
        return new Date(endIso).getTime() < now
      })
    }
    if (taskFilter === "occupied") {
      return items.filter(isItemToday)
    }
    return items
  }, [events, taskFilter, todayKey])

  
  return (
    <div
      className={cn(
        "flex flex-col flex-1 min-h-0 w-full min-w-0 max-w-none text-white",
        className
      )}
      data-mount="tasks-mission-control"
      data-debug="mission-control"
    >
      <MissionControlHeader
        dateRangeLabel={dateRangeLabel}
        view={view}
        onViewChange={setView}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      />

      {/* Zone 1 — viewport height: KPIs + calendar + Hoy */}
      <div className="flex flex-col min-h-screen">
        {/* Layer 1 — KPI strip (real data, navigation into Task Explorer) */}
        <div className="shrink-0 w-full flex items-center gap-3 px-1 py-3 min-h-[88px]">
          {[
            { label: "Pendientes", value: String(kpis.pendingToday), filter: "pending" as TaskFilterId },
            { label: "Completadas", value: String(kpis.completedToday), filter: "completed" as TaskFilterId },
            { label: "En riesgo", value: String(kpis.atRisk), filter: "risk" as TaskFilterId },
            { label: "Ocupación", value: `${kpis.occupationPct}%`, filter: "occupied" as TaskFilterId },
            { label: "Atrasadas", value: String(kpis.overdue), filter: "overdue" as TaskFilterId },
          ].map(({ label, value, filter }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleKpiClick(filter)}
              className={cn(
                "flex-1 min-w-0 rounded-lg border px-4 py-3 text-left transition-colors",
                "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.14]",
                taskFilter === filter && "border-white/40 bg-white/[0.06]"
              )}
            >
              <p className="text-[10px] uppercase tracking-wider text-white/40 truncate">{label}</p>
              <p className="text-lg font-semibold text-white tracking-tight mt-0.5 truncate tabular-nums">
                {value}
              </p>
            </button>
          ))}
        </div>

        {/* Layer 2 + 3 — Calendar (planning) | Execution column */}
        <div className="flex flex-1 min-h-0 w-full mt-4 gap-6">
          {/* LEFT — Calendar (canvas, no heavy cards) */}
          <div ref={calendarRef} className="flex-1 min-w-0 min-h-0" style={{ height: "100%" }}>
            <MissionCalendar
              events={events}
              initialRange={initialRange}
              onRefresh={onRefresh}
              className="h-full w-full"
              hideToolbar
              controlledView={view}
              controlledCurrentDate={currentDate}
              onViewChange={setView}
              onPrev={handlePrev}
              onNext={handleNext}
              onToday={handleToday}
              dateRangeLabel={dateRangeLabel}
            />
          </div>

        {/* RIGHT — Execution column (control tower) */}
        <div
          className="shrink-0 w-[380px] flex flex-col rounded-xl bg-white/[0.03] backdrop-blur border border-white/[0.06]"
          style={{ minWidth: 380, height: "100%" }}
        >
            <div className="shrink-0 pt-5 px-4 pb-2">
              <h2 className="text-lg font-semibold text-white tracking-tight">Ejecución</h2>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="flex flex-col gap-6 p-4">
                {/* Agenda de hoy — timeline */}
                <section>
                  <h3 className="text-xs uppercase tracking-wide text-white/50 mb-2">
                    Agenda de hoy
                  </h3>
                  <div className="rounded-xl bg-white/[0.02] p-4">
                    <TodayPanel events={events} onItemClick={scrollToCalendar} />
                  </div>
                </section>

                {/* Oportunidad de ingresos */}
                <section>
                  <h3 className="text-xs uppercase tracking-wide text-white/50 mb-2">
                    Oportunidad de ingresos
                  </h3>
                  <div className="rounded-xl bg-white/[0.02] p-5">
                    <MoneyOpportunityPanel from={initialRange?.from} to={initialRange?.to} />
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 4 — Task Explorer (table, below the fold) */}
      <div
        ref={taskExplorerRef}
        className="mt-6 flex flex-col gap-4 bg-white/[0.01]"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-white tracking-tight">Task Explorer</h2>
          <span className="text-xs uppercase tracking-wide text-white/50">
            Filtro: {taskFilterLabel}
          </span>
        </div>

        <div className="max-h-[400px] overflow-y-auto rounded-lg border border-white/[0.06] bg-white/[0.01]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#1E1F2B] border-b border-white/[0.08] shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
              <tr className="text-[10px] uppercase tracking-wider text-white/50">
                <th className="py-2.5 px-3 font-medium w-14">Hora</th>
                <th className="py-2.5 px-3 font-medium min-w-[140px]">Título</th>
                <th className="py-2.5 px-3 font-medium w-28">Cliente / Lead</th>
                <th className="py-2.5 px-3 font-medium w-24">Responsable</th>
                <th className="py-2.5 px-3 font-medium w-20">Prioridad</th>
                <th className="py-2.5 px-3 font-medium w-20">Estado</th>
                <th className="py-2.5 px-3 font-medium w-16">Riesgo</th>
                <th className="py-2.5 px-3 font-medium w-28 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 px-3 text-xs text-white/40 text-center">
                    No hay tareas para este filtro.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const level = getPriorityLevel(task)
                  const riskActive =
                    task.risk &&
                    (task.risk.overlap || task.risk.overload || task.risk.impossibleTiming)
                  const statusU = (task.status ?? "").toUpperCase()
                  const taskCompleted = statusU === "DONE" || statusU === "COMPLETED"
                  const isCompleted =
                    task.status === "COMPLETED" ||
                    task.status === "DONE" ||
                    (task as { completed?: boolean }).completed === true
                  return (
                    <tr
                      key={task.id}
                      className={cn(
                        "border-b border-white/[0.05] transition-colors",
                        taskCompleted
                          ? "opacity-75 bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.04]"
                          : "hover:bg-white/[0.04]"
                      )}
                    >
                      <td className="py-2 px-3 text-xs text-white/80 tabular-nums whitespace-nowrap">
                        {formatTime(task.startAt ?? task.start)}
                      </td>
                      <td className="py-2 px-3 text-sm max-w-[180px]">
                        <span className={cn("flex items-center gap-2 min-w-0", taskCompleted && "opacity-90")}>
                          {taskCompleted && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden />}
                          <span className={cn("truncate", taskCompleted ? "text-white/60 line-through" : "text-white")}>
                            {task.title}
                          </span>
                        </span>
                      </td>
                      <td className="py-2 px-3 text-xs text-white/70 truncate max-w-[120px]">
                        {task.clientName ?? task.leadName ?? "—"}
                      </td>
                      <td className="py-2 px-3 text-xs text-white/70 truncate max-w-[100px]">
                        {task.assignedTo ?? "—"}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={cn(
                            "inline-block px-2 py-0.5 rounded text-[10px] font-medium",
                            level === "high" && "bg-red-500/15 text-red-300 border border-red-500/40",
                            level === "medium" &&
                              "bg-amber-500/15 text-amber-300 border border-amber-500/40",
                            level === "low" && "bg-white/10 text-white/60 border border-white/10"
                          )}
                        >
                          {level === "high" ? "Alta" : level === "medium" ? "Media" : "Baja"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-xs text-white/70">
                        {taskCompleted ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-emerald-400 shrink-0" aria-hidden />
                            {task.status || "—"}
                          </span>
                        ) : (
                          task.status || "—"
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {riskActive ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                            Sí
                          </span>
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleComplete(e, task)}
                            className="text-[10px] px-2 py-1 rounded border border-white/20 hover:bg-white/10 text-white/80"
                          >
                            Completar
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleUnschedule(e, task)}
                            className="text-[10px] px-2 py-1 rounded border border-white/20 hover:bg-white/10 text-white/80"
                          >
                            Desprogramar
                          </button>
                          <button
                            type="button"
                            onClick={handleOpenTask}
                            className="text-[10px] px-2 py-1 rounded border border-white/20 hover:bg-white/10 text-white/80"
                          >
                            Abrir
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
  
}
