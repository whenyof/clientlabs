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

import { useSectorConfig } from "@/hooks/useSectorConfig"

type CreateTaskDialogProps = {
    providerId: string
    providerName: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function CreateTaskDialog({ providerId, providerName, open, onOpenChange, onSuccess }: CreateTaskDialogProps) {
    const { labels } = useSectorConfig()
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
                toast.success(labels.common.success)
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
                toast.error(result.error || labels.common.error)
            }
        } catch (error) {
            toast.error(labels.common.error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white">{labels.providers.actions.newTask}</DialogTitle>
                    <p className="text-sm text-white/60">{providerName}</p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <Label htmlFor="title" className="text-white/80">Título *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="Ej: Renovar contrato"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="description" className="text-white/80">Descripción</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white resize-none"
                            placeholder="Detalles de la tarea..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Priority */}
                        <div>
                            <Label htmlFor="priority" className="text-white/80">Prioridad</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                            >
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10">
                                    <SelectItem value="LOW">{labels.providers.dependency.LOW}</SelectItem>
                                    <SelectItem value="MEDIUM">{labels.providers.dependency.MEDIUM}</SelectItem>
                                    <SelectItem value="HIGH">{labels.providers.dependency.HIGH}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Due Date */}
                        <div>
                            <Label htmlFor="dueDate" className="text-white/80">Fecha límite</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                            {labels.common.cancel}
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            {loading ? labels.common.loading : labels.providers.actions.newTask}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
