"use client"

import { TrendingUp, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { GrowthOpportunity } from "../lib/growth-opportunities"

type Props = {
  opportunities: GrowthOpportunity[]
}

const impactConfig = {
  HIGH: {
    icon: TrendingUp,
    className: "border-violet-500/30 bg-violet-500/10 text-violet-400",
    iconClassName: "text-violet-400",
  },
  MEDIUM: {
    icon: Sparkles,
    className: "border-white/20 bg-white/5 text-white/90",
    iconClassName: "text-white/60",
  },
} as const

export function SalesOpportunitiesPanel({ opportunities }: Props) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <h3 className="text-sm font-medium text-white/80 mb-3">Oportunidades</h3>
      {opportunities.length === 0 ? (
        <p className="text-sm text-white/60">No se detectan oportunidades de crecimiento relevantes.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {opportunities.map((opp) => {
            const config = impactConfig[opp.impact]
            const Icon = config.icon
            return (
              <div
                key={opp.type}
                className={cn(
                  "flex items-start gap-3 rounded-lg border px-3 py-2.5",
                  config.className
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", config.iconClassName)} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{opp.title}</p>
                  <p className="text-xs opacity-90 mt-0.5">{opp.description}</p>
                  <p className="text-xs opacity-80 mt-1">{opp.suggestion}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
