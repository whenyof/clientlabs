// @ts-nocheck
"use client"

const emptySection = { kpis: { primary: 0, secondary: 0, trend: 0 }, chart: [], table: [] }
const formatCurrency = (n: number) => '€' + n.toLocaleString('es-ES')
const formatPercentage = (n: number) => n.toFixed(1) + '%'
import { BanknotesIcon, ArrowTrendingDownIcon, ScaleIcon } from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface FinanceAnalyticsProps {
  selectedRange: string
}

export function FinanceAnalytics({ selectedRange }: FinanceAnalyticsProps) {
  const data = emptySection as any

  const kpis = [
    {
      label: "Beneficio Neto",
      value: formatCurrency(data.kpis.primary),
      change: formatPercentage(data.kpis.trend),
      icon: BanknotesIcon,
      color: "text-green-400"
    },
    {
      label: "Margen",
      value: `${data.kpis.secondary}%`,
      change: "+1.2%",
      icon: ScaleIcon,
      color: "text-blue-400"
    },
    {
      label: "ROI",
      value: "245%",
      change: "+15%",
      icon: ArrowTrendingDownIcon,
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + (index * 0.1), duration: 0.3 }}
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

      {/* Balance financiero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h4 className="text-lg font-semibold text-white mb-4">
          Balance financiero
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.chartData.map((item, index) => (
            <motion.div
              key={index}
              className="bg-gray-700/20 rounded-lg p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (index * 0.1), duration: 0.3 }}
              whileHover={{ scale: 1.03, y: -3 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium">{item.label}</span>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(item.value)}
              </div>
              <div className="text-sm text-gray-400">
                {item.label === 'Beneficio'
                  ? `${((item.value / (data.chartData[0].value + data.chartData[1].value)) * 100).toFixed(1)}% margen`
                  : `${((item.value / data.kpis.primary) * 100).toFixed(1)}% del total`
                }
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Flujo de caja */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h4 className="text-lg font-semibold text-white mb-4">
          Flujo de caja mensual
        </h4>
        <div className="space-y-3">
          {[
            { month: "Enero", inflow: 52000, outflow: 38000, net: 14000 },
            { month: "Febrero", inflow: 62400, outflow: 45600, net: 16800 },
            { month: "Marzo", inflow: 58000, outflow: 42300, net: 15700 },
            { month: "Abril", inflow: 67200, outflow: 48900, net: 18300 }
          ].map((cashflow, index) => (
            <motion.div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-700/20 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
              whileHover={{ scale: 1.01 }}
            >
              <span className="text-white font-medium">{cashflow.month}</span>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-green-400">+{formatCurrency(cashflow.inflow)}</div>
                  <div className="text-sm text-red-400">-{formatCurrency(cashflow.outflow)}</div>
                </div>
                <div className="text-right min-w-20">
                  <div className="text-white font-bold">{formatCurrency(cashflow.net)}</div>
                  <div className="text-xs text-gray-400">neto</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Ratios financieros */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <motion.div
          className="bg-gray-700/30 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <h5 className="text-white font-medium mb-3">Ratios de liquidez</h5>
          <div className="space-y-2">
            {[
              { label: "Ratio corriente", value: "2.4", color: "text-green-400" },
              { label: "Ratio rápido", value: "1.8", color: "text-yellow-400" }
            ].map((ratio, index) => (
              <motion.div
                key={index}
                className="flex justify-between"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + (index * 0.1), duration: 0.3 }}
              >
                <span className="text-gray-400">{ratio.label}</span>
                <span className={ratio.color}>{ratio.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="bg-gray-700/30 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <h5 className="text-white font-medium mb-3">Eficiencia operativa</h5>
          <div className="space-y-2">
            {[
              { label: "Rotación activos", value: "3.2x", color: "text-blue-400" },
              { label: "Margen EBITDA", value: "28%", color: "text-purple-400" }
            ].map((metric, index) => (
              <motion.div
                key={index}
                className="flex justify-between"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + (index * 0.1), duration: 0.3 }}
              >
                <span className="text-gray-400">{metric.label}</span>
                <span className={metric.color}>{metric.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}