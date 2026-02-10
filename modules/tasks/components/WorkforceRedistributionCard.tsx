"use client"

import { useState, useCallback, useEffect } from "react"
import { Users, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { updateTask } from "@/lib/tasks-client"
import { toast } from "sonner"

export type WorkforceSuggestion = {
  taskId: string
  fromUser: string | null
  toUser: string | null
  benefit: number
}

type WorkforceRedistributionCardProps = {
  from: string
  to: string
  capacityMinutes?: number
  /** Optional: task id -> title for display */
  taskTitles?: Record<string, string>
  onApplied?: () => void
  className?: string
}

function label(user: string | null): string {
  if (user == null || user === "") return "Unassigned"
  return user
}

export function WorkforceRedistributionCard({
  from,
  to,
  capacityMinutes,
  taskTitles = {},
  onApplied,
  className,
}: WorkforceRedistributionCardProps) {
  const [suggestions, setSuggestions] = useState<WorkforceSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [applyingId, setApplyingId] = useState<string | null>(null)

  const fetchSuggestions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ from, to })
      if (capacityMinutes != null && capacityMinutes > 0) {
        params.set("capacityMinutes", String(capacityMinutes))
      }
      const res = await fetch(
        `/api/tasks/redistribution-suggestions?${params.toString()}`
      )
      if (!res.ok) throw new Error("Failed to load suggestions")
      const data = await res.json()
      setSuggestions(data.suggestions ?? [])
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [from, to, capacityMinutes])

  useEffect(() => {
    fetchSuggestions()
  }, [fetchSuggestions])

  const handleApply = useCallback(
    async (s: WorkforceSuggestion) => {
      setApplyingId(s.taskId)
      try {
        await updateTask(s.taskId, { assignedToId: s.toUser })
        setSuggestions((prev) => prev.filter((x) => x.taskId !== s.taskId))
        onApplied?.()
        toast.success("Task reassigned.")
      } catch {
        toast.error("Could not reassign task.")
      } finally {
        setApplyingId(null)
      }
    },
    [onApplied]
  )

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-border/80 bg-card p-4 text-sm text-muted-foreground",
          className
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking workload balance…
      </div>
    )
  }

  if (suggestions.length === 0) return null

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card p-4 shadow-sm",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
        <Users className="h-4 w-4 text-blue-500" />
        Rebalance workload
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Suggest moving low-priority tasks from overloaded people to those with capacity. You approve each move; nothing is reassigned automatically.
      </p>
      <ul className="space-y-2">
        {suggestions.map((s) => (
          <li
            key={s.taskId}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {taskTitles[s.taskId] ?? "Task"}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>{label(s.fromUser)}</span>
                <ArrowRight className="h-3 w-3 shrink-0" />
                <span>{label(s.toUser)}</span>
                <span className="shrink-0">— {s.benefit} min relief</span>
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="shrink-0 gap-1"
              onClick={() => handleApply(s)}
              disabled={applyingId === s.taskId}
            >
              {applyingId === s.taskId ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Applying…
                </>
              ) : (
                "Apply"
              )}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
