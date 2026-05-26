"use client"

import { motion } from "framer-motion"
import { ChartBarIcon } from "@heroicons/react/24/outline"

export function PredictionsChart() {
  return (
    <div className="space-y-8">
      <motion.div
        className="bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-green-500/10 border border-blue-500/20 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Predicciones Inteligentes</h3>
        <div className="py-10 text-center">
          <ChartBarIcon className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3" />
          <p className="text-[var(--text-secondary)] font-medium">Sin predicciones disponibles</p>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Las predicciones se generarán a medida que el sistema analice tus datos.
          </p>
        </div>
      </motion.div>
    </div>
  )
}