"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"
import { formatReportingCurrency } from "../utils"
import type { ReportingKPIs as KPIType } from "../types"
import { cn } from "@/lib/utils"

type Props = {
  kpis: KPIType
}

export function ReportingKPIs({ kpis }: Props) {
  const { labels } = useSectorConfig()
  const r = labels.reporting

  const items = [
    { label: r.kpis.revenue, value: formatReportingCurrency(kpis.revenue), sub: null },
    { label: r.kpis.sales, value: String(kpis.sales), sub: null },
    { label: r.kpis.avgTicket, value: formatReportingCurrency(kpis.avgTicket), sub: null },
    {
      label: r.kpis.growth,
      value:
        kpis.growthPercent !== null
          ? `${kpis.growthPercent > 0 ? "+" : ""}${kpis.growthPercent}%`
          : "—",
      sub: null,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur",
            "flex flex-col justify-center"
          )}
        >
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider truncate">
            {item.label}
          </p>
          <p className="text-xl font-bold text-white mt-0.5 truncate">{item.value}</p>
        </div>
      ))}
    </div>
  )
}
