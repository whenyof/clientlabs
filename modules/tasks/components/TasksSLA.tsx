"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export type SLAData = {
  withinSLA: number
  breachedSLA: number
  pendingRisk: number
  avgResolutionTime: number
}

const SLA_CARD_BASE =
  "rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm transition-colors min-w-0"

function SLACardSkeleton() {
  return (
    <div className={cn(SLA_CARD_BASE, "animate-pulse")}>
      <div className="p-4 flex flex-col gap-2">
        <div className="h-3.5 w-24 rounded bg-white/10" />
        <div className="h-8 w-14 rounded bg-white/15" />
      </div>
    </div>
  )
}

function SLACard({
  title,
  value,
  subtext,
  accent,
}: {
  title: string
  value: string | number
  subtext?: string
  accent: "green" | "red" | "amber" | "neutral"
}) {
  const accentBorder =
    accent === "green"
      ? "border-emerald-500/30"
      : accent === "red"
        ? "border-rose-500/30"
        : accent === "amber"
          ? "border-amber-500/30"
          : "border-violet-500/20"

  return (
    <div className={cn(SLA_CARD_BASE, accentBorder, "hover:bg-white/[0.06]")}>
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

function formatResolutionMinutes(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function TasksSLA({ className }: { className?: string }) {
  const [data, setData] = useState<SLAData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    fetch("/api/tasks/sla")
      .then((res) => {
        if (!res.ok) throw new Error("SLA failed")
        return res.json() as Promise<SLAData>
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
        aria-label="SLA y cumplimiento"
        data-sla-skeleton
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <SLACardSkeleton key={i} />
          ))}
        </div>
      </section>
    )
  }

  if (!data) return null

  return (
    <section
      className={cn("w-full", className)}
      aria-label="SLA y cumplimiento"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SLACard
          title="Dentro SLA"
          value={data.withinSLA}
          subtext="completadas a tiempo"
          accent="green"
        />
        <SLACard
          title="Fuera SLA"
          value={data.breachedSLA}
          subtext={data.breachedSLA > 0 ? "superaron el tiempo acordado" : undefined}
          accent="red"
        />
        <SLACard
          title="En riesgo"
          value={data.pendingRisk}
          subtext={data.pendingRisk > 0 ? "pendientes cerca del límite" : undefined}
          accent="amber"
        />
        <SLACard
          title="Tiempo medio"
          value={formatResolutionMinutes(data.avgResolutionTime)}
          subtext={
            data.avgResolutionTime > 0
              ? "resolución (creación → cierre)"
              : "sin completadas hoy"
          }
          accent="neutral"
        />
      </div>
    </section>
  )
}
