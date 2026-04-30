"use client"

import { CheckCircle2, AlertCircle } from "lucide-react"
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
    { label: "Rentabilidad", ok: profit >= 0 && profitGrowth >= -5, okText: "Estable o al alza", badText: "Presión a la baja" },
    { label: "Gastos",       ok: expenseGrowth <= 15,               okText: "Controlados",        badText: "Subiendo con fuerza" },
    { label: "Liquidez",     ok: cashFlow >= 0,                     okText: "Liquidez sana",      badText: "Flujo negativo" },
    { label: "Concentración",ok: topShare < 50,                     okText: "Cartera diversif.",  badText: "Riesgo concentración" },
  ]

  const score = items.filter((i) => i.ok).length
  const scoreColor = score === 4 ? "#1FA97A" : score >= 2 ? "#D97706" : "#DC2626"

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-900">Salud del negocio</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">4 indicadores clave</p>
        </div>
        {/* Score ring */}
        <div
          className="relative h-9 w-9 flex-shrink-0 rounded-full"
          style={{ background: `conic-gradient(${scoreColor} ${(score / 4) * 360}deg, #E2E8F0 0deg)` }}
        >
          <div className="absolute inset-1.5 flex items-center justify-center rounded-full bg-white">
            <span className="text-[9px] font-bold" style={{ color: scoreColor }}>{score}/4</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-2">
              {item.ok
                ? <CheckCircle2 className="h-3.5 w-3.5 text-[#1FA97A] flex-shrink-0" />
                : <AlertCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />}
              <span className="text-[11px] text-slate-500">{item.label}</span>
            </div>
            <span className={`text-[11px] font-semibold ${item.ok ? "text-slate-700" : "text-amber-600"}`}>
              {item.ok ? item.okText : item.badText}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
