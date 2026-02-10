"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export type NextActionItem = {
  id: string
  title: string
  dueDate: string | null
  startAt: string | null
  estimatedMinutes: number | null
  priorityScore: number | null
  status: string
  sourceModule: string | null
  clientName: string | null
}

function formatDuration(min: number | null): string {
  if (min == null) return "—"
  if (min >= 60) return `${Math.floor(min / 60)} h ${min % 60} min`
  return `${min} min`
}

export function NextActionsPanel({
  onItemClick,
  className,
}: {
  onItemClick?: () => void
  className?: string
}) {
  const [items, setItems] = useState<NextActionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch("/api/tasks/next")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: NextActionItem[]) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setItems([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <aside
      className={cn(
        "flex flex-col min-h-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-sm shrink-0",
        className
      )}
      aria-label="Qué hacer ahora"
    >
      <h2 className="text-sm font-semibold text-white px-4 py-3 border-b border-white/10 shrink-0">
        Qué hacer ahora
      </h2>
      <div className="flex-1 min-h-0 overflow-auto px-3 py-3">
        {loading ? (
          <div className="py-6 text-center text-xs text-zinc-500">
            Cargando…
          </div>
        ) : items.length === 0 ? (
          <div className="py-6 text-center text-sm text-zinc-500">
            No hay tareas pendientes prioritarias
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={onItemClick}
                  className={cn(
                    "w-full text-left rounded-lg border transition-all duration-200 px-3 py-2.5 flex items-start gap-3",
                    index === 0
                      ? "bg-violet-500/15 border-violet-400/50 ring-1 ring-violet-400/30 hover:bg-violet-500/20"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums",
                      index === 0
                        ? "bg-violet-500/40 text-violet-200 ring-1 ring-violet-400/50"
                        : "bg-white/10 text-zinc-400"
                    )}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-zinc-400 tabular-nums mt-0.5">
                      {formatDuration(item.estimatedMinutes)}
                    </p>
                    {item.clientName && (
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {item.clientName}
                      </p>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
