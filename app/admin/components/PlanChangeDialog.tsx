"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"

type UserData = {
  id: string
  email: string
  name: string | null
  role: "USER" | "ADMIN"
  plan: "FREE" | "TRIAL" | "STARTER" | "PRO" | "BUSINESS"
}

type PlanChangeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserData
  onConfirm: (userId: string, newPlan: "STARTER" | "PRO" | "BUSINESS") => Promise<void>
}

const PLANS = [
  {
    value: "STARTER",
    label: "Starter",
    description: "Para autónomos que empiezan — 12,99€/mes",
    color: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  },
  {
    value: "PRO",
    label: "Pro",
    description: "Para pymes — 24,99€/mes",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    value: "BUSINESS",
    label: "Business",
    description: "Para empresas en crecimiento — 39,99€/mes",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
] as const

type PlanValue = typeof PLANS[number]["value"]

export function PlanChangeDialog({ open, onOpenChange, user, onConfirm }: PlanChangeDialogProps) {
  const normalizedCurrent: PlanValue = (user.plan === "FREE" || user.plan === "TRIAL") ? "STARTER" : user.plan as PlanValue
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanValue>(normalizedCurrent)

  const handleConfirm = async () => {
    if (selectedPlan === normalizedCurrent) {
      onOpenChange(false)
      return
    }

    setLoading(true)
    try {
      await onConfirm(user.id, selectedPlan)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-primary)] max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar plan</DialogTitle>
          <DialogDescription className="text-[var(--text-secondary)]">
            Selecciona un nuevo plan para este usuario
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-[var(--bg-card)] p-4 rounded-lg space-y-2">
            <p className="text-sm text-[var(--text-secondary)]">Usuario</p>
            <p className="text-[var(--text-primary)] font-medium">{user.name || "Sin nombre"}</p>
            <p className="text-[var(--text-secondary)] text-sm">{user.email}</p>
          </div>

          <div className="space-y-3">
            <Label className="text-[var(--text-primary)]">Selecciona un plan</Label>
            <RadioGroup value={selectedPlan} onValueChange={(v) => setSelectedPlan(v as PlanValue)}>
              {PLANS.map((plan) => (
                <div
                  key={plan.value}
                  className="flex items-start space-x-3 p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] cursor-pointer"
                  onClick={() => setSelectedPlan(plan.value)}
                >
                  <RadioGroupItem value={plan.value} id={plan.value} className="mt-1" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={plan.value} className="text-[var(--text-primary)] font-medium cursor-pointer">
                        {plan.label}
                      </Label>
                      <Badge className={plan.color}>{plan.value}</Badge>
                      {normalizedCurrent === plan.value && (
                        <Badge variant="outline" className="text-xs">Actual</Badge>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{plan.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || selectedPlan === normalizedCurrent}
          >
            {loading ? "Actualizando..." : "Confirmar cambio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
