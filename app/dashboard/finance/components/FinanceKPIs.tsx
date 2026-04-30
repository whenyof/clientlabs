"use client"

import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useFinanceData } from "../context/FinanceDataContext"

const fmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })

function MiniSparkline({
  data, color, id,
}: { data: number[]; color: string; id: string }) {
  if (data.length < 2) return <div className="h-10" />
  const w = 100, h = 36
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => [
    ((i / (data.length - 1)) * w).toFixed(1),
    (h - ((v - min) / range) * (h - 6) - 3).toFixed(1),
  ])
  const line = pts.map(([x, y]) => `${x},${y}`).join(" ")
  const area = `M ${pts[0][0]},${h} ${pts.map(([x, y]) => `L ${x},${y}`).join(" ")} L ${pts[pts.length - 1][0]},${h} Z`
  const gradId = `sg-${id}`
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill={color} />
    </svg>
  )
}

function Delta({ pct }: { pct: number }) {
  const up = pct >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
      up ? "bg-[#ECFDF5] text-[#1FA97A]" : "bg-red-50 text-red-500"
    }`}>
      {up ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
      {up ? "+" : ""}{pct.toFixed(1)}%
    </span>
  )
}

export function FinanceKPIs() {
  const { analytics, loading } = useFinanceData()
  const k       = analytics?.kpis
  const trends  = analytics?.trends
  const monthly = analytics?.monthlyTrend ?? []

  const totalIncome    = k?.totalIncome    ?? 0
  const totalExpenses  = Math.abs(k?.totalExpenses ?? 0)
  const netProfit      = k?.netProfit      ?? 0
  const pendingPayments= k?.pendingPayments ?? 0
  const marginPct = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0
  const pendingPct = (totalIncome + pendingPayments) > 0
    ? Math.round((pendingPayments / (totalIncome + pendingPayments)) * 100) : 0

  const cards = [
    {
      id: "income",
      label: "Facturación total",
      value: fmt.format(totalIncome),
      valueColor: "text-slate-900",
      delta: trends?.incomeGrowth ?? null,
      sub: "cobrado este mes",
      spark: monthly.map((m) => m.income),
      sparkColor: "#1FA97A",
      accent: "border-t-[#1FA97A]",
    },
    {
      id: "profit",
      label: "Beneficio neto",
      value: fmt.format(netProfit),
      valueColor: netProfit >= 0 ? "text-[#1FA97A]" : "text-red-500",
      delta: trends?.profitGrowth ?? null,
      sub: `${marginPct}% de margen`,
      spark: monthly.map((m) => m.profit),
      sparkColor: netProfit >= 0 ? "#6366F1" : "#EF4444",
      accent: "border-t-indigo-400",
    },
    {
      id: "expenses",
      label: "Gastos del período",
      value: fmt.format(totalExpenses),
      valueColor: "text-slate-900",
      delta: trends?.expenseGrowth != null ? -trends.expenseGrowth : null,
      sub: "costes totales",
      spark: monthly.map((m) => m.expenses),
      sparkColor: "#F87171",
      accent: "border-t-red-300",
    },
    {
      id: "pending",
      label: "Facturas pendientes",
      value: fmt.format(pendingPayments),
      valueColor: pendingPayments > 0 ? "text-amber-600" : "text-slate-400",
      delta: null as number | null,
      sub: pendingPct > 0 ? `${pendingPct}% aún por cobrar` : "al corriente de pago",
      spark: [] as number[],
      sparkColor: "#F59E0B",
      accent: "border-t-amber-400",
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white h-[148px] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`rounded-xl border border-slate-200 bg-white overflow-hidden border-t-2 ${card.accent}`}
        >
          <div className="px-4 pt-4 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-2.5">
              {card.label}
            </p>
            <div className="flex items-start justify-between gap-1">
              <span className={`text-[16px] sm:text-[21px] font-bold leading-none tracking-tight tabular-nums ${card.valueColor}`}>
                {card.value}
              </span>
              {card.delta != null && <Delta pct={card.delta} />}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">{card.sub}</p>
          </div>
          <div className="px-3 pb-3 mt-0.5">
            <MiniSparkline data={card.spark} color={card.sparkColor} id={card.id} />
          </div>
        </div>
      ))}
    </div>
  )
}
