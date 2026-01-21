"use client"

import type { TaskItem } from "./mock"

interface TaskKPIsProps {
  tasks: TaskItem[]
}

export function TaskKPIs({ tasks }: TaskKPIsProps) {
  const total = tasks.length
  const pending = tasks.filter((task) => task.status === "pending").length
  const inProgress = tasks.filter((task) => task.status === "in_progress").length
  const automated = tasks.filter((task) => task.origin === "bot").length

  const cards = [
    { id: "kpi-total", label: "Total tareas", value: total },
    { id: "kpi-pending", label: "Pendientes", value: pending },
    { id: "kpi-progress", label: "En progreso", value: inProgress },
    { id: "kpi-auto", label: "Automáticas", value: automated },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card) => (
        <article
          key={card.id}
          className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl"
        >
          <p className="text-[11px] uppercase tracking-[0.4em] text-white/50">{card.label}</p>
          <p className="mt-4 text-3xl font-semibold text-white">{card.value}</p>
        </article>
      ))}
    </div>
  )
}

export default TaskKPIs
