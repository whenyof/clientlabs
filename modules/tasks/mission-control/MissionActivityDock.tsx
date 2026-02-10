"use client"

import { cn } from "@/lib/utils"

const cardClass =
  "bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl shadow-black/20 p-4"

export function MissionActivityDock({ className }: { className?: string }) {
  return (
    <footer
      className={cn(cardClass, "flex items-center gap-4", className)}
      aria-label="Actividad futura"
    >
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 shrink-0">
        Actividad futura
      </h2>
      <div className="flex-1 flex gap-3 overflow-x-auto py-1 min-h-[72px]">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="shrink-0 w-32 rounded-lg border border-dashed border-zinc-700/60 bg-zinc-800/30 p-3"
          >
            <span className="text-xs text-zinc-500">Slot {i}</span>
          </div>
        ))}
      </div>
    </footer>
  )
}
