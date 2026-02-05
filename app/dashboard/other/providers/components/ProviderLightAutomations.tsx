"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Zap, Bell, CheckSquare, Send, Save } from "lucide-react"
import { toast } from "sonner"
import { updateProviderLightAutomations } from "@/app/dashboard/providers/actions"
import { motion } from "framer-motion"

type ProviderLightAutomationsProps = {
    providerId: string
    autoCreateTaskOnRisk: boolean
    autoNotifyBeforeRestock: number | null
    autoSuggestOrder: boolean
    onUpdate?: () => void
}

export function ProviderLightAutomations({
    providerId,
    autoCreateTaskOnRisk: initialAutoTask,
    autoNotifyBeforeRestock: initialNotify,
    autoSuggestOrder: initialSuggest,
    onUpdate
}: ProviderLightAutomationsProps) {
    const [autoTask, setAutoTask] = useState(initialAutoTask)
    const [autoSuggest, setAutoSuggest] = useState(initialSuggest)
    const [notifyDays, setNotifyDays] = useState(initialNotify?.toString() || "")
    const [saving, setSaving] = useState(false)

    const handleToggleTask = async (checked: boolean) => {
        setAutoTask(checked)
        try {
            const result = await updateProviderLightAutomations(providerId, { autoCreateTaskOnRisk: checked })
            if (result.success) {
                toast.success(checked ? "Auto-tarea activada" : "Auto-tarea desactivada")
                onUpdate?.()
            } else {
                toast.error("Error al actualizar")
                setAutoTask(!checked)
            }
        } catch (error) {
            toast.error("Error al actualizar")
            setAutoTask(!checked)
        }
    }

    const handleToggleSuggest = async (checked: boolean) => {
        setAutoSuggest(checked)
        try {
            const result = await updateProviderLightAutomations(providerId, { autoSuggestOrder: checked })
            if (result.success) {
                toast.success(checked ? "Sugerencias activadas" : "Sugerencias desactivadas")
                onUpdate?.()
            } else {
                toast.error("Error al actualizar")
                setAutoSuggest(!checked)
            }
        } catch (error) {
            toast.error("Error al actualizar")
            setAutoSuggest(!checked)
        }
    }

    const handleSaveNotify = async () => {
        setSaving(true)
        try {
            const days = notifyDays.trim() ? parseInt(notifyDays) : null
            if (days !== null && (isNaN(days) || days < 0)) {
                toast.error("Días no válidos")
                setSaving(false)
                return
            }

            const result = await updateProviderLightAutomations(providerId, { autoNotifyBeforeRestock: days })
            if (result.success) {
                toast.success("Aviso de reposición actualizado")
                onUpdate?.()
            } else {
                toast.error("Error al actualizar")
            }
        } catch (error) {
            toast.error("Error al actualizar")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 px-1">
                <Zap className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-semibold text-white">Automatizaciones Ligeras</h3>
            </div>

            <div className="grid gap-4">
                {/* Auto Create Task */}
                <motion.div
                    className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-start justify-between gap-4"
                    whileHover={{ borderColor: "rgba(255,255,255,0.2)" }}
                >
                    <div className="flex gap-3">
                        <div className="h-9 w-9 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <CheckSquare className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <Label className="text-base font-medium text-white">Auto-tarea por Riesgo</Label>
                            <p className="text-sm text-white/50 mt-0.5">
                                Crea una tarea urgente automáticamente cuando el stock entra en estado crítico.
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={autoTask}
                        onCheckedChange={handleToggleTask}
                    />
                </motion.div>

                {/* Suggest Order */}
                <motion.div
                    className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-start justify-between gap-4"
                    whileHover={{ borderColor: "rgba(255,255,255,0.2)" }}
                >
                    <div className="flex gap-3">
                        <div className="h-9 w-9 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            <Send className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                            <Label className="text-base font-medium text-white">Sugerencia de Pedido</Label>
                            <p className="text-sm text-white/50 mt-0.5">
                                Destaca la acción de contacto cuando el sistema detecta necesidad de reposición.
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={autoSuggest}
                        onCheckedChange={handleToggleSuggest}
                    />
                </motion.div>

                {/* Notify Before Restock */}
                <motion.div
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                    whileHover={{ borderColor: "rgba(255,255,255,0.2)" }}
                >
                    <div className="flex gap-3 mb-4">
                        <div className="h-9 w-9 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <Bell className="h-5 w-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <Label className="text-base font-medium text-white">Aviso de Anticipación</Label>
                            <p className="text-sm text-white/50 mt-0.5">
                                Crea un recordatorio X días antes de la fecha estimada de reposición.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 items-center pl-12">
                        <div className="flex-1 max-w-[120px]">
                            <Input
                                type="number"
                                placeholder="Días"
                                value={notifyDays}
                                onChange={(e) => setNotifyDays(e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <span className="text-sm text-white/50 font-medium">días antes</span>
                        <Button
                            size="sm"
                            onClick={handleSaveNotify}
                            disabled={saving}
                            className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border-purple-500/30"
                        >
                            <Save className="h-4 w-4 mr-1.5" />
                            Guardar
                        </Button>
                    </div>
                </motion.div>
            </div>

            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                <p className="text-xs text-amber-200/70 leading-relaxed">
                    <strong>Nota operativa:</strong> Estas automatizaciones nunca enviarán pedidos directamente. Solo preparan tareas y avisos para que tú mantengas el control final.
                </p>
            </div>
        </div>
    )
}
