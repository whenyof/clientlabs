"use client"

import { LeadStatus } from "./mock"

interface AIPredictionProps {
  score: number
  status: LeadStatus
}

const STATUS_COPY: Record<LeadStatus, string> = {
  hot: "Alta probabilidad de cierre",
  warm: "Buena oportunidad con seguimiento",
  cold: "Necesita nurturing",
}

export function AIPrediction({ score, status }: AIPredictionProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">IA Prediction</h4>
        <span className="text-xs text-purple-300 bg-purple-500/10 px-2 py-1 rounded-full">
          {score}%
        </span>
      </div>
      <p className="text-sm text-white/70">{STATUS_COPY[status]}</p>
      <div className="h-2 bg-white/5 rounded-full">
        <div
          className="h-2 bg-purple-500/70 rounded-full"
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs text-white/50">
        Clasificación automática basada en señales de comportamiento.
      </p>
    </div>
  )
}
