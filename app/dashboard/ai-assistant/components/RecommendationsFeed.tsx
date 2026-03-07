"use client"

import { motion } from "framer-motion"
import { mockRecommendations } from "../mock"

export function RecommendationsFeed() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Centro de Recomendaciones</h3>
        <p className="text-[var(--text-secondary)]">Acciones inteligentes sugeridas por IA</p>
      </div>

      <div className="space-y-4">
        {mockRecommendations.slice(0, 3).map((recommendation, index) => (
          <motion.div
            key={recommendation.id}
            className="bg-[var(--bg-main)] backdrop-blur-sm rounded-xl border border-[var(--border-subtle)] p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                  {recommendation.title}
                </h4>
                <p className="text-[var(--text-secondary)] text-sm">
                  {recommendation.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    recommendation.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                    recommendation.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-[var(--bg-main)]0/20 text-[var(--text-secondary)]'
                  }`}>
                    {recommendation.priority.toUpperCase()}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {recommendation.confidence}% confianza
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-400">
                  {recommendation.expectedImpact}/10
                </div>
                <div className="text-xs text-[var(--text-secondary)]">Impacto esperado</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}