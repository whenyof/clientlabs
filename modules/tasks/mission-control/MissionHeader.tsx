"use client"

import { cn } from "@/lib/utils"
import { AddTaskButton } from "@/app/dashboard/tasks/AddTaskButton"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const VIEWS = [
  { id: "week", label: "Semana" },
  { id: "month", label: "Mes" },
] as const

function formatCurrentDate() {
  return new Date().toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function MissionHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "w-full flex items-center justify-between gap-4 py-2",
        className
      )}
    >
      {/* Left: title + subtitle (current date) */}
      <div className="min-w-0">
        <h1 className="text-lg font-semibold tracking-tight text-white truncate">
          Tareas
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          {formatCurrentDate()}
        </p>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="w-px h-5 bg-white/10" aria-hidden />
        <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.02] p-0.5">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                v.id === "week"
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-white/10" aria-hidden />
        <AddTaskButton className="h-8 px-3 text-xs font-medium bg-violet-600 hover:bg-violet-500 text-white border-0" />
      </div>
    </header>
  )
}
