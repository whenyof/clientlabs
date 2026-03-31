"use client"

import { TrendingUp, BarChart3, Calendar, ArrowUp, ArrowDown } from "lucide-react"
import { formatCurrency } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"

export function Forecast() {
  const { analytics, loading } = useFinanceData()
  const pred = analytics?.predictions
  const netProfit = analytics?.kpis?.netProfit ?? 0
  const nextCashFlow = pred?.nextMonthCashFlow ?? 0

  if (loading) {
    return <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] border-[var(--border-subtle)] p-5 animate-pulse h-48" />
  }

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] border-[var(--border-subtle)] p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Pronóstico financiero</h3>
          <p className="text-xs text-[var(--text-secondary)]">Predicciones de flujo de caja</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <Calendar className="w-3.5 h-3.5" />
          <span>Basado en datos reales</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="p-3.5 bg-blue-500/[0.08] border border-blue-500/15 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">Este período</span>
          </div>
          <div className="text-xl font-bold text-[var(--text-primary)] mb-0.5">
            {formatCurrency(netProfit)}
          </div>
          <div className="text-xs text-[var(--text-secondary)]">Beneficio neto actual</div>
          <div className="mt-2 flex items-center gap-1">
            {netProfit >= 0
              ? <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
              : <ArrowDown className="w-3.5 h-3.5 text-red-400" />}
            <span className={`text-xs font-medium ${netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {netProfit >= 0 ? "Positivo" : "Negativo"}
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-emerald-500/[0.08] border border-emerald-500/15 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">Próximo mes</span>
          </div>
          <div className="text-xl font-bold text-[var(--text-primary)] mb-0.5">
            {formatCurrency(nextCashFlow)}
          </div>
          <div className="text-xs text-[var(--text-secondary)]">Flujo previsto (modelo)</div>
        </div>
      </div>

      {pred && (pred.nextMonthRevenue != null || pred.nextMonthExpenses != null) ? (
        <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)]">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {pred.nextMonthRevenue != null && (
              <div>
                <div className="text-xs text-[var(--text-secondary)] mb-0.5">Ingresos previstos</div>
                <div className="text-emerald-400 font-semibold text-sm">{formatCurrency(pred.nextMonthRevenue)}</div>
              </div>
            )}
            {pred.nextMonthExpenses != null && (
              <div>
                <div className="text-xs text-[var(--text-secondary)] mb-0.5">Gastos previstos</div>
                <div className="text-red-400 font-semibold text-sm">{formatCurrency(pred.nextMonthExpenses)}</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-4 text-center text-[var(--text-secondary)] text-xs">
          Sin datos de pronóstico. Añade más transacciones para ver predicciones.
        </div>
      )}

      {pred?.nextMonthCashFlow != null && pred.nextMonthCashFlow < 0 && (
        <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
          <div className="text-orange-400 text-xs font-medium">Flujo previsto negativo el próximo mes</div>
          <div className="text-xs text-[var(--text-secondary)] mt-0.5">Revisa gastos e ingresos previstos.</div>
        </div>
      )}
    </div>
  )
}
