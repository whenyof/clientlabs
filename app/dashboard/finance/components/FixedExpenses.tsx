"use client"

import { motion } from "framer-motion"
import { formatCurrency, formatExpenseFrequency } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"
import { ClockIcon, CalendarIcon } from "@heroicons/react/24/outline"

function getNextPaymentDate(nextPayment: Date | string, _frequency: string) {
  const date = typeof nextPayment === "string" ? new Date(nextPayment) : nextPayment
  const now = new Date()
  const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysUntil < 0) return { text: "Vencido", color: "text-red-400" }
  if (daysUntil === 0) return { text: "Hoy", color: "text-orange-400" }
  if (daysUntil <= 7) return { text: `En ${daysUntil} días`, color: "text-yellow-400" }
  return { text: date.toLocaleDateString("es-ES"), color: "text-[var(--text-secondary)]" }
}

function monthlyEquivalent(expense: { frequency: string; amount: number }): number {
  switch (expense.frequency) {
    case "WEEKLY":
    case "weekly":
      return expense.amount * (30 / 7)
    case "MONTHLY":
    case "monthly":
      return expense.amount
    case "QUARTERLY":
    case "quarterly":
      return expense.amount / 3
    case "SEMIANNUAL":
      return expense.amount / 6
    case "ANNUAL":
      return expense.amount / 12
    default:
      return 0
  }
}

type DetectedItem = {
  id: string
  name: string
  amount: number
  frequency: string
  nextPayment: string
  active: boolean
}

function mapDetectedToExpenses(
  list: Array<{
    supplier: string
    averageAmount: number
    frequency: "monthly" | "weekly" | "quarterly"
    nextEstimatedPayment: string
  }>
): DetectedItem[] {
  return list.map((r) => ({
    id: `detected-${encodeURIComponent(r.supplier)}`,
    name: r.supplier,
    amount: r.averageAmount,
    frequency: r.frequency.toUpperCase(),
    nextPayment: r.nextEstimatedPayment,
    active: true,
  }))
}

export function FixedExpenses() {
  const { analytics, loading } = useFinanceData()
  const detected = analytics?.detectedRecurringExpenses ?? []
  const expenses = mapDetectedToExpenses(detected)

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/[0.03] p-5 animate-pulse h-48" />
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/[0.03] p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Gastos fijos</h3>
        <p className="text-xs text-[var(--text-secondary)] mb-4">Detectados automáticamente desde movimientos</p>
        <div className="py-6 text-center text-[var(--text-secondary)] text-sm">
          Sin gastos recurrentes detectados. Se necesitan al menos 3 pagos similares con intervalo y importe consistentes.
        </div>
      </div>
    )
  }

  const totalMonthly = expenses.reduce((total, expense) => total + monthlyEquivalent(expense), 0)

  return (
    <motion.div
      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/[0.03] p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Gastos fijos</h3>
          <p className="text-xs text-[var(--text-secondary)]">Recurrentes y suscripciones</p>
        </div>
        <span className="text-xs text-[var(--text-secondary)]">
          {expenses.length} detectados
        </span>
      </div>

      <div className="space-y-2">
        {expenses.map((expense, index) => (
          <motion.div
            key={expense.id}
            className="p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-subtle)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-lg ${
                    expense.active ? "bg-purple-500/20" : "bg-[var(--bg-main)]0/20"
                  }`}
                >
                  <ClockIcon
                    className={`w-5 h-5 ${
                      expense.active ? "text-purple-400" : "text-[var(--text-secondary)]"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4
                      className={`font-semibold ${
                        expense.active ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                      }`}
                    >
                      {expense.name}
                    </h4>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        expense.frequency === "MONTHLY"
                          ? "bg-blue-500/20 text-blue-400"
                          : expense.frequency === "QUARTERLY"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-purple-500/20 text-purple-400"
                      }`}
                    >
                      {formatExpenseFrequency(expense.frequency)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                      <span className="text-red-400 font-semibold">
                        {formatCurrency(expense.amount)}
                      </span>
                      <span>por período</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                      <span
                        className={
                          getNextPaymentDate(expense.nextPayment, expense.frequency).color
                        }
                      >
                        Próximo:{" "}
                        {getNextPaymentDate(expense.nextPayment, expense.frequency).text}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-6 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Total mensual estimado:</span>
          <span className="text-red-400 font-semibold">
            {formatCurrency(totalMonthly)}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}
