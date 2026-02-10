"use client"

import { useMemo, useState } from "react"
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
import { cn } from "@/lib/utils"
import { formatReportingCurrency } from "../utils"
import {
  getYoyDateRanges,
  filterSalesByDateRange,
  aggregateYoYChartData,
  computeYoYKPIs,
} from "../utils"
import type { ReportingSale } from "../types"
import type { YoYPeriodPreset } from "../types"

type Props = {
  sales: ReportingSale[]
}

function YoYBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-white/40 text-sm">—</span>
  const positive = value >= 0
  return (
    <span
      className={cn(
        "text-sm font-semibold",
        positive ? "text-emerald-400" : "text-rose-400"
      )}
    >
      {value > 0 ? "+" : ""}{value}%
    </span>
  )
}

export function ReportingYoY({ sales }: Props) {
  const { labels } = useSectorConfig()
  const y = labels.reporting.yoy

  const [period, setPeriod] = useState<YoYPeriodPreset>("ytd")

  const { current, previous } = useMemo(() => getYoyDateRanges(period), [period])

  const salesCurrent = useMemo(
    () => filterSalesByDateRange(sales, current.from, current.to),
    [sales, current]
  )
  const salesPrevious = useMemo(
    () => filterSalesByDateRange(sales, previous.from, previous.to),
    [sales, previous]
  )

  const yoyKpis = useMemo(
    () => computeYoYKPIs(salesCurrent, salesPrevious),
    [salesCurrent, salesPrevious]
  )

  const chartData = useMemo(
    () => aggregateYoYChartData(salesCurrent, salesPrevious, period),
    [salesCurrent, salesPrevious, period]
  )

  const currentYearLabel = String(new Date().getFullYear())
  const previousYearLabel = String(new Date().getFullYear() - 1)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-sm font-medium text-white/80">{y.title}</h3>
        <div className="flex rounded-lg bg-white/5 p-0.5 border border-white/10">
          <button
            type="button"
            onClick={() => setPeriod("ytd")}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              period === "ytd" ? "bg-white/15 text-white" : "text-white/60 hover:text-white"
            )}
          >
            {y.periodYtd}
          </button>
          <button
            type="button"
            onClick={() => setPeriod("full")}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              period === "full" ? "bg-white/15 text-white" : "text-white/60 hover:text-white"
            )}
          >
            {y.periodFullYear}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider">
            {y.revenueYoY}
          </p>
          <p className="text-lg font-bold text-white mt-0.5">
            {formatReportingCurrency(yoyKpis.revenueCurrent)}
          </p>
          <p className="text-xs text-white/40 mt-0.5">
            {previousYearLabel}: {formatReportingCurrency(yoyKpis.revenuePrevious)}
          </p>
          <YoYBadge value={yoyKpis.revenueYoY} />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider">
            {y.salesYoY}
          </p>
          <p className="text-lg font-bold text-white mt-0.5">{yoyKpis.salesCurrent}</p>
          <p className="text-xs text-white/40 mt-0.5">
            {previousYearLabel}: {yoyKpis.salesPrevious}
          </p>
          <YoYBadge value={yoyKpis.salesYoY} />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider">
            {y.avgTicketYoY}
          </p>
          <p className="text-lg font-bold text-white mt-0.5">
            {formatReportingCurrency(yoyKpis.avgTicketCurrent)}
          </p>
          <p className="text-xs text-white/40 mt-0.5">
            {previousYearLabel}: {formatReportingCurrency(yoyKpis.avgTicketPrevious)}
          </p>
          <YoYBadge value={yoyKpis.avgTicketYoY} />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="h-[280px] w-full">
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
                formatter={(value: number | undefined) => [formatReportingCurrency(value ?? 0), ""]}
                labelFormatter={(label) => label}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px" }}
                formatter={(value) => <span className="text-white/70">{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="currentYear"
                name={`${y.currentYear} (${currentYearLabel})`}
                stroke="rgba(59, 130, 246, 0.95)"
                strokeWidth={2}
                dot={{ fill: "rgba(59, 130, 246, 0.9)", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="previousYear"
                name={`${y.previousYear} (${previousYearLabel})`}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                dot={{ fill: "rgba(255,255,255,0.4)", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
