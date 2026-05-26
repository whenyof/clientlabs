"use client"

import { useQuery } from "@tanstack/react-query"
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

type Stats = {
  hotLeadsCount: number
  riskClientsCount: number
  activeAutomationsCount: number
  totalExecutions: number
}

export function AssistantKPIs() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["ai-assistant-stats"],
    queryFn: () => fetch("/api/ai-assistant/stats").then(r => r.json()),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
  })

  const kpis = [
    {
      title: "Leads Calientes",
      value: stats ? String(stats.hotLeadsCount) : "—",
      subtitle: "score ≥ 70",
      icon: FireIcon,
      color: "from-red-500 to-pink-600",
      bgColor: "from-red-500/10 to-pink-600/10",
    },
    {
      title: "Clientes en Riesgo",
      value: stats ? String(stats.riskClientsCount) : "—",
      subtitle: "requieren atención",
      icon: ExclamationTriangleIcon,
      color: "from-orange-500 to-red-600",
      bgColor: "from-orange-500/10 to-red-600/10",
    },
    {
      title: "Automatizaciones",
      value: stats ? String(stats.activeAutomationsCount) : "—",
      subtitle: "activas ahora",
      icon: SparklesIcon,
      color: "from-yellow-500 to-amber-600",
      bgColor: "from-yellow-500/10 to-amber-600/10",
    },
    {
      title: "Ejecuciones",
      value: stats ? String(stats.totalExecutions) : "—",
      subtitle: "historial total",
      icon: ChartBarIcon,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-500/10 to-emerald-600/10",
    },
    {
      title: "Predicciones IA",
      value: "—",
      subtitle: "próximamente",
      icon: CpuChipIcon,
      color: "from-blue-500 to-indigo-600",
      bgColor: "from-blue-500/10 to-indigo-600/10",
    },
    {
      title: "Emails IA",
      value: "—",
      subtitle: "próximamente",
      icon: EnvelopeIcon,
      color: "from-emerald-500 to-violet-600",
      bgColor: "from-emerald-500/10 to-violet-600/10",
    },
    {
      title: "Llamadas Sugeridas",
      value: "—",
      subtitle: "próximamente",
      icon: PhoneIcon,
      color: "from-cyan-500 to-teal-600",
      bgColor: "from-cyan-500/10 to-teal-600/10",
    },
    {
      title: "Tiempo Respuesta",
      value: "—",
      subtitle: "próximamente",
      icon: ClockIcon,
      color: "from-gray-500 to-slate-600",
      bgColor: "from-gray-500/10 to-slate-600/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <motion.div
            key={index}
            className="relative overflow-hidden rounded-xl bg-[var(--bg-main)] backdrop-blur-sm border border-[var(--border-subtle)] hover:border-[var(--border-subtle)] transition-all duration-300 hover:scale-105 group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05, duration: 0.5 }}
            whileHover={{ y: -2 }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${kpi.bgColor} opacity-50`} />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color} shadow-[var(--shadow-card)]`}>
                  <Icon className="w-6 h-6 text-[var(--text-primary)]" />
                </div>
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">{kpi.value}</div>
              <div className="text-sm text-[var(--text-secondary)] font-medium mb-2">{kpi.title}</div>
              <div className="text-xs text-[var(--text-secondary)]">{kpi.subtitle}</div>
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        )
      })}
    </div>
  )
}
