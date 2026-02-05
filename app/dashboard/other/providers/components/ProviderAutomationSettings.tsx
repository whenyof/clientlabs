"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DollarSign, Bell, Flag, Save } from "lucide-react"
import { toast } from "sonner"
import {
    updateProviderBudget,
    updateProviderReminder,
    toggleProviderCritical
} from "@/app/dashboard/providers/actions"

type ProviderAutomationSettingsProps = {
    providerId: string
    isCritical: boolean
    monthlyBudgetLimit: number | null
    reminderInterval: number | null
    onUpdate?: () => void
}

export function ProviderAutomationSettings({
    providerId,
    isCritical: initialCritical,
    monthlyBudgetLimit: initialBudget,
    reminderInterval: initialReminder,
    onUpdate
}: ProviderAutomationSettingsProps) {
    const [isCritical, setIsCritical] = useState(initialCritical)
    const [budgetLimit, setBudgetLimit] = useState(initialBudget?.toString() || "")
    const [reminderDays, setReminderDays] = useState(initialReminder?.toString() || "")
    const [saving, setSaving] = useState(false)

    const handleToggleCritical = async (checked: boolean) => {
        setIsCritical(checked)
        try {
            const result = await toggleProviderCritical(providerId, checked)
            if (result.success) {
                toast.success(checked ? "Proveedor marcado como crítico" : "Marca crítica removida")
                onUpdate?.()
            } else {
                toast.error(result.error || "Error al actualizar")
                setIsCritical(!checked) // Revert
            }
        } catch (error) {
            toast.error("Error al actualizar")
            setIsCritical(!checked) // Revert
        }
    }

    const handleSaveBudget = async () => {
        setSaving(true)
        try {
            const limit = budgetLimit.trim() ? parseFloat(budgetLimit) : null

            if (limit !== null && (isNaN(limit) || limit <= 0)) {
                toast.error("El presupuesto debe ser un número positivo")
                setSaving(false)
                return
            }

            const result = await updateProviderBudget(providerId, limit)
            if (result.success) {
                toast.success(limit ? "Presupuesto actualizado" : "Presupuesto eliminado")
                onUpdate?.()
            } else {
                toast.error(result.error || "Error al actualizar presupuesto")
            }
        } catch (error) {
            toast.error("Error al actualizar presupuesto")
        } finally {
            setSaving(false)
        }
    }

    const handleSaveReminder = async () => {
        setSaving(true)
        try {
            const days = reminderDays.trim() ? parseInt(reminderDays) : null

            if (days !== null && (isNaN(days) || days <= 0)) {
                toast.error("El intervalo debe ser un número positivo")
                setSaving(false)
                return
            }

            const result = await updateProviderReminder(providerId, days)
            if (result.success) {
                toast.success(days ? `Recordatorio configurado cada ${days} días` : "Recordatorio desactivado")
                onUpdate?.()
            } else {
                toast.error(result.error || "Error al actualizar recordatorio")
            }
        } catch (error) {
            toast.error("Error al actualizar recordatorio")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Flag className="h-5 w-5" />
                    Configuración de Automatizaciones
                </h3>

                <div className="space-y-6">
                    {/* Critical Flag */}
                    <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Flag className="h-4 w-4 text-red-400" />
                                <Label htmlFor="critical" className="text-white font-medium">
                                    Proveedor Crítico
                                </Label>
                            </div>
                            <p className="text-sm text-white/60">
                                Marca este proveedor como crítico para prioridad máxima
                            </p>
                        </div>
                        <Switch
                            id="critical"
                            checked={isCritical}
                            onCheckedChange={handleToggleCritical}
                        />
                    </div>

                    {/* Budget Limit */}
                    <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                        <div className="flex items-center gap-2 mb-3">
                            <DollarSign className="h-4 w-4 text-blue-400" />
                            <Label htmlFor="budget" className="text-white font-medium">
                                Límite de Presupuesto Mensual
                            </Label>
                        </div>
                        <p className="text-sm text-white/60 mb-3">
                            Recibe alertas si el gasto mensual supera este límite
                        </p>
                        <div className="flex gap-2">
                            <Input
                                id="budget"
                                type="number"
                                step="0.01"
                                min="0"
                                value={budgetLimit}
                                onChange={(e) => setBudgetLimit(e.target.value)}
                                placeholder="Ej: 5000"
                                className="bg-white/5 border-white/10 text-white"
                            />
                            <Button
                                onClick={handleSaveBudget}
                                disabled={saving}
                                className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Guardar
                            </Button>
                        </div>
                        {budgetLimit && (
                            <p className="text-xs text-white/40 mt-2">
                                Alerta al 80% ({(parseFloat(budgetLimit) * 0.8).toFixed(0)}€) y al 100%
                            </p>
                        )}
                    </div>

                    {/* Reminder Interval */}
                    <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                        <div className="flex items-center gap-2 mb-3">
                            <Bell className="h-4 w-4 text-purple-400" />
                            <Label htmlFor="reminder" className="text-white font-medium">
                                Recordatorio de Pedido
                            </Label>
                        </div>
                        <p className="text-sm text-white/60 mb-3">
                            Recibe recordatorios automáticos cada X días
                        </p>
                        <div className="flex gap-2">
                            <Input
                                id="reminder"
                                type="number"
                                min="1"
                                value={reminderDays}
                                onChange={(e) => setReminderDays(e.target.value)}
                                placeholder="Ej: 30"
                                className="bg-white/5 border-white/10 text-white"
                            />
                            <Button
                                onClick={handleSaveReminder}
                                disabled={saving}
                                className="bg-purple-500 hover:bg-purple-600 text-white"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Guardar
                            </Button>
                        </div>
                        {reminderDays && (
                            <p className="text-xs text-white/40 mt-2">
                                Próximo recordatorio en {reminderDays} días
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                <p className="text-sm text-blue-400">
                    <strong>ℹ️ Automatizaciones claras:</strong> Todas las alertas se basan en reglas simples y visibles.
                    No hay IA ni lógica oculta. Puedes ajustar o desactivar cualquier automatización en cualquier momento.
                </p>
            </div>
        </div>
    )
}
