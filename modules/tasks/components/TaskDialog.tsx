"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTask, updateTask } from "@/app/dashboard/tasks/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useSectorConfig } from "@/hooks/useSectorConfig"

const DEFAULT_START_TIME = "09:00"
const DEFAULT_DURATION_MIN = 30
const DURATION_PRESETS = [15, 30, 45, 60] as const

function formatTimeForInput(date: Date): string {
    const h = date.getHours()
    const m = date.getMinutes()
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

type TaskDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    task?: any // TODO: Type properly with Prisma type
    clientId?: string
    leadId?: string
    onSuccess?: (task?: any) => void
    onSubmit?: (data: any) => Promise<void> // Optional: Override default submission logic
}

export function TaskDialog({ open, onOpenChange, task, clientId, leadId, onSuccess, onSubmit }: TaskDialogProps) {
    const { labels } = useSectorConfig()
    const ui = labels.tasks.ui
    const priorities = labels.tasks.priorities
    const types = labels.tasks.types
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState(task?.title || "")
    const [dueDate, setDueDate] = useState(task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0])
    const [priority, setPriority] = useState(task?.priority || "MEDIUM")
    const [type, setType] = useState(task?.type || "MANUAL")
    const [startTime, setStartTime] = useState(DEFAULT_START_TIME)
    const [durationMinutes, setDurationMinutes] = useState(DEFAULT_DURATION_MIN)
    const [durationPreset, setDurationPreset] = useState<number | "custom">(DEFAULT_DURATION_MIN)
    const [customDuration, setCustomDuration] = useState("")

    useEffect(() => {
        if (open) {
            setTitle(task?.title ?? "")
            setDueDate(task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0])
            setPriority((task?.priority as "LOW" | "MEDIUM" | "HIGH") ?? "MEDIUM")
            setType((task?.type as "MANUAL" | "CALL" | "EMAIL" | "MEETING") ?? "MANUAL")
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
                setDurationPreset(DURATION_PRESETS.includes(mins as (typeof DURATION_PRESETS)[number]) ? mins : "custom")
                setCustomDuration(DURATION_PRESETS.includes(mins as (typeof DURATION_PRESETS)[number]) ? "" : String(mins))
            } else {
                setDurationMinutes(DEFAULT_DURATION_MIN)
                setDurationPreset(DEFAULT_DURATION_MIN)
                setCustomDuration("")
            }
        }
    }, [open, task])

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error(ui.toastTitleRequired)
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
                title,
                dueDate: dueDateForApi,
                priority,
                type,
                clientId: clientId || task?.clientId,
                leadId: leadId || task?.leadId,
                startAt,
                endAt,
                estimatedMinutes: durationMinutes,
            }

            if (onSubmit) {
                await onSubmit(data)
            } else {
                if (task?.id) {
                    await updateTask(task.id, data)
                    toast.success(ui.toastSaved)
                    if (onSuccess) onSuccess({ ...task, ...data })
                } else {
                    const res = await createTask(data)
                    toast.success(ui.toastCreated)
                    if (onSuccess) onSuccess({
                        id: (res as any).taskId || `temp-${Date.now()}`,
                        ...data,
                        status: "PENDING",
                        createdAt: new Date()
                    })
                }
            }

            onOpenChange(false)

            if (!task) {
                setTitle("")
                setPriority("MEDIUM")
                setType("MANUAL")
                setStartTime(DEFAULT_START_TIME)
                setDurationMinutes(DEFAULT_DURATION_MIN)
                setDurationPreset(DEFAULT_DURATION_MIN)
                setCustomDuration("")
            }

        } catch (error) {
            console.error(error)
            toast.error(ui.toastErrorSave)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>{task ? ui.dialogTitleEdit : ui.dialogTitleNew}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title" className="text-white">{ui.formTitle}</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={ui.formTitlePlaceholder}
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="priority" className="text-white">{ui.formPriority}</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder={ui.formPriority} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">{priorities.LOW}</SelectItem>
                                    <SelectItem value="MEDIUM">{priorities.MEDIUM}</SelectItem>
                                    <SelectItem value="HIGH">{priorities.HIGH} 🔥</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type" className="text-white">{ui.formType}</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder={ui.formType} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MANUAL">{types.MANUAL}</SelectItem>
                                    <SelectItem value="CALL">{types.CALL}</SelectItem>
                                    <SelectItem value="EMAIL">{types.EMAIL}</SelectItem>
                                    <SelectItem value="MEETING">{types.MEETING}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="date" className="text-white">{ui.formDueDate}</Label>
                        <Input
                            id="date"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="startTime" className="text-white">Hora de inicio</Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value || DEFAULT_START_TIME)}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="duration" className="text-white">Duración</Label>
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
                                <SelectContent>
                                    {DURATION_PRESETS.map((m) => (
                                        <SelectItem key={m} value={String(m)}>{m} min</SelectItem>
                                    ))}
                                    <SelectItem value="custom">Personalizado</SelectItem>
                                </SelectContent>
                            </Select>
                            {durationPreset === "custom" && (
                                <div className="flex items-center gap-2 mt-1">
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
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                        {ui.cancel}
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {task ? ui.saveChanges : ui.createTask}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
