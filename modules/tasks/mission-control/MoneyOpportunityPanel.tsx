"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Banknote, Clock, Briefcase } from "lucide-react"

export type MoneyOpportunityData = {
  freeMinutes: number
  jobsThatFit: number
  potentialRevenue: number
  daysAnalyzed: number
}

function formatFreeTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m > 0 ? `${h} h ${m} min` : `${h} h`
}

export function MoneyOpportunityPanel({
  from,
  to,
  className,
}: {
  /** Start of range (ISO or Date); default = today. */
  from?: string | Date
  /** End of range (ISO or Date); default = today + 7 days. */
  to?: string | Date
  className?: string
}) {
  const [data, setData] = useState<MoneyOpportunityData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params = new URLSearchParams()
    if (from) params.set("from", typeof from === "string" ? from : from.toISOString())
    if (to) params.set("to", typeof to === "string" ? to : to.toISOString())
    const qs = params.toString()
    fetch(`/api/tasks/money-opportunity${qs ? `?${qs}` : ""}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: MoneyOpportunityData | null) => {
        if (!cancelled && d) setData(d)
      })
      .catch(() => {
        if (!cancelled) setData(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [from, to])

  return (
    <aside
      className={cn(
        "flex flex-col min-h-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-sm shrink-0",
        className
      )}
      aria-label="Oportunidad de ingresos"
    >
      <h2 className="text-sm font-semibold text-white px-4 py-3 border-b border-white/10 shrink-0 flex items-center gap-2">
        <Banknote className="w-4 h-4 text-emerald-400" />
        Oportunidad de ingresos
      </h2>
      <div className="flex-1 min-h-0 overflow-auto px-4 py-3">
        {loading ? (
          <div className="py-6 text-center text-xs text-zinc-500">
            Cargando…
          </div>
        ) : !data ? (
          <div className="py-6 text-center text-sm text-zinc-500">
            No hay datos
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Clock className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Tiempo libre
                </p>
                <p className="text-sm font-semibold text-white tabular-nums">
                  {formatFreeTime(data.freeMinutes)}
                </p>
                {data.daysAnalyzed > 0 && (
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    en {data.daysAnalyzed} día{data.daysAnalyzed !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Briefcase className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Trabajos que caben
                </p>
                <p className="text-sm font-semibold text-white tabular-nums">
                  {data.jobsThatFit}
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-3 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
                <Banknote className="h-4 w-4 text-emerald-300" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-emerald-400/90 uppercase tracking-wider">
                  Ingresos potenciales
                </p>
                <p className="text-base font-bold text-emerald-200 tabular-nums">
                  {data.potentialRevenue.toLocaleString("es-ES", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
