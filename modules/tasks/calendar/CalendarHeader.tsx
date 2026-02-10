"use client"

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ViewMode = "day" | "week"

type CalendarHeaderProps = {
  currentDate: Date
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onDateChange: (date: Date) => void
  className?: string
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onViewModeChange,
  onDateChange,
  className,
}: CalendarHeaderProps) {
  const rangeLabel =
    viewMode === "day"
      ? format(currentDate, "EEEE, d MMMM yyyy", { locale: es })
      : `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "d MMM", { locale: es })} – ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), "d MMM yyyy", { locale: es })}`

  const goPrev = () => {
    if (viewMode === "day") onDateChange(addDays(currentDate, -1))
    else onDateChange(subWeeks(currentDate, 1))
  }
  const goNext = () => {
    if (viewMode === "day") onDateChange(addDays(currentDate, 1))
    else onDateChange(addWeeks(currentDate, 1))
  }
  const goToday = () => onDateChange(new Date())

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
          onClick={goPrev}
          aria-label="Anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:bg-violet-500/10 hover:text-violet-600"
          onClick={goNext}
          aria-label="Siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:bg-violet-500/10 hover:text-violet-600"
          onClick={goToday}
        >
          Hoy
        </Button>
        <span className="ml-2 text-sm font-medium text-foreground min-w-[200px]">
          {rangeLabel}
        </span>
      </div>
      <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-0.5">
        <Button
          variant={viewMode === "day" ? "secondary" : "ghost"}
          size="sm"
          className="gap-1.5"
          onClick={() => onViewModeChange("day")}
        >
          <CalendarDays className="h-4 w-4" />
          Día
        </Button>
        <Button
          variant={viewMode === "week" ? "secondary" : "ghost"}
          size="sm"
          className="gap-1.5"
          onClick={() => onViewModeChange("week")}
        >
          <CalendarDays className="h-4 w-4" />
          Semana
        </Button>
      </div>
    </div>
  )
}
