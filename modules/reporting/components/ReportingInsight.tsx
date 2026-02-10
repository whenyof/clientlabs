"use client"

import { useMemo } from "react"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { formatReportingCurrency } from "../utils"
import type { ReportingSale, ReportingKPIs, TopClient } from "../types"

type Props = {
  salesInRange: ReportingSale[]
  kpis: ReportingKPIs
  topClients: TopClient[]
}

export function ReportingInsight({ salesInRange, kpis, topClients }: Props) {
  const { labels } = useSectorConfig()
  const title = labels.reporting.insight.title

  const bullets = useMemo(() => {
    const lines: string[] = []
    if (kpis.sales > 0) {
      lines.push(
        `Periodo: ${kpis.sales} ventas por un total de ${formatReportingCurrency(kpis.revenue)}. Ticket medio: ${formatReportingCurrency(kpis.avgTicket)}.`
      )
    }
    if (kpis.growthPercent !== null && kpis.growthPercent !== 0) {
      lines.push(
        kpis.growthPercent > 0
          ? `Ingresos un ${kpis.growthPercent}% por encima del periodo anterior.`
          : `Ingresos un ${Math.abs(kpis.growthPercent)}% por debajo del periodo anterior.`
      )
    }
    if (topClients.length > 0) {
      const top = topClients[0]
      lines.push(`${top.name} es el mayor contribuyente con ${formatReportingCurrency(top.revenue)} (${top.count} ventas).`)
    }
    if (lines.length === 0 && salesInRange.length === 0) {
      lines.push("Sin actividad en el periodo seleccionado. Cambia el rango para ver datos.")
    }
    return lines
  }, [kpis, topClients, salesInRange.length])

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <h3 className="text-sm font-medium text-white/80 mb-3">{title}</h3>
      <ul className="space-y-2">
        {bullets.map((line, i) => (
          <li key={i} className="text-sm text-white/70 leading-relaxed">
            {line}
          </li>
        ))}
      </ul>
    </div>
  )
}
