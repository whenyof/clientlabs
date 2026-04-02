"use client"

import { useState, useEffect } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface ChartPoint {
  date: string
  ingresos: number
  gastos: number
}

const currencyFmt = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
})

const PERIODS = [
  { label: "7 días", value: "week" },
  { label: "30 días", value: "month" },
  { label: "3 meses", value: "quarter" },
] as const

type Period = (typeof PERIODS)[number]["value"]

function transformData(raw: { month: string; income: number; expenses: number }[]): ChartPoint[] {
  return raw.map((r) => ({
    date: r.month,
    ingresos: r.income,
    gastos: r.expenses,
  }))
}

export function DashboardChart() {
  const [period, setPeriod] = useState<Period>("month")
  const [data, setData] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [totalIngresos, setTotalIngresos] = useState(0)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/finance/analytics?period=${period}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => {
        const points = transformData(json.monthlyTrend ?? [])
        setData(points)
        setTotalIngresos(points.reduce((s, p) => s + p.ingresos, 0))
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [period])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-900">Ingresos vs Gastos</h3>
          {!loading && (
            <p className="mt-0.5 text-[22px] font-semibold tracking-tight text-[#1FA97A]">
              {currencyFmt.format(totalIngresos)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                period === p.value
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="h-2 w-2 rounded-full bg-[#1FA97A]" />
          Ingresos
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="h-0.5 w-4 border-t-2 border-dashed border-red-400" />
          Gastos
        </span>
      </div>

      {loading ? (
        <div className="h-[200px] animate-pulse rounded-lg bg-slate-50" />
      ) : data.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center text-[13px] text-slate-400">
          Sin datos para mostrar
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1FA97A" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1FA97A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "white",
                border: "0.5px solid #E2E8F0",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
              formatter={(value) => [
                currencyFmt.format(Number(value)),
                "",
              ]}
            />
            <Area
              type="monotone"
              dataKey="ingresos"
              stroke="#1FA97A"
              strokeWidth={2}
              fill="url(#colorIngresos)"
            />
            <Area
              type="monotone"
              dataKey="gastos"
              stroke="#EF4444"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="none"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
