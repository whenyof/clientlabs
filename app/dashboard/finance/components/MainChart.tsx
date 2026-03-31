"use client"

import { useMemo, useCallback, useRef } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"
import { formatCurrency } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"

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

  const rawData = useMemo(
    () => chartSeries.map((d) => ({ label: d.label, income: d.income, expense: d.expense, profit: d.profit })),
    [chartSeries]
  )

  const demoData = useMemo(
    () => [
      { label: "S1", income: 4000, expense: 2500, profit: 1500 },
      { label: "S2", income: 5200, expense: 3100, profit: 2100 },
      { label: "S3", income: 4800, expense: 2900, profit: 1900 },
      { label: "S4", income: 6100, expense: 3200, profit: 2900 },
    ],
    []
  )

  const chartData = rawData.length > 0 ? rawData : demoData
  const finalData =
    chartData.length > 0
      ? chartData
      : [
          { label: "A", income: 1000, expense: 600, profit: 400 },
          { label: "B", income: 2000, expense: 1200, profit: 800 },
        ]

  const yDomain = useMemo(() => {
    if (!finalData.length) return [0, 100]
    const flat = finalData.flatMap((d) => [d.income, d.expense, d.profit].filter(Number.isFinite))
    const min = Math.min(0, ...flat)
    const max = Math.max(...flat)
    const pad = (max - min) * 0.1 || 100
    return [Math.floor(min - pad), Math.ceil(max + pad)]
  }, [finalData])

  const periodProfit = kpis?.netProfit ?? 0
  const profitGrowth = trends?.profitGrowth ?? 0

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 flex flex-col w-full overflow-hidden">
      {/* Range selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0">
        <div className="flex items-center gap-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] p-0.5">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleRangeChange(opt.value)}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-all
                ${range === opt.value
                  ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Profit hero */}
        <div className="flex items-baseline gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-medium">
              Beneficio período
            </p>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold tabular-nums tracking-tight ${periodProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {formatCurrency(periodProfit)}
              </span>
              {profitGrowth != null && (
                <span className={`flex items-center gap-0.5 text-xs font-medium ${profitGrowth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {profitGrowth >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {profitGrowth >= 0 ? "+" : ""}{profitGrowth.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={finalData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="chartIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="chartExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="chartProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 2" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="rgba(0,0,0,0.25)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickMargin={6}
            />
            <YAxis
              stroke="rgba(0,0,0,0.25)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`}
              domain={yDomain}
              width={38}
              tickMargin={2}
            />
            <Tooltip
              content={<ChartTooltip trends={trends} previousPoints={finalData} />}
              cursor={{ stroke: "rgba(0,0,0,0.1)", strokeWidth: 1 }}
              isAnimationActive={false}
            />
            <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fill="url(#chartIncome)" isAnimationActive animationDuration={500} dot={false} activeDot={{ r: 4, fill: "#10b981", strokeWidth: 0 }} />
            <Area type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={1.5} fill="url(#chartExpense)" isAnimationActive animationDuration={500} dot={false} activeDot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }} />
            <Area type="monotone" dataKey="profit" stroke="#a78bfa" strokeWidth={3} fill="url(#chartProfit)" isAnimationActive animationDuration={500} dot={false} activeDot={{ r: 5, fill: "#a78bfa", strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-3 pt-3 border-t border-[var(--border-subtle)] shrink-0">
        {[
          { color: "bg-emerald-500", label: "Ingresos" },
          { color: "bg-red-500/80", label: "Gastos" },
          { color: "bg-violet-400", label: "Beneficio" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${l.color}`} />
            <span className="text-xs font-medium text-[var(--text-secondary)]">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
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
  const deltaIncome = prev && prev.income !== 0 ? ((income - prev.income) / prev.income) * 100 : null
  const deltaExpense = prev && prev.expense !== 0 ? ((expense - prev.expense) / prev.expense) * 100 : null

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-white shadow-xl min-w-[200px]">
      <div className="px-4 pt-3 pb-2 border-b border-[var(--border-subtle)]">
        <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{label}</p>
      </div>
      <div className="px-4 py-3 space-y-2">
        <div className="flex justify-between items-baseline gap-6">
          <span className="text-xs text-[var(--text-secondary)]">Ingresos</span>
          <span className="text-sm font-semibold tabular-nums text-emerald-400">{formatCurrency(income)}</span>
        </div>
        {deltaIncome != null && (
          <p className="text-[10px] text-[var(--text-secondary)] -mt-1">{deltaIncome >= 0 ? "+" : ""}{deltaIncome.toFixed(1)}% vs anterior</p>
        )}
        <div className="flex justify-between items-baseline gap-6">
          <span className="text-xs text-[var(--text-secondary)]">Gastos</span>
          <span className="text-sm font-semibold tabular-nums text-red-400">{formatCurrency(expense)}</span>
        </div>
        {deltaExpense != null && (
          <p className="text-[10px] text-[var(--text-secondary)] -mt-1">{deltaExpense >= 0 ? "+" : ""}{deltaExpense.toFixed(1)}% vs anterior</p>
        )}
        <div className="flex justify-between items-baseline gap-6 pt-1.5 border-t border-[var(--border-subtle)]">
          <span className="text-xs text-[var(--text-secondary)]">Beneficio</span>
          <span className="text-sm font-semibold tabular-nums text-violet-400">{formatCurrency(profit)}</span>
        </div>
      </div>
    </div>
  )
}
