"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTask, updateTask } from "@/app/dashboard/tasks/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useSectorConfig } from "@/hooks/useSectorConfig"

const DEFAULT_START_TIME = "09:00"
const DEFAULT_DURATION_MIN = 30
const DURATION_PRESETS = [15, 30, 45, 60] as const

type TaskDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    task?: any
    clientId?: string
    leadId?: string
    entityName?: string
    onSuccess?: (task?: any) => void
    onSubmit?: (data: any) => Promise<void>
}

function formatTimeForInput(date: Date): string {
    const h = date.getHours()
    const m = date.getMinutes()
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export function TaskDialog({ open, onOpenChange, task, clientId, leadId, entityName, onSuccess, onSubmit }: TaskDialogProps) {
    const { labels } = useSectorConfig()
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM")
    const [dueDate, setDueDate] = useState("")
    const [startTime, setStartTime] = useState(DEFAULT_START_TIME)
    const [durationMinutes, setDurationMinutes] = useState(DEFAULT_DURATION_MIN)
    const [durationPreset, setDurationPreset] = useState<number | "custom">(DEFAULT_DURATION_MIN)
    const [customDuration, setCustomDuration] = useState("")

    useEffect(() => {
        if (open) {
            setTitle(task?.title ?? "")
            setDescription(task?.description ?? "")
            setPriority((task?.priority as "LOW" | "MEDIUM" | "HIGH") ?? "MEDIUM")
            setDueDate(task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "")
            if (task?.startAt) {
                setStartTime(formatTimeForInput(new Date(task.startAt)))
            } else {
                setStartTime(DEFAULT_START_TIME)
            }
            const mins = task?.estimatedMinutes ?? (task?.startAt && task?.endAt
                ? Math.round((new Date(task.endAt).getTime() - new Date(task.startAt).getTime()) / 60000)
                : null)
            if (mins != null && mins > 0) {
                setDurationMinutes(mins)
                setDurationPreset(DURATION_PRESETS.includes(mins as typeof DURATION_PRESETS[number]) ? mins : "custom")
                setCustomDuration(DURATION_PRESETS.includes(mins as typeof DURATION_PRESETS[number]) ? "" : String(mins))
            } else {
                setDurationMinutes(DEFAULT_DURATION_MIN)
                setDurationPreset(DEFAULT_DURATION_MIN)
                setCustomDuration("")
            }
        }
    }, [open, task])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) {
            toast.error("El título es obligatorio")
            return
        }

        setLoading(true)
        try {
            const dateStr = dueDate || new Date().toISOString().split("T")[0]
            const [hh, mm] = startTime.split(":").map(Number)
            const startAt = new Date(dateStr)
            startAt.setHours(isNaN(hh) ? 9 : hh, isNaN(mm) ? 0 : mm, 0, 0)
            const endAt = new Date(startAt.getTime() + durationMinutes * 60 * 1000)
            const dueDateForApi = new Date(dateStr)
            dueDateForApi.setHours(12, 0, 0, 0)

            const data = {
                title: title.trim(),
                description: description.trim() || undefined,
                dueDate: dueDateForApi,
                priority,
                type: (task?.type ?? "MANUAL") as "MANUAL" | "CALL" | "EMAIL" | "MEETING",
                clientId: clientId ?? task?.clientId,
                leadId: leadId ?? task?.leadId,
                startAt,
                endAt,
                estimatedMinutes: durationMinutes,
                ...(task?.assignedToId !== undefined && { assignedToId: task.assignedToId }),
            }

            if (onSubmit) {
                await onSubmit(data)
            } else if (task?.id) {
                await updateTask(task.id, data)
                toast.success(labels.common.success)
                if (onSuccess) onSuccess({ ...task, ...data })
            } else {
                const res = await createTask(data)
                toast.success(labels.common.success)
                if (onSuccess) onSuccess({
                    id: (res as any).taskId ?? `temp-${Date.now()}`,
                    ...data,
                    status: "PENDING",
                    createdAt: new Date(),
                })
            }

            onOpenChange(false)
            setTitle("")
            setDescription("")
            setPriority("MEDIUM")
            setDueDate("")
            setStartTime(DEFAULT_START_TIME)
            setDurationMinutes(DEFAULT_DURATION_MIN)
            setDurationPreset(DEFAULT_DURATION_MIN)
            setCustomDuration("")
        } catch (error) {
            console.error(error)
            toast.error(labels.common.error)
        } finally {
            setLoading(false)
        }
    }

    const isCreate = !task?.id
    const dialogTitle = isCreate ? labels.providers.actions.newTask : labels.tasks?.ui?.dialogTitleEdit ?? "Editar tarea"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white">{dialogTitle}</DialogTitle>
                    {entityName && <p className="text-sm text-white/60">{entityName}</p>}
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title" className="text-white/80">Título *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="Ej: Renovar contrato"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="description" className="text-white/80">Descripción</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-white/5 border-white/10 text-white resize-none"
                            placeholder="Detalles de la tarea..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="priority" className="text-zinc-200">Prioridad</Label>
                            <Select
                                value={priority}
                                onValueChange={(value: "LOW" | "MEDIUM" | "HIGH") => setPriority(value)}
                            >
                                <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700 data-[state=open]:bg-zinc-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                    <SelectItem value="LOW" className="text-white bg-transparent data-[highlighted]:bg-zinc-700 data-[highlighted]:text-white cursor-pointer">
                                        {labels.providers.dependency.LOW}
                                    </SelectItem>
                                    <SelectItem value="MEDIUM" className="text-white bg-transparent data-[highlighted]:bg-zinc-700 data-[highlighted]:text-white cursor-pointer">
                                        {labels.providers.dependency.MEDIUM}
                                    </SelectItem>
                                    <SelectItem value="HIGH" className="text-white bg-transparent data-[highlighted]:bg-zinc-700 data-[highlighted]:text-white cursor-pointer">
                                        {labels.providers.dependency.HIGH}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="dueDate" className="text-white/80">Fecha</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="startTime" className="text-white/80">Hora de inicio</Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value || DEFAULT_START_TIME)}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div>
                            <Label htmlFor="duration" className="text-white/80">Duración</Label>
                            <Select
                                value={durationPreset === "custom" ? "custom" : String(durationPreset)}
                                onValueChange={(v) => {
                                    if (v === "custom") {
                                        setDurationPreset("custom")
                                        setDurationMinutes(customDuration ? parseInt(customDuration, 10) || DEFAULT_DURATION_MIN : DEFAULT_DURATION_MIN)
                                    } else {
                                        const n = parseInt(v, 10)
                                        setDurationPreset(n)
                                        setDurationMinutes(n)
                                        setCustomDuration("")
                                    }
                                }}
                            >
                                <SelectTrigger id="duration" className="bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Minutos" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                    {DURATION_PRESETS.map((m) => (
                                        <SelectItem key={m} value={String(m)} className="text-white focus:bg-zinc-700 cursor-pointer">
                                            {m} min
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="custom" className="text-white focus:bg-zinc-700 cursor-pointer">
                                        Personalizado
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {durationPreset === "custom" && (
                                <div className="flex items-center gap-2 mt-2">
                                    <Input
                                        type="number"
                                        min={5}
                                        max={480}
                                        step={5}
                                        placeholder="Minutos"
                                        value={customDuration}
                                        onChange={(e) => {
                                            const v = e.target.value
                                            setCustomDuration(v)
                                            const n = parseInt(v, 10)
                                            if (!Number.isNaN(n) && n >= 5) setDurationMinutes(Math.min(480, n))
                                        }}
                                        className="bg-white/5 border-white/10 text-white w-24"
                                    />
                                    <span className="text-xs text-white/60">min</span>
                                </div>
                            )}
                        </div>
                    </div>

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
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? labels.common.loading : (isCreate ? labels.providers.actions.newTask : (labels.tasks?.ui?.saveChanges ?? "Guardar"))}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
