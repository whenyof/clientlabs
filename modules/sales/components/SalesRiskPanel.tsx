"use client"

import { AlertTriangle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SalesRiskAlert } from "../lib/risk-detection"

type Props = {
  alerts: SalesRiskAlert[]
}

const severityConfig = {
  HIGH: {
    icon: AlertCircle,
    className: "border-rose-500/30 bg-rose-500/10 text-rose-400",
    iconClassName: "text-rose-400",
  },
  MEDIUM: {
    icon: AlertTriangle,
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    iconClassName: "text-amber-400",
  },
} as const

export function SalesRiskPanel({ alerts }: Props) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <h3 className="text-sm font-medium text-white/80 mb-3">Riesgos detectados</h3>
      {alerts.length === 0 ? (
        <p className="text-sm text-white/60">No hay riesgos detectados. Rendimiento estable.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {alerts.map((alert) => {
            const config = severityConfig[alert.severity]
            const Icon = config.icon
            return (
              <div
                key={alert.type}
                className={cn(
                  "flex items-start gap-3 rounded-lg border px-3 py-2.5",
                  config.className
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", config.iconClassName)} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs opacity-90 mt-0.5">{alert.description}</p>
                  <p className="text-xs opacity-80 mt-1">{alert.suggestion}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
