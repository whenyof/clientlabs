"use client"

import { useState, useCallback } from "react"
import { MapPin, Route, Loader2, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export type RouteOptimizerCardProps = {
  /** Date for the day to optimize (YYYY-MM-DD) */
  date: string
  /** Tasks for this day: id, title, latitude, longitude */
  tasks: Array<{
    id: string
    title: string
    latitude?: number | null
    longitude?: number | null
  }>
  onAccepted?: () => void
  className?: string
}

type OptimizedResult = {
  orderedTaskIds: string[]
  estimatedTravelMinutes: number
}

export function RouteOptimizerCard({
  date,
  tasks,
  onAccepted,
  className,
}: RouteOptimizerCardProps) {
  const [result, setResult] = useState<OptimizedResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const withCoords = tasks.filter(
    (t) =>
      t.latitude != null &&
      t.longitude != null &&
      Number.isFinite(t.latitude) &&
      Number.isFinite(t.longitude)
  )

  const optimize = useCallback(async () => {
    if (withCoords.length === 0) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/tasks/route-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      })
      if (!res.ok) throw new Error("Optimize failed")
      const data = await res.json()
      setResult({
        orderedTaskIds: data.orderedTaskIds ?? [],
        estimatedTravelMinutes: data.estimatedTravelMinutes ?? 0,
      })
    } catch {
      toast.error("Could not optimize route.")
    } finally {
      setLoading(false)
    }
  }, [date, withCoords.length])

  const accept = useCallback(async () => {
    if (!result || result.orderedTaskIds.length === 0) return
    setApplying(true)
    try {
      const res = await fetch("/api/tasks/route-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          orderedTaskIds: result.orderedTaskIds,
        }),
      })
      if (!res.ok) throw new Error("Apply failed")
      toast.success("Route order saved.")
      setResult(null)
      onAccepted?.()
    } catch {
      toast.error("Could not save route order.")
    } finally {
      setApplying(false)
    }
  }, [date, result, onAccepted])

  if (withCoords.length < 2) return null

  const taskMap = new Map(tasks.map((t) => [t.id, t]))

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-2 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Route className="h-4 w-4 text-emerald-500" />
          Optimize daily route
        </div>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform", expanded && "rotate-180")}
        />
      </button>
      {expanded && (
        <div className="border-t border-border/60 px-4 pb-4 pt-2">
          <p className="mb-3 text-xs text-muted-foreground">
            {withCoords.length} tasks have locations. Start from first or base; always pick nearest next. Review the order below and accept to save.
          </p>
          {!result ? (
            <Button
              size="sm"
              variant="secondary"
              className="gap-2"
              onClick={optimize}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Optimizing…
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  Optimize route
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Estimated travel time</span>
                <span className="font-medium">
                  {result.estimatedTravelMinutes.toFixed(0)} min
                </span>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ordered visits
                </p>
                <ol className="list-decimal list-inside space-y-1.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm">
                  {result.orderedTaskIds.map((id, i) => (
                    <li key={id} className="flex items-center gap-2">
                      <span className="text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                      <span className="truncate">
                        {taskMap.get(id)?.title ?? id}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={accept}
                  disabled={applying}
                >
                  {applying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Accept order
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setResult(null)}
                  disabled={applying}
                >
                  Re-run
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
