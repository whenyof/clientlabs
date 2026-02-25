"use client"

import { useState } from "react"
import type { Lead } from "@prisma/client"
import { X, Flame, CloudSun, CloudSnow, Calendar, MapPin, Tag as TagIcon, FileText, MessageSquare, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { TemperatureIcon } from "./TemperatureIcon"
import { addLeadNote, markLeadLost, convertLeadToClient, changeLeadTemperature, addLeadTag, removeLeadTag, setLeadReminder, completeLeadReminder } from "../actions"
import { useRouter } from "next/navigation"
import type { LeadTemp } from "@prisma/client"
import { toast } from "sonner"
import { TaskDialog } from "@/components/tasks/TaskDialog"
import { TaskCard, type Task } from "@/components/tasks/TaskCard"
import { getTasks } from "@/app/dashboard/tasks/actions"
import { CheckSquare } from "lucide-react"
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
            toast.success("Nota guardada correctamente")
        } catch (error) {
            console.error(error)
            toast.error("Error al guardar nota")
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
            toast.success("Lead marcado como perdido")
            onClose()
        } catch (error) {
            console.error(error)
            toast.error("Error al marcar como perdido")
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
            toast.success(result.clientCreated ? "Lead convertido a cliente" : "Lead convertido y vinculado a cliente existente")
            onClose()
        } catch (error) {
            console.error(error)
            toast.error("Error al convertir lead")
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
            const tempLabels = {
                HOT: "HOT 🔥",
                WARM: "WARM 🌤️",
                COLD: "COLD ❄️"
            }
            toast.success(`Temperatura cambiada a ${tempLabels[newTemp]}`)
        } catch (error) {
            console.error(error)
            const message = error instanceof Error ? error.message : "Error al cambiar temperatura"
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
            toast.success("Tag añadido")
        } catch (error) {
            console.error(error)
            const message = error instanceof Error ? error.message : "Error al añadir tag"
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
            toast.success("Tag eliminado")
        } catch (error) {
            console.error(error)
            toast.error("Error al eliminar tag")
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
            toast.success("Recordatorio añadido")
        } catch (error) {
            console.error(error)
            const message = error instanceof Error ? error.message : "Error al añadir recordatorio"
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
            toast.success("Recordatorio completado")
        } catch (error) {
            console.error(error)
            toast.error("Error al completar recordatorio")
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
                onSuccess={() => {
                    if (lead) getTasks({ leadId: lead.id }).then(setTasks)
                }}
            />
            {/* Overlay */}
            {
                isOpen && (
                    <div
                        className="fixed inset-0 bg-[var(--bg-card)]/40 z-40 transition-opacity duration-200"
                        onClick={onClose}
                    />
                )
            }

            {/* Side Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-full md:w-[480px] bg-[var(--bg-card)] border-l border-[var(--border-subtle)] z-50 transform transition-transform duration-200 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-[var(--border-subtle)]">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{lead.name}</h2>
                                <p className="text-sm text-[var(--text-secondary)]">{lead.email}</p>
                                {lead.phone && <p className="text-sm text-[var(--text-secondary)]">{lead.phone}</p>}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-[var(--bg-surface)] transition-colors"
                            >
                                <X className="h-5 w-5 text-[var(--text-secondary)]" />
                            </button>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                            <TemperatureIcon temperature={lead.temperature || "COLD"} showLabel />
                            {lead.leadStatus === "CONVERTED" && (
                                <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-medium">
                                    ✓ Convertido
                                </span>
                            )}
                            {lead.leadStatus === "LOST" && (
                                <span className="px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-medium">
                                    ✗ Perdido
                                </span>
                            )}
                        </div>

                        {/* AI Suggestions */}
                        {(() => {
                            const suggestion = getLeadSuggestion(lead)
                            if (!suggestion) return null

                            const handleApplyAction = () => {
                                switch (suggestion.action) {
                                    case "email":
                                        handleEmailClick()
                                        break
                                    case "call":
                                        toast.info("Registra la llamada en las notas")
                                        break
                                    case "convert":
                                        setConvertDialog(true)
                                        break
                                    case "follow_up":
                                        toast.info("Registra el seguimiento en las notas")
                                        break
                                }
                            }

                            return (
                                <div className="mt-4">
                                    <AISuggestionCard
                                        leadId={lead.id}
                                        suggestion={suggestion}
                                        onApplyAction={handleApplyAction}
                                    />
                                </div>
                            )
                        })()}
                    </div>

                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Quick Actions */}
                        {!isReadOnly && (
                            <div>
                                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Acciones Rápidas</h3>
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
                                        title={lead.email ? `Enviar email a ${lead.email}` : "Sin email"}
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
                                        Convertir
                                    </Button>
                                    <Button
                                        onClick={() => setLostDialog(true)}
                                        className="bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 justify-start"
                                        variant="outline"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Marcar Perdido
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Tasks Section */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                                    <CheckSquare className="h-4 w-4" />
                                    Tareas
                                </h3>
                                <Button
                                    onClick={() => setTaskDialog(true)}
                                    size="sm"
                                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                                >
                                    + Añadir
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {tasks.length > 0 ? (
                                    tasks.map(task => (
                                        <TaskCard key={task.id} task={task} />
                                    ))
                                ) : (
                                    <p className="text-sm text-[var(--text-secondary)] text-center py-4 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-main)]">
                                        No hay tareas pendientes
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Reminder Section */}
                        <div>
                            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                                <Bell className="h-4 w-4" />
                                Próximo Recordatorio
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
                                        call: "Llamar",
                                        email: "Responder email",
                                        follow_up: "Seguimiento",
                                        custom: "Personalizado"
                                    }

                                    return (
                                        <div className="p-3 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-lg">{typeEmojis[reminder.type]}</span>
                                                        <span className="text-[var(--text-primary)] font-medium">{typeLabels[reminder.type]}</span>
                                                    </div>
                                                    <div className="text-sm text-[var(--text-secondary)]">
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
                                                        <div className="text-xs text-[var(--text-secondary)] mt-2">
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
                                                    className="flex-1 bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
                                                    disabled={loading}
                                                >
                                                    Cambiar
                                                </Button>
                                                <Button
                                                    onClick={handleCompleteReminder}
                                                    size="sm"
                                                    className="flex-1 bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                                                    disabled={loading}
                                                >
                                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                                    Completar
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                }

                                if (!isReadOnly) {
                                    return (
                                        <div className="p-3 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-center">
                                            <p className="text-sm text-[var(--text-secondary)] mb-3">Sin recordatorios</p>
                                            <Button
                                                onClick={() => setReminderDialog(true)}
                                                size="sm"
                                                className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
                                                disabled={loading}
                                            >
                                                <Bell className="h-4 w-4 mr-2" />
                                                Añadir recordatorio
                                            </Button>
                                        </div>
                                    )
                                }

                                return (
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        No disponible para leads {lead.leadStatus === "CONVERTED" ? "convertidos" : "perdidos"}
                                    </p>
                                )
                            })()}
                        </div>

                        {/* Information */}
                        <div>
                            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Información</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-[var(--text-secondary)]" />
                                    <span className="text-[var(--text-secondary)]">Fuente:</span>
                                    <span className="text-[var(--text-primary)]">{lead.source || "-"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-[var(--text-secondary)]" />
                                    <span className="text-[var(--text-secondary)]">Creado:</span>
                                    <span className="text-[var(--text-primary)]">{formatDate(lead.createdAt)}</span>
                                </div>
                                {lead.lastActionAt && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="h-4 w-4 text-[var(--text-secondary)]" />
                                        <span className="text-[var(--text-secondary)]">Última acción:</span>
                                        <span className="text-[var(--text-primary)]">{formatDate(lead.lastActionAt)}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm">
                                    <FileText className="h-4 w-4 text-[var(--text-secondary)]" />
                                    <span className="text-[var(--text-secondary)]">Score:</span>
                                    <span className="text-[var(--text-primary)]">{lead.score}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                                <TagIcon className="h-4 w-4" />
                                Tags
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
                                        placeholder="Añadir tag..."
                                        className="bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] text-sm"
                                        disabled={loading}
                                    />
                                    <Button
                                        onClick={handleAddTag}
                                        disabled={loading || !newTag.trim()}
                                        size="sm"
                                        className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 shrink-0"
                                    >
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Añadir
                                    </Button>
                                </div>
                            )}

                            {!lead.tags || lead.tags.length === 0 && (
                                <p className="text-sm text-[var(--text-secondary)] mb-3">
                                    {isReadOnly ? "Sin tags" : "Añade tags para organizar este lead"}
                                </p>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Notas
                            </h3>
                            {!isReadOnly && (
                                <div className="space-y-2">
                                    <Textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Añadir o editar notas del lead..."
                                        className="bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] min-h-[120px]"
                                    />
                                    <Button
                                        onClick={handleAddNote}
                                        disabled={loading || !note.trim()}
                                        className="w-full bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
                                    >
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Guardar Nota
                                    </Button>
                                    {lead.notes && (
                                        <p className="text-xs text-[var(--text-secondary)]">
                                            Última actualización: {formatDate(lead.updatedAt)}
                                        </p>
                                    )}
                                </div>
                            )}
                            {isReadOnly && lead.notes && (
                                <div className="p-3 rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)]">
                                    <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{lead.notes}</p>
                                    <p className="text-xs text-[var(--text-secondary)] mt-2">
                                        Lead {lead.leadStatus === "CONVERTED" ? "convertido" : "perdido"} - Solo lectura
                                    </p>
                                </div>
                            )}
                            {isReadOnly && !lead.notes && (
                                <p className="text-sm text-[var(--text-secondary)]">
                                    No hay notas para este lead
                                </p>
                            )}
                        </div>

                        {/* Automation Placeholder */}
                        <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                            <h3 className="text-sm font-medium text-purple-300 mb-2">🤖 Automatización</h3>
                            <p className="text-xs text-[var(--text-secondary)]">
                                Este lead entrará automáticamente en reglas de seguimiento según su temperatura y tags.
                            </p>
                            <p className="text-xs text-purple-400 mt-2">Próximamente: configuración avanzada</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lost Dialog */}
            <Dialog open={lostDialog} onOpenChange={setLostDialog}>
                <DialogContent className="bg-[var(--bg-card)] border-[var(--border-subtle)]">
                    <DialogHeader>
                        <DialogTitle className="text-[var(--text-primary)]">Marcar como perdido</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            value={lostReason}
                            onChange={(e) => setLostReason(e.target.value)}
                            placeholder="¿Por qué se perdió este lead?"
                            className="bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLostDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleMarkLost}
                            disabled={loading || !lostReason.trim()}
                            className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Marcar Perdido
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Convert Dialog */}
            <Dialog open={convertDialog} onOpenChange={setConvertDialog}>
                <DialogContent className="bg-[var(--bg-card)] border-[var(--border-subtle)]">
                    <DialogHeader>
                        <DialogTitle className="text-[var(--text-primary)] text-xl">¿Convertir lead a cliente?</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                            <p className="text-sm text-amber-300 font-medium mb-2">⚠️ Esta acción es IRREVERSIBLE</p>
                            <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                                <li>• El lead quedará marcado como CONVERTIDO</li>
                                <li>• No podrás modificar su información</li>
                                <li>• Se creará o vinculará a un cliente</li>
                            </ul>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConvertDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleConvert}
                            disabled={loading}
                            className="bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar Conversión
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Temperature Dialog */}
            <Dialog open={temperatureDialog} onOpenChange={setTemperatureDialog}>
                <DialogContent className="bg-[var(--bg-card)] border-[var(--border-subtle)]">
                    <DialogHeader>
                        <DialogTitle className="text-[var(--text-primary)]">Cambiar Temperatura</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <p className="text-sm text-[var(--text-secondary)]">Selecciona la nueva temperatura del lead:</p>
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
                                <span className="text-sm text-red-400 font-medium">HOT</span>
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
                                <span className="text-sm text-amber-400 font-medium">WARM</span>
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
                                <span className="text-sm text-cyan-400 font-medium">COLD</span>
                            </button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTemperatureDialog(false)} disabled={loading}>
                            Cerrar
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
