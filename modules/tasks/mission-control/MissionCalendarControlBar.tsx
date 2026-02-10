"use client"

import { useState, memo } from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AddTaskButton } from "@/app/dashboard/tasks/AddTaskButton"
import type { CalendarViewMode } from "./CalendarView"

const VIEWS: { id: CalendarViewMode; label: string }[] = [
  { id: "day", label: "Día" },
  { id: "week", label: "Semana" },
  { id: "month", label: "Mes" },
  { id: "timeline", label: "Línea de tiempo" },
]

export const MissionCalendarControlBar = memo(function MissionCalendarControlBar({
  dateRangeLabel = "Jan 8–14 2026",
  view: controlledView,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  className,
}: {
  dateRangeLabel?: string
  view?: CalendarViewMode
  onViewChange?: (view: CalendarViewMode) => void
  onPrev?: () => void
  onNext?: () => void
  onToday?: () => void
  className?: string
}) {
  const [internalView, setInternalView] = useState<CalendarViewMode>("week")
  const view = controlledView ?? internalView
  const setView = onViewChange ?? setInternalView
  const [search, setSearch] = useState("")

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 h-12 px-4 rounded-xl border border-white/10 bg-white/[0.02] shrink-0",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5"
          aria-label="Anterior"
          onClick={onPrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5"
          onClick={onToday}
        >
          Hoy
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5"
          aria-label="Siguiente"
          onClick={onNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-xs font-medium text-zinc-300 tabular-nums min-w-[100px]">
          {dateRangeLabel}
        </span>
      </div>
      <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.02] p-0.5">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setView(v.id)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
              view === v.id
                ? "bg-white/10 text-white"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative w-32">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
          <Input
            type="search"
            placeholder="Buscar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-7 rounded-xl border border-white/10 bg-white/[0.02] text-zinc-300 text-xs placeholder:text-zinc-500"
          />
        </div>
        <Select>
          <SelectTrigger className="h-8 w-[100px] rounded-xl border border-white/10 bg-white/[0.02] text-zinc-300 text-xs">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            <SelectItem value="all" className="text-zinc-300 focus:bg-zinc-800">
              Todos
            </SelectItem>
            <SelectItem value="pending" className="text-zinc-300 focus:bg-zinc-800">
              Pendiente
            </SelectItem>
            <SelectItem value="done" className="text-zinc-300 focus:bg-zinc-800">
              Hecho
            </SelectItem>
          </SelectContent>
        </Select>
        <AddTaskButton
          className="h-8 px-3 rounded-xl border-0 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium shrink-0"
        />
      </div>
    </div>
  )
})
