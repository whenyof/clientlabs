"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createClientReminder } from "../actions"

type ReminderDialogProps = {
    clientId: string
    isOpen: boolean
    onClose: () => void
    onSuccess: (task?: any, replaceId?: string) => void
}

const REMINDER_PRESETS = [
    { label: "Mañana", days: 1 },
    { label: "En 3 días", days: 3 },
    { label: "En 1 semana", days: 7 },
    { label: "En 2 semanas", days: 14 },
]

const REMINDER_TYPES = [
    { value: "CALL", label: "Llamar" },
    { value: "EMAIL", label: "Enviar email" },
    { value: "FOLLOW_UP", label: "Seguimiento" },
    { value: "MEETING", label: "Reunión" },
    { value: "CUSTOM", label: "Personalizado" },
]

export function ReminderDialog({ clientId, isOpen, onClose, onSuccess }: ReminderDialogProps) {
    const [type, setType] = useState("CALL")
    const [dueDate, setDueDate] = useState("")
    const [note, setNote] = useState("")
    const [loading, setLoading] = useState(false)

    const handlePreset = (days: number) => {
        const date = new Date()
        date.setDate(date.getDate() + days)
        // Format as YYYY-MM-DD for native input
        setDueDate(date.toISOString().split('T')[0])
    }

    const handleSubmit = async () => {
        if (!dueDate) {
            toast.error("Selecciona una fecha")
            return
        }

        // 1. Optimistic Update
        const tempId = `temp-${Date.now()}`
        const optimisticTask = {
            id: tempId,
            title: `Recordatorio: ${REMINDER_TYPES.find((t) => t.value === type)?.label || type}`,
            status: "PENDING",
            priority: "HIGH",
            type: type,
            dueDate: new Date(dueDate),
            createdAt: new Date(),
            clientId
        }

        if (onSuccess) onSuccess(optimisticTask)
        onClose()
        setType("CALL")
        setDueDate("")
        setNote("")

        // 2. Background Server Action
        try {
            const res = await createClientReminder(clientId, {
                type: REMINDER_TYPES.find((t) => t.value === type)?.label || type,
                dueDate: new Date(dueDate),
                note,
            })

            // 3. Confirm with Real Task (Replace Temp)
            if (onSuccess) onSuccess((res as any).task, tempId)
            toast.success("Recordatorio creado")
        } catch (error) {
            toast.error("Error al crear recordatorio")
            // Ideally we should revert the optimistic task here?
            // onSuccess(null, tempId) ?
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-900 border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-white">Crear Recordatorio</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Type Selector */}
                    <div>
                        <Label className="text-white">Tipo</Label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full mt-1 rounded-md border border-white/10 bg-white/5 p-2 text-white"
                        >
                            {REMINDER_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Picker - Native Input */}
                    <div>
                        <Label className="text-white">Fecha</Label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full mt-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Quick Presets */}
                    <div>
                        <Label className="text-white text-xs">Accesos rápidos</Label>
                        <div className="flex gap-2 mt-1">
                            {REMINDER_PRESETS.map((preset) => (
                                <Button
                                    key={preset.label}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePreset(preset.days)}
                                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs"
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Note */}
                    <div>
                        <Label className="text-white">Nota (opcional)</Label>
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Detalles del recordatorio..."
                            className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !dueDate}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Crear Recordatorio
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
