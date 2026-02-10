"use client"

import { format, parseISO } from "date-fns"
import { enUS } from "date-fns/locale"
import { Lightbulb, ArrowRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { RedistributionSuggestion } from "../lib/redistributionSuggestions"

type RedistributionSuggestionCardProps = {
  suggestions: RedistributionSuggestion[]
  onMove: (suggestion: RedistributionSuggestion) => void
  movingId?: string | null
  className?: string
}

function formatDay(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "EEEE, MMM d", { locale: enUS })
  } catch {
    return dateStr
  }
}

export function RedistributionSuggestionCard({
  suggestions,
  onMove,
  movingId,
  className,
}: RedistributionSuggestionCardProps) {
  if (suggestions.length === 0) return null

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card p-4 shadow-sm",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        Better task distribution
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Move low-priority tasks to lighter days. You choose; nothing is moved automatically.
      </p>
      <ul className="space-y-2">
        {suggestions.map((s) => (
          <li
            key={s.taskId}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {s.taskTitle}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 shrink-0" />
                Move to {formatDay(s.to)} to reduce overload.
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="shrink-0 gap-1"
              onClick={() => onMove(s)}
              disabled={movingId === s.taskId}
            >
              {movingId === s.taskId ? (
                "Moving…"
              ) : (
                <>
                  <ArrowRight className="h-3.5 w-3.5" />
                  Move
                </>
              )}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
