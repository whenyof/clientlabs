"use client"

import { Activity } from "lucide-react"
import { cn } from "@/lib/utils"

export type ProviderRiskCardProps = {
  isLight: boolean
  dependencyLevel: string
  operationalState: string
  affectedArea?: string | null
  hasAlternative?: boolean
}

export function ProviderRiskCard({
  isLight,
  dependencyLevel,
  operationalState,
  affectedArea,
  hasAlternative,
}: ProviderRiskCardProps) {
  if (dependencyLevel === "LOW") return null

  return (
    <div
      className={cn(
        "rounded-xl border p-3.5",
        operationalState === "RISK"
          ? isLight
            ? "bg-red-50/70 border-red-100"
            : "bg-red-500/5 border-red-500/15"
          : operationalState === "ATTENTION"
            ? isLight
              ? "bg-amber-50/70 border-amber-100"
              : "bg-amber-500/5 border-amber-500/15"
            : isLight
              ? "bg-white border-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              : "bg-white/[0.02] border-white/[0.08]"
      )}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Activity
          className={cn(
            "h-3.5 w-3.5",
            operationalState === "RISK"
              ? "text-red-500"
              : operationalState === "ATTENTION"
                ? "text-amber-500"
                : "text-blue-500"
          )}
        />
        <h3
          className={cn(
            "text-[11px] font-medium",
            isLight ? "text-neutral-900" : "text-white"
          )}
        >
          Riesgo operativo
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p
            className={cn(
              "text-[10px] font-medium uppercase tracking-wider",
              isLight ? "text-neutral-400" : "text-white/35"
            )}
          >
            Área
          </p>
          <p
            className={cn(
              "text-[11px] mt-0.5 truncate",
              isLight ? "text-neutral-700" : "text-white/70"
            )}
          >
            {affectedArea || "—"}
          </p>
        </div>
        <div>
          <p
            className={cn(
              "text-[10px] font-medium uppercase tracking-wider",
              isLight ? "text-neutral-400" : "text-white/35"
            )}
          >
            Contingencia
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full shrink-0",
                hasAlternative ? "bg-green-500" : "bg-amber-500 animate-pulse"
              )}
            />
            <span
              className={cn(
                "text-[11px]",
                isLight ? "text-neutral-700" : "text-white/70"
              )}
            >
              {hasAlternative ? "Sí" : "No"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
