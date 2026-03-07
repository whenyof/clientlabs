"use client"

import { AlertTriangle, AlertCircle, TrendingDown, TrendingUp, Receipt, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SalesAnomaly, AnomalyType, AnomalySeverity } from "../services/anomalyDetection"

type Props = {
  anomalies: SalesAnomaly[]
}

const SEVERITY_CONFIG: Record<
  AnomalySeverity,
  { icon: typeof AlertCircle; className: string; iconClassName: string }
> = {
  HIGH: {
    icon: AlertCircle,
    className: "border-rose-500/30 bg-rose-500/10",
    iconClassName: "text-rose-400",
  },
  MEDIUM: {
    icon: AlertTriangle,
    className: "border-amber-500/30 bg-amber-500/10",
    iconClassName: "text-amber-400",
  },
  LOW: {
    icon: AlertTriangle,
    className: "border-amber-500/20 bg-amber-500/5",
    iconClassName: "text-amber-400/90",
  },
}

function getTypeIcon(type: AnomalyType) {
  switch (type) {
    case "REVENUE_DROP":
    case "SALES_DROP":
      return TrendingDown
    case "REVENUE_SPIKE":
    case "SALES_SPIKE":
      return TrendingUp
    case "TICKET_LOW":
    case "TICKET_HIGH":
      return Receipt
    case "CLIENT_INACTIVE":
      return Users
    default:
      return AlertTriangle
  }
}

function confidenceLabel(confidence: number): string {
  const pct = Math.round(confidence * 100)
  if (pct >= 85) return "Alta"
  if (pct >= 70) return "Media"
  return "Baja"
}

export function SalesAnomalyPanel({ anomalies }: Props) {
  if (anomalies.length === 0) return null

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <span className="text-base" aria-hidden>
          🚨
        </span>
        <h3 className="text-sm font-medium text-white/80">
          Anomalías detectadas
        </h3>
      </div>
      <div className="p-4 flex flex-col gap-2">
        {anomalies.map((a, i) => {
          const config = SEVERITY_CONFIG[a.severity]
          const Icon = config.icon
          const TypeIcon = getTypeIcon(a.type)
          return (
            <div
              key={`${a.type}-${i}`}
              className={cn(
                "flex items-start gap-3 rounded-lg border px-3 py-2.5",
                config.className
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", config.iconClassName)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{a.title}</p>
                <p className="text-xs text-white/80 mt-0.5">{a.description}</p>
                <p className="text-xs text-white/50 mt-1.5 flex items-center gap-1.5">
                  <TypeIcon className="h-3.5 w-3.5" />
                  Confianza: {confidenceLabel(a.confidence)} (
                  {Math.round(a.confidence * 100)}%)
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
