"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { formatReportingCurrency } from "../utils"
import type { ChartPoint } from "../types"

type Props = {
  data: ChartPoint[]
}

export function ReportingChart({ data }: Props) {
  const { labels } = useSectorConfig()
  const r = labels.reporting
  const chartTitle = r.chartTitle
  const revenueLabel = r.kpis.revenue

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur min-h-[280px] flex items-center justify-center">
        <p className="text-white/40 text-sm">Sin datos en el periodo seleccionado</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h3 className="text-sm font-medium text-white/80 mb-4">{chartTitle}</h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="reportingRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
              </linearGradient>
            </defs>
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
              formatter={(value: number | undefined) => [formatReportingCurrency(value ?? 0), revenueLabel]}
              labelFormatter={(label) => label}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="rgba(59, 130, 246, 0.9)"
              strokeWidth={2}
              fill="url(#reportingRevenueGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
