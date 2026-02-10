"use client"

import { cn } from "@/lib/utils"
import { AlertTriangle, CalendarClock, Sparkles } from "lucide-react"

export type RiskItem = { id: string; label: string; detail?: string }
export type ConflictItem = { id: string; label: string; detail?: string }
export type SuggestionItem = { id: string; label: string; detail?: string }

type MissionIntelligenceProps = {
  className?: string
  risks?: RiskItem[]
  conflicts?: ConflictItem[]
  suggestions?: SuggestionItem[]
}

function InsightCard({
  title,
  icon: Icon,
  items,
  emptyLabel,
  className,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: { id: string; label: string; detail?: string }[]
  emptyLabel: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/10 bg-white/[0.03] p-3",
        className
      )}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="h-3 w-3 text-zinc-500 shrink-0" />
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          {title}
        </h3>
      </div>
      {items.length === 0 ? (
        <p className="text-[11px] text-zinc-500">{emptyLabel}</p>
      ) : (
        <ul className="space-y-0">
          {items.map((item, i) => (
            <li
              key={item.id}
              className={cn(
                "py-1.5 text-[11px] text-zinc-300",
                i < items.length - 1 && "border-b border-white/5"
              )}
            >
              <span className="font-medium text-zinc-200">{item.label}</span>
              {item.detail && (
                <span className="block text-zinc-500 mt-0.5 text-[10px]">{item.detail}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function MissionIntelligence({
  className,
  risks = [],
  conflicts = [],
  suggestions = [],
}: MissionIntelligenceProps) {
  return (
    <aside
      className={cn("flex flex-col h-full min-h-0", className)}
      aria-label="Panel de inteligencia"
    >
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 shrink-0">
        Inteligencia
      </h2>
      <div className="flex-1 min-h-0 overflow-auto flex flex-col gap-2">
        <InsightCard
          title="Riesgos detectados"
          icon={AlertTriangle}
          items={risks}
          emptyLabel="No hay riesgos"
        />
        <InsightCard
          title="Conflictos de horario"
          icon={CalendarClock}
          items={conflicts}
          emptyLabel="No hay conflictos"
        />
        <InsightCard
          title="Sugerencias de optimización"
          icon={Sparkles}
          items={suggestions}
          emptyLabel="Sin sugerencias"
        />
      </div>
    </aside>
  )
}
