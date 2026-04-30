"use client"

import { useMemo, useCallback } from "react"
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { formatCurrency } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"

const RANGE_OPTIONS = [
  { value: "today",  label: "Hoy"     },
  { value: "week",   label: "Semana"  },
  { value: "month",  label: "Mes"     },
  { value: "year",   label: "Año"     },
] as const

type RangeValue = (typeof RANGE_OPTIONS)[number]["value"]

const tickFmt = (v: number) => {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`
  return `${v}`
}

export function MainChart() {
  const { analytics, period, setPeriod, refetch } = useFinanceData()
  const chartSeries = analytics?.chartSeries ?? []
  const trends      = analytics?.trends
  const kpis        = analytics?.kpis

  const range = (["today", "week", "month", "year"].includes(period) ? period : "month") as RangeValue

  const handleRangeChange = useCallback(
    (next: RangeValue) => { setPeriod(next); refetch() },
    [setPeriod, refetch]
  )

  // Filter out trailing buckets that have no data at all (avoids ghost dots on the line)
  const chartData = useMemo(() => {
    const all = chartSeries.map((d) => ({ label: d.label, income: d.income, expense: d.expense, profit: d.profit }))
    // Find last index with actual data
    let last = -1
    for (let i = all.length - 1; i >= 0; i--) {
      if (all[i].income > 0 || all[i].expense > 0) { last = i; break }
    }
    return last >= 0 ? all.slice(0, last + 1) : all
  }, [chartSeries])

  const totalIncome  = kpis?.totalIncome  ?? 0
  const totalProfit  = kpis?.netProfit    ?? 0
  const incomeGrowth = trends?.incomeGrowth ?? 0
  const profitGrowth = trends?.profitGrowth ?? 0

  const yDomain = useMemo(() => {
    if (!chartData.length) return [0, 1000]
    const flat = chartData.flatMap((d) => [d.income, d.expense, d.profit].filter(Number.isFinite))
    const min  = Math.min(0, ...flat)
    const max  = Math.max(100, ...flat)
    const pad  = (max - min) * 0.18 || 500
    return [Math.floor(min - pad), Math.ceil(max + pad)]
  }, [chartData])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        {/* Summary numbers */}
        <div className="flex items-baseline gap-4 sm:gap-6 flex-wrap">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-1">
              Ingresos del período
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-[22px] sm:text-[28px] font-bold tracking-tight leading-none text-slate-900 tabular-nums">
                {formatCurrency(totalIncome)}
              </span>
              {incomeGrowth !== 0 && (
                <span className={`text-[11px] font-semibold ${incomeGrowth >= 0 ? "text-[#1FA97A]" : "text-red-500"}`}>
                  {incomeGrowth >= 0 ? "+" : ""}{incomeGrowth.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className="pl-4 sm:pl-6 border-l border-slate-100">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-1">
              Beneficio neto
            </p>
            <div className="flex items-baseline gap-2">
              <span className={`text-[18px] sm:text-[22px] font-bold tracking-tight leading-none tabular-nums ${totalProfit >= 0 ? "text-[#1FA97A]" : "text-red-500"}`}>
                {formatCurrency(totalProfit)}
              </span>
              {profitGrowth !== 0 && (
                <span className={`text-[11px] font-semibold ${profitGrowth >= 0 ? "text-[#1FA97A]" : "text-red-500"}`}>
                  {profitGrowth >= 0 ? "+" : ""}{profitGrowth.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5 flex-shrink-0 self-start">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleRangeChange(opt.value)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                range === opt.value
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chart ───────────────────────────────────────────────── */}
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart
          data={chartData}
          margin={{ top: 4, right: 4, left: 0, bottom: 4 }}
          barGap={3}
          barCategoryGap="32%"
        >
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1FA97A" stopOpacity={0.75} />
              <stop offset="100%" stopColor="#1FA97A" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FCA5A5" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#FCA5A5" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="label"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: "#94A3B8" }}
          />
          <YAxis
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={tickFmt}
            domain={yDomain}
            width={42}
            tick={{ fill: "#94A3B8" }}
            tickMargin={4}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "rgba(15,23,42,0.03)", radius: 6 }}
            isAnimationActive={false}
          />
          <ReferenceLine y={0} stroke="#E2E8F0" strokeWidth={1} />

          {/* Income — gradient green bars */}
          <Bar dataKey="income" name="Ingresos" fill="url(#incomeGrad)" radius={[4, 4, 0, 0]} maxBarSize={44} isAnimationActive animationDuration={500} />
          {/* Expenses — soft red bars */}
          <Bar dataKey="expense" name="Gastos" fill="url(#expenseGrad)" stroke="#FCA5A5" strokeWidth={0} radius={[4, 4, 0, 0]} maxBarSize={44} isAnimationActive animationDuration={500} />
          {/* Profit — indigo line */}
          <Line type="monotone" dataKey="profit" name="Beneficio" stroke="#6366F1" strokeWidth={2.5} dot={{ fill: "#6366F1", r: 3.5, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#6366F1", stroke: "#EEF2FF", strokeWidth: 2 }} isAnimationActive animationDuration={600} />
        </ComposedChart>
      </ResponsiveContainer>

      {/* ── Legend ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-5 mt-3 pt-3 border-t border-slate-100">
        {[
          { swatch: "bg-[#1FA97A]",                              label: "Ingresos"  },
          { swatch: "bg-red-100 border border-red-200",          label: "Gastos"    },
          { swatch: "rounded-full bg-indigo-500",                label: "Beneficio" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-[3px] flex-shrink-0 ${l.swatch}`} />
            <span className="text-[11px] font-medium text-slate-500">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChartTooltip({
  active, payload, label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
  label?: string
}) {
  if (!active || !payload?.length || !label) return null

  const income  = payload.find((p) => p.name === "Ingresos")?.value  ?? 0
  const expense = payload.find((p) => p.name === "Gastos")?.value    ?? 0
  const profit  = payload.find((p) => p.name === "Beneficio")?.value ?? 0

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xl p-3.5 min-w-[190px]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-2.5 pb-2 border-b border-slate-100">
        {label}
      </p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-[2px] bg-[#1FA97A]" />
            <span className="text-[11px] text-slate-500">Ingresos</span>
          </div>
          <span className="text-[12px] font-bold tabular-nums text-[#1FA97A]">{formatCurrency(income)}</span>
        </div>
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-[2px] bg-red-200 border border-red-300" />
            <span className="text-[11px] text-slate-500">Gastos</span>
          </div>
          <span className="text-[12px] font-bold tabular-nums text-red-500">{formatCurrency(expense)}</span>
        </div>
        <div className="flex items-center justify-between gap-8 pt-1.5 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-indigo-500" />
            <span className="text-[11px] text-slate-500">Beneficio</span>
          </div>
          <span className={`text-[12px] font-bold tabular-nums ${profit >= 0 ? "text-indigo-600" : "text-red-500"}`}>
            {formatCurrency(profit)}
          </span>
        </div>
      </div>
    </div>
  )
}
