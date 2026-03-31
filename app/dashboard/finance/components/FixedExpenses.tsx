"use client"

import { Clock, Calendar } from "lucide-react"
import { formatCurrency, formatExpenseFrequency } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"

function getNextPaymentDate(nextPayment: Date | string, _frequency: string) {
  const date = typeof nextPayment === "string" ? new Date(nextPayment) : nextPayment
  const daysUntil = Math.ceil((date.getTime() - Date.now()) / 86400000)
  if (daysUntil < 0) return { text: "Vencido", color: "text-red-400" }
  if (daysUntil === 0) return { text: "Hoy", color: "text-orange-400" }
  if (daysUntil <= 7) return { text: `En ${daysUntil} días`, color: "text-yellow-400" }
  return { text: date.toLocaleDateString("es-ES"), color: "text-[var(--text-secondary)]" }
}

function monthlyEquivalent(expense: { frequency: string; amount: number }): number {
  switch (expense.frequency.toUpperCase()) {
    case "WEEKLY": return expense.amount * (30 / 7)
    case "MONTHLY": return expense.amount
    case "QUARTERLY": return expense.amount / 3
    case "SEMIANNUAL": return expense.amount / 6
    case "ANNUAL": return expense.amount / 12
    default: return 0
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
    return <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] border-[var(--border-subtle)] p-5 animate-pulse h-48" />
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] border-[var(--border-subtle)] p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Gastos fijos</h3>
        <p className="text-xs text-[var(--text-secondary)] mb-4">Detectados desde movimientos</p>
        <div className="py-6 text-center text-[var(--text-secondary)] text-xs">
          Sin gastos recurrentes detectados. Se necesitan al menos 3 pagos similares con intervalo e importe consistentes.
        </div>
      </div>
    )
  }

  const totalMonthly = expenses.reduce((total, e) => total + monthlyEquivalent(e), 0)

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] border-[var(--border-subtle)] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Gastos fijos</h3>
          <p className="text-xs text-[var(--text-secondary)]">Recurrentes y suscripciones</p>
        </div>
        <span className="text-xs text-[var(--text-secondary)]">{expenses.length} detectados</span>
      </div>

      <div className="space-y-2">
        {expenses.map((expense) => {
          const nextDate = getNextPaymentDate(expense.nextPayment, expense.frequency)
          return (
            <div
              key={expense.id}
              className="p-3 rounded-xl border bg-[var(--bg-card)] border-[var(--border-subtle)] flex items-center gap-3"
            >
              <div className={`p-2 rounded-lg shrink-0 ${expense.active ? "bg-emerald-500/15" : "bg-[var(--bg-surface)]"}`}>
                <Clock className={`w-4 h-4 ${expense.active ? "text-emerald-400" : "text-[var(--text-secondary)]"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-sm font-medium truncate ${expense.active ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                    {expense.name}
                  </span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                    expense.frequency === "MONTHLY"
                      ? "bg-blue-500/20 text-blue-400"
                      : expense.frequency === "QUARTERLY"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-violet-500/20 text-violet-400"
                  }`}>
                    {formatExpenseFrequency(expense.frequency)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-red-400 font-semibold">{formatCurrency(expense.amount)}</span>
                  <span className="text-[var(--text-secondary)]">por período</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[var(--text-secondary)]" />
                    <span className={nextDate.color}>Próximo: {nextDate.text}</span>
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-between text-sm">
        <span className="text-xs text-[var(--text-secondary)]">Total mensual estimado</span>
        <span className="text-red-400 font-semibold text-sm">{formatCurrency(totalMonthly)}</span>
      </div>
    </div>
  )
}
