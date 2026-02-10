"use client"

import { AlertTriangle, AlertCircle, CheckCircle, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export type BusinessInsightItem = {
  type: "positive" | "warning" | "opportunity"
  title: string
  description: string
}

type Props = {
  insights: BusinessInsightItem[]
}

const typeConfig = {
  positive: {
    icon: CheckCircle,
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    iconClassName: "text-emerald-400",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    iconClassName: "text-amber-400",
  },
  opportunity: {
    icon: TrendingUp,
    className: "border-violet-500/30 bg-violet-500/10 text-violet-400",
    iconClassName: "text-violet-400",
  },
} as const

export function SalesInsights({ insights }: Props) {
  if (insights.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-white/80">Análisis inteligente</h3>
      <div className="flex flex-col gap-2">
        {insights.map((insight, i) => {
          const config = typeConfig[insight.type]
          if (!config) return null
          const Icon = config.icon
          return (
            <div
              key={`${insight.type}-${insight.title}-${i}`}
              className={cn(
                "flex items-start gap-3 rounded-xl border px-4 py-3",
                config.className
              )}
            >
              {Icon ? <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", config.iconClassName)} /> : null}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{insight.title}</p>
                <p className="text-xs opacity-90 mt-0.5 leading-snug">{insight.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
