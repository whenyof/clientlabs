"use client"

import { motion } from "framer-motion"
import { mockAIRecommendations } from "../mock"
import {
  SparklesIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  LightBulbIcon
} from "@heroicons/react/24/outline"

export function AIRecommendations() {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-green-400 bg-green-500/10 border-green-500/20'
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
      default:
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high':
        return ArrowTrendingUpIcon   // 🔥 CAMBIADO
      case 'medium':
        return LightBulbIcon
      default:
        return SparklesIcon
    }
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">
          🤖
        </div>
        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Recomendaciones IA</h3>
        <p className="text-[var(--text-secondary)]">
          Sugerencias inteligentes basadas en tu uso y patrones de negocio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAIRecommendations.map((rec, index) => {
          const ImpactIcon = getImpactIcon(rec.impact)
          const impactColor = getImpactColor(rec.impact)

          return (
            <motion.div
              key={rec.id}
              className="bg-[var(--bg-main)] backdrop-blur-sm rounded-xl border border-[var(--border-subtle)] p-6 hover:border-[var(--border-subtle)] transition-all duration-300 group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (index * 0.1), duration: 0.5 }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-xl ${impactColor}`}>
                  <ImpactIcon className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                    rec.impact === 'high'
                      ? 'bg-green-500/20 text-green-400'
                      : rec.impact === 'medium'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {rec.impact === 'high' ? 'Alto Impacto' :
                     rec.impact === 'medium' ? 'Medio Impacto' : 'Bajo Impacto'}
                  </div>

                  <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                    {rec.title}
                  </h4>
                </div>
              </div>

              <p className="text-[var(--text-secondary)] text-sm mb-4 leading-relaxed">
                {rec.description}
              </p>

              <div className="flex gap-3">
                <motion.button
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-600 text-[var(--text-primary)] text-sm font-medium rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Implementar
                  <ArrowRightIcon className="w-4 h-4" />
                </motion.button>

                <motion.button
                  className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Más tarde
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* AI Insights Summary */}
      <motion.div
        className="bg-gradient-to-r from-emerald-600/10 via-blue-600/10 to-green-600/10 rounded-xl border border-emerald-500/20 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-[var(--text-primary)]" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-[var(--text-primary)]">Análisis Inteligente</h4>
            <p className="text-[var(--text-secondary)]">Basado en 30 días de datos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--bg-main)] rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400 mb-1">+45%</div>
            <div className="text-sm text-[var(--text-secondary)]">Eficiencia potencial</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">Con automatizaciones</div>
          </div>

          <div className="bg-[var(--bg-main)] rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400 mb-1">3</div>
            <div className="text-sm text-[var(--text-secondary)]">Integraciones sugeridas</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">Para optimizar procesos</div>
          </div>

          <div className="bg-[var(--bg-main)] rounded-xl p-4">
            <div className="text-2xl font-bold text-emerald-400 mb-1">€12K</div>
            <div className="text-sm text-[var(--text-secondary)]">Revenue adicional</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">Con mejoras propuestas</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}