"use client"

import { useMemo } from "react"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { formatSaleCurrency } from "../utils"
import type { Sale } from "../types"
import type { SalesKPIsWithVariation } from "../types"

type Props = {
  kpis: SalesKPIsWithVariation
  salesCurrent: Sale[]
}

export function SalesComparisonCards({ kpis, salesCurrent }: Props) {
  const { labels } = useSectorConfig()
  const sl = labels.sales
  const insights = labels.sales.insights

  const topClient = useMemo(() => {
    const byClient = new Map<string, number>()
    for (const s of salesCurrent) {
      const name = s.clientName || "Sin cliente"
      byClient.set(name, (byClient.get(name) ?? 0) + Number(s.total))
    }
    let best: { name: string; total: number } | null = null
    byClient.forEach((total, name) => {
      if (!best || total > best.total) best = { name, total }
    })
    return best
  }, [salesCurrent])

  const cards = useMemo(() => {
    const list: { title: string; value: string; sub?: string }[] = []
    if (kpis.totalRevenueVar !== null) {
      list.push({
        title: insights.vsPreviousPeriod,
        value: `${kpis.totalRevenueVar > 0 ? "+" : ""}${kpis.totalRevenueVar}%`,
        sub: `${formatSaleCurrency(kpis.totalRevenue)} vs ${formatSaleCurrency(kpis.totalRevenuePrev)}`,
      })
    }
    if (topClient) {
      list.push({
        title: insights.topClient,
        value: topClient.name,
        sub: formatSaleCurrency(topClient.total),
      })
    }
    list.push({
      title: insights.paidShare,
      value: `${kpis.paidPercent}%`,
      sub: `${kpis.paidCount} / ${kpis.totalSales} ${sl.plural.toLowerCase()}`,
    })
    return list
  }, [kpis, topClient, insights, sl.plural])

  if (cards.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur"
        >
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">{card.title}</p>
          <p className="text-lg font-semibold text-white truncate">{card.value}</p>
          {card.sub && <p className="text-sm text-white/50 truncate mt-0.5">{card.sub}</p>}
        </div>
      ))}
    </div>
  )
}
