"use client"

import { useSectorConfig } from "@/hooks/useSectorConfig"

import { useState } from "react"
import type { Lead } from "@prisma/client"
import { X, Flame, CloudSun, CloudSnow, Calendar, MapPin, Tag as TagIcon, FileText, MessageSquare, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { TemperatureIcon } from "./TemperatureIcon"
import { addLeadNote, markLeadLost, convertLeadToClient, changeLeadTemperature, addLeadTag, removeLeadTag, setLeadReminder, completeLeadReminder } from "../actions"
import { useRouter } from "next/navigation"
import type { LeadTemp } from "@prisma/client"
import { toast } from "sonner"
import { TaskDialog } from "@/components/tasks/TaskDialog"
import type { Task } from "@/components/tasks/TaskCard"
import { getTasks } from "@/app/dashboard/tasks/actions"
import { toggleTaskCompletion } from "@/app/dashboard/tasks/actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CheckSquare, Circle } from "lucide-react"
import { useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { TagPill } from "./TagPill"
import { ReminderDialog } from "./ReminderDialog"
import { DeleteLeadDialog } from "./DeleteLeadDialog"
import { cn } from "@/lib/utils"
import { getLeadSuggestion } from "../utils/leadSuggestions"
import { AISuggestionCard } from "./AISuggestionCard"
import {
    Mail,
    User,
    StickyNote,
    Snowflake,
    Clock,
    Bell,
    CheckCircle2,
    Trash2,
} from "lucide-react"

type LeadSidePanelProps = {
    lead: Lead | null
    isOpen: boolean
    onClose: () => void
}

export function LeadSidePanel({ lead, isOpen, onClose }: LeadSidePanelProps) {
    const { labels } = useSectorConfig()
    const ui = labels.leads.ui
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [tasks, setTasks] = useState<Task[]>([])
    const [taskDialog, setTaskDialog] = useState(false)
    const [note, setNote] = useState("")
    const [lostReason, setLostReason] = useState("")
    const [lostDialog, setLostDialog] = useState(false)
    const [convertDialog, setConvertDialog] = useState(false)
    const [temperatureDialog, setTemperatureDialog] = useState(false)
    const [newTag, setNewTag] = useState("")
    const [reminderDialog, setReminderDialog] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [activeTab, setActiveTab] = useState<"summary" | "tasks" | "reminders" | "notes">("summary")
    const [taskTogglePending, setTaskTogglePending] = useState(false)

    const handleToggleTask = async (taskId: string, completed: boolean) => {
        setTaskTogglePending(true)
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: completed ? "DONE" : "PENDING" } : t))
        try {
            await toggleTaskCompletion(taskId, completed)
            router.refresh()
        } catch {
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: completed ? "PENDING" : "DONE" } : t))
            toast.error(ui.toastErrorNote)
        } finally {
            setTaskTogglePending(false)
        }
    }

    // Initialize note with existing notes
    useEffect(() => {
        if (lead && lead.notes) {
            setNote(lead.notes)
        } else {
            setNote("")
        }

        if (lead && isOpen) {
            getTasks({ leadId: lead.id }).then(setTasks)
        }
    }, [lead, isOpen])

    if (!lead) return null

    const isReadOnly = lead.leadStatus === "CONVERTED" || lead.leadStatus === "LOST"

    const handleAddNote = async () => {
        if (!note.trim()) return
        setLoading(true)
        try {
            await addLeadNote(lead.id, note)
            router.refresh()
            toast.success(ui.toastNoteSaved)
        } catch (error) {
            console.error(error)
            toast.error(ui.toastErrorNote)
        } finally {
            setLoading(false)
        }
    }

    const handleEmailClick = () => {
        if (!lead.email) return
        window.location.href = `mailto:${lead.email}?subject=Contacto desde ClientLabs`
    }

    const handleMarkLost = async () => {
        if (!lostReason.trim()) return
        setLoading(true)
        try {
            await markLeadLost(lead.id, lostReason)
            setLostReason("")
            setLostDialog(false)
            router.refresh()
            toast.success(`${labels.leads.singular} marcado como ${labels.leads.status.LOST.toLowerCase()}`)
            onClose()
        } catch (error) {
            console.error(error)
            toast.error(ui.toastErrorConvert)
        } finally {
            setLoading(false)
        }
    }

    const handleConvert = async () => {
        setLoading(true)
        try {
            const result = await convertLeadToClient(lead.id)
            setConvertDialog(false)
            router.refresh()
            toast.success(result.clientCreated ? `${labels.leads.singular} convertido a ${labels.clients.singular.toLowerCase()}` : `${labels.leads.singular} convertido y vinculado a ${labels.clients.singular.toLowerCase()} existente`)
            onClose()
        } catch (error) {
            console.error(error)
            toast.error(ui.toastErrorConvert)
        } finally {
            setLoading(false)
        }
    }

    const handleChangeTemperature = async (newTemp: LeadTemp) => {
        setLoading(true)
        try {
            await changeLeadTemperature(lead.id, newTemp)
            setTemperatureDialog(false)
            router.refresh()
            toast.success(`${ui.toastTempChanged} ${labels.leads.temperatures[newTemp]}`)
        } catch (error) {
            console.error(error)
            const message = error instanceof Error ? error.message : ui.toastTempChangeError
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    const handleAddTag = async () => {
        if (!newTag.trim()) return
        setLoading(true)
        try {
            await addLeadTag(lead.id, newTag.trim())
            setNewTag("")
            router.refresh()
            toast.success(ui.toastTagAdded)
        } catch (error) {
            console.error(error)
            const message = error instanceof Error ? error.message : ui.toastTagError
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveTag = async (tag: string) => {
        setLoading(true)
        try {
            await removeLeadTag(lead.id, tag)
            router.refresh()
            toast.success(ui.toastTagRemoved)
        } catch (error) {
            console.error(error)
            toast.error(ui.toastTagError)
        } finally {
            setLoading(false)
        }
    }

    const handleSetReminder = async (reminder: { type: string; date: string; time?: string; note?: string }) => {
        setLoading(true)
        try {
            await setLeadReminder(lead.id, reminder as any)
            setReminderDialog(false)
            router.refresh()
            toast.success(ui.toastReminderAdded)
        } catch (error) {
            console.error(error)
            const message = error instanceof Error ? error.message : ui.toastReminderError
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    const handleCompleteReminder = async () => {
        setLoading(true)
        try {
            await completeLeadReminder(lead.id)
            router.refresh()
            toast.success(ui.toastReminderCompleted)
        } catch (error) {
            console.error(error)
            toast.error(ui.toastReminderCompleteError)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (date: Date | null) => {
        if (!date) return "-"
        return new Date(date).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        })
    }

    return (
        <>
            <TaskDialog
                open={taskDialog}
                onOpenChange={(open) => {
                    setTaskDialog(open)
                    if (!open && lead) {
                        getTasks({ leadId: lead.id }).then(setTasks)
                    }
                }}
                leadId={lead.id}
                entityName={lead.name ?? undefined}
                onSuccess={() => {
                    if (lead) {
                        getTasks({ leadId: lead.id }).then(setTasks)
                        router.refresh()
                    }
                }}
            />
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent side="right" className="w-full sm:max-w-2xl bg-zinc-950 border-l border-white/10 p-0 flex flex-col focus:outline-none">
                    <SheetHeader className="z-10 bg-zinc-950 border-b border-white/10 p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <SheetTitle className="text-white text-xl truncate">{lead.name}</SheetTitle>
                                <p className="text-sm text-white/60 truncate mt-1">{lead.email}</p>
                                {lead.phone && <p className="text-sm text-white/60 truncate">{lead.phone}</p>}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <TemperatureIcon temperature={lead.temperature || "COLD"} showLabel />
                                    {lead.leadStatus === "CONVERTED" && (
                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px] h-5">{labels.leads.status.CONVERTED}</Badge>
                                    )}
                                    {lead.leadStatus === "LOST" && (
                                        <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/40 text-[10px] h-5">{labels.leads.status.LOST}</Badge>
                                    )}
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="text-white/60 hover:text-white hover:bg-white/10 shrink-0">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {/* AI suggestion arriba */}
                        {(() => {
                            const suggestion = getLeadSuggestion(lead)
                            if (!suggestion) return null
                            const handleApplyAction = () => {
                                switch (suggestion.action) {
                                    case "email": handleEmailClick(); break
                                    case "call": toast.info(ui.registerCallInNotes); break
                                    case "convert": setConvertDialog(true); break
                                    case "follow_up": toast.info(ui.registerFollowUpInNotes); break
                                }
                            }
                            return (
                                <div>
                                    <AISuggestionCard leadId={lead.id} suggestion={suggestion} onApplyAction={handleApplyAction} />
                                </div>
                            )
                        })()}
                        {/* Quick Actions */}
                        {!isReadOnly && (
                            <div>
                                <h3 className="text-sm font-medium text-white/80 mb-3">{ui.quickActions}</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        onClick={() => setTemperatureDialog(true)}
                                        className="bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 justify-start"
                                        variant="outline"
                                    >
                                        <Flame className="h-4 w-4 mr-2" />
                                        Temperatura
                                    </Button>
                                    <Button
                                        onClick={handleEmailClick}
                                        disabled={!lead.email}
                                        className="bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 justify-start disabled:opacity-50 disabled:cursor-not-allowed"
                                        variant="outline"
                                        title={lead.email ? `${ui.sendEmail} ${lead.email}` : ui.noEmail}
                                    >
                                        <Mail className="h-4 w-4 mr-2" />
                                        Email
                                    </Button>
                                    <Button
                                        onClick={() => setConvertDialog(true)}
                                        className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 justify-start"
                                        variant="outline"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        {labels.common.create} {labels.clients.singular}
                                    </Button>
                                    <Button
                                        onClick={() => setLostDialog(true)}
                                        className="bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 justify-start"
                                        variant="outline"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Marcar {labels.leads.status.LOST}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Tasks Section — mismo layout que Providers */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-white font-medium">{labels.nav.tasks} y Seguimiento</h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white/5 text-white border-white/10 hover:bg-white/10"
                                    onClick={() => setTaskDialog(true)}
                                >
                                    <CheckSquare className="h-4 w-4 mr-2" /> {labels.providers.actions.newTask}
                                </Button>
                            </div>
                            {tasks.length === 0 ? (
                                <div className="text-center py-12 text-white/20 border-2 border-dashed border-white/5 rounded-xl">
                                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>No hay tareas registradas</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {tasks.map(task => (
                                        <div
                                            key={task.id}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-lg bg-white/5 border group transition-all",
                                                task.status === "DONE"
                                                    ? "border-green-500/20 bg-green-500/5"
                                                    : "border-white/10 hover:border-white/20"
                                            )}
                                        >
                                            <button
                                                onClick={() => handleToggleTask(task.id, task.status !== "DONE")}
                                                className="transition-all hover:scale-110"
                                                disabled={taskTogglePending}
                                            >
                                                {task.status === "DONE" ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
                                                ) : (
                                                    <Circle className="h-5 w-5 text-white/20 hover:text-white/40" />
                                                )}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={cn(
                                                    "text-sm font-medium truncate transition-all",
                                                    task.status === "DONE" ? "line-through text-white/30" : "text-white"
                                                )}>
                                                    {task.title}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {task.dueDate && (
                                                        <p className="text-[10px] text-white/40">Vence: {format(new Date(task.dueDate), "d MMM", { locale: es })}</p>
                                                    )}
                                                    <Badge variant="outline" className={cn(
                                                        "text-[9px] py-0 px-1 leading-none h-4",
                                                        task.priority === "HIGH" ? "border-red-500/50 text-red-400" :
                                                        task.priority === "MEDIUM" ? "border-amber-500/50 text-amber-400" :
                                                        "border-blue-500/50 text-blue-400"
                                                    )}>
                                                        {task.priority}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Reminder Section */}
                        <div>
                            <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                                <Bell className="h-4 w-4" />
                                {ui.sidebarNextReminder}
                            </h3>

                            {(() => {
                                const metadata = (lead.metadata as any) || {}
                                const reminder = metadata.reminder

                                if (reminder && !isReadOnly) {
                                    const reminderDate = new Date(reminder.date)
                                    const now = new Date()
                                    const isOverdue = reminderDate < now
                                    const isToday = reminderDate.toDateString() === now.toDateString()

                                    const typeEmojis: Record<string, string> = {
                                        call: "📞",
                                        email: "✉️",
                                        follow_up: "📝",
                                        custom: "🔔"
                                    }

                                    const typeLabels: Record<string, string> = {
                                        call: ui.reminderTypeCall,
                                        email: ui.reminderTypeEmail,
                                        follow_up: ui.reminderTypeFollowUp,
                                        custom: ui.reminderTypeCustom
                                    }

                                    return (
                                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-lg">{typeEmojis[reminder.type]}</span>
                                                        <span className="text-white font-medium">{typeLabels[reminder.type]}</span>
                                                    </div>
                                                    <div className="text-sm text-white/60">
                                                        🗓️ {reminderDate.toLocaleDateString("es-ES", {
                                                            day: "numeric",
                                                            month: "short"
                                                        })}
                                                        {reminder.time && ` · ${reminder.time}`}
                                                    </div>
                                                    {isOverdue && (
                                                        <div className="text-xs text-red-400 mt-1">
                                                            🔴 Vencido
                                                        </div>
                                                    )}
                                                    {isToday && !isOverdue && (
                                                        <div className="text-xs text-orange-400 mt-1">
                                                            🟠 Hoy
                                                        </div>
                                                    )}
                                                    {reminder.note && (
                                                        <div className="text-xs text-white/40 mt-2">
                                                            {reminder.note}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => setReminderDialog(true)}
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1 bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                                                    disabled={loading}
                                                >
                                                    {ui.reminderChange}
                                                </Button>
                                                <Button
                                                    onClick={handleCompleteReminder}
                                                    size="sm"
                                                    className="flex-1 bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                                                    disabled={loading}
                                                >
                                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                                    {ui.reminderComplete}
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                }

                                if (!isReadOnly) {
                                    return (
                                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                                            <p className="text-sm text-white/40 mb-3">{ui.sidebarNoReminders}</p>
                                            <Button
                                                onClick={() => setReminderDialog(true)}
                                                size="sm"
                                                className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
                                                disabled={loading}
                                            >
                                                <Bell className="h-4 w-4 mr-2" />
                                                {ui.sidebarAddReminder}
                                            </Button>
                                        </div>
                                    )
                                }

                                return (
                                    <p className="text-sm text-white/40">
                                        No disponible para {labels.leads.plural.toLowerCase()} {lead.leadStatus === "CONVERTED" ? labels.leads.status.CONVERTED.toLowerCase() : labels.leads.status.LOST.toLowerCase()}
                                    </p>
                                )
                            })()}
                        </div>

                        {/* Information */}
                        <div>
                            <h3 className="text-sm font-medium text-white/80 mb-3">{ui.sidebarInfo}</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-white/40" />
                                    <span className="text-white/60">{ui.sidebarSource}:</span>
                                    <span className="text-white">{lead.source || "-"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-white/40" />
                                    <span className="text-white/60">{ui.sidebarCreated}:</span>
                                    <span className="text-white">{formatDate(lead.createdAt)}</span>
                                </div>
                                {lead.lastActionAt && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="h-4 w-4 text-white/40" />
                                        <span className="text-white/60">{ui.sidebarLastAction}:</span>
                                        <span className="text-white">{formatDate(lead.lastActionAt)}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm">
                                    <FileText className="h-4 w-4 text-white/40" />
                                    <span className="text-white/60">{ui.sidebarScore}:</span>
                                    <span className="text-white">{lead.score}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                                <TagIcon className="h-4 w-4" />
                                {ui.sidebarTags}
                            </h3>

                            {/* Existing Tags */}
                            {lead.tags && lead.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {lead.tags.map((tag, idx) => (
                                        <TagPill
                                            key={idx}
                                            tag={tag}
                                            size="md"
                                            onRemove={!isReadOnly ? () => handleRemoveTag(tag) : undefined}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Add New Tag */}
                            {!isReadOnly && (
                                <div className="flex gap-2">
                                    <Input
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault()
                                                handleAddTag()
                                            }
                                        }}
                                        placeholder={ui.sidebarAddTagPlaceholder}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 text-sm"
                                        disabled={loading}
                                    />
                                    <Button
                                        onClick={handleAddTag}
                                        disabled={loading || !newTag.trim()}
                                        size="sm"
                                        className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 shrink-0"
                                    >
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {ui.sidebarAddTag}
                                    </Button>
                                </div>
                            )}

                            {!lead.tags || lead.tags.length === 0 && (
                                <p className="text-sm text-white/40 mb-3">
                                    {isReadOnly ? ui.sidebarTagsReadOnly : ui.sidebarTagsHint}
                                </p>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                {ui.sidebarNotes}
                            </h3>
                            {!isReadOnly && (
                                <div className="space-y-2">
                                    <Textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder={ui.sidebarNotesPlaceholder}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[120px]"
                                    />
                                    <Button
                                        onClick={handleAddNote}
                                        disabled={loading || !note.trim()}
                                        className="w-full bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
                                    >
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {ui.sidebarSaveNote}
                                    </Button>
                                    {lead.notes && (
                                        <p className="text-xs text-white/40">
                                            Última actualización: {formatDate(lead.updatedAt)}
                                        </p>
                                    )}
                                </div>
                            )}
                            {isReadOnly && lead.notes && (
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <p className="text-sm text-white/80 whitespace-pre-wrap">{lead.notes}</p>
                                    <p className="text-xs text-white/40 mt-2">
                                        {ui.sidebarReadOnlyNote}
                                    </p>
                                </div>
                            )}
                            {isReadOnly && !lead.notes && (
                                <p className="text-sm text-white/40">
                                    No hay notas para este lead
                                </p>
                            )}
                        </div>

                        {/* Automation Placeholder */}
                        <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                            <h3 className="text-sm font-medium text-purple-300 mb-2">{ui.automationTitle}</h3>
                            <p className="text-xs text-white/60">
                                Este lead entrará automáticamente en reglas de seguimiento según su temperatura y tags.
                            </p>
                            <p className="text-xs text-purple-400 mt-2">{ui.automationComing}</p>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Lost Dialog */}
            <Dialog open={lostDialog} onOpenChange={setLostDialog}>
                <DialogContent className="bg-zinc-900 border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white">{ui.lostDialogTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            value={lostReason}
                            onChange={(e) => setLostReason(e.target.value)}
                            placeholder={ui.lostReasonPlaceholder}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLostDialog(false)}>
                            {labels.common.cancel}
                        </Button>
                        <Button
                            onClick={handleMarkLost}
                            disabled={loading || !lostReason.trim()}
                            className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {ui.markLostShort}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Convert Dialog */}
            <Dialog open={convertDialog} onOpenChange={setConvertDialog}>
                <DialogContent className="bg-zinc-900 border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white text-xl">{ui.convertDialogTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                            <p className="text-sm text-amber-300 font-medium mb-2">⚠️ {ui.convertIrreversible}</p>
                            <ul className="text-xs text-white/70 space-y-1">
                                <li>• {ui.convertBullet1}</li>
                                <li>• {ui.convertBullet2}</li>
                                <li>• {ui.convertBullet3}</li>
                            </ul>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConvertDialog(false)}>
                            {labels.common.cancel}
                        </Button>
                        <Button
                            onClick={handleConvert}
                            disabled={loading}
                            className="bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {ui.confirmConvert}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Temperature Dialog */}
            <Dialog open={temperatureDialog} onOpenChange={setTemperatureDialog}>
                <DialogContent className="bg-zinc-900 border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white">{ui.changeTemperature}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <p className="text-sm text-white/60">{ui.selectNewTemperature}</p>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => handleChangeTemperature("HOT")}
                                disabled={loading || lead.temperature === "HOT"}
                                className={`p-4 rounded-lg border-2 transition-all ${lead.temperature === "HOT"
                                    ? "bg-red-500/20 border-red-500/50 opacity-50 cursor-not-allowed"
                                    : "bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
                                    }`}
                            >
                                <Flame className="h-6 w-6 text-red-400 mx-auto mb-2" />
                                <span className="text-sm text-red-400 font-medium">{labels.leads.temperatures.HOT}</span>
                            </button>
                            <button
                                onClick={() => handleChangeTemperature("WARM")}
                                disabled={loading || lead.temperature === "WARM"}
                                className={`p-4 rounded-lg border-2 transition-all ${lead.temperature === "WARM"
                                    ? "bg-amber-500/20 border-amber-500/50 opacity-50 cursor-not-allowed"
                                    : "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
                                    }`}
                            >
                                <CloudSun className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                                <span className="text-sm text-amber-400 font-medium">{labels.leads.temperatures.WARM}</span>
                            </button>
                            <button
                                onClick={() => handleChangeTemperature("COLD")}
                                disabled={loading || lead.temperature === "COLD"}
                                className={`p-4 rounded-lg border-2 transition-all ${lead.temperature === "COLD"
                                    ? "bg-cyan-500/20 border-cyan-500/50 opacity-50 cursor-not-allowed"
                                    : "bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20"
                                    }`}
                            >
                                <CloudSnow className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                                <span className="text-sm text-cyan-400 font-medium">{labels.leads.temperatures.COLD}</span>
                            </button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTemperatureDialog(false)} disabled={loading}>
                            {ui.closeButton}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reminder Dialog */}
            <ReminderDialog
                open={reminderDialog}
                onClose={() => setReminderDialog(false)}
                onSave={(date, note) => handleSetReminder({
                    type: "custom",
                    date: date.toISOString(),
                    note
                })}
                loading={loading}
            />

            {/* Delete Dialog */}
            <DeleteLeadDialog
                open={deleteDialog}
                onClose={() => setDeleteDialog(false)}
                leadId={lead.id}
                leadName={lead.name || "Sin nombre"}
                onDeleted={() => {
                    onClose()
                    router.refresh()
                }}
            />
        </>
    )
}
