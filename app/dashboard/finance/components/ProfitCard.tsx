"use client"

import { TrendingUp, DollarSign } from "lucide-react"

export function ProfitCard() {
  const totalIncome = 24580
  const totalExpenses = 18250
  const profit = totalIncome - totalExpenses
  const profitMargin = (profit / totalIncome) * 100

  return (
    <div className="bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-subtle)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Beneficio Mensual</h3>
        <div className="p-2 bg-green-500/10 rounded-lg">
          <TrendingUp className="w-5 h-5 text-green-400" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-secondary)]">Ingresos Totales</span>
          <span className="text-green-400 font-medium">€{totalIncome.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[var(--text-secondary)]">Gastos Totales</span>
          <span className="text-red-400 font-medium">€{totalExpenses.toLocaleString()}</span>
        </div>

        <hr className="border-[var(--border-subtle)]" />

        <div className="flex items-center justify-between">
          <span className="text-[var(--text-primary)] font-medium">Beneficio Neto</span>
          <span className="text-xl font-bold text-green-400">€{profit.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[var(--text-secondary)]">Margen de Beneficio</span>
          <span className="text-purple-400 font-medium">{profitMargin.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}