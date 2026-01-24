"use client"

import { motion } from "framer-motion"
import {
  FireIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  SparklesIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  CpuChipIcon
} from "@heroicons/react/24/outline"
import { mockAiKPIs, formatCurrency, formatPercentage } from "../mock"

export function AssistantKPIs() {
  const kpis = [
    {
      title: "Leads Calientes",
      value: mockAiKPIs.hotLeads.toString(),
      subtitle: "requieren atención inmediata",
      icon: FireIcon,
      color: "from-red-500 to-pink-600",
      bgColor: "from-red-500/10 to-pink-600/10",
      trend: "+12%",
      trendUp: true
    },
    {
      title: "Clientes en Riesgo",
      value: mockAiKPIs.riskClients.toString(),
      subtitle: "necesitan intervención",
      icon: ExclamationTriangleIcon,
      color: "from-orange-500 to-red-600",
      bgColor: "from-orange-500/10 to-red-600/10",
      trend: "+2",
      trendUp: false
    },
    {
      title: "Ingresos Predichos",
      value: formatCurrency(mockAiKPIs.revenuePredicted),
      subtitle: "este mes",
      icon: ChartBarIcon,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-500/10 to-emerald-600/10",
      trend: "+8.5%",
      trendUp: true
    },
    {
      title: "Precisión IA",
      value: formatPercentage(mockAiKPIs.predictionsAccuracy),
      subtitle: "tasa de acierto",
      icon: CpuChipIcon,
      color: "from-blue-500 to-indigo-600",
      bgColor: "from-blue-500/10 to-indigo-600/10",
      trend: "+2.1%",
      trendUp: true
    },
    {
      title: "Emails Generados",
      value: mockAiKPIs.emailsGenerated.toString(),
      subtitle: "automatizados hoy",
      icon: EnvelopeIcon,
      color: "from-purple-500 to-violet-600",
      bgColor: "from-purple-500/10 to-violet-600/10",
      trend: "+5",
      trendUp: true
    },
    {
      title: "Llamadas Sugeridas",
      value: mockAiKPIs.callsSuggested.toString(),
      subtitle: "prioridad alta",
      icon: PhoneIcon,
      color: "from-cyan-500 to-teal-600",
      bgColor: "from-cyan-500/10 to-teal-600/10",
      trend: "+3",
      trendUp: true
    },
    {
      title: "Automatizaciones Activas",
      value: mockAiKPIs.activeAutomations.toString(),
      subtitle: "funcionando correctamente",
      icon: SparklesIcon,
      color: "from-yellow-500 to-amber-600",
      bgColor: "from-yellow-500/10 to-amber-600/10",
      trend: "+2",
      trendUp: true
    },
    {
      title: "Tiempo Respuesta",
      value: `${mockAiKPIs.avgResponseTime}h`,
      subtitle: "promedio IA",
      icon: ClockIcon,
      color: "from-gray-500 to-slate-600",
      bgColor: "from-gray-500/10 to-slate-600/10",
      trend: "-0.3h",
      trendUp: true
    }
  ]

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
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                  kpi.trendUp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {kpi.trend}
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