"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, TrendingUp, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export type ImpactLevel = "low" | "medium" | "high"

export type OperationalPrediction = {
  type: string
  title: string
  description: string
  probability: number
  impactLevel: ImpactLevel
  affectedTasks: { id: string; title: string }[]
}

export type PredictionsOperativasSectionProps = {
  from: string
  to: string
  className?: string
}

function impactStyles(impact: ImpactLevel): { bg: string; border: string; text: string; dot: string } {
  switch (impact) {
    case "high":
      return {
        bg: "bg-red-500/10",
        border: "border-red-500/40",
        text: "text-red-700 dark:text-red-400",
        dot: "bg-red-500",
      }
    case "medium":
      return {
        bg: "bg-amber-500/10",
        border: "border-amber-500/40",
        text: "text-amber-700 dark:text-amber-400",
        dot: "bg-amber-500",
      }
    default:
      return {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/40",
        text: "text-emerald-700 dark:text-emerald-400",
        dot: "bg-emerald-500",
      }
  }
}

export function PredictionsOperativasSection({
  from,
  to,
  className,
}: PredictionsOperativasSectionProps) {
  const [predictions, setPredictions] = useState<OperationalPrediction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ from, to })
    fetch(`/api/tasks/predictions?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 401 ? "No autorizado" : "Error al cargar predicciones")
        return res.json()
      })
      .then((data: { predictions?: OperationalPrediction[] }) => {
        if (!cancelled) setPredictions(Array.isArray(data.predictions) ? data.predictions : [])
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Error")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [from, to])

  if (loading) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden",
          className
        )}
      >
        <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Predicciones operativas</h3>
        </div>
        <div className="px-4 py-6 text-sm text-muted-foreground text-center">
          Calculando predicciones…
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
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <h3 className="text-sm font-semibold text-foreground">Predicciones operativas</h3>
        </div>
        <div className="px-4 py-3 text-sm text-destructive">{error}</div>
      </div>
    )
  }

  if (predictions.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden",
          className
        )}
      >
        <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-semibold text-foreground">Predicciones operativas</h3>
        </div>
        <div className="px-4 py-4 text-sm text-muted-foreground">
          No hay riesgos detectados en el rango seleccionado. El sistema sigue el histórico de tareas para alertar retrasos, saturación y clientes problemáticos.
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
        <TrendingUp className="w-4 h-4 text-violet-500" />
        <h3 className="text-sm font-semibold text-foreground">Predicciones operativas</h3>
        <span className="text-xs text-muted-foreground ml-1">
          {predictions.length} alerta{predictions.length !== 1 ? "s" : ""}
        </span>
      </div>
      <ul className="divide-y divide-border/60">
        {predictions.map((p, i) => {
          const isExpanded = expandedId === p.type + String(i)
          const styles = impactStyles(p.impactLevel)
          return (
            <li key={`${p.type}-${i}`} className={cn("bg-background/30", styles.bg)}>
              <div className="px-4 py-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : p.type + String(i))}
                  className="flex items-center gap-1.5 text-left text-sm font-medium text-foreground hover:opacity-90 transition-opacity"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  )}
                  <span className={cn("w-2 h-2 rounded-full shrink-0", styles.dot)} aria-hidden />
                  {p.title}
                </button>
                <span className={cn("text-xs font-medium", styles.text)}>
                  {(p.probability * 100).toFixed(0)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {p.impactLevel === "high"
                    ? "Alto impacto"
                    : p.impactLevel === "medium"
                      ? "Impacto medio"
                      : "Bajo impacto"}
                </span>
                <span className="text-xs text-muted-foreground">
                  · {p.affectedTasks.length} tarea{p.affectedTasks.length !== 1 ? "s" : ""} afectada{p.affectedTasks.length !== 1 ? "s" : ""}
                </span>
              </div>
              {isExpanded && (
                <div
                  className={cn(
                    "px-4 pb-3 pt-0 pl-9 text-sm border-t border-border/40 pt-3",
                    styles.border
                  )}
                >
                  <p className="mb-2 text-muted-foreground">{p.description}</p>
                  {p.affectedTasks.length > 0 && (
                    <p className="text-xs font-medium text-foreground">
                      Tareas: {p.affectedTasks.map((t) => t.title || t.id).join(", ")}
                    </p>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
