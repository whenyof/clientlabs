"use client"

import { memo } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { format, isToday, startOfWeek, endOfWeek } from "date-fns"
import { enUS } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type CalendarView = "month" | "week" | "day"

type CalendarToolbarProps = {
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  currentDate: Date
  onCurrentDateChange: (date: Date) => void
  className?: string
}

function getRangeLabel(view: CalendarView, date: Date): string {
  if (view === "month") {
    return format(date, "MMMM yyyy", { locale: enUS })
  }
  if (view === "week") {
    const start = startOfWeek(date, { weekStartsOn: 1 })
    const end = endOfWeek(date, { weekStartsOn: 1 })
    return `${format(start, "MMM d", { locale: enUS })} – ${format(end, "MMM d, yyyy", { locale: enUS })}`
  }
  return format(date, "EEEE, MMMM d, yyyy", { locale: enUS })
}

function addViewDelta(view: CalendarView, date: Date, delta: number): Date {
  const d = new Date(date)
  if (view === "month") {
    d.setMonth(d.getMonth() + delta)
    return d
  }
  if (view === "week") {
    d.setDate(d.getDate() + delta * 7)
    return d
  }
  d.setDate(d.getDate() + delta)
  return d
}

export const CalendarToolbar = memo(function CalendarToolbar({
  view,
  onViewChange,
  currentDate,
  onCurrentDateChange,
  className,
}: CalendarToolbarProps) {
  const rangeLabel = getRangeLabel(view, currentDate)

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card px-4 py-3 shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:bg-violet-500/10 hover:text-violet-600"
          onClick={() => onCurrentDateChange(addViewDelta(view, currentDate, -1))}
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:bg-violet-500/10 hover:text-violet-600"
          onClick={() => onCurrentDateChange(addViewDelta(view, currentDate, 1))}
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-1.5 text-sm font-medium",
            isToday(currentDate)
              ? "bg-violet-500/15 text-violet-600"
              : "text-muted-foreground hover:bg-violet-500/10 hover:text-violet-600"
          )}
          onClick={() => onCurrentDateChange(new Date())}
        >
          <Calendar className="h-3.5 w-3.5" />
          Today
        </Button>
      </div>

      <h2 className="text-base font-semibold text-foreground sm:text-lg">{rangeLabel}</h2>

      <div className="flex rounded-lg border border-border/80 bg-muted/30 p-0.5">
        {(["month", "week", "day"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onViewChange(v)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              view === v
                ? "bg-violet-500 text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
})
