"use client"

import {
  CogIcon,
  PlayIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface AutomationKPIsProps {
  total?: number
  active?: number
}

export function AutomationKPIs({ total = 0, active = 0 }: AutomationKPIsProps) {
  const kpis = [
    {
      title: "Automatizaciones Activas",
      value: active.toString(),
      subtitle: `${total} total`,
      icon: CogIcon,
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-500/10 to-cyan-600/10"
    },
    {
      title: "Ejecuciones Totales",
      value: "0",
      subtitle: "este mes",
      icon: PlayIcon,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-500/10 to-emerald-600/10"
    },
    {
      title: "Tasa de Éxito",
      value: "—",
      subtitle: "promedio",
      icon: CheckCircleIcon,
      color: "from-purple-500 to-indigo-600",
      bgColor: "from-purple-500/10 to-indigo-600/10"
    },
    {
      title: "Ingresos Generados",
      value: "€0",
      subtitle: "por automatizaciones",
      icon: CurrencyDollarIcon,
      color: "from-orange-500 to-amber-600",
      bgColor: "from-orange-500/10 to-amber-600/10"
    },
    {
      title: "Tiempo Ahorrado",
      value: "—",
      subtitle: "mensual",
      icon: ClockIcon,
      color: "from-cyan-500 to-teal-600",
      bgColor: "from-cyan-500/10 to-teal-600/10"
    },
    {
      title: "ROI Promedio",
      value: "—",
      subtitle: "retorno inversión",
      icon: ArrowTrendingUpIcon,
      color: "from-pink-500 to-rose-600",
      bgColor: "from-pink-500/10 to-rose-600/10"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <motion.div
            key={index}
            className="relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-105"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + (index * 0.1), duration: 0.5 }}
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
              </div>

              <div className="text-2xl font-bold text-white mb-1">
                {kpi.value}
              </div>

              <div className="text-sm text-gray-400 font-medium mb-2">
                {kpi.title}
              </div>

              <div className="text-xs text-gray-500">
                {kpi.subtitle}
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