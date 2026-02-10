"use client"

import { useState, memo, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { MoreHorizontal, Calendar, Users, FileText, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toggleTaskCompletion } from "@/app/dashboard/tasks/actions"
import { TaskDialog } from "./TaskDialog"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"
import { toast } from "sonner"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { getPriorityScoreLabel, getPriorityScoreBadgeClass } from "@/modules/tasks/lib/priority-score-badge"

// Define simplified type for UI
export type Task = {
    id: string
    title: string
    status: "PENDING" | "DONE" | "CANCELLED"
    priority: "LOW" | "MEDIUM" | "HIGH"
    /** Calculated priority score for badge (Crítica / Alta / Media / Baja). */
    priorityScore?: number | null
    type: "MANUAL" | "CALL" | "EMAIL" | "MEETING"
    dueDate: Date | string | null
    clientId?: string | null
    clientName?: string | null
    leadId?: string | null
    leadName?: string | null
    createdAt: Date | string
}

type TaskCardProps = {
    task: Task
    onUpdate?: (taskId: string, status: "PENDING" | "DONE") => void
    onDelete?: (taskId: string) => void
}

export const TaskCard = memo(function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
    const { labels } = useSectorConfig()
    const ui = labels.tasks.ui
    const typeLabels = labels.tasks.types as Record<string, string>
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    // Safe conversion for dates to avoid hydration mismatches if possible, 
    // but here we just render based on props.

    const [isMounted, setIsMounted] = useState(false)
    useEffect(() => { setIsMounted(true) }, [])

    // Derived state
    const isCompleted = task.status === "DONE"

    // safe overdue check
    const isOverdue = isMounted && !isCompleted && task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0))

    const handleToggle = (checked: boolean) => {
        // Micro-latency compensation: immediate state change is handled by parent optimist UI
        // We can add a sound effect here if requested later.

        const newStatus = checked ? "DONE" : "PENDING"
        if (onUpdate) {
            onUpdate(task.id, newStatus)
        }

        // Haptic feedback if available (mobile)
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(5);
        }

        toggleTaskCompletion(task.id, checked).catch(() => {
            toast.error(ui.toastErrorUpdate)
            // Revert is handled by parent if needed
            if (onUpdate) {
                // Optimistic revert could happen here or rely on parent revalidation
                onUpdate(task.id, !checked ? "DONE" : "PENDING")
            }
        })
    }

    const handleDelete = () => {
        // Only call parent's onDelete - it handles both optimistic UI and server action
        // This prevents the double-call bug that caused duplicate toasts
        if (onDelete) {
            onDelete(task.id)
        }
    }

    const typeIcons = {
        MANUAL: FileText,
        CALL: Phone,
        EMAIL: Mail,
        MEETING: Users
    }

    const TypeIcon = (typeIcons as any)[task.type] || FileText

    return (
        <>
            <div
                className={cn(
                    "group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ease-out",
                    // Micro-interaction: Scale slightly on hover
                    !isCompleted && "hover:scale-[1.01] hover:shadow-lg hover:shadow-black/20 hover:bg-white/[0.02]",
                    isCompleted
                        ? "bg-white/5 border-transparent opacity-60 hover:opacity-100"
                        : "bg-zinc-900 border-white/5 hover:border-white/10",
                    isOverdue && !isCompleted ? "border-red-500/30 bg-red-500/5 hover:bg-red-500/10" : ""
                )}
            >
                {/* Checkbox wrapper for larger click area */}
                <div className="flex items-center justify-center p-1">
                    <Checkbox
                        checked={isCompleted}
                        onCheckedChange={handleToggle}
                        className={cn(
                            "transition-all duration-300 border-white/20",
                            "data-[state=checked]:bg-emerald-500 data-[state=checked]:border-transparent data-[state=checked]:scale-110",
                            "group-hover:border-white/40"
                        )}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className={cn(
                            "font-medium truncate transition-all duration-300",
                            isCompleted ? "text-white/40 line-through decoration-white/20" : "text-white group-hover:text-blue-50"
                        )}>
                            {task.title}
                        </span>
                        {getPriorityScoreLabel(task.priorityScore ?? null) ? (
                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4", getPriorityScoreBadgeClass(task.priorityScore))}>
                                {getPriorityScoreLabel(task.priorityScore ?? null)}
                            </Badge>
                        ) : task.priority === "HIGH" ? (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-orange-500/10 border-orange-500/20 text-orange-400 animate-in fade-in zoom-in duration-300">
                                🔥 {ui.priorityHighBadge}
                            </Badge>
                        ) : null}
                        {isOverdue && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-red-500/10 border-red-500/20 text-red-400 animate-pulse">
                                {ui.overdueBadge}
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-white/40 group-hover:text-white/60 transition-colors">
                        {/* Type */}
                        <div className="flex items-center gap-1.5 bg-white/5 px-1.5 py-0.5 rounded-md">
                            <TypeIcon className="h-3 w-3 opacity-70" />
                            <span>{typeLabels[task.type] ?? task.type}</span>
                        </div>

                        {/* Date */}
                        <div className={cn("flex items-center gap-1.5", isOverdue && "text-red-400 font-medium")}>
                            <Calendar className="h-3 w-3 opacity-70" />
                            {task.dueDate ? format(new Date(task.dueDate), "d MMM", { locale: es }) : ui.noDate}
                        </div>

                        {/* Context (Lead/Client) */}
                        {task.clientName && (
                            <div className="flex items-center gap-1 text-blue-400/80 hover:text-blue-400 transition-colors">
                                <Users className="h-3 w-3" />
                                {task.clientName}
                            </div>
                        )}
                        {task.leadName && (
                            <div className="flex items-center gap-1 text-purple-400/80 hover:text-purple-400 transition-colors">
                                <Users className="h-3 w-3" />
                                {task.leadName}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
                            <DropdownMenuItem onClick={() => setEditOpen(true)} className="text-white hover:bg-white/10 cursor-pointer">
                                {ui.edit}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-red-400 hover:bg-red-500/10 cursor-pointer">
                                {ui.delete}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <TaskDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                task={task}
            />

            <DeleteConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={handleDelete}
                title={ui.deleteDialogTitle}
                description={ui.deleteDialogDescription}
            />
        </>
    )
})
