"use client"

import { useState, useEffect, useCallback } from "react"
import { Check, X, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type {
  OperationalRecommendation,
  RecommendationType,
  SuggestedChange,
} from "./types"

export type DecisionesRecomendadasSectionProps = {
  from: string
  to: string
  onApplied?: () => void
  className?: string
}

function typeLabel(type: RecommendationType): string {
  switch (type) {
    case "reschedule":
      return "Replanificar"
    case "reassign":
      return "Reasignar"
    case "extend_time":
      return "Ampliar tiempo"
    case "merge":
      return "Compactar"
    case "priority_change":
      return "Prioridad"
    default:
      return type
  }
}

function difficultyLabel(d: "low" | "medium" | "high"): string {
  switch (d) {
    case "low":
      return "Fácil"
    case "medium":
      return "Media"
    case "high":
      return "Alta"
    default:
      return d
  }
}

async function applyChange(change: SuggestedChange): Promise<boolean> {
  if ("taskIds" in change) {
    return true
  }
  const { taskId } = change
  const body: Record<string, unknown> = {}
  if ("dueDate" in change && change.dueDate != null) body.dueDate = change.dueDate
  if ("startAt" in change && change.startAt != null) body.startAt = change.startAt
  if ("endAt" in change && change.endAt != null) body.endAt = change.endAt
  if ("assignedToId" in change) body.assignedToId = change.assignedToId
  if ("estimatedMinutes" in change) body.estimatedMinutes = change.estimatedMinutes
  if ("priority" in change) body.priority = change.priority
  if (Object.keys(body).length === 0) return true
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.ok
}

export function DecisionesRecomendadasSection({
  from,
  to,
  onApplied,
  className,
}: DecisionesRecomendadasSectionProps) {
  const [recommendations, setRecommendations] = useState<OperationalRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [applyingId, setApplyingId] = useState<string | null>(null)

  const fetchRecs = useCallback(() => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ from, to })
    fetch(`/api/tasks/recommendations?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 401 ? "No autorizado" : "Error al cargar")
        return res.json()
      })
      .then((data: { recommendations?: OperationalRecommendation[] }) => {
        setRecommendations(Array.isArray(data.recommendations) ? data.recommendations : [])
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error"))
      .finally(() => setLoading(false))
  }, [from, to])

  useEffect(() => {
    fetchRecs()
  }, [fetchRecs])

  const visible = recommendations.filter((r) => !dismissedIds.has(r.id))

  const handleApply = async (rec: OperationalRecommendation) => {
    setApplyingId(rec.id)
    try {
      const ok = await applyChange(rec.suggestedChange)
      if (ok) {
        setDismissedIds((prev) => new Set(prev).add(rec.id))
        onApplied?.()
        fetchRecs()
      }
    } finally {
      setApplyingId(null)
    }
  }

  const handleDiscard = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id))
  }

  const canApply = (rec: OperationalRecommendation): boolean => {
    const c = rec.suggestedChange
    if ("taskIds" in c && c.taskIds?.length) return false
    if ("taskId" in c) return true
    return false
  }

  if (loading) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden",
          className
        )}
      >
        <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-foreground">Decisiones recomendadas</h3>
        </div>
        <div className="px-4 py-6 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analizando agenda y predicciones…
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={cn(
          "rounded-xl border border-destructive/40 bg-destructive/5 overflow-hidden",
          className
        )}
      >
        <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-destructive" />
          <h3 className="text-sm font-semibold text-foreground">Decisiones recomendadas</h3>
        </div>
        <div className="px-4 py-3 text-sm text-destructive">{error}</div>
      </div>
    )
  }

  if (visible.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden",
          className
        )}
      >
        <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-semibold text-foreground">Decisiones recomendadas</h3>
        </div>
        <div className="px-4 py-4 text-sm text-muted-foreground">
          No hay recomendaciones nuevas en este rango. El sistema combina predicciones de riesgo y agenda para sugerir replanificar, reasignar o ampliar tiempo.
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden",
        className
      )}
    >
      <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-semibold text-foreground">Decisiones recomendadas</h3>
        <span className="text-xs text-muted-foreground ml-1">
          {visible.length} sugerencia{visible.length !== 1 ? "s" : ""}
        </span>
      </div>
      <ul className="divide-y divide-border/60">
        {visible.map((rec) => {
          const applying = applyingId === rec.id
          const applyable = canApply(rec)
          return (
            <li key={rec.id} className="px-4 py-3 bg-background/30 hover:bg-muted/20 transition-colors">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {typeLabel(rec.type)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(rec.confidence * 100).toFixed(0)}% conf. · {difficultyLabel(rec.difficulty)}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground">{rec.title}</p>
                <p className="text-sm text-muted-foreground">{rec.explanation}</p>
                <p className="text-xs text-muted-foreground italic">{rec.expectedBenefit}</p>
                {rec.affectedTaskTitles?.length ? (
                  <p className="text-xs text-muted-foreground">
                    Tareas: {rec.affectedTaskTitles.join(", ")}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2 pt-1">
                  {applyable && (
                    <Button
                      size="sm"
                      className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleApply(rec)}
                      disabled={applying}
                    >
                      {applying ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      Aplicar
                    </Button>
                  )}
                  {rec.type === "merge" && (
                    <span className="text-xs text-muted-foreground self-center">
                      Ajuste manual recomendado
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                    onClick={() => handleDiscard(rec.id)}
                    disabled={applying}
                  >
                    <X className="w-3.5 h-3.5" />
                    Descartar
                  </Button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
