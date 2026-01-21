"use client"

import { mockAiInsights } from "../mock"
import {
  LightBulbIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CpuChipIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"
import { AnimatedCard } from "./AnimatedCard"

export function AiInsights() {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction':
        return ChartBarIcon
      case 'alert':
        return ExclamationTriangleIcon
      case 'recommendation':
        return CpuChipIcon
      default:
        return LightBulbIcon
    }
  }

  const getInsightColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'from-red-500/20 to-red-600/20 border-red-500/30'
      case 'medium':
        return 'from-yellow-500/20 to-orange-600/20 border-yellow-500/30'
      default:
        return 'from-blue-500/20 to-cyan-600/20 border-blue-500/30'
    }
  }

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'bg-red-500/20 text-red-400 border-red-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }
    const labels = {
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    }
    return {
      color: colors[impact as keyof typeof colors] || colors.low,
      label: labels[impact as keyof typeof labels] || labels.low
    }
  }

  return (
    <AnimatedCard delay={0.7}>
      <div className="p-6">
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <motion.div
            className="p-2 bg-purple-600/20 rounded-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <LightBulbIcon className="w-5 h-5 text-purple-400" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-white">
              Insights de IA
            </h3>
            <p className="text-gray-400 text-sm">
              Análisis inteligente y recomendaciones automatizadas
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockAiInsights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type)
            const impactBadge = getImpactBadge(insight.impact)

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.2 + (index * 0.1),
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${getInsightColor(insight.impact)} p-5 border transition-all duration-300 group cursor-pointer`}
              >
                {/* Background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="relative">
                  <motion.div
                    className="flex items-start justify-between mb-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + (index * 0.1), duration: 0.3 }}
                  >
                    <motion.div
                      className="p-2 bg-white/10 rounded-lg"
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <span className="text-lg">{insight.icon}</span>
                    </motion.div>
                    <motion.span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${impactBadge.color}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.4 + (index * 0.1),
                        type: "spring",
                        stiffness: 500
                      }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {impactBadge.label}
                    </motion.span>
                  </motion.div>

                  <motion.h4
                    className="text-white font-semibold mb-2 leading-tight"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + (index * 0.1), duration: 0.3 }}
                  >
                    {insight.title}
                  </motion.h4>

                  <motion.p
                    className="text-gray-300 text-sm leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + (index * 0.1), duration: 0.3 }}
                  >
                    {insight.description}
                  </motion.p>

                  {/* Action hint */}
                  <motion.div
                    className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ y: 10 }}
                    whileHover={{ y: 0 }}
                  >
                    <Icon className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-purple-400 font-medium">
                      {insight.type === 'prediction' ? 'Ver predicción' :
                       insight.type === 'alert' ? 'Revisar ahora' :
                       'Implementar'}
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Summary stats */}
        <motion.div
          className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          {[
            { label: "Prioridad alta", value: mockAiInsights.filter(i => i.impact === 'high').length, color: "text-red-400" },
            { label: "Prioridad media", value: mockAiInsights.filter(i => i.impact === 'medium').length, color: "text-yellow-400" },
            { label: "Oportunidades", value: mockAiInsights.filter(i => i.impact === 'low').length, color: "text-blue-400" },
            { label: "Precisión IA", value: "94%", color: "text-green-400" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 + (index * 0.1), duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* AI Status */}
        <motion.div
          className="mt-6 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-lg p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4, duration: 0.3 }}
            >
              <motion.div
                className="w-3 h-3 bg-green-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div>
                <div className="text-white font-medium">IA activa y aprendiendo</div>
                <div className="text-sm text-gray-400">Última actualización: hace 5 minutos</div>
              </div>
            </motion.div>
            <motion.button
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
              whileHover={{ scale: 1.05, x: 2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5, duration: 0.3 }}
            >
              Ver más insights
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatedCard>
  )
}