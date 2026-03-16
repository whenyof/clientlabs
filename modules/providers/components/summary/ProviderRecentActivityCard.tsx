"use client"

import { cn } from "@/lib/utils"

export type ProviderRecentActivityCardProps = {
  isLight: boolean
  recentActivityText: string
  onViewTimeline: () => void
}

export function ProviderRecentActivityCard({
  isLight,
  recentActivityText,
  onViewTimeline,
}: ProviderRecentActivityCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-2.5",
        isLight
          ? "bg-white border-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          : "bg-white/[0.02] border-white/[0.06]"
      )}
    >
      <p
        className={cn(
          "text-[10px] font-medium uppercase tracking-wider mb-1",
          isLight ? "text-neutral-400" : "text-white/40"
        )}
      >
        Actividad reciente
      </p>
      <p
        className={cn(
          "text-[11px]",
          recentActivityText === "Sin actividad reciente"
            ? isLight
              ? "text-neutral-500"
              : "text-white/50"
            : isLight
              ? "text-neutral-600"
              : "text-white/60"
        )}
      >
        {recentActivityText}
      </p>
      <button
        type="button"
        onClick={onViewTimeline}
        className={cn(
          "mt-1.5 text-[10px] font-medium",
          isLight ? "text-emerald-600 hover:underline" : "text-emerald-400 hover:underline"
        )}
      >
        Ver en Timeline
      </button>
    </div>
  )
}
