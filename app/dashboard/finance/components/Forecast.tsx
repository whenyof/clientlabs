"use client"

import { motion } from "framer-motion"
import { formatCurrency } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"
import {
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline"

export function Forecast() {
  const { analytics, loading } = useFinanceData()
  const pred = analytics?.predictions
  const netProfit = analytics?.kpis?.netProfit ?? 0
  const nextCashFlow = pred?.nextMonthCashFlow ?? 0

  if (loading) {
    return <div className="bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] p-6 animate-pulse h-48" />
  }

  return (
    <motion.div
      className="bg-[var(--bg-main)] backdrop-blur-sm rounded-xl border border-[var(--border-subtle)] p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Pronóstico Financiero</h3>
          <p className="text-[var(--text-secondary)] text-sm">Predicciones de flujo de caja</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <CalendarIcon className="w-4 h-4" />
          <span>Basado en datos reales</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <motion.div
          className="p-4 bg-gradient-to-br from-blue-500/10 to-teal-500/10 border border-blue-500/20 rounded-xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <ChartBarIcon className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-semibold">Este período</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
            {formatCurrency(netProfit)}
          </div>
          <div className="text-sm text-[var(--text-secondary)]">Beneficio neto actual</div>
          <div className="mt-2 flex items-center gap-1">
            {netProfit >= 0 ? <ArrowUpIcon className="w-4 h-4 text-green-400" /> : <ArrowDownIcon className="w-4 h-4 text-red-400" />}
            <span className={`text-sm ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netProfit >= 0 ? 'Positivo' : 'Negativo'}
            </span>
          </div>
        </motion.div>

        <motion.div
          className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-semibold">Próximo mes</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
            {formatCurrency(nextCashFlow)}
          </div>
          <div className="text-sm text-[var(--text-secondary)]">Flujo previsto (modelo)</div>
        </motion.div>
      </div>

      <div className="space-y-4">
        {pred && (pred.nextMonthRevenue != null || pred.nextMonthExpenses != null || pred.nextMonthCashFlow != null) ? (
          <motion.div
            className="p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              {pred.nextMonthRevenue != null && (
                <div>
                  <div className="text-[var(--text-secondary)]">Ingresos previstos</div>
                  <div className="text-green-400 font-semibold">{formatCurrency(pred.nextMonthRevenue)}</div>
                </div>
              )}
              {pred.nextMonthExpenses != null && (
                <div>
                  <div className="text-[var(--text-secondary)]">Gastos previstos</div>
                  <div className="text-red-400 font-semibold">{formatCurrency(pred.nextMonthExpenses)}</div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="py-6 text-center text-[var(--text-secondary)] text-sm">
            Sin datos de pronóstico. Añade más transacciones para ver predicciones.
          </div>
        )}
      </div>

      {pred && pred.nextMonthCashFlow != null && pred.nextMonthCashFlow < 0 && (
        <motion.div
          className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-orange-400 font-medium">Próximo mes: flujo previsto negativo</div>
          <div className="text-sm text-[var(--text-secondary)] mt-1">Revisa gastos e ingresos.</div>
        </motion.div>
      )}
    </motion.div>
  )
}