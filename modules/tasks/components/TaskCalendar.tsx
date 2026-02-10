"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

type TaskCalendarProps = {
  className?: string
}

/**
 * Placeholder para el calendario de tareas.
 * Aquí irán drag & drop, planificación y asignaciones.
 */
export function TaskCalendar({ className }: TaskCalendarProps) {
  return (
    <Card
      className={cn(
        "rounded-xl border border-border/80 shadow-sm overflow-hidden",
        "min-h-[500px] flex flex-col",
        className
      )}
    >
      <CardHeader className="border-b border-border/60 py-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-violet-500/10 p-2">
            <Calendar className="h-5 w-5 text-violet-500" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Calendario de tareas
          </h2>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center p-8">
        <p className="text-center text-muted-foreground max-w-md text-sm leading-relaxed">
          Aquí aparecerán las tareas con drag & drop, planificación y asignaciones.
        </p>
      </CardContent>
    </Card>
  )
}
