"use client"

import { motion } from "framer-motion"
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

      <div className="bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] p-12 text-center">
        <LightBulbIcon className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
        <h4 className="text-lg font-medium text-[var(--text-secondary)] mb-2">
          Sin recomendaciones disponibles
        </h4>
        <p className="text-[var(--text-secondary)] text-sm max-w-sm mx-auto">
          Conecta integraciones para que el sistema analice tus datos y genere recomendaciones personalizadas.
        </p>
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