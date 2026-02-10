"use client"

import { useMemo, useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { cn } from "@/lib/utils"
import { formatSaleCurrency, aggregateSalesChartData } from "../utils"
import type { Sale } from "../types"
import type { DateRangePreset } from "../types"

type ChartMode = "revenue" | "count" | "avgTicket"

type Props = {
  sales: Sale[]
  dateRange: { from: Date; to: Date }
  preset: DateRangePreset
}

export function SalesChart({ sales, dateRange, preset }: Props) {
  const { labels } = useSectorConfig()
  const sl = labels.sales
  const [mode, setMode] = useState<ChartMode>("revenue")

  const data = useMemo(
    () => aggregateSalesChartData(sales, dateRange.from, dateRange.to, preset),
    [sales, dateRange.from, dateRange.to, preset]
  )

  const dataKey = mode === "revenue" ? "revenue" : mode === "count" ? "count" : "avgTicket"
  const formatValue = (v: number) =>
    mode === "revenue" ? formatSaleCurrency(v) : mode === "count" ? String(v) : formatSaleCurrency(v)
  const tooltipLabel = mode === "revenue" ? sl.table.amount : mode === "count" ? sl.plural : sl.stats.avgTicket

  const modes: { key: ChartMode; label: string }[] = [
    { key: "revenue", label: sl.chartModes.revenue },
    { key: "count", label: sl.chartModes.count },
    { key: "avgTicket", label: sl.chartModes.avgTicket },
  ]

  if (data.length === 0) return null

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h3 className="text-sm font-medium text-white/80">{sl.heroChartTitle}</h3>
        <div className="flex rounded-lg bg-white/5 p-0.5 border border-white/10">
          {modes.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                mode === m.key ? "bg-white/15 text-white" : "text-white/60 hover:text-white"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[320px] min-h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {data.length <= 1 || mode === "count" ? (
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                axisLine={false}
                tickFormatter={(v) => (mode === "revenue" || mode === "avgTicket" ? (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)) : String(v))}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(24 24 27)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.8)" }}
                formatter={(value: number) => [formatValue(value), tooltipLabel]}
                labelFormatter={(label) => label}
              />
              <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell
                    key={entry.date}
                    fill={
                      (mode === "revenue" ? entry.revenue : mode === "count" ? entry.count : entry.avgTicket) > 0
                        ? "rgba(59, 130, 246, 0.6)"
                        : "rgba(255,255,255,0.05)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                axisLine={false}
                tickFormatter={(v) => (mode === "revenue" || mode === "avgTicket" ? (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)) : String(v))}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(24 24 27)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.8)" }}
                formatter={(value: number) => [formatValue(value), tooltipLabel]}
                labelFormatter={(label) => label}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="rgba(59, 130, 246, 0.9)"
                strokeWidth={2}
                dot={{ fill: "rgba(59, 130, 246, 0.8)", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
