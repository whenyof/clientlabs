// @ts-nocheck
"use client"

const emptySection = { kpis: { primary: 0, secondary: 0, trend: 0 }, chart: [], chartData: [] as { label: string; value: number }[], table: [] }
const formatCurrency = (n: number) => '€' + n.toLocaleString('es-ES')
const formatPercentage = (n: number) => n.toFixed(1) + '%'
import { CurrencyDollarIcon, ShoppingBagIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface SalesAnalyticsProps {
  selectedRange: string
}

export function SalesAnalytics({ selectedRange }: SalesAnalyticsProps) {
  const data = emptySection as any

  const kpis = [
    {
      label: "Ingresos Totales",
      value: formatCurrency(data.kpis.primary),
      change: formatPercentage(data.kpis.trend),
      icon: CurrencyDollarIcon,
      color: "text-green-400"
    },
    {
      label: "Número de Ventas",
      value: "156",
      change: "+8.2%",
      icon: ShoppingBagIcon,
      color: "text-blue-400"
    },
    {
      label: "Crecimiento",
      value: formatPercentage(data.kpis.secondary),
      change: formatPercentage(data.kpis.secondary),
      icon: ArrowTrendingUpIcon,
      color: "text-purple-400"
    }
  ]

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* KPIs */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <motion.div
              key={index}
              className="bg-gray-700/30 rounded-lg p-4"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${kpi.color}`} />
                <span className={`text-sm font-medium ${kpi.color}`}>
                  {kpi.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {kpi.value}
              </div>
              <div className="text-sm text-gray-400">
                {kpi.label}
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Gráfico de ventas mensuales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h4 className="text-lg font-semibold text-white mb-4">
          Ventas por mes
        </h4>
        <div className="space-y-3">
          {data.chartData.map((month, index) => (
            <motion.div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-700/20 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
              whileHover={{ scale: 1.01, backgroundColor: "rgba(55, 65, 81, 0.3)" }}
            >
              <span className="text-white font-medium">{month.label}</span>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-white font-bold">{formatCurrency(month.value)}</div>
                  <div className="text-sm text-gray-400">
                    {index > 0
                      ? formatPercentage(((month.value - data.chartData[index - 1].value) / data.chartData[index - 1].value) * 100)
                      : "+0.0%"
                    }
                  </div>
                </div>
                <div className="w-20 h-2 bg-gray-600 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(month.value / Math.max(...data.chartData.map(d => d.value))) * 100}%`
                    }}
                    transition={{ delay: 0.5 + (0.1 * index), duration: 1 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Métricas de ventas */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.div
          className="bg-gray-700/30 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <h5 className="text-white font-medium mb-2">Ticket Promedio</h5>
          <div className="text-2xl font-bold text-green-400 mb-1">€403</div>
          <div className="text-sm text-gray-400">+5.2% vs mes anterior</div>
        </motion.div>

        <motion.div
          className="bg-gray-700/30 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <h5 className="text-white font-medium mb-2">Tasa de Conversión</h5>
          <div className="text-2xl font-bold text-blue-400 mb-1">12.8%</div>
          <div className="text-sm text-gray-400">+2.1% vs mes anterior</div>
        </motion.div>

        <motion.div
          className="bg-gray-700/30 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <h5 className="text-white font-medium mb-2">Valor de Vida</h5>
          <div className="text-2xl font-bold text-purple-400 mb-1">€2,340</div>
          <div className="text-sm text-gray-400">Cliente promedio</div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}