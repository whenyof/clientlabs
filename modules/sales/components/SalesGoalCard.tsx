"use client"

import { useState, useMemo } from "react"
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatSaleCurrency } from "../utils"
import type { MonthlyGoalAnalytics } from "../services/monthlyGoalAnalytics"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

type Props = {
  target?: number
  /** Analytics from GET /api/sales/monthly-goal (single source of truth). */
  analytics?: MonthlyGoalAnalytics | null
  /** Calendar days left in the month (0 = last day). */
  daysRemaining: number
  /** Called after saving the goal; parent should refetch and pass new target. */
  onGoalSaved?: (targetRevenue: number) => void
  /** Optional refetch callback so parent can reload goal from server after save. */
  onRefetch?: () => void
}

export function SalesGoalCard({
  target = 0,
  analytics,
  daysRemaining,
  onGoalSaved,
  onRefetch,
}: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [saving, setSaving] = useState(false)

  const hasGoal = target > 0 && analytics != null
  const displayTarget = hasGoal ? analytics.goal : 0
  const currentRevenue = analytics?.currentRevenue ?? 0
  const progress = analytics?.progress ?? 0
  const remaining = analytics?.remaining ?? 0
  const projection = analytics?.projection ?? 0

  const { progressPct, requiredPerDay, barColor, projectionOnTrack } = useMemo(() => {
    const pct = Math.round(progress * 100)
    const required = daysRemaining > 0 ? remaining / daysRemaining : 0
    const onTrack = displayTarget > 0 && projection >= displayTarget
    const bar = hasGoal && remaining <= 0
      ? "bg-violet-500"
      : onTrack
        ? "bg-violet-500"
        : "bg-amber-500"
    return {
      progressPct: pct,
      requiredPerDay: required,
      barColor: bar,
      projectionOnTrack: onTrack,
    }
  }, [progress, remaining, daysRemaining, displayTarget, projection, hasGoal])

  const isComplete = hasGoal && remaining <= 0
  const isMonthEnd = daysRemaining <= 0

  const openEdit = () => {
    setInputValue(displayTarget > 0 ? String(Math.round(displayTarget)) : "")
    setEditOpen(true)
  }

  const handleSave = async () => {
    const value = parseFloat(inputValue.replace(",", "."))
    if (Number.isNaN(value) || value < 0) return
    setSaving(true)
    try {
      const res = await fetch("/api/sales/monthly-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRevenue: value }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Failed to save")
      }
      const data = await res.json()
      const savedTarget = data?.goal?.targetRevenue ?? value
      onGoalSaved?.(savedTarget)
      onRefetch?.()
      setEditOpen(false)
      toast.success("Objetivo guardado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-sm font-medium text-white/80">Objetivo mensual</h3>
          <button
            type="button"
            onClick={openEdit}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            title={hasGoal ? "Editar objetivo" : "Definir objetivo"}
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>

        {!hasGoal && (
          <button
            type="button"
            onClick={openEdit}
            className="text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors"
          >
            Define tu objetivo mensual
          </button>
        )}

        {hasGoal && (
          <>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-2">
              <span className="text-lg font-semibold text-white tabular-nums">
                {formatSaleCurrency(currentRevenue)}
                <> / {formatSaleCurrency(displayTarget)}</>
              </span>
              <span className="text-sm text-white/50 tabular-nums">({progressPct}%)</span>
            </div>

            <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-4">
              <div
                className={cn("h-full rounded-full transition-[width] duration-300", barColor)}
                style={{ width: `${Math.min(100, progressPct)}%` }}
              />
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-2">
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-xs text-white/50">Faltan</span>
                <span className="text-base font-semibold text-white tabular-nums">
                  {formatSaleCurrency(Math.round(remaining))}
                </span>
              </div>
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-xs text-white/50">Necesario por día</span>
                <span className="text-base font-semibold text-white tabular-nums">
                  {formatSaleCurrency(Math.round(requiredPerDay))}
                </span>
              </div>
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-xs text-white/50">Proyección actual</span>
                <span
                  className={cn(
                    "text-base font-semibold tabular-nums",
                    projectionOnTrack ? "text-violet-400" : "text-amber-400"
                  )}
                >
                  {formatSaleCurrency(Math.round(projection))}
                </span>
              </div>
            </div>

            <div className="mt-3 text-sm text-white/50">
              {isComplete ? (
                <span className="text-violet-400 font-medium">Objetivo cumplido</span>
              ) : isMonthEnd ? (
                <span>Fin de mes</span>
              ) : (
                <span>
                  {daysRemaining} {daysRemaining === 1 ? "día" : "días"} restantes
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {hasGoal ? "Editar objetivo mensual" : "Definir objetivo mensual"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-white/80">Objetivo de ingresos (€)</Label>
              <Input
                type="number"
                min={0}
                step={100}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="25000"
                className="mt-2 bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)} className="text-white/70">
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || inputValue.trim() === ""}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                {saving ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
