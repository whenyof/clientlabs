"use client"

import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  ArrowPathIcon,
  TicketIcon,
  CogIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"
import { AnimatedCard } from "./AnimatedCard"

interface AnalyticsKPIsProps {
  selectedRange: string
}

/** No analytics backend — show zeros. */
export function AnalyticsKPIs({ selectedRange: _selectedRange }: AnalyticsKPIsProps) {
  const kpiData = [
    {
      title: "Ingresos Totales",
      value: "€0",
      change: 0,
      icon: CurrencyDollarIcon,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-500/10 to-emerald-600/10"
    },
    {
      title: "Crecimiento",
      value: "0%",
      change: 0,
      icon: ArrowTrendingUpIcon,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-500/10 to-emerald-600/10"
    },
    {
      title: "Leads Nuevos",
      value: "0",
      change: 0,
      icon: UserGroupIcon,
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-500/10 to-cyan-600/10"
    },
    {
      title: "Conversión",
      value: "0%",
      change: 0,
      icon: ArrowPathIcon,
      color: "from-purple-500 to-indigo-600",
      bgColor: "from-purple-500/10 to-indigo-600/10"
    },
    {
      title: "Ticket Medio",
      value: "€0",
      change: 0,
      icon: TicketIcon,
      color: "from-orange-500 to-amber-600",
      bgColor: "from-orange-500/10 to-amber-600/10"
    },
    {
      title: "% Automatizado",
      value: "0%",
      change: 0,
      icon: CogIcon,
      color: "from-cyan-500 to-teal-600",
      bgColor: "from-cyan-500/10 to-teal-600/10"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <AnimatedCard
            key={index}
            delay={0.1 + (index * 0.1)}
            className="overflow-hidden p-6"
            scale={1.03}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${kpi.bgColor} opacity-50`} />

            {/* Content */}
            <div className="relative">
              <motion.div
                className="flex items-center justify-between mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (index * 0.1), duration: 0.3 }}
              >
                <div className={`p-3 rounded-xl bg-gradient-to-br ${kpi.color} shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <motion.div
                    className="text-2xl font-bold text-white"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (index * 0.1), duration: 0.3 }}
                  >
                    {kpi.value}
                  </motion.div>
                  <motion.div
                    className="text-sm font-medium text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + (index * 0.1), duration: 0.3 }}
                  >
                    {kpi.change >= 0 ? '+' : ''}{kpi.change}%
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                className="text-sm text-gray-400 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + (index * 0.1), duration: 0.3 }}
              >
                {kpi.title}
              </motion.div>
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </AnimatedCard>
        )
      })}
    </div>
  )
}