"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { createProviderTask } from "../actions"
import { useRouter } from "next/navigation"

type CreateTaskDialogProps = {
    providerId: string
    providerName: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function CreateTaskDialog({ providerId, providerName, open, onOpenChange, onSuccess }: CreateTaskDialogProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
        dueDate: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title.trim()) {
            toast.error("El título es obligatorio")
            return
        }

        setLoading(true)

        try {
            const result = await createProviderTask({
                providerId,
                title: formData.title,
                description: formData.description || undefined,
                priority: formData.priority,
                dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined
            })

            if (result.success) {
                toast.success("Tarea creada correctamente")
                onOpenChange(false)
                router.refresh() // Refresh server data
                if (onSuccess) onSuccess()
                // Reset form
                setFormData({
                    title: "",
                    description: "",
                    priority: "MEDIUM",
                    dueDate: ""
                })
            } else {
                toast.error(result.error || "Error al crear tarea")
            }
        } catch (error) {
            toast.error("Error al crear tarea")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[var(--bg-card)] border-[var(--border-subtle)] max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-[var(--text-primary)]">Crear tarea</DialogTitle>
                    <p className="text-sm text-[var(--text-secondary)]">{providerName}</p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <Label htmlFor="title" className="text-[var(--text-secondary)]">Título *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-primary)]"
                            placeholder="Ej: Renovar contrato"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="description" className="text-[var(--text-secondary)]">Descripción</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-primary)] resize-none"
                            placeholder="Detalles de la tarea..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Priority */}
                        <div>
                            <Label htmlFor="priority" className="text-[var(--text-secondary)]">Prioridad</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                            >
                                <SelectTrigger className="bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-primary)]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[var(--bg-card)] border-[var(--border-subtle)]">
                                    <SelectItem value="LOW">Baja</SelectItem>
                                    <SelectItem value="MEDIUM">Media</SelectItem>
                                    <SelectItem value="HIGH">Alta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Due Date */}
                        <div>
                            <Label htmlFor="dueDate" className="text-[var(--text-secondary)]">Fecha límite</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                className="bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-primary)]"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 text-[var(--text-primary)]"
                        >
                            {loading ? "Creando..." : "Crear tarea"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
