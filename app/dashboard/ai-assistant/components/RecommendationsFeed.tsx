"use client"

import { motion } from "framer-motion"
import { SparklesIcon } from "@heroicons/react/24/outline"

export function RecommendationsFeed() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Centro de Recomendaciones</h3>
        <p className="text-[var(--text-secondary)]">Acciones inteligentes sugeridas por IA</p>
      </div>

      <div className="bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] p-12 text-center">
        <SparklesIcon className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3" />
        <p className="text-[var(--text-secondary)] font-medium">Sin recomendaciones</p>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Las recomendaciones aparecerán aquí cuando el asistente analice tu actividad.
        </p>
      </div>
    </div>
  )
}