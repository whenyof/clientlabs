"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"
import { cn } from "@/lib/utils"
import type { ReportingPeriodPreset } from "../types"

const PRESETS: ReportingPeriodPreset[] = ["day", "7d", "30d", "6m", "12m"]

type Props = {
  value: ReportingPeriodPreset
  onChange: (preset: ReportingPeriodPreset) => void
  className?: string
}

export function ReportingPeriodPicker({ value, onChange, className }: Props) {
  const { labels } = useSectorConfig()
  const p = labels.reporting.periods

  const label = (preset: ReportingPeriodPreset) => {
    switch (preset) {
      case "day":
        return p.day
      case "7d":
        return p.last7
      case "30d":
        return p.last30
      case "6m":
        return p.last6m
      case "12m":
        return p.last12m
      default:
        return String(preset)
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {PRESETS.map((preset) => (
        <button
          key={preset}
          type="button"
          onClick={() => onChange(preset)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
            value === preset
              ? "bg-white/15 text-white border border-white/20"
              : "text-white/60 hover:text-white hover:bg-white/10 border border-transparent"
          )}
        >
          {label(preset)}
        </button>
      ))}
    </div>
  )
}
