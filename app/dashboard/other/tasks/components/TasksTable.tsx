"use client"

import { PriorityBadge } from "./PriorityBadge"
import type { TaskItem, TaskOrigin, TaskStatus } from "./mock"

interface TasksTableProps {
  tasks: TaskItem[]
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pendiente",
  in_progress: "En progreso",
  completed: "Completada",
}

const STATUS_STYLES: Record<TaskStatus, string> = {
  pending: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  in_progress: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  completed: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
}

const ORIGIN_LABELS: Record<TaskOrigin, string> = {
  manual: "Manual",
  bot: "Automático",
}

export function TasksTable({ tasks }: TasksTableProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm text-white/80">
          <thead className="bg-[#111827]/70">
            <tr>
              <th className="px-6 py-4 text-xs uppercase tracking-[0.3em] text-white/40">Selección</th>
              <th className="px-6 py-4 text-xs uppercase tracking-[0.3em] text-white/40">Tarea</th>
              <th className="px-6 py-4 text-xs uppercase tracking-[0.3em] text-white/40">Cliente</th>
              <th className="px-6 py-4 text-xs uppercase tracking-[0.3em] text-white/40">Prioridad</th>
              <th className="px-6 py-4 text-xs uppercase tracking-[0.3em] text-white/40">Fecha</th>
              <th className="px-6 py-4 text-xs uppercase tracking-[0.3em] text-white/40">Estado</th>
              <th className="px-6 py-4 text-xs uppercase tracking-[0.3em] text-white/40">Origen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-white/5 transition">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="rounded border-white/20 bg-transparent text-purple-500 focus:ring-purple-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-white">{task.title}</p>
                </td>
                <td className="px-6 py-4 text-white/70">{task.client}</td>
                <td className="px-6 py-4">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="px-6 py-4 text-white/60">
                  {new Date(task.dueDate).toLocaleDateString("es-ES")}
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] border ${STATUS_STYLES[task.status]}`}>
                    {STATUS_LABELS[task.status]}
                  </span>
                </td>
                <td className="px-6 py-4 text-white/70">
                  <span className="inline-flex items-center gap-2">
                    {task.origin === "bot" && <span aria-hidden>🤖</span>}
                    {ORIGIN_LABELS[task.origin]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}