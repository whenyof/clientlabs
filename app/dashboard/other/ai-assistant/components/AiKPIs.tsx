"use client"

import {
  LightBulbIcon,
  UserGroupIcon,
  ChartBarIcon,
  SparklesIcon,
  EnvelopeIcon,
  PhoneIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"
import { mockAiKPIs, formatCurrency, formatPercentage } from "../mock"

export function AiKPIs() {
  const kpis = [
    {
      title: "Insights Generados",
      value: mockAiKPIs.totalInsights.toString(),
      subtitle: "esta semana",
      icon: LightBulbIcon,
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-500/10 to-cyan-600/10"
    },
    {
      title: "Leads Calientes",
      value: mockAiKPIs.hotLeads.toString(),
      subtitle: "requieren atención",
      icon: UserGroupIcon,
      color: "from-red-500 to-pink-600",
      bgColor: "from-red-500/10 to-pink-600/10"
    },
    {
      title: "Precisión Predicciones",
      value: formatPercentage(mockAiKPIs.predictionsAccuracy),
      subtitle: "tasa de acierto",
      icon: ChartBarIcon,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-500/10 to-emerald-600/10"
    },
    {
      title: "Ingresos Predichos",
      value: formatCurrency(mockAiKPIs.revenuePredicted),
      subtitle: "este mes",
      icon: SparklesIcon,
      color: "from-purple-500 to-indigo-600",
      bgColor: "from-purple-500/10 to-indigo-600/10"
    },
    {
      title: "Emails Generados",
      value: mockAiKPIs.emailsGenerated.toString(),
      subtitle: "automatizados",
      icon: EnvelopeIcon,
      color: "from-orange-500 to-amber-600",
      bgColor: "from-orange-500/10 to-amber-600/10"
    },
    {
      title: "Llamadas Sugeridas",
      value: mockAiKPIs.callsSuggested.toString(),
      subtitle: "prioridad alta",
      icon: PhoneIcon,
      color: "from-cyan-500 to-teal-600",
      bgColor: "from-cyan-500/10 to-teal-600/10"
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
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/5 to-blue-600/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        )
      })}
    </div>
  )
}