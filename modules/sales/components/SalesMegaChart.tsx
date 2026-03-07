"use client"

import { useState, useMemo } from "react"
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { cn } from "@/lib/utils"
import {
  parseSaleDate,
  getDateKeyDay,
  formatChartLabelDay,
  filterSalesByRange,
  formatSaleCurrency,
} from "../utils"
import { SalesMegaTooltip } from "./SalesMegaTooltip"
import type { Sale } from "../types"

export type MegaChartPreset = "today" | "7d" | "30d" | "6m" | "ytd" | "custom"

type Mode = "sales" | "purchases"

type SalesMegaChartProps = {
  mode?: Mode
  sales: Sale[]
  initialPreset?: MegaChartPreset
  customRange?: { from: Date; to: Date } | null
}

function getMegaRange(
  preset: MegaChartPreset,
  custom?: { from: Date; to: Date } | null
): { from: Date; to: Date } {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  if (preset === "custom" && custom) {
    const from = new Date(custom.from.getFullYear(), custom.from.getMonth(), custom.from.getDate(), 0, 0, 0, 0)
    const to = new Date(custom.to.getFullYear(), custom.to.getMonth(), custom.to.getDate(), 23, 59, 59, 999)
    return { from, to }
  }

  switch (preset) {
    case "today":
      return { from: todayStart, to: todayEnd }
    case "7d": {
      const from7 = new Date(todayStart)
      from7.setDate(from7.getDate() - 6)
      return { from: from7, to: todayEnd }
    }
    case "30d": {
      const from30 = new Date(todayStart)
      from30.setDate(from30.getDate() - 29)
      return { from: from30, to: todayEnd }
    }
    case "6m": {
      const start = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0)
      return { from: start, to: todayEnd }
    }
    case "ytd": {
      const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
      return { from: start, to: todayEnd }
    }
    default:
      return { from: todayStart, to: todayEnd }
  }
}

function amountFor(s: Sale): number {
  return Number((s as Sale & { amount?: number | null }).amount ?? s.total ?? 0)
}

export function SalesMegaChart({
  mode = "sales",
  sales,
  initialPreset = "30d",
  customRange = null,
}: SalesMegaChartProps) {
  const { labels } = useSectorConfig()
  const sl = labels.sales
  const isPurchases = mode === "purchases"
  const [preset, setPreset] = useState<MegaChartPreset>(initialPreset)
  const [showRevenue, setShowRevenue] = useState(true)
  const [showSales, setShowSales] = useState(true)
  const [showAvg, setShowAvg] = useState(true)

  const { from, to } = useMemo(
    () => getMegaRange(preset, preset === "custom" ? customRange : null),
    [preset, customRange]
  )

  const filteredSales = useMemo(() => filterSalesByRange(sales, from, to), [sales, from, to])

  const chartData = useMemo(() => {
    const dayMap = new Map<string, { revenue: number; salesCount: number }>()
    const cursor = new Date(from)
    while (cursor <= to) {
      dayMap.set(getDateKeyDay(cursor), { revenue: 0, salesCount: 0 })
      cursor.setDate(cursor.getDate() + 1)
    }
    for (const s of filteredSales) {
      const d = parseSaleDate(s.saleDate)
      if (!d || d < from || d > to) continue
      const key = getDateKeyDay(d)
      const cur = dayMap.get(key) ?? { revenue: 0, salesCount: 0 }
      cur.revenue += amountFor(s)
      cur.salesCount += 1
      dayMap.set(key, cur)
    }

    const sorted = Array.from(dayMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    const last14 = sorted.slice(-14)
    const dailyAvgRevenue =
      last14.length > 0
        ? last14.reduce((a, [, v]) => a + v.revenue, 0) / 14
        : 0
    const dailyAvgSales =
      last14.length > 0
        ? last14.reduce((a, [, v]) => a + v.salesCount, 0) / 14
        : 0

    const result = sorted.map(([dateKey, { revenue, salesCount }]) => ({
      date: dateKey,
      label: formatChartLabelDay(dateKey),
      revenue,
      salesCount,
      avgTicket: salesCount > 0 ? revenue / salesCount : 0,
      forecastBase: null as number | null,
      forecastLow: null as number | null,
      forecastHigh: null as number | null,
    }))

    const futureDays = 30
    for (let i = 1; i <= futureDays; i++) {
      const d = new Date(to)
      d.setDate(d.getDate() + i)
      const key = getDateKeyDay(d)
      result.push({
        date: key,
        label: formatChartLabelDay(key),
        revenue: 0,
        salesCount: 0,
        avgTicket: 0,
        forecastBase: dailyAvgRevenue,
        forecastLow: dailyAvgRevenue * 0.9,
        forecastHigh: dailyAvgRevenue * 1.1,
      })
    }
    return result.sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredSales, from, to])

  const presets: { value: MegaChartPreset; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "7d", label: "7D" },
    { value: "30d", label: "30D" },
    { value: "6m", label: "6M" },
    { value: "ytd", label: "YTD" },
    { value: "custom", label: "Custom" },
  ]

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur">
      <div className="p-4 border-b border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white/90">
            {isPurchases ? "Evolución del gasto" : (sl?.heroChartTitle ?? "Sales Performance")}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg bg-white/5 p-0.5 border border-white/10">
              {presets.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPreset(p.value)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                    preset === p.value ? "bg-white/15 text-white" : "text-white/60 hover:text-white"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <label className="flex items-center gap-1.5 text-xs text-white/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRevenue}
                  onChange={(e) => setShowRevenue(e.target.checked)}
                  className="rounded border-white/30 bg-white/5"
                />
                {isPurchases ? "Gastos" : "Revenue"}
              </label>
              <label className="flex items-center gap-1.5 text-xs text-white/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSales}
                  onChange={(e) => setShowSales(e.target.checked)}
                  className="rounded border-white/30 bg-white/5"
                />
                {isPurchases ? "Órdenes" : "Sales"}
              </label>
              <label className="flex items-center gap-1.5 text-xs text-white/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAvg}
                  onChange={(e) => setShowAvg(e.target.checked)}
                  className="rounded border-white/30 bg-white/5"
                />
                {isPurchases ? "Coste medio" : "Avg Ticket"}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 pt-2 min-h-[320px]">
        <div className="h-[320px] min-h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => (
                  <SalesMegaTooltip
                    mode={mode}
                    active={active}
                    payload={payload}
                    label={label}
                    labelFormatter={(l) => {
                      const found = chartData.find((d) => d.label === l)
                      return found ? `${found.label}` : l
                    }}
                  />
                )}
              />
              {showRevenue && (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="forecastBase"
                  fill="rgba(59,130,246,0.15)"
                  stroke="none"
                  isAnimationActive={false}
                />
              )}
              {showRevenue && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="rgb(139,92,246)"
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {showSales && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="salesCount"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth={1}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {showAvg && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="avgTicket"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
