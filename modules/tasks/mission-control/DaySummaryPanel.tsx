"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import type { CalendarItem } from "@/modules/calendar/types/calendar-item"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

function toDate(iso: string): Date {
  return typeof iso === "string" ? parseISO(iso) : new Date(iso)
}

export function DaySummaryPanel({
  events = [],
  date,
  className,
}: {
  events?: CalendarItem[]
  date: Date
  className?: string
}) {
  const summary = useMemo(() => {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
    const todayEvents = events.filter((ev) => {
      const start = toDate(ev.start)
      return start >= dayStart && start <= dayEnd
    })
    const pending = todayEvents.filter((e) => (e.status || "").toUpperCase() !== "DONE")
    const completed = todayEvents.filter((e) => (e.status || "").toUpperCase() === "DONE")
    let occupiedMinutes = 0
    todayEvents.forEach((ev) => {
      const s = toDate(ev.start).getTime()
      const e = toDate(ev.end).getTime()
      occupiedMinutes += Math.max(0, (e - s) / (60 * 1000))
    })
    const dayMinutes = 10 * 60
    const gapMinutes = Math.max(0, dayMinutes - occupiedMinutes)
    const nextTasks = [...pending]
      .sort((a, b) => toDate(a.start).getTime() - toDate(b.start).getTime())
      .slice(0, 6)
    return {
      nextTasks,
      pendingCount: pending.length,
      completedCount: completed.length,
      occupiedMinutes,
      gapMinutes,
    }
  }, [events, date])

  const occupiedLabel =
    summary.occupiedMinutes >= 60
      ? `${Math.floor(summary.occupiedMinutes / 60)} h ${Math.round(summary.occupiedMinutes % 60)} min`
      : `${Math.round(summary.occupiedMinutes)} min`
  const gapLabel =
    summary.gapMinutes >= 60
      ? `${Math.floor(summary.gapMinutes / 60)} h`
      : `${Math.round(summary.gapMinutes)} min`

  return (
    <aside
      className={cn(
        "flex flex-col min-h-0 overflow-auto rounded-lg border border-white/10 bg-white/[0.02]",
        className
      )}
      aria-label="Resumen del día"
    >
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 px-4 py-3 border-b border-white/10 shrink-0">
        Resumen del día
      </h2>
      <div className="flex-1 min-h-0 overflow-auto px-4 py-3 space-y-4">
        <div>
          <h3 className="text-[11px] font-medium text-zinc-500 mb-1.5">Próximas</h3>
          <ul className="space-y-1">
            {summary.nextTasks.length === 0 ? (
              <li className="text-[11px] text-zinc-500">Nada programado</li>
            ) : (
              summary.nextTasks.map((ev) => (
                <li key={ev.id} className="text-xs text-zinc-300 truncate">
                  {format(toDate(ev.start), "HH:mm", { locale: es })} · {ev.title}
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded border border-white/10 bg-white/[0.03] px-2.5 py-2">
            <span className="text-zinc-500 block">Pendientes</span>
            <span className="font-semibold tabular-nums text-white">{summary.pendingCount}</span>
          </div>
          <div className="rounded border border-white/10 bg-white/[0.03] px-2.5 py-2">
            <span className="text-zinc-500 block">Completadas</span>
            <span className="font-semibold tabular-nums text-white">{summary.completedCount}</span>
          </div>
        </div>
        <div>
          <h3 className="text-[11px] font-medium text-zinc-500 mb-1">Tiempo ocupado</h3>
          <p className="text-xs font-medium text-white tabular-nums">{occupiedLabel}</p>
        </div>
        <div>
          <h3 className="text-[11px] font-medium text-zinc-500 mb-1">Huecos disponibles</h3>
          <p className="text-xs font-medium text-white tabular-nums">{gapLabel}</p>
        </div>
      </div>
    </aside>
  )
}
