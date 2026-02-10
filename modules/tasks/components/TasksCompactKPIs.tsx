"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type CompactKPIData = {
  pending: number
  overdue: number
  atRisk: number
  loadPct: number
}

const KPI_BASE = "rounded-lg bg-white/[0.03] border border-white/10 min-w-0 flex flex-col justify-center"

function KPISkeleton() {
  return (
    <div className={cn(KPI_BASE, "h-20 animate-pulse")}>
      <div className="px-4 py-3">
        <div className="h-6 w-10 rounded bg-white/10 mb-1.5" />
        <div className="h-3 w-16 rounded bg-white/10" />
      </div>
    </div>
  )
}

function KPICell({
  value,
  label,
  className,
}: {
  value: string | number
  label: string
  className?: string
}) {
  return (
    <div className={cn(KPI_BASE, "h-20 px-4 py-3", className)}>
      <span className="text-2xl font-semibold tabular-nums text-white leading-tight block">
        {value}
      </span>
      <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mt-0.5">
        {label}
      </span>
    </div>
  )
}

export function TasksCompactKPIs({ className }: { className?: string }) {
  const [data, setData] = useState<CompactKPIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    Promise.all([
      fetch("/api/tasks/radar").then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch("/api/tasks/sla").then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch("/api/tasks/performance").then((r) => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([radar, sla, performance]) => {
        if (cancelled) return
        const totalAssigned = Array.isArray(performance)
          ? (performance as { assigned: number; currentLoad: number }[]).reduce(
              (s, r) => s + r.assigned,
              0
            )
          : 0
        const totalLoad = Array.isArray(performance)
          ? (performance as { currentLoad: number }[]).reduce((s, r) => s + r.currentLoad, 0)
          : 0
        const loadPct =
          totalAssigned > 0 ? Math.min(100, Math.round((totalLoad / totalAssigned) * 100)) : 0
        setData({
          pending: radar.pending ?? 0,
          overdue: radar.overdue ?? 0,
          atRisk: sla.pendingRisk ?? 0,
          loadPct,
        })
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (loading || error) {
    return (
      <section className={cn("w-full", className)} aria-label="KPIs del día">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <KPISkeleton key={i} />
          ))}
        </div>
      </section>
    )
  }

  if (!data) return null

  return (
    <section className={cn("w-full", className)} aria-label="KPIs del día">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-24">
        <KPICell value={data.pending} label="Pendientes hoy" />
        <KPICell value={data.overdue} label="Retrasadas" />
        <KPICell value={data.atRisk} label="En riesgo" />
        <KPICell value={`${data.loadPct}%`} label="Carga equipo" />
      </div>
    </section>
  )
}
