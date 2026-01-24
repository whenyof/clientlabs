"use client"

import { motion } from "framer-motion"
import { getInsightIcon, mockAiInsights, getPriorityColor } from "../mock"
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
          <h3 className="text-2xl font-bold text-white mb-2">Insights de IA</h3>
          <p className="text-gray-400">Análisis inteligente en tiempo real</p>
        </div>
        <div className="text-sm text-gray-500">
          Actualizado hace 5 min
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockAiInsights.map((insight, index) => {
          const style = getInsightStyle(insight.type)
          const Icon = style.icon

          return (
            <motion.div
              key={insight.id}
              className={`relative overflow-hidden rounded-2xl ${style.bg} backdrop-blur-sm border ${style.border} hover:shadow-lg ${style.glow} transition-all duration-300 group`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -2, scale: 1.01 }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-800/50`}>
                      <Icon className={`w-5 h-5 ${style.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-1">
                        {insight.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          insight.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                          insight.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {insight.impact.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {insight.confidence}% confianza
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-2xl">
                    {getInsightIcon(insight.type)}
                  </span>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {insight.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    {new Date(insight.createdAt).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => handleViewDetail(insight.id)}
                      className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <EyeIcon className="w-3 h-3" />
                      Ver detalle
                    </motion.button>

                    <motion.button
                      onClick={() => handleExecuteAction(insight.id)}
                      className="flex items-center gap-1 px-3 py-1 text-xs bg-purple-600/20 hover:bg-purple-500/30 text-purple-400 hover:text-purple-300 rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Ejecutar
                      <ArrowRightIcon className="w-3 h-3" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Animated border */}
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
                animate={{ backgroundPosition: ['0% 50%', '100% 50%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{
                  backgroundSize: '200% 200%',
                  backgroundImage: 'linear-gradient(90deg, transparent, rgba(147, 51, 234, 0.3), transparent)'
                }}
              />
            </motion.div>
          )
        })}
      </div>

      {/* Summary */}
      <motion.div
        className="bg-gray-800/30 rounded-xl p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Total insights generados: <span className="text-white font-semibold">{mockAiInsights.length}</span>
          </span>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">
              Prioridad alta: <span className="text-red-400 font-semibold">
                {mockAiInsights.filter(i => i.impact === 'high').length}
              </span>
            </span>
            <span className="text-gray-400">
              Confianza promedio: <span className="text-green-400 font-semibold">
                {Math.round(mockAiInsights.reduce((sum, i) => sum + i.confidence, 0) / mockAiInsights.length)}%
              </span>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}