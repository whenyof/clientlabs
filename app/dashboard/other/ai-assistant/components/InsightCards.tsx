"use client"

import { motion } from "framer-motion"
import { AnimatedCard } from "../../analytics/components/AnimatedCard"
import { mockAiInsights, getInsightIcon } from "../mock"
import {
  ExclamationTriangleIcon,
  FireIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline"

export function InsightCards() {
  const getInsightStyle = (type: string, impact: string) => {
    const baseStyles = {
      hot_lead: {
        bg: "bg-gradient-to-br from-red-500/10 to-pink-600/10",
        border: "border-red-500/20",
        icon: FireIcon,
        color: "text-red-400"
      },
      risk_client: {
        bg: "bg-gradient-to-br from-orange-500/10 to-red-600/10",
        border: "border-orange-500/20",
        icon: ExclamationTriangleIcon,
        color: "text-orange-400"
      },
      opportunity: {
        bg: "bg-gradient-to-br from-green-500/10 to-emerald-600/10",
        border: "border-green-500/20",
        icon: ArrowTrendingUpIcon,
        color: "text-green-400"
      },
      warning: {
        bg: "bg-gradient-to-br from-yellow-500/10 to-orange-600/10",
        border: "border-yellow-500/20",
        icon: LightBulbIcon,
        color: "text-yellow-400"
      }
    }

    return baseStyles[type as keyof typeof baseStyles] || baseStyles.warning
  }

  const getImpactBadge = (impact: string) => {
    const styles = {
      high: "bg-red-500/20 text-red-400 border-red-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      low: "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
    return styles[impact as keyof typeof styles] || styles.medium
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {mockAiInsights.map((insight, index) => {
        const style = getInsightStyle(insight.type, insight.impact)
        const Icon = style.icon

        return (
          <AnimatedCard key={insight.id} delay={index * 0.1}>
            <div className={`p-6 rounded-2xl border ${style.bg} ${style.border} backdrop-blur-sm`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-800/50`}>
                    <Icon className={`w-5 h-5 ${style.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {insight.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getImpactBadge(insight.impact)}`}>
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

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>
                  {new Date(insight.createdAt).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                {insight.leadId && (
                  <span className="text-purple-400">
                    Lead ID: {insight.leadId}
                  </span>
                )}
                {insight.clientId && (
                  <span className="text-blue-400">
                    Cliente ID: {insight.clientId}
                  </span>
                )}
              </div>
            </div>
          </AnimatedCard>
        )
      })}
    </div>
  )
}