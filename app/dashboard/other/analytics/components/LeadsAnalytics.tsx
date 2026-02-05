// @ts-nocheck
"use client"

const emptySection = { kpis: { primary: 0, secondary: 0, trend: 0 }, chart: [], table: [] }
const formatPercentage = (n: number) => n.toFixed(1) + '%'
import { UserGroupIcon, ArrowTrendingUpIcon, ClockIcon } from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface LeadsAnalyticsProps {
  selectedRange: string
}

export function LeadsAnalytics({ selectedRange }: LeadsAnalyticsProps) {
  const data = emptySection as any

  const kpis = [
    {
      label: "Total Leads",
      value: data.kpis.primary.toString(),
      change: formatPercentage(data.kpis.trend),
      icon: UserGroupIcon,
      color: "text-blue-400"
    },
    {
      label: "Conversión",
      value: `${data.kpis.secondary}%`,
      change: "+2.1%",
      icon: ArrowTrendingUpIcon,
      color: "text-green-400"
    },
    {
      label: "Tiempo promedio",
      value: "3.2 días",
      change: "-0.5 días",
      icon: ClockIcon,
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

      {/* Gráfico de fuentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h4 className="text-lg font-semibold text-white mb-4">
          Fuentes de leads
        </h4>
        <div className="space-y-3">
          {data.chartData.map((source, index) => (
            <motion.div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-700/20 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
              whileHover={{ scale: 1.01, backgroundColor: "rgba(55, 65, 81, 0.3)" }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: source.color }}
                  whileHover={{ scale: 1.5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                />
                <span className="text-white font-medium">{source.label}</span>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">{source.value}</div>
                <div className="text-sm text-gray-400">
                  {((source.value / data.kpis.primary) * 100).toFixed(1)}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Métricas adicionales */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.div
          className="bg-gray-700/30 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <h5 className="text-white font-medium mb-2">Calidad de leads</h5>
          <div className="space-y-2">
            {[
              { label: "Alto valor", value: "35%", color: "text-green-400" },
              { label: "Medio valor", value: "45%", color: "text-yellow-400" },
              { label: "Bajo valor", value: "20%", color: "text-red-400" }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex justify-between"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (index * 0.1), duration: 0.3 }}
              >
                <span className="text-gray-400">{item.label}</span>
                <span className={item.color}>{item.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="bg-gray-700/30 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <h5 className="text-white font-medium mb-2">Tasa de respuesta</h5>
          <motion.div
            className="text-3xl font-bold text-blue-400 mb-1"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            68%
          </motion.div>
          <div className="text-sm text-gray-400">+12% vs período anterior</div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}