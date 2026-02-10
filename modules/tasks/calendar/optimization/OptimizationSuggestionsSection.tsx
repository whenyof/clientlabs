"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Lightbulb, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { OptimizationSuggestion } from "./suggestions-engine"
import type { CalendarEvent } from "../calendar-event-types"

export type OptimizationSuggestionsSectionProps = {
  suggestions: OptimizationSuggestion[]
  events: CalendarEvent[]
  className?: string
}

function getTaskTitle(events: CalendarEvent[], taskId: string): string {
  return events.find((e) => e.id === taskId)?.title ?? taskId
}

function difficultyLabel(d: OptimizationSuggestion["difficulty"]): string {
  switch (d) {
    case "low":
      return "Fácil"
    case "medium":
      return "Media"
    case "high":
      return "Alta"
  }
}

export function OptimizationSuggestionsSection({
  suggestions,
  events,
  className,
}: OptimizationSuggestionsSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (suggestions.length === 0) return null

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden",
        className
      )}
    >
      <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-violet-500" />
        <h3 className="text-sm font-semibold text-foreground">
          Optimización sugerida
        </h3>
      </div>
      <ul className="divide-y divide-border/60">
        {suggestions.map((s) => {
          const isExpanded = expandedId === s.id
          return (
            <li key={s.id} className="bg-background/30">
              <div className="px-4 py-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  className="flex items-center gap-1.5 text-left text-sm font-medium text-foreground hover:text-violet-600 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  )}
                  {s.title}
                </button>
                {s.timeSavedMinutes > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/15 px-2 py-0.5 text-xs font-medium text-violet-600">
                    <Clock className="w-3.5 h-3.5" />
                    {s.timeSavedMinutes} min
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {s.affectedTaskIds.length} tarea{s.affectedTaskIds.length !== 1 ? "s" : ""} afectada{s.affectedTaskIds.length !== 1 ? "s" : ""}
                </span>
                <span className="text-xs text-muted-foreground">
                  · {difficultyLabel(s.difficulty)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-7 text-xs text-violet-600 hover:bg-violet-500/10"
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                >
                  {isExpanded ? "Ocultar" : "Ver propuesta"}
                </Button>
              </div>
              {isExpanded && (
                <div className="px-4 pb-3 pt-0 pl-9 text-sm text-muted-foreground border-t border-border/40 pt-3 mt-0">
                  <p className="mb-2">{s.description}</p>
                  <p className="text-xs font-medium text-foreground mb-1">
                    Tareas: {s.affectedTaskIds.map((id) => getTaskTitle(events, id)).join(", ")}
                  </p>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
