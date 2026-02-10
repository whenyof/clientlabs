"use client"

import { TaskKPIs } from "./TaskKPIs"
import { TaskCalendar } from "./TaskCalendar"
import { TaskInsights } from "./TaskInsights"
import { TaskListTable } from "./TaskListTable"
import { cn } from "@/lib/utils"

type TaskDashboardProps = {
  className?: string
}

/**
 * Layout principal del módulo de tareas.
 * 4 zonas: KPIs, bloque central (calendario + insights), tabla de tareas, espacio futuro.
 * Solo estructura visual y placeholders; sin fetch ni lógica.
 */
export function TaskDashboard({ className }: TaskDashboardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 lg:gap-8 w-full max-w-7xl mx-auto",
        className
      )}
    >
      {/* Sección 1 — KPIs superiores */}
      <section aria-label="Indicadores de tareas">
        <TaskKPIs />
      </section>

      {/* Sección 2 — Bloque central: calendario + insights */}
      <section
        aria-label="Calendario e insights"
        className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6"
      >
        <div className="lg:col-span-8">
          <TaskCalendar />
        </div>
        <div className="lg:col-span-4">
          <TaskInsights />
        </div>
      </section>

      {/* Sección 3 — Lista / tabla de tareas */}
      <section aria-label="Lista de tareas">
        <TaskListTable />
      </section>

      {/* Sección 4 — Futuro */}
      <section aria-label="Extensiones futuras">
        {/* futuras automatizaciones, métricas avanzadas, etc */}
        <div className="min-h-[120px] rounded-xl border border-dashed border-border/60 bg-muted/5 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Espacio para extensiones futuras
          </p>
        </div>
      </section>
    </div>
  )
}
