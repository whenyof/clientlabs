"use client"
import { getBaseUrl } from "@/lib/api/baseUrl"


import { useEffect, useState } from "react"
import { Lightbulb } from "lucide-react"

interface LeadInsightsCardProps {
  leadId: string
  score?: number
}

interface InsightsData {
  identity?: { notes?: string | null }
  recommendations?: string[]
}

export function LeadInsightsCard({ leadId, score = 0 }: LeadInsightsCardProps) {
  const [insights, setInsights] = useState<InsightsData | null>(null)

  useEffect(() => {
    fetch(`/api/leads/${leadId}/insights`)
      .then((res) => res.json())
      .then((data) => setInsights(data))
      .catch(() => setInsights(null))
  }, [leadId])

  const hints: string[] = []
  if (score < 30 && score >= 0) {
    hints.push("Lead score bajo")
    hints.push("Recomendación: enviar email de seguimiento")
  }
  if (insights?.recommendations?.length) {
    hints.push(...insights.recommendations)
  }
  if (hints.length === 0) {
    hints.push("Lead visitó la web")
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        <Lightbulb className="h-3.5 w-3.5" />
        Insights
      </h3>
      <div className="space-y-2 text-sm text-neutral-700">
        {hints.length > 0 ? (
          hints.map((hint, i) => (
            <p key={i} className="leading-relaxed">
              {hint}
            </p>
          ))
        ) : (
          <p className="italic text-neutral-400">
            No hay insights disponibles. La actividad del lead aparecerá aquí.
          </p>
        )}
      </div>
    </div>
  )
}
