"use client"

import { TrendingUp, TrendingDown, Calendar, Info } from "lucide-react"
import { formatCurrency } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"

export function Forecast() {
  const { analytics, loading } = useFinanceData()
  const pred        = analytics?.predictions
  const monthly     = analytics?.monthlyTrend ?? []
  const netProfit   = analytics?.kpis?.netProfit   ?? 0
  const nextCashFlow= pred?.nextMonthCashFlow ?? 0
  const nextRevenue = pred?.nextMonthRevenue  ?? 0
  const nextExpenses= pred?.nextMonthExpenses ?? 0

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse h-[176px]" />
  }

  // Predictions are unreliable with < 3 months of data
  const monthsWithData  = monthly.filter((m) => m.income > 0 || m.expenses > 0).length
  const hasEnoughData   = monthsWithData >= 3
  const profitPositive  = netProfit   >= 0
  const nextPositive    = nextCashFlow >= 0

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-900">Pronóstico</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {hasEnoughData ? "Basado en regresión histórica" : "Acumulando historial…"}
          </p>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Calendar className="h-3 w-3" />
          <span>Próximo mes</span>
        </div>
      </div>

      {/* Current vs next */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">
          <div className="flex items-center gap-1 mb-1">
            {profitPositive
              ? <TrendingUp className="h-3 w-3 text-[#1FA97A]" />
              : <TrendingDown className="h-3 w-3 text-red-500" />}
            <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">Este mes</span>
          </div>
          <p className={`text-[15px] font-bold tabular-nums leading-none ${profitPositive ? "text-[#1FA97A]" : "text-red-500"}`}>
            {formatCurrency(netProfit)}
          </p>
          <p className="text-[9px] text-slate-400 mt-0.5">beneficio neto</p>
        </div>

        <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">
          {hasEnoughData ? (
            <>
              <div className="flex items-center gap-1 mb-1">
                {nextPositive
                  ? <TrendingUp className="h-3 w-3 text-[#1FA97A]" />
                  : <TrendingDown className="h-3 w-3 text-red-500" />}
                <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">Próximo</span>
              </div>
              <p className={`text-[15px] font-bold tabular-nums leading-none ${nextPositive ? "text-[#1FA97A]" : "text-red-500"}`}>
                {formatCurrency(nextCashFlow)}
              </p>
              <p className="text-[9px] text-slate-400 mt-0.5">flujo previsto</p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1 mb-1">
                <Info className="h-3 w-3 text-slate-300" />
                <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-400">Próximo</span>
              </div>
              <p className="text-[12px] font-semibold text-slate-300 leading-tight">Sin datos</p>
              <p className="text-[9px] text-slate-300 mt-0.5">
                necesitas {3 - monthsWithData} mes{3 - monthsWithData !== 1 ? "es" : ""} más
              </p>
            </>
          )}
        </div>
      </div>

      {/* Breakdown */}
      {hasEnoughData ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Ingresos previstos</span>
            <span className="text-[11px] font-semibold tabular-nums text-[#1FA97A]">{formatCurrency(nextRevenue)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Gastos previstos</span>
            <span className="text-[11px] font-semibold tabular-nums text-red-500">{formatCurrency(nextExpenses)}</span>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 px-3 py-2.5 text-center">
          <p className="text-[10px] text-slate-400">
            Sigue registrando ingresos y gastos — el modelo de predicción se activa con {3 - monthsWithData} mes{3 - monthsWithData !== 1 ? "es" : ""} más de historial.
          </p>
        </div>
      )}
    </div>
  )
}
