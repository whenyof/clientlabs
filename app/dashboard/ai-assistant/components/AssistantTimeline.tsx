"use client"

import { motion } from "framer-motion"
import { ClockIcon } from "@heroicons/react/24/outline"

export function AssistantTimeline() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Historial de IA</h3>
          <p className="text-[var(--text-secondary)]">Actividad y decisiones del asistente inteligente</p>
        </div>
      </div>

      <div className="bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] p-12 text-center">
        <ClockIcon className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3" />
        <p className="text-[var(--text-secondary)] font-medium">Sin actividad registrada</p>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          El historial de actividad del asistente aparecerá aquí a medida que se generen análisis y recomendaciones.
        </p>
      </div>
    </div>
  )
}