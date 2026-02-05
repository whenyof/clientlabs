"use client"

import { motion } from "framer-motion"
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  CreditCardIcon,
  ChartBarIcon,
  ClockIcon,
  CalculatorIcon,
  CurrencyEuroIcon
} from "@heroicons/react/24/outline"
import { formatCurrency, formatPercentage } from "../lib/formatters"
import { useFinanceData } from "../context/FinanceDataContext"

export function FinanceKPIs() {
  const { analytics, loading } = useFinanceData()
  const k = analytics?.kpis

  const kpis = k
    ? [
        { title: "Ingresos Totales", value: formatCurrency(k.totalIncome), subtitle: "este período", icon: BanknotesIcon, color: "from-green-500 to-emerald-600", bgColor: "from-green-500/10 to-emerald-600/10", trend: (analytics.trends?.incomeGrowth ?? 0) >= 0 ? `+${(analytics.trends?.incomeGrowth ?? 0).toFixed(1)}%` : `${(analytics.trends?.incomeGrowth ?? 0).toFixed(1)}%`, trendUp: (analytics.trends?.incomeGrowth ?? 0) >= 0, change: k.totalIncome * 0.1 },
        { title: "Gastos Totales", value: formatCurrency(Math.abs(k.totalExpenses)), subtitle: "este período", icon: CreditCardIcon, color: "from-red-500 to-pink-600", bgColor: "from-red-500/10 to-pink-600/10", trend: (analytics.trends?.expenseGrowth ?? 0) >= 0 ? `+${(analytics.trends?.expenseGrowth ?? 0).toFixed(1)}%` : `${(analytics.trends?.expenseGrowth ?? 0).toFixed(1)}%`, trendUp: false, change: Math.abs(k.totalExpenses) * 0.1 },
        { title: "Beneficio Neto", value: formatCurrency(k.netProfit), subtitle: "resultado final", icon: ChartBarIcon, color: "from-blue-500 to-indigo-600", bgColor: "from-blue-500/10 to-indigo-600/10", trend: (analytics.trends?.profitGrowth ?? 0) >= 0 ? `+${(analytics.trends?.profitGrowth ?? 0).toFixed(1)}%` : `${(analytics.trends?.profitGrowth ?? 0).toFixed(1)}%`, trendUp: (analytics.trends?.profitGrowth ?? 0) >= 0, change: k.netProfit * 0.1 },
        { title: "Pendiente de Cobro", value: formatCurrency(k.pendingPayments), subtitle: "facturas por cobrar", icon: ClockIcon, color: "from-orange-500 to-amber-600", bgColor: "from-orange-500/10 to-amber-600/10", trend: "—", trendUp: true, change: 0 },
        { title: "Burn Rate", value: formatCurrency(k.burnRate), subtitle: "gasto mensual", icon: CalculatorIcon, color: "from-purple-500 to-violet-600", bgColor: "from-purple-500/10 to-violet-600/10", trend: "—", trendUp: true, change: 0 },
        { title: "Pagos Recurrentes", value: formatCurrency(k.recurringPayments), subtitle: "gastos fijos mensuales", icon: CurrencyEuroIcon, color: "from-cyan-500 to-teal-600", bgColor: "from-cyan-500/10 to-teal-600/10", trend: "—", trendUp: false, change: 0 },
        { title: "Tasa de Crecimiento", value: formatPercentage(k.growthRate), subtitle: "vs período anterior", icon: ArrowTrendingUpIcon, color: "from-emerald-500 to-green-600", bgColor: "from-emerald-500/10 to-green-600/10", trend: `${k.growthRate >= 0 ? "+" : ""}${k.growthRate.toFixed(1)}%`, trendUp: k.growthRate >= 0, change: k.growthRate },
        { title: "Flujo de Caja", value: formatCurrency(k.cashFlow), subtitle: "liquidez disponible", icon: BanknotesIcon, color: "from-indigo-500 to-purple-600", bgColor: "from-indigo-500/10 to-purple-600/10", trend: "—", trendUp: k.cashFlow >= 0, change: k.cashFlow * 0.1 },
      ]
    : []

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-gray-800/50 border border-gray-700/50 p-6 animate-pulse h-36" />
        ))}
      </div>
    )
  }

  if (kpis.length === 0) {
    return (
      <div className="rounded-2xl bg-gray-800/50 border border-gray-700/50 p-12 text-center text-gray-400">
        <p className="text-lg font-medium text-white/80">Sin datos financieros</p>
        <p className="text-sm mt-1">Añade transacciones para ver los KPIs.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <motion.div
            key={index}
            className="relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-105 group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + (index * 0.05), duration: 0.5 }}
            whileHover={{ y: -2 }}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${kpi.bgColor} opacity-50`} />

            {/* Content */}
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color} shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${
                  kpi.trendUp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {kpi.trendUp ? (
                    <ArrowTrendingUpIcon className="w-3 h-3" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-3 h-3" />
                  )}
                  {kpi.trend}
                </div>
              </div>

              <div className="text-2xl font-bold text-white mb-1">
                {kpi.value}
              </div>

              <div className="text-sm text-gray-400 font-medium mb-2">
                {kpi.title}
              </div>

              <div className="text-xs text-gray-500 flex items-center gap-1">
                <span>{kpi.subtitle}</span>
                <span className={`ml-1 ${kpi.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ({kpi.change >= 0 ? '+' : ''}{formatCurrency(Math.abs(kpi.change))})
                </span>
              </div>
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        )
      })}
    </div>
  )
}