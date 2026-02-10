"use client"

import { useFinanceData } from "../context/FinanceDataContext"
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"

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
      text: topShare >= 50 ? "Riesgo concentración" : "Diversificado",
    },
  ]

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Salud del negocio</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]"
          >
            {item.status ? (
              <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 shrink-0" aria-hidden />
            )}
            <div className="min-w-0">
              <p className="text-xs text-white/50">{item.label}</p>
              <p className={`text-sm font-medium ${item.status ? "text-white" : "text-amber-400/90"}`}>
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
