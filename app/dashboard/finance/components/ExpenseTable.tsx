"use client"

import { Receipt, TrendingDown } from "lucide-react"

const EXPENSES = [
  {
    id: 1,
    category: "Marketing",
    description: "Campaña Google Ads",
    amount: 2500,
    date: "2024-01-15"
  },
  {
    id: 2,
    category: "Oficina",
    description: "Alquiler mensual",
    amount: 1200,
    date: "2024-01-01"
  },
  {
    id: 3,
    category: "Software",
    description: "Suscripción herramientas",
    amount: 450,
    date: "2024-01-10"
  },
  {
    id: 4,
    category: "Personal",
    description: "Salarios equipo",
    amount: 8500,
    date: "2024-01-30"
  },
  {
    id: 5,
    category: "Marketing",
    description: "Diseño web landing",
    amount: 1800,
    date: "2024-01-08"
  }
]

export function ExpenseTable() {
  const totalExpenses = EXPENSES.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-subtle)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Gastos Recientes</h3>
        <div className="text-right">
          <p className="text-sm text-[var(--text-secondary)]">Total este mes</p>
          <p className="text-lg font-bold text-red-400">€{totalExpenses.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-3">
        {EXPENSES.map((expense) => (
          <div key={expense.id} className="flex items-center justify-between p-3 bg-[var(--bg-main)] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Receipt className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="font-medium text-[var(--text-primary)] text-sm">{expense.category}</p>
                <p className="text-[var(--text-secondary)] text-xs">{expense.description}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-medium text-[var(--text-primary)]">€{expense.amount.toLocaleString()}</p>
              <p className="text-[var(--text-secondary)] text-xs">{new Date(expense.date).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--bg-main)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] rounded-lg transition-colors">
          <TrendingDown className="w-4 h-4" />
          Ver todos los gastos
        </button>
      </div>
    </div>
  )
}