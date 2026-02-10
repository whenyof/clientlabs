"use client"

import { cn } from "@/lib/utils"

const cardClass =
  "bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl shadow-black/20 p-5"

export function MissionKPIs({ className }: { className?: string }) {
  return (
    <section
      className={cn("grid grid-cols-2 sm:grid-cols-4 gap-4", className)}
      aria-label="KPIs"
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            cardClass,
            "flex flex-col gap-1 min-h-[88px]"
          )}
        >
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            KPI {i}
          </span>
          <span className="text-2xl font-bold tabular-nums text-white">
            —
          </span>
          <span className="text-xs text-zinc-500">—</span>
        </div>
      ))}
    </section>
  )
}
