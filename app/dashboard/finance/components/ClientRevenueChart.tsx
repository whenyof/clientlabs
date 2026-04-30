"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { useFinanceData } from "../context/FinanceDataContext"

const fmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })

const PALETTE = ["#1FA97A", "#6366F1", "#F59E0B", "#3B82F6", "#EC4899", "#14B8A6"]

export function ClientRevenueChart() {
  const { analytics, loading } = useFinanceData()
  const raw     = analytics?.clientRevenue ?? []
  const income  = analytics?.kpis?.totalIncome ?? 0

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white h-full animate-pulse min-h-[340px]" />
  }

  const hasData = raw.length > 0 && income > 0
  const total   = raw.reduce((s, c) => s + c.totalRevenue, 0)
  const slices  = raw
    .filter((c) => c.totalRevenue > 0)
    .slice(0, 6)
    .map((c, i) => ({
      name:  c.clientName,
      value: c.totalRevenue,
      pct:   total > 0 ? Math.round((c.totalRevenue / total) * 100) : 0,
      color: PALETTE[i % PALETTE.length],
    }))

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-[13px] font-semibold text-slate-900">Ingresos por cliente</h3>
        <p className="text-[10px] text-slate-400 mt-0.5">Distribución del período</p>
      </div>

      {!hasData ? (
        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          <p className="text-[12px] text-slate-400">Sin datos de clientes aún</p>
        </div>
      ) : (
        <>
          {/* Donut */}
          <div className="relative" style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={slices}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                  isAnimationActive
                  animationDuration={500}
                >
                  {slices.map((_, i) => (
                    <Cell key={i} fill={slices[i].color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [fmt.format(Number(val ?? 0)), ""]}
                  contentStyle={{
                    fontSize: 11, borderRadius: 8,
                    border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  itemStyle={{ color: "#475569" }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Centre label */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">Total</span>
              <span className="text-[17px] font-bold text-slate-900 tabular-nums leading-tight">{fmt.format(total)}</span>
              <span className="text-[9px] text-slate-400">{slices.length} cliente{slices.length !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Legend list */}
          <div className="mt-4 space-y-2.5">
            {slices.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[11px] text-slate-600 truncate flex-1 min-w-0">{item.name}</span>
                <span className="text-[10px] font-medium text-slate-400 tabular-nums flex-shrink-0">{item.pct}%</span>
                <span className="text-[11px] font-semibold text-slate-700 tabular-nums flex-shrink-0">
                  {fmt.format(item.value)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
