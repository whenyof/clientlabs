"use client"

import { motion } from "framer-motion"
import { formatCurrency, formatExpenseFrequency } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"
import {
  ClockIcon,
  CalendarIcon,
  PlayIcon,
  PauseIcon,
  PencilIcon
} from "@heroicons/react/24/outline"

export function FixedExpenses() {
  const { analytics, loading } = useFinanceData()
  const expenses = analytics?.fixedExpenses ?? []

  const handleToggleExpense = (expenseId: string) => {
    console.log('Toggle expense:', expenseId)
  }

  const handleEditExpense = (expenseId: string) => {
    console.log('Edit expense:', expenseId)
  }

  const getNextPaymentDate = (nextPayment: Date | string, _frequency: string) => {
    const date = typeof nextPayment === 'string' ? new Date(nextPayment) : nextPayment
    const now = new Date()
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntil < 0) return { text: 'Vencido', color: 'text-red-400' }
    if (daysUntil === 0) return { text: 'Hoy', color: 'text-orange-400' }
    if (daysUntil <= 7) return { text: `En ${daysUntil} días`, color: 'text-yellow-400' }
    return { text: date.toLocaleDateString('es-ES'), color: 'text-gray-400' }
  }

  if (loading) {
    return <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-6 animate-pulse h-48" />
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-xl font-bold text-white mb-2">Gastos Fijos</h3>
        <p className="text-gray-400 text-sm mb-4">Pagos recurrentes y suscripciones</p>
        <div className="py-8 text-center text-gray-400">
          <p className="text-white/80">Sin gastos fijos</p>
          <p className="text-sm mt-1">Los gastos recurrentes aparecerán aquí.</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Gastos Fijos</h3>
          <p className="text-gray-400 text-sm">Pagos recurrentes y suscripciones</p>
        </div>
        <div className="text-sm text-gray-400">
          {expenses.filter(e => e.active).length} activos
        </div>
      </div>

      <div className="space-y-4">
        {expenses.map((expense, index) => {
          const nextPayment = getNextPaymentDate(expense.nextPayment, expense.frequency)

          return (
            <motion.div
              key={expense.id}
              className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                expense.active
                  ? 'bg-gray-900/50 border-gray-700/50 hover:border-gray-600/50'
                  : 'bg-gray-900/30 border-gray-700/30 opacity-60'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (index * 0.1), duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    expense.active ? 'bg-purple-500/20' : 'bg-gray-500/20'
                  }`}>
                    <ClockIcon className={`w-5 h-5 ${
                      expense.active ? 'text-purple-400' : 'text-gray-400'
                    }`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className={`font-semibold ${
                        expense.active ? 'text-white' : 'text-gray-400'
                      }`}>
                        {expense.name}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        expense.frequency === 'MONTHLY' ? 'bg-blue-500/20 text-blue-400' :
                        expense.frequency === 'QUARTERLY' ? 'bg-green-500/20 text-green-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {formatExpenseFrequency(expense.frequency)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <span className="text-red-400 font-semibold">
                          {formatCurrency(expense.amount)}
                        </span>
                        <span>por período</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span className={nextPayment.color}>
                          Próximo: {nextPayment.text}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => handleEditExpense(index.toString())}
                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    onClick={() => handleToggleExpense(index.toString())}
                    className={`p-2 rounded-lg transition-colors ${
                      expense.active
                        ? 'text-green-400 hover:bg-green-600/20'
                        : 'text-gray-400 hover:bg-gray-600/20'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {expense.active ? (
                      <PauseIcon className="w-4 h-4" />
                    ) : (
                      <PlayIcon className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Summary */}
      <motion.div
        className="mt-6 p-4 bg-gray-900/50 rounded-xl border border-gray-700/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Total mensual estimado:
          </span>
          <span className="text-red-400 font-semibold">
            {formatCurrency(expenses
              .filter(e => e.active)
              .reduce((total, expense) => {
                switch (expense.frequency) {
                  case 'MONTHLY':
                    return total + expense.amount
                  case 'QUARTERLY':
                    return total + (expense.amount / 3)
                  case 'SEMIANNUAL':
                    return total + (expense.amount / 6)
                  case 'ANNUAL':
                    return total + (expense.amount / 12)
                  default:
                    return total
                }
              }, 0))}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}