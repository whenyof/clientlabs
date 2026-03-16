"use client"

import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

export type ProviderSuggestionCardProps = {
  isLight: boolean
  message: string
  onClick: () => void
}

export function ProviderSuggestionCard({
  isLight,
  message,
  onClick,
}: ProviderSuggestionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left transition-all group",
        isLight
          ? "rounded-lg border border-neutral-100 border-l-2 border-l-[var(--accent)] bg-emerald-50/50 hover:bg-emerald-50/70 lg:col-span-2 lg:row-start-2 px-3 py-2"
          : "rounded-lg border border-blue-500/20 bg-gradient-to-r from-blue-600/15 to-indigo-600/10 hover:border-blue-500/40 px-3 py-2"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span
            className={cn(
              "text-[10px] uppercase tracking-wider font-medium",
              isLight ? "text-emerald-600" : "text-blue-400/60"
            )}
          >
            Sugerencia
          </span>
          <p
            className={cn(
              "text-xs font-medium truncate mt-0.5",
              isLight ? "text-neutral-900" : "text-white"
            )}
          >
            {message}
          </p>
        </div>
        <ExternalLink
          className={cn(
            "h-3.5 w-3.5 shrink-0 opacity-60 group-hover:opacity-100",
            isLight ? "text-neutral-400" : "text-blue-400/60"
          )}
        />
      </div>
    </button>
  )
}
