"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export type RadarData = {
  pending: number
  done: number
  overdue: number
  total: number
  completionRate: number
}

const RADAR_CARD_BASE =
  "rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm transition-colors min-w-0"

function RadarCardSkeleton() {
  return (
    <div className={cn(RADAR_CARD_BASE, "animate-pulse")}>
      <div className="p-4 flex flex-col gap-2">
        <div className="h-3.5 w-20 rounded bg-white/10" />
        <div className="h-8 w-12 rounded bg-white/15" />
      </div>
    </div>
  )
}

function RadarCard({
  title,
  value,
  subtext,
  accent = "violet",
}: {
  title: string
  value: string | number
  subtext?: string
  accent?: "violet" | "emerald" | "amber" | "rose"
}) {
  const accentBorder =
    accent === "violet"
      ? "border-violet-500/30"
      : accent === "emerald"
        ? "border-emerald-500/30"
        : accent === "amber"
          ? "border-amber-500/30"
          : "border-rose-500/30"

  return (
    <div className={cn(RADAR_CARD_BASE, accentBorder, "hover:bg-white/[0.06]")}>
      <div className="p-4 flex flex-col gap-0.5">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          {title}
        </span>
        <span className="text-2xl font-semibold tabular-nums text-white">
          {value}
        </span>
        {subtext !== undefined && subtext !== "" && (
          <span className="text-xs text-zinc-500 mt-0.5">{subtext}</span>
        )}
      </div>
    </div>
  )
}

export function TasksRadar({ className }: { className?: string }) {
  const [data, setData] = useState<RadarData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    fetch("/api/tasks/radar")
      .then((res) => {
        if (!res.ok) throw new Error("Radar failed")
        return res.json() as Promise<RadarData>
      })
      .then((body) => {
        if (!cancelled) {
          setData(body)
          setError(false)
        }
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

  const showSkeleton = loading || error

  if (showSkeleton) {
    return (
      <section
        className={cn("w-full", className)}
        aria-label="Radar diario"
        data-radar-skeleton
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <RadarCardSkeleton key={i} />
          ))}
        </div>
      </section>
    )
  }

  if (!data) return null

  return (
    <section
      className={cn("w-full", className)}
      aria-label="Radar diario ejecutivo"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <RadarCard
          title="Pendientes"
          value={data.pending}
          subtext="por hacer hoy"
          accent="violet"
        />
        <RadarCard
          title="Completadas"
          value={data.done}
          subtext="del total hoy"
          accent="emerald"
        />
        <RadarCard
          title="Retrasadas"
          value={data.overdue}
          subtext={data.overdue > 0 ? "requieren atención" : undefined}
          accent="amber"
        />
        <RadarCard
          title="Total hoy"
          value={data.total}
          subtext="tareas con vencimiento hoy"
          accent="violet"
        />
        <RadarCard
          title="Cumplimiento"
          value={`${data.completionRate}%`}
          subtext={data.total === 0 ? "sin tareas hoy" : undefined}
          accent="violet"
        />
      </div>
    </section>
  )
}
