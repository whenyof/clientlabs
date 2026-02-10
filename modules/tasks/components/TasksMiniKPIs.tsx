"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type MiniKPIData = {
  totalToday: number
  pending: number
  overdue: number
  atRisk: number
  loadPct: number
}

export function TasksMiniKPIs({ className }: { className?: string }) {
  const [data, setData] = useState<MiniKPIData | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch("/api/tasks/radar").then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch("/api/tasks/sla").then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch("/api/tasks/performance").then((r) => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([radar, sla, performance]) => {
        if (cancelled) return
        const totalAssigned = Array.isArray(performance)
          ? (performance as { assigned: number }[]).reduce((s, r) => s + r.assigned, 0)
          : 0
        const totalLoad = Array.isArray(performance)
          ? (performance as { currentLoad: number }[]).reduce((s, r) => s + r.currentLoad, 0)
          : 0
        const loadPct = totalAssigned > 0 ? Math.min(100, Math.round((totalLoad / totalAssigned) * 100)) : 0
        setData({
          totalToday: radar.total ?? 0,
          pending: radar.pending ?? 0,
          overdue: radar.overdue ?? 0,
          atRisk: sla.pendingRisk ?? 0,
          loadPct,
        })
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  if (!data) return null

  const badges = [
    { label: "Hoy", value: data.totalToday },
    { label: "Pendientes", value: data.pending },
    { label: "Vencen", value: data.overdue },
    { label: "En riesgo", value: data.atRisk },
    { label: "Ocupación", value: `${data.loadPct}%` },
  ]

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {badges.map(({ label, value }) => (
        <span
          key={label}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-zinc-300"
        >
          <span className="font-medium tabular-nums text-white">{value}</span>
          <span className="text-zinc-500">{label}</span>
        </span>
      ))}
    </div>
  )
}
