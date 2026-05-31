"use client"

import React, { memo } from "react"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { formatReportingCurrency } from "../utils"
import type { ReportingKPIs as KPIType } from "../types"
import { cn } from "@/lib/utils"

type Props = {
  kpis: KPIType
}

function ReportingKPIsComponent({ kpis }: Props) {
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
            "rounded-xl p-4 flex flex-col justify-center"
          )}
          style={{ background: "#ffffff", border: "1px solid #e8e8e8" }}
        >
          <p className="text-xs font-medium uppercase tracking-wider truncate" style={{ color: "#737373" }}>
            {item.label}
          </p>
          <p className="text-xl font-bold mt-0.5 truncate" style={{ color: "#0a0a0a" }}>{item.value}</p>
        </div>
      ))}
    </div>
  )
}

export const ReportingKPIs = memo(ReportingKPIsComponent)
