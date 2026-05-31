"use client"

import React, { memo } from "react"
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

function ReportingChartComponent({ data }: Props) {
  const { labels } = useSectorConfig()
  const r = labels.reporting
  const chartTitle = r.chartTitle
  const revenueLabel = r.kpis.revenue

  if (data.length === 0) {
    return (
      <div className="rounded-xl p-6 min-h-[280px] flex items-center justify-center" style={{ border: "1px solid #e8e8e8", background: "#ffffff" }}>
        <p className="text-sm" style={{ color: "#737373" }}>Sin datos en el periodo seleccionado</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl p-6" style={{ border: "1px solid #e8e8e8", background: "#ffffff" }}>
      <h3 className="text-sm font-medium mb-4" style={{ color: "#0a0a0a" }}>{chartTitle}</h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="reportingRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fill: "#737373", fontSize: 11 }}
              axisLine={{ stroke: "#e8e8e8" }}
            />
            <YAxis
              tick={{ fill: "#737373", fontSize: 11 }}
              axisLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#0a0a0a" }}
              formatter={(value: unknown) => [formatReportingCurrency(typeof value === "number" ? value : Number(value) || 0), revenueLabel]}
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

export const ReportingChart = memo(ReportingChartComponent)
