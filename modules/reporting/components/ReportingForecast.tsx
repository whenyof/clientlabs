"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { formatReportingCurrency } from "../utils"
import type { RevenueForecastData } from "../types"

type Props = {
  forecast: RevenueForecastData | null
}

export function ReportingForecast({ forecast }: Props) {
  const { labels } = useSectorConfig()
  const f = labels.reporting.forecast

  const chartData = useMemo(() => {
    if (!forecast) return []
    const n = forecast.historicalRevenue.length
    return forecast.monthLabels.map((label, i) => ({
      label,
      historical: i < n ? forecast.historicalRevenue[i] : null,
      conservative: i >= n ? forecast.scenarios.conservative[i - n] : null,
      realistic: i >= n ? forecast.scenarios.realistic[i - n] : null,
      optimistic: i >= n ? forecast.scenarios.optimistic[i - n] : null,
    }))
  }, [forecast])

  if (!forecast || chartData.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur min-h-[280px] flex items-center justify-center">
        <p className="text-white/40 text-sm">Necesitas al menos 2 meses de datos para ver la previsión</p>
      </div>
    )
  }

  const n = forecast.historicalRevenue.length

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h3 className="text-sm font-medium text-white/80 mb-4">{f.title}</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
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
              formatter={(value: number | undefined) => (value != null ? [formatReportingCurrency(value), ""] : [])}
              labelFormatter={(label) => label}
            />
            <ReferenceLine x={chartData[n - 1]?.label} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="historical"
              name={f.historical}
              stroke="rgba(255,255,255,0.85)"
              strokeWidth={2}
              dot={{ fill: "rgba(255,255,255,0.6)", r: 3 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="conservative"
              name={f.conservative}
              stroke="rgba(234, 179, 8, 0.9)"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              dot={{ fill: "rgba(234, 179, 8, 0.8)", r: 2 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="realistic"
              name={f.realistic}
              stroke="rgba(59, 130, 246, 0.9)"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              dot={{ fill: "rgba(59, 130, 246, 0.8)", r: 2 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="optimistic"
              name={f.optimistic}
              stroke="rgba(34, 197, 94, 0.9)"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              dot={{ fill: "rgba(34, 197, 94, 0.8)", r: 2 }}
              connectNulls={false}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px" }}
              formatter={(value) => <span className="text-white/70">{value}</span>}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-white/40 mt-3">
        Basado en tendencia lineal de los últimos 12 meses. Conservador 90%, optimista +10%.
      </p>
    </div>
  )
}
