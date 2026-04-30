"use client"

import { formatCurrency } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"

export function CashflowBlock() {
  const { analytics, loading } = useFinanceData()
  const k = analytics?.kpis
  const inflow = k?.totalIncome ?? 0
  const outflow = Math.abs(k?.totalExpenses ?? 0)
  const net = k?.netProfit ?? 0

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse h-[176px]" />
  }

  const total = Math.max(inflow, 1)
  const inflowPct  = 100
  const outflowPct = Math.min(100, Math.round((outflow / total) * 100))
  const positive = net >= 0

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-900">Flujo de caja</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Entradas vs salidas</p>
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
            positive ? "bg-[#ECFDF5] text-[#1FA97A]" : "bg-red-50 text-red-500"
          }`}
        >
          {positive ? "Positivo" : "Negativo"}
        </span>
      </div>

      <div className="space-y-3">
        {/* Inflow */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-500">Entradas</span>
            <span className="text-[12px] font-semibold tabular-nums text-[#1FA97A]">{formatCurrency(inflow)}</span>
          </div>
          <div className="h-[5px] w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1FA97A] rounded-full transition-all duration-700"
              style={{ width: `${inflowPct}%` }}
            />
          </div>
        </div>

        {/* Outflow */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-slate-500">Salidas</span>
            <span className="text-[12px] font-semibold tabular-nums text-red-500">{formatCurrency(outflow)}</span>
          </div>
          <div className="h-[5px] w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-400 rounded-full transition-all duration-700"
              style={{ width: `${outflowPct}%` }}
            />
          </div>
        </div>

        {/* Net */}
        <div className={`flex items-center justify-between pt-2 border-t border-slate-100`}>
          <span className="text-[11px] font-medium text-slate-600">Neto</span>
          <span className={`text-[14px] font-bold tabular-nums ${positive ? "text-[#1FA97A]" : "text-red-500"}`}>
            {formatCurrency(net)}
          </span>
        </div>
      </div>
    </div>
  )
}
