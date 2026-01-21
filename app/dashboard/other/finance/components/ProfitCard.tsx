"use client"

import { TrendingUp, DollarSign } from "lucide-react"

export function ProfitCard() {
  const totalIncome = 24580
  const totalExpenses = 18250
  const profit = totalIncome - totalExpenses
  const profitMargin = (profit / totalIncome) * 100

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Beneficio Mensual</h3>
        <div className="p-2 bg-green-500/10 rounded-lg">
          <TrendingUp className="w-5 h-5 text-green-400" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Ingresos Totales</span>
          <span className="text-green-400 font-medium">€{totalIncome.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">Gastos Totales</span>
          <span className="text-red-400 font-medium">€{totalExpenses.toLocaleString()}</span>
        </div>

        <hr className="border-gray-700" />

        <div className="flex items-center justify-between">
          <span className="text-white font-medium">Beneficio Neto</span>
          <span className="text-xl font-bold text-green-400">€{profit.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400">Margen de Beneficio</span>
          <span className="text-purple-400 font-medium">{profitMargin.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}