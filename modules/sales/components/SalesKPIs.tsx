"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"
import { formatSaleCurrency } from "../utils"
import { KPICard } from "@/app/dashboard/other/components/KPICard"

export type SalesKPIData = {
  revenue: number
  count: number
  avg: number
}

// Keeping types for prop compatibility, though explicit list is not used by KPICard
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
  /** Crecimiento vs periodo anterior; null → mostrar "—" */
  growth: number | null
  comparisons?: SalesKpiComparisons | null
  hasHistory?: boolean
}

export function SalesKPIs({
  mode = "sales",
  data,
  growth,
  comparisons: _comparisons, // unused in KPICard
  hasHistory: _hasHistory,  // unused in KPICard
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

  // Helper to determine change object for KPICard
  const getChange = (val: number | null) => {
    if (val === null) return undefined

    // Purchases: < 0 is Good (Positive), > 0 is Bad (Negative)
    // Sales: > 0 is Good (Positive), < 0 is Bad (Negative)
    const isPositive = isPurchases ? val <= 0 : val >= 0

    return {
      value: Math.abs(val),
      isPositive
    }
  }

  const cards = [
    {
      id: "revenue",
      title: isPurchases ? "Gastos totales" : (sl?.stats?.totalRevenue ?? "Ingresos totales"),
      value: formatSaleCurrency(data.revenue),
      icon: isPurchases ? '💸' : '💰',
      description: isPurchases ? "Total de gastos acumulados" : "Facturación total del periodo",
      change: undefined
    },
    {
      id: "count",
      title: isPurchases ? "Pedidos" : (sl?.plural ?? "Nº ventas"),
      value: String(data.count),
      icon: isPurchases ? '📦' : '🛒',
      description: isPurchases ? "Número de órdenes" : "Operaciones cerradas",
      change: undefined
    },
    {
      id: "ticket",
      title: isPurchases ? "Coste medio" : (sl?.stats?.avgTicket ?? "Ticket medio"),
      value: formatSaleCurrency(data.avg),
      icon: isPurchases ? '🧾' : '🏷️',
      description: isPurchases ? "Promedio por pedido" : "Valor medio por venta",
      change: undefined
    },
    {
      id: "growth",
      title: isPurchases ? "Variación" : (sl?.stats?.growth ?? "Crecimiento"),
      value: growth === null ? "—" : `${growth > 0 ? "+" : ""}${growth}%`,
      icon: isPurchases ? '📉' : '📈',
      description: "Respecto al periodo anterior",
      change: getChange(growth)
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      {cards.map((card) => (
        <KPICard
          key={card.id}
          title={card.title}
          value={card.value}
          change={card.change}
          icon={card.icon}
          description={card.description}
        />
      ))}
    </div>
  )
}
