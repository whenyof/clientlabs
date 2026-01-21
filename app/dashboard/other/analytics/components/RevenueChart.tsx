"use client"

import { TrendingUp, TrendingDown } from "lucide-react"

const REVENUE_DATA = [
  { month: "Ene", value: 8500, previous: 7800 },
  { month: "Feb", value: 9200, previous: 8200 },
  { month: "Mar", value: 8800, previous: 9100 },
  { month: "Abr", value: 12100, previous: 10500 },
  { month: "May", value: 11800, previous: 11200 },
  { month: "Jun", value: 13500, previous: 12800 }
]

export function RevenueChart() {
  const maxValue = Math.max(...REVENUE_DATA.map(d => Math.max(d.value, d.previous)))
  const latestValue = REVENUE_DATA[REVENUE_DATA.length - 1].value
  const previousValue = REVENUE_DATA[REVENUE_DATA.length - 1].previous
  const change = ((latestValue - previousValue) / previousValue) * 100

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Ingresos Mensuales</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-gray-400">Actual</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span className="text-gray-400">Anterior</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-2xl font-bold text-white">€{latestValue.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-1">
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm font-medium ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(1)}% vs mes anterior
            </span>
          </div>
        </div>
      </div>

      <div className="h-64 flex items-end gap-4">
        {REVENUE_DATA.map((data, index) => (
          <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
            <div className="relative w-full flex items-end gap-1">
              {/* Previous month bar */}
              <div
                className="bg-gray-600 rounded-t w-1/2"
                style={{ height: `${(data.previous / maxValue) * 100}%` }}
              />
              {/* Current month bar */}
              <div
                className="bg-purple-500 rounded-t w-1/2"
                style={{ height: `${(data.value / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{data.month}</span>
          </div>
        ))}
      </div>
    </div>
  )
}