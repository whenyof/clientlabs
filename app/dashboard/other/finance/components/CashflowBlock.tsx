"use client"

import { motion } from "framer-motion"
import { ArrowUpIcon, ArrowDownIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline"
import { formatCurrency } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"

export function CashflowBlock() {
  const { analytics, loading } = useFinanceData()
  const k = analytics?.kpis
  const cashFlow = k?.netProfit ?? 0
  const inflow = k?.totalIncome ?? 0
  const outflow = Math.abs(k?.totalExpenses ?? 0)

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 animate-pulse h-64" />
    )
  }

  if (inflow === 0 && outflow === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-xl font-bold text-white mb-2">Flujo de Caja</h3>
        <p className="text-gray-400 text-sm mb-4">Entradas vs salidas del período</p>
        <div className="py-8 text-center text-gray-400">
          <p className="text-white/80">Sin datos de flujo</p>
          <p className="text-sm mt-1">Añade transacciones para ver entradas y salidas.</p>
        </div>
      </div>
    )
  }

  const flowItems = [
    {
      label: "Entradas",
      amount: inflow,
      icon: ArrowUpIcon,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      label: "Salidas",
      amount: outflow,
      icon: ArrowDownIcon,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20"
    },
    {
      label: "Flujo Neto",
      amount: cashFlow,
      icon: ArrowsRightLeftIcon,
      color: cashFlow >= 0 ? "text-blue-400" : "text-orange-400",
      bgColor: cashFlow >= 0 ? "bg-blue-500/10" : "bg-orange-500/10",
      borderColor: cashFlow >= 0 ? "border-blue-500/20" : "border-orange-500/20"
    }
  ]

  return (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Flujo de Caja</h3>
        <p className="text-gray-400 text-sm">Entradas vs salidas del período</p>
      </div>

      <div className="space-y-4">
        {flowItems.map((item, index) => {
          const Icon = item.icon
          const percentage = ((item.amount / inflow) * 100)

          return (
            <motion.div
              key={index}
              className={`p-4 rounded-xl border ${item.bgColor} ${item.borderColor} transition-all duration-300 hover:scale-105`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + (index * 0.1), duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <div className="text-white font-medium">{item.label}</div>
                    <div className="text-xs text-gray-400">
                      {percentage.toFixed(1)}% del total
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-xl font-bold ${item.color}`}>
                    {formatCurrency(item.amount)}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${item.color.replace('text-', 'bg-')}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentage, 100)}%` }}
                  transition={{ delay: 0.6 + (index * 0.1), duration: 0.8 }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Summary */}
      <motion.div
        className="mt-6 p-4 bg-gray-900/50 rounded-xl border border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-medium">Estado del Flujo</div>
            <div className="text-sm text-gray-400">Resultado neto del período</div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${cashFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {cashFlow >= 0 ? '✅ Positivo' : '⚠️ Negativo'}
            </div>
            <div className="text-sm text-gray-400">
              {formatCurrency(Math.abs(cashFlow))} {cashFlow >= 0 ? 'superávit' : 'déficit'}
            </div>
          </div>
        </div>

        {/* Cash flow indicator */}
        <div className="mt-4 flex items-center justify-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            cashFlow >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            {cashFlow >= 0 ? (
              <ArrowUpIcon className="w-8 h-8 text-green-400" />
            ) : (
              <ArrowDownIcon className="w-8 h-8 text-red-400" />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}