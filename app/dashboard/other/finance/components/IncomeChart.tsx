"use client"

import { BarChart3, TrendingUp } from "lucide-react"

const INCOME_DATA = [
  { month: "Ene", income: 18500, expenses: 14200 },
  { month: "Feb", income: 21200, expenses: 16800 },
  { month: "Mar", income: 19800, expenses: 15200 },
  { month: "Abr", income: 24100, expenses: 18900 },
  { month: "May", income: 22800, expenses: 17500 },
  { month: "Jun", income: 26500, expenses: 20100 }
]

export function IncomeChart() {
  const maxValue = Math.max(...INCOME_DATA.flatMap(d => [d.income, d.expenses]))

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Ingresos vs Gastos</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-400">Ingresos</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-400">Gastos</span>
          </div>
        </div>
      </div>

      <div className="h-64 flex items-end gap-4">
        {INCOME_DATA.map((data, index) => (
          <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
            <div className="relative w-full flex items-end gap-1">
              <div
                className="bg-red-500 rounded-t w-1/2"
                style={{ height: `${(data.expenses / maxValue) * 100}%` }}
              />
              <div
                className="bg-green-500 rounded-t w-1/2"
                style={{ height: `${(data.income / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{data.month}</span>
          </div>
        ))}
      </div>
    </div>
  )
}