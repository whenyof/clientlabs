"use client"

import { CheckCircle2, AlertTriangle } from "lucide-react"
import { useFinanceData } from "../context/FinanceDataContext"

export function BusinessHealth() {
  const { analytics } = useFinanceData()
  const k = analytics?.kpis
  const trends = analytics?.trends
  const clientRevenue = analytics?.clientRevenue ?? []
  const profit = k?.netProfit ?? 0
  const cashFlow = k?.cashFlow ?? 0
  const profitGrowth = trends?.profitGrowth ?? 0
  const expenseGrowth = trends?.expenseGrowth ?? 0
  const totalRev = clientRevenue.reduce((s: number, c: { totalRevenue: number }) => s + c.totalRevenue, 0)
  const topShare = totalRev > 0 && clientRevenue[0] ? (clientRevenue[0].totalRevenue / totalRev) * 100 : 0

  const items = [
    {
      label: "Rentabilidad",
      status: profit >= 0 && profitGrowth >= -5,
      text: profit >= 0 && profitGrowth >= -5 ? "Estable o al alza" : "Presión a la baja",
    },
    {
      label: "Gastos",
      status: (expenseGrowth ?? 0) <= 15,
      text: (expenseGrowth ?? 0) > 15 ? "Subiendo con fuerza" : "Controlados",
    },
    {
      label: "Liquidez",
      status: cashFlow >= 0,
      text: cashFlow >= 0 ? "Liquidez sana" : "Flujo negativo",
    },
    {
      label: "Concentración",
      status: topShare < 50,
      text: topShare >= 50 ? "Riesgo de concentración" : "Cartera diversificada",
    },
  ]

  const healthScore = items.filter((i) => i.status).length
  const scoreColor =
    healthScore === 4 ? "text-emerald-400" :
    healthScore >= 2 ? "text-amber-400" : "text-red-400"

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Salud del negocio</h3>
        <span className={`text-xs font-bold ${scoreColor}`}>{healthScore}/4</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-subtle)]/60 bg-[var(--bg-card)] border-[var(--border-subtle)]"
          >
            {item.status ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden />
            )}
            <div className="min-w-0">
              <p className="text-[11px] text-[var(--text-secondary)]">{item.label}</p>
              <p className={`text-sm font-medium ${item.status ? "text-[var(--text-primary)]" : "text-amber-400/90"}`}>
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
