"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { formatSaleCurrency } from "../utils"
import type { SalesYoYMetrics, SalesYoYChartPoint } from "../types"

type Props = {
  yoyMetrics: SalesYoYMetrics
  chartData: SalesYoYChartPoint[]
  yearCurrent: number
  yearPrevious: number
}

export function SalesYoYSection({ yoyMetrics, chartData, yearCurrent, yearPrevious }: Props) {
  const { labels } = useSectorConfig()
  const sl = labels.sales?.yoy

  if (!yoyMetrics.hasPreviousData) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h3 className="text-sm font-medium text-white/80 mb-2">{sl?.title ?? "Comparativa anual"}</h3>
        <p className="text-sm text-white/50">{sl?.noDataMessage ?? "No hay datos suficientes del año anterior"}</p>
      </div>
    )
  }

  const tooltipText = sl?.tooltip ?? "Comparación con el mismo periodo del año anterior"
  const currentYearLabel = String(yearCurrent)
  const previousYearLabel = String(yearPrevious)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-sm font-medium text-white/80">{sl?.title ?? "Comparativa anual"}</h3>
        <p className="text-xs text-white/45" title={tooltipText}>{tooltipText}</p>
      </div>

      {chartData.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h4 className="text-xs font-medium text-white/60 mb-4">{sl?.chartTitle ?? "Evolución comparada"}</h4>
          <div className="h-[300px] min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                  axisLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgb(24 24 27)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "rgba(255,255,255,0.8)" }}
                  formatter={(value: number, name: string) => [
                    name === "revenueCurrent" || name === "revenuePrevious"
                      ? formatSaleCurrency(value)
                      : Math.round(Number(value)),
                    name === "revenueCurrent" || name === "countCurrent" ? currentYearLabel : previousYearLabel,
                  ]}
                  labelFormatter={(label) => label}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                  formatter={(value) => <span className="text-white/70 text-xs">{value}</span>}
                />
                <Line
                  type="monotone"
                  dataKey="revenueCurrent"
                  name={currentYearLabel}
                  stroke="rgba(59, 130, 246, 0.9)"
                  strokeWidth={2}
                  dot={{ fill: "rgba(59, 130, 246, 0.8)", r: 2 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="revenuePrevious"
                  name={previousYearLabel}
                  stroke="rgba(148, 163, 184, 0.9)"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={{ fill: "rgba(148, 163, 184, 0.8)", r: 2 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
