"use client"

import { useRouter } from "next/navigation"
import { CheckCircle, ArrowRight, UserPlus, Receipt, CheckSquare } from "lucide-react"

interface Task {
  id: string
  title: string
  dueDate: string | null
  priority: string
  type: string
}

interface ActivityFeed {
  leads: Array<{ id: string; name: string | null; createdAt: string }>
  invoices: Array<{ id: string; number: string; total: string | number; updatedAt: string }>
  tasks: Array<{ id: string; title: string; updatedAt: string }>
}

interface Props {
  tasks: Task[]
  overdueCount: number
  activityFeed: ActivityFeed
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Sin fecha"
  return new Date(dateStr).toLocaleDateString("es-ES", { day: "numeric", month: "short" })
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "ahora mismo"
  if (mins < 60) return `hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  return `hace ${Math.floor(hours / 24)}d`
}

export function DashboardTasks({ tasks, overdueCount, activityFeed }: Props) {
  const router = useRouter()

  const feedItems = [
    ...activityFeed.leads.map((l) => ({
      id: `lead-${l.id}`,
      icon: UserPlus,
      label: `Nuevo lead: ${l.name ?? "Sin nombre"}`,
      time: relativeTime(l.createdAt),
      ts: new Date(l.createdAt).getTime(),
      isLead: true,
    })),
    ...activityFeed.invoices.map((inv) => ({
      id: `inv-${inv.id}`,
      icon: Receipt,
      label: `Factura pagada #${inv.number}`,
      time: relativeTime(inv.updatedAt),
      ts: new Date(inv.updatedAt).getTime(),
      isLead: false,
    })),
    ...activityFeed.tasks.map((t) => ({
      id: `task-${t.id}`,
      icon: CheckSquare,
      label: `Tarea completada: ${t.title}`,
      time: relativeTime(t.updatedAt),
      ts: new Date(t.updatedAt).getTime(),
      isLead: false,
    })),
  ].sort((a, b) => b.ts - a.ts).slice(0, 5)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      {/* Tareas urgentes */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-semibold text-slate-900">Tareas urgentes</h3>
          {tasks.length > 0 && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
              {tasks.length}
            </span>
          )}
          {overdueCount > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
              {overdueCount} atrasada{overdueCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <button
          onClick={() => router.push("/dashboard/tasks")}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-400 transition-colors hover:text-[#1FA97A]"
        >
          Ver
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="py-4 text-center">
          <CheckCircle className="mx-auto mb-1.5 h-6 w-6 text-[#1FA97A] opacity-40" />
          <p className="text-[11px] text-slate-500">Sin tareas urgentes</p>
        </div>
      ) : (
        <div className="mb-3">
          {tasks.slice(0, 3).map((task) => (
            <div
              key={task.id}
              className="-mx-2 flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50/50 border-b border-slate-100 last:border-0"
              onClick={() => router.push("/dashboard/tasks")}
            >
              <div className="h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 border-red-300" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-slate-900">{task.title}</p>
                <p className="text-[10px] text-slate-400">{formatDate(task.dueDate)}</p>
              </div>
              {task.type && (
                <span className="flex-shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500">
                  {task.type}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actividad reciente */}
      <div className="border-t border-slate-100 pt-3">
        <div className="mb-2 flex items-center gap-1.5">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Actividad reciente
          </h3>
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1FA97A] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#1FA97A]" />
          </span>
          <span className="text-[9px] text-slate-400">En vivo</span>
        </div>
        {feedItems.length === 0 ? (
          <p className="py-3 text-center text-[11px] text-slate-400">Sin actividad reciente</p>
        ) : (
          <div className="space-y-2">
            {feedItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.id} className="flex items-start gap-2">
                  <div className={`mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${item.isLead ? "bg-[#1FA97A]" : "bg-slate-300"}`} />
                  <p className="flex-1 text-[11px] text-slate-600 leading-relaxed">{item.label}</p>
                  <span className="flex-shrink-0 text-[10px] text-slate-400">{item.time}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export function DashboardTasksSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-12 animate-pulse rounded bg-slate-100" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5 py-2 border-b border-slate-100 last:border-0">
          <div className="h-3.5 w-3.5 animate-pulse rounded-full bg-slate-100" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-2.5 w-16 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  )
}
