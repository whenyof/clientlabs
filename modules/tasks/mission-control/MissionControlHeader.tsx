"use client"

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
  { id: "year", label: "Año" },
]

export function MissionControlHeader({
  dateRangeLabel,
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  className,
}: {
  dateRangeLabel: string
  view: CalendarViewMode
  onViewChange: (v: CalendarViewMode) => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  className?: string
}) {
  return (
    <header
      className={cn(
        "w-full shrink-0 border-b border-white/10",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 min-h-[72px]">
        <div className="flex items-center gap-4 min-w-0">
          <h1 className="text-sm font-semibold text-white truncate shrink-0">Tareas</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
              aria-label="Anterior"
              onClick={onPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-base font-semibold text-white tabular-nums min-w-[140px] sm:min-w-[180px] text-center">
              {dateRangeLabel}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
              aria-label="Siguiente"
              onClick={onNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
              onClick={onToday}
            >
              Hoy
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-0.5 shrink-0">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onViewChange(v.id)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                view === v.id ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 flex-1 min-w-0 justify-end">
          <div className="relative w-28 sm:w-36 hidden md:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500 pointer-events-none" />
            <Input
              type="search"
              placeholder="Buscar"
              className="h-8 pl-8 rounded-lg border border-white/10 bg-white/[0.02] text-zinc-300 text-xs placeholder:text-zinc-500"
            />
          </div>
          <Select>
            <SelectTrigger className="h-8 w-[90px] rounded-lg border border-white/10 bg-white/[0.02] text-zinc-300 text-[11px] hidden sm:flex">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10">
              <SelectItem value="all" className="text-zinc-300 focus:bg-zinc-800">Todos</SelectItem>
              <SelectItem value="pending" className="text-zinc-300 focus:bg-zinc-800">Pendiente</SelectItem>
              <SelectItem value="done" className="text-zinc-300 focus:bg-zinc-800">Hecho</SelectItem>
            </SelectContent>
          </Select>
          <AddTaskButton className="h-8 px-3 rounded-lg border-0 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium shrink-0" />
        </div>
      </div>
    </header>
  )
}
