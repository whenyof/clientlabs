"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, CheckCircle2, Circle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

export type ProviderTaskRow = {
  id: string
  title: string
  description?: string | null
  status: string
  priority: string
  dueDate?: Date | null
}

export type ProviderTasksTabProps = {
  isLight: boolean
  loading: boolean
  tasks: ProviderTaskRow[]
  isPending: boolean
  labels: { nav: { tasks: string }; providers: { actions: { newTask: string } } }
  onNewTask: () => void
  onToggleTask: (taskId: string, completed: boolean) => void
}

export function ProviderTasksTab({
  isLight,
  loading,
  tasks,
  isPending,
  labels,
  onNewTask,
  onToggleTask,
}: ProviderTasksTabProps) {
  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "h-[60px] w-full rounded-lg animate-pulse",
                isLight ? "bg-neutral-200/60" : "bg-white/5 border border-white/10"
              )}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className={cn("font-medium", isLight ? "text-neutral-900" : "text-white")}>
          {labels.nav.tasks} y Seguimiento
        </h3>
        <Button
          variant="outline"
          size="sm"
          className={
            isLight
              ? "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
              : "bg-white/5 text-white border-white/10 hover:bg-white/10"
          }
          onClick={onNewTask}
        >
          <Plus className="h-4 w-4 mr-2" /> {labels.providers.actions.newTask}
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div
          className={cn(
            "text-center py-12 rounded-xl",
            isLight ? "border border-neutral-200 bg-white" : "text-white/20 border-2 border-dashed border-white/5"
          )}
        >
          <CheckCircle2 className={cn("h-12 w-12 mx-auto mb-3", isLight ? "text-neutral-300" : "opacity-20")} />
          <p className={isLight ? "text-neutral-600" : "text-white/70"}>No hay tareas registradas</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                isLight ? "bg-white border-neutral-100" : "bg-white/5 border-white/10",
                task.status === "DONE"
                  ? isLight
                    ? "border-green-200 bg-green-50/50"
                    : "border-green-500/20 bg-green-500/5"
                  : isLight
                    ? "hover:border-neutral-200"
                    : "hover:border-white/20"
              )}
            >
              <button
                type="button"
                onClick={() => onToggleTask(task.id, task.status !== "DONE")}
                className="transition-all hover:scale-110"
                disabled={isPending}
              >
                {task.status === "DONE" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className={cn("h-5 w-5", isLight ? "text-neutral-300 hover:text-neutral-500" : "text-white/20 hover:text-white/40")} />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <h4
                  className={cn(
                    "text-sm font-medium truncate",
                    task.status === "DONE"
                      ? isLight
                        ? "line-through text-neutral-400"
                        : "line-through text-white/30"
                      : isLight
                        ? "text-neutral-900"
                        : "text-white"
                  )}
                >
                  {task.title}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  {task.dueDate && (
                    <p className={cn("text-[10px]", isLight ? "text-neutral-500" : "text-white/40")}>
                      Vence: {format(new Date(task.dueDate), "d MMM", { locale: es })}
                    </p>
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] py-0 px-1 leading-none h-4",
                      task.priority === "HIGH"
                        ? "border-red-500/50 text-red-600"
                        : task.priority === "MEDIUM"
                          ? "border-amber-500/50 text-amber-600"
                          : "border-blue-500/50 text-blue-600"
                    )}
                  >
                    {task.priority}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
