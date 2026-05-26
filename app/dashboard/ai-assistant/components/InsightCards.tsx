"use client"

import { motion } from "framer-motion"
import { getInsightIcon, getPriorityColor } from "../mock"
import {
  ExclamationTriangleIcon,
  FireIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  EyeIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline"

export function InsightCards() {
  const getInsightStyle = (type: string) => {
    const baseStyles = {
      hot_lead: {
        bg: "bg-gradient-to-br from-red-500/10 to-pink-600/10",
        border: "border-red-500/20",
        icon: FireIcon,
        color: "text-red-400",
        glow: "shadow-red-500/10"
      },
      risk_client: {
        bg: "bg-gradient-to-br from-orange-500/10 to-red-600/10",
        border: "border-orange-500/20",
        icon: ExclamationTriangleIcon,
        color: "text-orange-400",
        glow: "shadow-orange-500/10"
      },
      opportunity: {
        bg: "bg-gradient-to-br from-green-500/10 to-emerald-600/10",
        border: "border-green-500/20",
        icon: ArrowTrendingUpIcon,
        color: "text-green-400",
        glow: "shadow-green-500/10"
      },
      warning: {
        bg: "bg-gradient-to-br from-yellow-500/10 to-orange-600/10",
        border: "border-yellow-500/20",
        icon: LightBulbIcon,
        color: "text-yellow-400",
        glow: "shadow-yellow-500/10"
      },
      success: {
        bg: "bg-gradient-to-br from-green-500/10 to-emerald-600/10",
        border: "border-green-500/20",
        icon: CheckCircleIcon,
        color: "text-green-400",
        glow: "shadow-green-500/10"
      }
    }

    return baseStyles[type as keyof typeof baseStyles] || baseStyles.warning
  }

  const handleViewDetail = (insightId: string) => {
    console.log('Ver detalle:', insightId)
  }

  const handleExecuteAction = (insightId: string) => {
    console.log('Ejecutar acción:', insightId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Insights de IA</h3>
          <p className="text-[var(--text-secondary)]">Análisis inteligente en tiempo real</p>
        </div>
        <div className="text-sm text-[var(--text-secondary)]">
          Actualizado hace 5 min
        </div>
      </div>

      <div className="bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] p-12 text-center">
        <LightBulbIcon className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3" />
        <p className="text-[var(--text-secondary)] font-medium">Sin insights disponibles</p>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Los insights se generarán automáticamente al analizar tus leads y clientes.
        </p>
      </div>

      {/* Summary */}
      <motion.div
        className="bg-[var(--bg-main)] rounded-xl p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--text-secondary)]">
            Total insights generados: <span className="text-[var(--text-primary)] font-semibold">0</span>
          </span>
        </div>
      </motion.div>
    </div>
  )
}