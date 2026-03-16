"use client"

import { Lightbulb, Star, AlertTriangle } from "lucide-react"

export interface ClientInsightsCardProps {
  insights?: {
    type: "top" | "engagement" | "risk"
    label: string
    description?: string
  }[]
}

export function ClientInsightsCard({ insights }: ClientInsightsCardProps) {
  const items =
    insights && insights.length
      ? insights
      : [
          { type: "top" as const, label: "Cliente destacado", description: "Alto potencial de ingresos." },
          { type: "engagement" as const, label: "Alta interacción", description: "Interacciones recientes positivas." },
          { type: "risk" as const, label: "Señales de riesgo", description: "Monitorizar pagos y actividad." },
        ]

  const getIcon = (type: "top" | "engagement" | "risk") => {
    if (type === "top") return <Star className="h-4 w-4 text-amber-400" />
    if (type === "engagement") return <Lightbulb className="h-4 w-4 text-emerald-500" />
    return <AlertTriangle className="h-4 w-4 text-red-500" />
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        Insights
      </h3>
      <div className="space-y-2 text-sm">
        {items.map((item, idx) => (
          <div key={`${item.type}-${idx}`} className="flex items-start gap-2">
            <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-50">
              {getIcon(item.type)}
            </div>
            <div className="space-y-0.5">
              <p className="font-medium text-neutral-900">{item.label}</p>
              {item.description && (
                <p className="text-xs text-neutral-600">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
