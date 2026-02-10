"use client"

import { useMemo } from "react"
import { format, parseISO, startOfDay, endOfDay } from "date-fns"
import { es } from "date-fns/locale"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CalendarItem } from "@/modules/calendar/types/calendar-item"
import { getPriorityScoreLabel, getPriorityScoreBadgeClass, getAutoPriorityBadgeClass } from "@/modules/tasks/lib/priority-score-badge"

function toDate(iso: string): Date {
  return typeof iso === "string" ? parseISO(iso) : new Date(iso)
}

function formatDurationMinutes(startIso: string, endIso: string): string {
  const s = toDate(startIso).getTime()
  const e = toDate(endIso).getTime()
  const min = Math.round((e - s) / (60 * 1000))
  if (min >= 60) return `${Math.floor(min / 60)} h ${min % 60} min`
  return `${min} min`
}

function statusLabel(status: string): string {
  const u = (status || "").toUpperCase()
  if (u === "DONE") return "Hecho"
  if (u === "CANCELLED") return "Cancelada"
  return "Pendiente"
}

export function TodayPanel({
  events = [],
  onItemClick,
  className,
}: {
  events?: CalendarItem[]
  /** Called when user clicks an item; e.g. scroll calendar into view. */
  onItemClick?: () => void
  className?: string
}) {
  const todayItems = useMemo(() => {
    const now = new Date()
    const dayStart = startOfDay(now)
    const dayEnd = endOfDay(now)
    const filtered = events.filter((ev) => {
      const start = toDate(ev.start)
      return start >= dayStart && start <= dayEnd
    })
    const isCompleted = (s: string) => {
      const u = (s ?? "").toUpperCase()
      return u === "DONE" || u === "COMPLETED"
    }
    return [...filtered].sort((a, b) => {
      const aDone = isCompleted(a.status ?? "")
      const bDone = isCompleted(b.status ?? "")
      if (aDone !== bDone) return aDone ? 1 : -1
      return toDate(a.start).getTime() - toDate(b.start).getTime()
    })
  }, [events])

  return (
    <aside
      className={cn(
        "flex flex-col min-h-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-sm sticky top-0",
        className
      )}
      aria-label="Hoy"
    >
      <h2 className="text-sm font-semibold text-white px-4 py-3 border-b border-white/10 shrink-0">
        Hoy
      </h2>
      <div className="flex-1 min-h-0 overflow-auto px-3 py-3">
        {todayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <p className="text-sm text-zinc-400">Nada programado hoy</p>
            <p className="text-xs text-zinc-500 mt-1">
              Las tareas del día aparecerán aquí
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {todayItems.map((ev) => {
              const startTime = format(toDate(ev.start), "HH:mm", { locale: es })
              const duration = formatDurationMinutes(ev.start, ev.end)
              const priorityLabel = getPriorityScoreLabel(ev.priorityScore ?? null)
              const priorityClass = getPriorityScoreBadgeClass(ev.priorityScore ?? null)
              const autoPriority = ev.autoPriority ?? null
              const autoBadgeClass = getAutoPriorityBadgeClass(autoPriority)
              const status = statusLabel(ev.status ?? "")
              const u = (ev.status ?? "").toUpperCase()
              const isCompleted = u === "DONE" || u === "COMPLETED"

              return (
                <li key={ev.id}>
                  <button
                    type="button"
                    onClick={onItemClick}
                    className={cn(
                      "w-full text-left rounded-lg px-3 py-2.5 transition-all duration-200",
                      isCompleted
                        ? "opacity-75 border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
                        : "border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 hover:shadow-sm"
                    )}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      {isCompleted && (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden />
                      )}
                      <span className="text-xs font-semibold tabular-nums text-violet-300 shrink-0">
                        {startTime}
                      </span>
                      {priorityLabel && (
                        <span
                          className={cn(
                            "shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium",
                            priorityClass
                          )}
                        >
                          {priorityLabel}
                        </span>
                      )}
                      {autoPriority && (
                        <span className={cn("shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium", autoBadgeClass)}>
                          {autoPriority}
                        </span>
                      )}
                      <span className={cn("text-[11px] shrink-0", isCompleted ? "text-white/50" : "text-zinc-500")}>
                        {status}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-sm font-medium truncate mt-1",
                        isCompleted ? "line-through text-white/60" : "text-white"
                      )}
                    >
                      {ev.title}
                    </p>
                    <p className="text-xs text-zinc-400 tabular-nums mt-0.5">
                      {duration}
                    </p>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
