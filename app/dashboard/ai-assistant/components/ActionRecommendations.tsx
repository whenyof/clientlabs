"use client"

import { motion } from "framer-motion"
import { AnimatedCard } from "../../analytics/components/AnimatedCard"
import { SparklesIcon } from "@heroicons/react/24/outline"

export function ActionRecommendations() {
  return (
    <div className="p-12 bg-[var(--bg-main)] rounded-xl border border-[var(--border-subtle)] text-center">
      <SparklesIcon className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-3" />
      <p className="text-[var(--text-secondary)] font-medium">Sin recomendaciones</p>
      <p className="text-[var(--text-secondary)] text-sm mt-1">
        El asistente generará recomendaciones de acción personalizadas a medida que analice tus datos.
      </p>
    </div>
  )
}