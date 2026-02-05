"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTask, updateTask } from "@/app/dashboard/tasks/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useSectorConfig } from "@/hooks/useSectorConfig"

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

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error(ui.toastTitleRequired)
            return
        }

        setLoading(true)
        try {
            const data = {
                title,
                dueDate: new Date(dueDate),
                priority,
                type,
                clientId: clientId || task?.clientId,
                leadId: leadId || task?.leadId
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
