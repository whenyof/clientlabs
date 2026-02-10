"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"
import { cn } from "@/lib/utils"
import { formatSaleCurrency } from "../utils"
import { ChevronUp, ChevronDown, Minus } from "lucide-react"

export type SalesKPIData = {
  revenue: number
  count: number
  avg: number
}

export type KpiVariation = {
  vsPrevious: number | null
  vsAverage: number | null
  vsYearAgo: number | null
}

export type SalesKpiComparisons = {
  revenue: KpiVariation
  count: KpiVariation
  ticket: KpiVariation
  growth: KpiVariation
}

type Props = {
  data: SalesKPIData
  /** Crecimiento vs periodo anterior; null → mostrar "—" */
  growth: number | null
  comparisons?: SalesKpiComparisons | null
  hasHistory?: boolean
}

function VariationLine({
  pct,
  label,
}: {
  pct: number | null
  label: string
}) {
  if (pct === null) return <span className="text-xs text-white/40">—</span>
  const isPositive = pct > 0
  const isNegative = pct < 0
  const isNeutral = pct === 0
  const Icon = isPositive ? ChevronUp : isNegative ? ChevronDown : Minus
  const colorClass = isPositive
    ? "text-emerald-400"
    : isNegative
      ? "text-red-400/90"
      : "text-white/50"
  const sign = pct > 0 ? "+" : ""
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs tabular-nums",
        colorClass
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {sign}
      {pct}% {label}
    </span>
  )
}

export function SalesKPIs({
  data,
  growth,
  comparisons,
  hasHistory = true,
}: Props) {
  const { labels } = useSectorConfig()
  const sl = labels.sales
  const hasData = data.count > 0 || data.revenue > 0
  const showComparisons = comparisons != null && hasHistory

  if (!hasData) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur text-center">
        <p className="text-sm text-white/50">No hay datos para este periodo</p>
      </div>
    )
  }

  const cards: {
    key: keyof SalesKpiComparisons
    label: string
    value: string
    valueClassName?: string
  }[] = [
    {
      key: "revenue",
      label: sl?.stats?.totalRevenue ?? "Ingresos totales",
      value: formatSaleCurrency(data.revenue),
    },
    {
      key: "count",
      label: sl?.plural ?? "Nº ventas",
      value: String(data.count),
    },
    {
      key: "ticket",
      label: sl?.stats?.avgTicket ?? "Ticket medio",
      value: formatSaleCurrency(data.avg),
    },
    {
      key: "growth",
      label: sl?.stats?.growth ?? "Crecimiento",
      value: growth === null ? "—" : `${growth > 0 ? "+" : ""}${growth}%`,
      valueClassName: cn(
        "tabular-nums",
        growth === null ? "text-white/60" : growth > 0 ? "text-emerald-400" : growth < 0 ? "text-red-400/90" : "text-white/60"
      ),
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-colors hover:border-white/15 hover:bg-white/[0.07]"
        >
          <p className="text-sm text-white/60 truncate mb-1">{card.label}</p>
          <p
            className={cn(
              "text-2xl font-semibold text-white truncate tabular-nums",
              card.valueClassName
            )}
          >
            {card.value}
          </p>
          {showComparisons && comparisons[card.key] ? (
            <div className="mt-2 space-y-0.5">
              <div>
                <VariationLine
                  pct={comparisons[card.key].vsPrevious}
                  label="vs anterior"
                />
              </div>
              <div>
                <VariationLine
                  pct={comparisons[card.key].vsAverage}
                  label="vs promedio"
                />
              </div>
              <div>
                <VariationLine
                  pct={comparisons[card.key].vsYearAgo}
                  label="vs año pasado"
                />
              </div>
            </div>
          ) : !hasHistory && card.key === "revenue" ? (
            <p className="mt-2 text-xs text-white/40">Sin histórico suficiente</p>
          ) : null}
        </div>
      ))}
    </div>
  )
}
