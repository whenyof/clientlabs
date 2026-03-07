"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { SidePanel } from "@/components/ui/SidePanel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TaskDialog } from "@/components/tasks/TaskDialog"
import type { CalendarTask } from "./types"
import type { ApiTaskRaw } from "./types"

type CalendarSidePanelProps = {
    open: boolean
    task: CalendarTask | null
    apiTask: ApiTaskRaw | null
    onClose: () => void
    onSaved?: () => void
}

const statusVariant: Record<string, "secondary" | "default" | "outline"> = {
    PENDING: "default",
    DONE: "secondary",
    CANCELLED: "outline",
}

const priorityLabel: Record<string, string> = {
    HIGH: "Alta",
    MEDIUM: "Media",
    LOW: "Baja",
}

export function CalendarSidePanel({
    open,
    task,
    apiTask,
    onClose,
    onSaved,
}: CalendarSidePanelProps) {
    const [editOpen, setEditOpen] = useState(false)

    if (!task) return null

    const dueLabel = task.dueDate
        ? format(new Date(task.dueDate), "EEEE d MMMM, HH:mm", { locale: es })
        : "Sin fecha"

    const taskForDialog = apiTask
        ? {
            id: apiTask.id,
            title: apiTask.title,
            description: apiTask.description ?? "",
            dueDate: apiTask.dueDate,
            priority: apiTask.priority,
            type: apiTask.type ?? "MANUAL",
            clientId: apiTask.clientId ?? apiTask.Client?.id,
            leadId: apiTask.leadId ?? apiTask.Lead?.id,
        }
        : undefined

    return (
        <>
            <SidePanel isOpen={open} onClose={onClose} width="default" title={task.title} showCloseButton={true}>
                <div className="flex-1 p-6 space-y-6">
                    <div className="flex flex-wrap gap-2">
                        <Badge variant={statusVariant[task.status] ?? "secondary"}>
                            {task.status === "PENDING"
                                ? "Pendiente"
                                : task.status === "DONE"
                                    ? "Hecho"
                                    : "Cancelado"}
                        </Badge>
                        <Badge variant="outline">
                            {priorityLabel[task.priority] ?? task.priority}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                            Fecha y hora
                        </p>
                        <p className="text-sm text-foreground">{dueLabel}</p>
                    </div>
                    {task.clientName && (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                Cliente
                            </p>
                            <p className="text-sm text-foreground">{task.clientName}</p>
                        </div>
                    )}
                    {task.leadName && (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                Lead
                            </p>
                            <p className="text-sm text-foreground">{task.leadName}</p>
                        </div>
                    )}
                    <div className="pt-4">
                        <Button
                            variant="outline"
                            className="w-full border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                            onClick={() => setEditOpen(true)}
                        >
                            Editar tarea
                        </Button>
                    </div>
                </div>
            </SidePanel>
            <TaskDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                task={taskForDialog}
                onSuccess={() => {
                    onSaved?.()
                    setEditOpen(false)
                }}
            />
        </>
    )
}
