"use client"

import { useMemo, useCallback } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import { formatCurrency } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/outline"

const RANGE_OPTIONS = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
] as const

type RangeValue = (typeof RANGE_OPTIONS)[number]["value"]

export function MainChart() {
  const { analytics, period, setPeriod, refetch } = useFinanceData()
  const chartSeries = analytics?.chartSeries ?? []
  const trends = analytics?.trends
  const kpis = analytics?.kpis

  const range = (["today", "week", "month", "year"].includes(period) ? period : "month") as RangeValue

  const handleRangeChange = useCallback(
    (next: RangeValue) => {
      setPeriod(next)
      refetch()
    },
    [setPeriod, refetch]
  )

  const chartData = useMemo(() => {
    return chartSeries.map((d) => ({
      label: d.label,
      income: d.income,
      expense: d.expense,
      profit: d.profit,
    }))
  }, [chartSeries])

  const yDomain = useMemo(() => {
    if (!chartData.length) return [0, 100]
    const flat = chartData.flatMap((d) => [d.income, d.expense, d.profit].filter(Number.isFinite))
    const min = Math.min(0, ...flat)
    const max = Math.max(...flat)
    const pad = (max - min) * 0.1 || 100
    return [Math.floor(min - pad), Math.ceil(max + pad)]
  }, [chartData])

  const hasData = chartData.length > 0 && chartData.some((d) => d.income > 0 || d.expense > 0 || d.profit !== 0)
  const isLoading = false

  const periodProfit = kpis?.netProfit ?? 0
  const profitGrowth = trends?.profitGrowth ?? 0

  return (
    <motion.div
      className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-5 flex flex-col min-h-[380px] w-full overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Range selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2 shrink-0">
        <div className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 p-0.5">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleRangeChange(opt.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${range === opt.value
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/60 hover:text-white/80 hover:bg-white/5"}
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Executive summary — profit hero, above the chart */}
      <div className="shrink-0 mb-4 px-0.5">
        <p className="text-xs uppercase tracking-wider text-white/50 font-medium mb-0.5">
          Beneficio del período
        </p>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span
            className={`text-3xl font-bold tabular-nums tracking-tight ${
              periodProfit >= 0 ? "text-violet-400" : "text-red-400"
            }`}
          >
            {formatCurrency(periodProfit)}
          </span>
          {profitGrowth != null && (
            <span
              className={`flex items-center gap-1 text-sm font-medium ${
                profitGrowth >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {profitGrowth >= 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4" />
              )}
              {profitGrowth >= 0 ? "+" : ""}
              {profitGrowth.toFixed(1)}% vs anterior
            </span>
          )}
        </div>
      </div>

      {/* Chart area — fixed height */}
      <div className="w-full h-[380px] min-h-[380px] shrink-0 relative">
        {isLoading ? (
          <div className="w-full h-full rounded-lg bg-white/5 animate-pulse" />
        ) : !hasData ? (
          <EmptyChartWithAxes />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={range}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 12, right: 12, left: 4, bottom: 12 }}
                >
                  <defs>
                    <linearGradient id="chartIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="chartExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="chartProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="2 2"
                    stroke="rgba(255,255,255,0.04)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    stroke="rgba(255,255,255,0.35)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={6}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.35)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`}
                    domain={yDomain}
                    width={40}
                    tickMargin={2}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                    trends={trends}
                    previousPoints={chartData}
                  />
                }
                    cursor={{ stroke: "rgba(255,255,255,0.18)", strokeWidth: 1 }}
                    isAnimationActive={false}
                  />
                  {/* Income — base reference, thicker + soft gradient */}
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="url(#chartIncome)"
                    isAnimationActive
                    animationDuration={600}
                    animationEasing="ease-out"
                    dot={false}
                    activeDot={{ r: 5, fill: "#10b981", stroke: "rgba(255,255,255,0.4)", strokeWidth: 2 }}
                  />
                  {/* Expenses — contextual, thin */}
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#f87171"
                    strokeWidth={1.5}
                    fill="url(#chartExpense)"
                    isAnimationActive
                    animationDuration={600}
                    animationEasing="ease-out"
                    dot={false}
                    activeDot={{ r: 4, fill: "#ef4444", stroke: "rgba(255,255,255,0.3)", strokeWidth: 2 }}
                  />
                  {/* Profit — hero, thicker + glow */}
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#a78bfa"
                    strokeWidth={3.5}
                    fill="url(#chartProfit)"
                    isAnimationActive
                    animationDuration={600}
                    animationEasing="ease-out"
                    dot={false}
                    activeDot={{
                      r: 6,
                      fill: "#a78bfa",
                      stroke: "rgba(255,255,255,0.5)",
                      strokeWidth: 2,
                      style: { filter: "drop-shadow(0 0 6px rgba(167,139,250,0.6))" },
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 shrink-0 pt-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-white/60">Ingresos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="text-xs font-medium text-white/60">Gastos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
          <span className="text-xs font-medium text-white/60">Beneficio</span>
        </div>
      </div>
    </motion.div>
  )
}

type TooltipPayload = { dataKey: string; value: number }[]

function ChartTooltip({
  active,
  payload,
  label,
  trends,
  previousPoints,
}: {
  active?: boolean
  payload?: TooltipPayload
  label?: string
  trends?: { incomeGrowth?: number; expenseGrowth?: number; profitGrowth?: number }
  previousPoints: { label: string; income: number; expense: number; profit: number }[]
}) {
  if (!active || !payload?.length || !label) return null

  const income = payload.find((p) => p.dataKey === "income")?.value ?? 0
  const expense = payload.find((p) => p.dataKey === "expense")?.value ?? 0
  const profit = payload.find((p) => p.dataKey === "profit")?.value ?? 0

  const idx = previousPoints.findIndex((p) => p.label === label)
  const prev = idx > 0 ? previousPoints[idx - 1] : null
  const deltaIncome = prev != null && prev.income !== 0 ? ((income - prev.income) / prev.income) * 100 : null
  const deltaExpense = prev != null && prev.expense !== 0 ? ((expense - prev.expense) / prev.expense) * 100 : null
  const deltaProfit = prev != null && prev.profit !== 0 ? ((profit - prev.profit) / Math.abs(prev.profit)) * 100 : null

  return (
    <div className="rounded-2xl border border-white/20 bg-black/80 shadow-2xl backdrop-blur-xl overflow-hidden min-w-[220px] ring-1 ring-white/10">
      <div className="px-4 pt-3.5 pb-2.5 border-b border-white/10">
        <p className="text-xs font-semibold text-white/90 uppercase tracking-wider">{label}</p>
      </div>
      <div className="px-4 py-3.5 space-y-2.5">
        <div className="flex justify-between items-baseline gap-6">
          <span className="text-sm text-white/55">Ingresos</span>
          <span className="text-base font-semibold tabular-nums text-emerald-400">
            {formatCurrency(income)}
          </span>
        </div>
        {deltaIncome != null && (
          <p className="text-[11px] text-white/45 -mt-1">
            {deltaIncome >= 0 ? "+" : ""}{deltaIncome.toFixed(1)}% vs anterior
          </p>
        )}
        <div className="flex justify-between items-baseline gap-6">
          <span className="text-sm text-white/55">Gastos</span>
          <span className="text-base font-semibold tabular-nums text-red-400">
            {formatCurrency(expense)}
          </span>
        </div>
        {deltaExpense != null && (
          <p className="text-[11px] text-white/45 -mt-1">
            {deltaExpense >= 0 ? "+" : ""}{deltaExpense.toFixed(1)}% vs anterior
          </p>
        )}
        <div className="flex justify-between items-baseline gap-6 pt-2 border-t border-white/10">
          <span className="text-sm text-white/55">Beneficio</span>
          <span className="text-base font-semibold tabular-nums text-violet-400">
            {formatCurrency(profit)}
          </span>
        </div>
        {deltaProfit != null && (
          <p className="text-[11px] text-white/45 -mt-1">
            {deltaProfit >= 0 ? "+" : ""}{deltaProfit.toFixed(1)}% vs anterior
          </p>
        )}
        {trends && (trends.incomeGrowth != null || trends.profitGrowth != null) && (
          <div className="pt-2 mt-2 border-t border-white/10 flex flex-wrap gap-x-2 text-[11px] text-white/50">
            <span>Resumen período:</span>
            {trends.incomeGrowth != null && (
              <span className={trends.incomeGrowth >= 0 ? "text-emerald-400" : "text-red-400"}>
                Ingresos {trends.incomeGrowth >= 0 ? "+" : ""}{trends.incomeGrowth.toFixed(1)}%
              </span>
            )}
            {trends.profitGrowth != null && (
              <span className={trends.profitGrowth >= 0 ? "text-violet-400" : "text-red-400"}>
                Resultado {trends.profitGrowth >= 0 ? "+" : ""}{trends.profitGrowth.toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyChartWithAxes() {
  const emptyData = useMemo(() => [{ label: "", income: 0, expense: 0, profit: 0 }], [])
  return (
    <div className="relative w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={emptyData} margin={{ top: 12, right: 12, left: 4, bottom: 12 }}>
          <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="label" stroke="rgba(255,255,255,0.25)" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis
            stroke="rgba(255,255,255,0.25)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`}
            domain={[0, 100]}
            width={40}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <p className="text-sm text-white/45 text-center max-w-[260px]">
          Sin datos en este período. Cambia el rango o registra movimientos.
        </p>
      </div>
    </div>
  )
}
