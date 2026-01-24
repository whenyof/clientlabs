"use client"

import { motion } from "framer-motion"
import { mockPredictions, formatCurrency } from "../mock"

export function PredictionsChart() {
  return (
    <div className="space-y-8">
      <motion.div
        className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 border border-blue-500/20 rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <h3 className="text-2xl font-bold text-white mb-4">Predicciones Inteligentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {formatCurrency(mockPredictions[0]?.predictedRevenue || 0)}
            </div>
            <div className="text-sm text-gray-400">Este mes</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {mockPredictions[0]?.confidence || 0}%
            </div>
            <div className="text-sm text-gray-400">Confianza IA</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              ↗️ Alcista
            </div>
            <div className="text-sm text-gray-400">Tendencia</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}