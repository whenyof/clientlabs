"use client"

import { motion } from "framer-motion"
import { formatCurrency } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"
import { TagIcon } from "@heroicons/react/24/outline"

function getBudgetStatusClass(status?: string) {
  if (status === 'exceeded') return { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Excedido' }
  if (status === 'warning') return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Aviso' }
  return { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Bien' }
}

export function Budgets() {
  const { analytics, loading } = useFinanceData()
  const budgets = analytics?.budgets ?? []

  if (loading) {
    return <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 animate-pulse h-48" />
  }

  if (budgets.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Presupuestos</h3>
        <p className="text-xs text-white/50 mb-4">Control por categorías</p>
        <div className="py-6 text-center text-white/40 text-sm">Sin presupuestos</div>
      </div>
    )
  }

  return (
    <motion.div
      className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Presupuestos</h3>
          <p className="text-xs text-white/50">Control por categorías</p>
        </div>
        <span className="text-xs text-white/45">{budgets.length} activos</span>
      </div>

      <div className="space-y-3">
        {budgets.map((budget, index) => {
          const utilization = (budget.spent / budget.limit) * 100
          const statusClass = getBudgetStatusClass(budget.status)
          const remaining = (budget.remaining ?? budget.limit - budget.spent)

          return (
            <motion.div
              key={budget.id}
              className="p-6 bg-gray-900/50 rounded-xl border border-gray-700/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + (index * 0.1), duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <TagIcon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{budget.category}</h4>
                    <p className="text-gray-400 text-sm">Presupuesto mensual</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-1">
                    {utilization.toFixed(1)}% utilizado
                  </div>
                  <div className={`text-lg font-bold ${statusClass.text}`}>
                    {formatCurrency(remaining)}
                  </div>
                  <div className="text-xs text-gray-400">restante</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">
                    Gastado: {formatCurrency(Math.abs(budget.spent))}
                  </span>
                  <span className="text-gray-400">
                    Límite: {formatCurrency(budget.limit)}
                  </span>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-3">
                  <motion.div
                    className={`h-3 rounded-full ${budget.status === 'exceeded' ? 'bg-red-500' : budget.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(utilization, 100)}%` }}
                    transition={{ delay: 0.8 + (index * 0.1), duration: 0.8 }}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {budget.status === 'good' && (
                    <>
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm font-medium">Dentro del presupuesto</span>
                    </>
                  )}
                  {budget.status === 'warning' && (
                    <>
                      <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 text-sm font-medium">Cerca del límite</span>
                    </>
                  )}
                  {(budget.status === 'exceeded' || budget.status === 'danger') && (
                    <>
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 text-sm font-medium">Presupuesto excedido</span>
                    </>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  Actualizado hoy
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <span className="font-semibold text-emerald-400">{budgets.filter(b => b.status === 'good').length}</span>
          <span className="text-white/45 ml-1">ok</span>
        </div>
        <div>
          <span className="font-semibold text-amber-400">{budgets.filter(b => b.status === 'warning').length}</span>
          <span className="text-white/45 ml-1">aviso</span>
        </div>
        <div>
          <span className="font-semibold text-rose-400">{budgets.filter(b => b.status === 'exceeded' || b.status === 'danger').length}</span>
          <span className="text-white/45 ml-1">exced.</span>
        </div>
      </div>
    </motion.div>
  )
}