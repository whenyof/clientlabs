"use client"

import { useRouter } from "next/navigation"
import { CheckCircle, ArrowRight } from "lucide-react"

interface Task {
  id: string
  title: string
  dueDate: string | null
  priority: string
  type: string
}

interface Props {
  tasks: Task[]
  overdueCount: number
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Sin fecha"
  const d = new Date(dateStr)
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" })
}

export function DashboardTasks({ tasks, overdueCount }: Props) {
  const router = useRouter()

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-semibold text-slate-900">Tareas prioritarias</h3>
          {tasks.length > 0 && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
              {tasks.length}
            </span>
          )}
          {overdueCount > 0 && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
              {overdueCount} atrasada{overdueCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <button
          onClick={() => router.push("/dashboard/tasks")}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-400 transition-colors hover:text-[#1FA97A]"
        >
          Ver todas
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="py-8 text-center">
          <CheckCircle className="mx-auto mb-2 h-8 w-8 text-[#1FA97A] opacity-50" />
          <p className="text-[13px] text-slate-500">Sin tareas prioritarias</p>
          <p className="text-[11px] text-slate-400">Todo esta bajo control</p>
        </div>
      ) : (
        <div>
          {tasks.map((task) => (
            <div
              key={task.id}
              className="-mx-4 flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-slate-50/50 border-b border-slate-100 last:border-0"
              onClick={() => router.push("/dashboard/tasks")}
            >
              <div className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-red-300 transition-colors group-hover:border-red-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-slate-900">{task.title}</p>
                <p className="text-[11px] text-slate-400">{formatDate(task.dueDate)}</p>
              </div>
              {task.type && (
                <span className="flex-shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-medium text-slate-500">
                  {task.type}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function DashboardTasksSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
          <div className="h-4 w-4 animate-pulse rounded-full bg-slate-100" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-2.5 w-20 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  )
}
