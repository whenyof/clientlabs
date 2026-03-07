"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"
import { formatSaleCurrency } from "../utils"
import { FinanceStatCard, KpiVariant } from "@/app/dashboard/other/finance/components/FinanceStatCard"

export type SalesKPIData = {
  revenue: number
  count: number
  avg: number
}

// Keeping types for prop compatibility
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

type Mode = "sales" | "purchases"

type Props = {
  mode?: Mode
  data: SalesKPIData
  growth: number | null
  comparisons?: SalesKpiComparisons | null
  hasHistory?: boolean
}

export function SalesKPIs({
  mode = "sales",
  data,
  growth,
}: Props) {
  const { labels } = useSectorConfig()
  const sl = labels.sales
  const isPurchases = mode === "purchases"

  const hasData = data.count > 0 || data.revenue > 0

  if (!hasData) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur text-center">
        <p className="text-sm text-white/50">No hay datos para este periodo</p>
      </div>
    )
  }

  // Determine deltaUp explicitly for the growth card
  // Sales: > 0 is good (Green/True)
  // Purchases: < 0 is good (Green/True)
  const growthIsGood = growth !== null ? (isPurchases ? growth <= 0 : growth >= 0) : null

  const cards = [
    {
      id: "revenue",
      label: isPurchases ? "Gastos totales" : (sl?.stats?.totalRevenue ?? "Ingresos totales"),
      value: formatSaleCurrency(data.revenue),
      variant: (isPurchases ? "red" : "emerald") as KpiVariant,
      delta: undefined,
      deltaUp: null as boolean | null,
      tooltip: isPurchases ? "Total de gastos acumulados" : "Facturación total del periodo",
    },
    {
      id: "count",
      label: isPurchases ? "Pedidos" : (sl?.plural ?? "Nº ventas"),
      value: String(data.count),
      variant: "violet" as KpiVariant,
      delta: undefined,
      deltaUp: null as boolean | null,
      tooltip: isPurchases ? "Número de órdenes" : "Operaciones cerradas",
    },
    {
      id: "ticket",
      label: isPurchases ? "Coste medio" : (sl?.stats?.avgTicket ?? "Ticket medio"),
      value: formatSaleCurrency(data.avg),
      variant: "violet" as KpiVariant,
      delta: undefined,
      deltaUp: null as boolean | null,
      tooltip: isPurchases ? "Promedio por pedido" : "Valor medio por venta",
    },
    {
      id: "growth",
      label: isPurchases ? "Variación" : (sl?.stats?.growth ?? "Crecimiento"),
      value: growth === null ? "—" : `${growth > 0 ? "+" : ""}${growth}%`,
      variant: "blue" as KpiVariant,
      delta: growth === null ? "—" : `${growth > 0 ? "+" : ""}${growth}%`,
      deltaUp: growthIsGood,
      tooltip: "Respecto al periodo anterior",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      {cards.map((card, index) => (
        <FinanceStatCard
          key={card.id}
          index={index}
          label={card.label}
          value={card.value}
          variant={card.variant}
          delta={card.delta}
          deltaUp={card.deltaUp}
          tooltip={card.tooltip}
        />
      ))}
    </div>
  )
}
