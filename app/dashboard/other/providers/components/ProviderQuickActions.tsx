"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Mail, Phone, MessageSquare, Bell, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { openEmailClient } from "@/lib/integrations/email"
import { downloadIcsFile, generateGoogleCalendarUrl, generateOutlookCalendarUrl } from "@/lib/integrations/calendar"
import {
    logProviderContact,
    saveEmailTemplate,
    getEmailTemplates
} from "@/app/dashboard/providers/actions"

type QuickActionsProps = {
    providerId: string
    providerName: string
    contactEmail?: string | null
    contactPhone?: string | null
    onActionComplete?: () => void
    variant?: "table" | "panel"
    highlightEmail?: boolean
}

type EmailTemplate = {
    id: string
    name: string
    subject: string
    body: string
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
    {
        id: "followup",
        name: "Seguimiento",
        subject: "Seguimiento de pedido",
        body: "Hola,\n\nEspero que todo esté bien. Me gustaría hacer un seguimiento sobre nuestro último pedido.\n\n¿Podrías confirmarme el estado?\n\nGracias,"
    },
    {
        id: "renewal",
        name: "Renovación",
        subject: "Renovación de contrato",
        body: "Hola,\n\nNos acercamos a la fecha de renovación de nuestro contrato. Me gustaría discutir los términos para el próximo periodo.\n\n¿Podemos agendar una llamada?\n\nSaludos,"
    },
    {
        id: "issue",
        name: "Incidencia",
        subject: "Incidencia con servicio",
        body: "Hola,\n\nHemos detectado una incidencia que requiere atención urgente.\n\nDetalles:\n\n¿Podrías ayudarnos a resolverlo lo antes posible?\n\nGracias,"
    }
]

export function ProviderQuickActions({
    providerId,
    providerName,
    contactEmail,
    contactPhone,
    onActionComplete,
    variant = "panel",
    highlightEmail = false
}: QuickActionsProps) {
    const [emailDialog, setEmailDialog] = useState(false)
    const [callDialog, setCallDialog] = useState(false)
    const [noteDialog, setNoteDialog] = useState(false)
    const [reminderDialog, setReminderDialog] = useState(false)

    const [emailSubject, setEmailSubject] = useState("")
    const [emailBody, setEmailBody] = useState("")
    const [callNotes, setCallNotes] = useState("")
    const [noteContent, setNoteContent] = useState("")
    const [reminderDays, setReminderDays] = useState("7")

    const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES)
    const [saving, setSaving] = useState(false)

    const handleOpenEmail = () => {
        if (!contactEmail) {
            toast.error("No hay email de contacto configurado")
            return
        }
        setEmailDialog(true)
    }

    const handleSendEmail = async (method: "mailto" | "gmail" | "outlook") => {
        if (!contactEmail) return

        setSaving(true)
        try {
            // Log contact
            await logProviderContact(providerId, "EMAIL", emailSubject, emailBody)

            // Open in client
            openEmailClient({ to: contactEmail, subject: emailSubject, body: emailBody }, method)

            toast.success(`Email preparado (${method}). Contacto registrado.`)
            setEmailDialog(false)
            setEmailSubject("")
            setEmailBody("")
            onActionComplete?.()
        } catch (error) {
            toast.error("Error al registrar contacto")
        } finally {
            setSaving(false)
        }
    }

    const handleLogCall = async () => {
        if (!contactPhone) {
            toast.error("No hay teléfono de contacto configurado")
            return
        }

        setCallDialog(true)
    }

    const handleConfirmCall = async () => {
        setSaving(true)
        try {
            await logProviderContact(providerId, "CALL", "Llamada telefónica", callNotes)

            // Open phone dialer (works on mobile)
            if (contactPhone) {
                window.location.href = `tel:${contactPhone}`
            }

            toast.success("Llamada registrada")
            setCallDialog(false)
            setCallNotes("")
            onActionComplete?.()
        } catch (error) {
            toast.error("Error al registrar llamada")
        } finally {
            setSaving(false)
        }
    }

    const handleQuickNote = () => {
        setNoteDialog(true)
    }

    const handleSaveNote = async () => {
        if (!noteContent.trim()) {
            toast.error("La nota no puede estar vacía")
            return
        }

        setSaving(true)
        try {
            // Use existing addProviderNote action
            const { addProviderNote } = await import("@/app/dashboard/providers/actions")
            const result = await addProviderNote(providerId, noteContent)

            if (result.success) {
                toast.success("Nota añadida")
                setNoteDialog(false)
                setNoteContent("")
                onActionComplete?.()
            } else {
                toast.error(result.error || "Error al añadir nota")
            }
        } catch (error) {
            toast.error("Error al añadir nota")
        } finally {
            setSaving(false)
        }
    }

    const handleQuickReminder = () => {
        setReminderDialog(true)
    }

    const handleSetReminder = async () => {
        const days = parseInt(reminderDays)
        if (isNaN(days) || days <= 0) {
            toast.error("El número de días debe ser positivo")
            return
        }

        setSaving(true)
        try {
            await logProviderContact(providerId, "REMINDER", `Recordatorio en ${days} días`, null)

            // Also create a task
            const { createProviderTask } = await import("@/app/dashboard/providers/actions")
            const dueDate = new Date()
            dueDate.setDate(dueDate.getDate() + days)

            await createProviderTask({
                providerId,
                title: `Contactar a ${providerName}`,
                description: `Recordatorio automático en ${days} días`,
                priority: "MEDIUM",
                dueDate
            })

            toast.success(`Recordatorio creado para dentro de ${days} días`)
            setReminderDialog(false)
            setReminderDays("7")
            onActionComplete?.()
        } catch (error) {
            toast.error("Error al crear recordatorio")
        } finally {
            setSaving(false)
        }
    }

    const handleCalendarExport = async (type: 'ics' | 'google' | 'outlook') => {
        const days = parseInt(reminderDays)
        if (isNaN(days) || days <= 0) return

        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + days)

        const event = {
            title: `Contactar a ${providerName}`,
            description: `Recordatorio gestionado desde ClientLabs CRM`,
            startDate: dueDate,
        }

        try {
            // Log as calendar action
            await logProviderContact(providerId, "CALENDAR", `Exportación: ${event.title}`, `Tipo: ${type}`)

            if (type === 'ics') {
                downloadIcsFile(event)
            } else if (type === 'google') {
                window.open(generateGoogleCalendarUrl(event), '_blank')
            } else if (type === 'outlook') {
                window.open(generateOutlookCalendarUrl(event), '_blank')
            }

            toast.success("Evento exportado al calendario")
        } catch (error) {
            toast.error("Error al exportar al calendario")
        }
    }

    const handleUseTemplate = (template: EmailTemplate) => {
        setEmailSubject(template.subject)
        setEmailBody(template.body)
        toast.success(`Template "${template.name}" cargado`)
    }

    const isTable = variant === "table"

    return (
        <>
            {/* Quick Action Buttons */}
            <div className={cn(
                "flex items-center gap-2",
                isTable && "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            )}>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                        e.stopPropagation()
                        handleOpenEmail()
                    }}
                    className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200",
                        contactEmail
                            ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                            : "bg-white/5 text-white/30 cursor-not-allowed",
                        highlightEmail && contactEmail && "ring-2 ring-blue-500 animate-pulse bg-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    )}
                    disabled={!contactEmail}
                    title={highlightEmail ? "Sugerencia: Enviar pedido" : "Enviar email"}
                >
                    <Mail className="h-4 w-4" />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                        e.stopPropagation()
                        handleLogCall()
                    }}
                    className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200",
                        contactPhone
                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            : "bg-white/5 text-white/30 cursor-not-allowed"
                    )}
                    disabled={!contactPhone}
                    title="Llamar"
                >
                    <Phone className="h-4 w-4" />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                        e.stopPropagation()
                        handleQuickNote()
                    }}
                    className="h-8 w-8 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 flex items-center justify-center transition-all duration-200"
                    title="Nota rápida"
                >
                    <MessageSquare className="h-4 w-4" />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                        e.stopPropagation()
                        handleQuickReminder()
                    }}
                    className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 flex items-center justify-center transition-all duration-200"
                    title="Recordatorio"
                >
                    <Bell className="h-4 w-4" />
                </motion.button>
            </div>

            {/* Email Dialog */}
            <Dialog open={emailDialog} onOpenChange={setEmailDialog}>
                <DialogContent className="bg-zinc-900 border-white/10 max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2">
                            <Mail className="h-5 w-5 text-blue-400" />
                            Enviar Email a {providerName}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Templates */}
                        <div>
                            <Label className="text-white/80 text-sm mb-2 block">Templates rápidos</Label>
                            <div className="flex flex-wrap gap-2">
                                {templates.map((template) => (
                                    <Button
                                        key={template.id}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleUseTemplate(template)}
                                        className="border-white/10 text-white/80 hover:bg-white/10"
                                    >
                                        {template.name}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* To */}
                        <div>
                            <Label className="text-white/80">Para</Label>
                            <Input
                                value={contactEmail || ""}
                                disabled
                                className="bg-white/5 border-white/10 text-white/60"
                            />
                        </div>

                        {/* Subject */}
                        <div>
                            <Label htmlFor="subject" className="text-white/80">Asunto *</Label>
                            <Input
                                id="subject"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                                placeholder="Asunto del email"
                            />
                        </div>

                        {/* Body */}
                        <div>
                            <Label htmlFor="body" className="text-white/80">Mensaje *</Label>
                            <Textarea
                                id="body"
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                                className="bg-white/5 border-white/10 text-white resize-none"
                                rows={8}
                                placeholder="Escribe tu mensaje aquí..."
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setEmailDialog(false)}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={() => handleSendEmail("mailto")}
                            disabled={!emailSubject || !emailBody || saving}
                            className="bg-white/10 hover:bg-white/20 text-white"
                        >
                            <Mail className="h-4 w-4 mr-2" />
                            Abrir en Cliente de Email
                        </Button>
                        <Button
                            onClick={() => handleSendEmail("gmail")}
                            disabled={!emailSubject || !emailBody || saving}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Abrir en Gmail
                        </Button>
                        <Button
                            onClick={() => handleSendEmail("outlook")}
                            disabled={!emailSubject || !emailBody || saving}
                            className="bg-sky-600 hover:bg-sky-700 text-white"
                        >
                            <Mail className="h-4 w-4 mr-2" />
                            Abrir en Outlook
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Call Dialog */}
            <Dialog open={callDialog} onOpenChange={setCallDialog}>
                <DialogContent className="bg-zinc-900 border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2">
                            <Phone className="h-5 w-5 text-green-400" />
                            Llamar a {providerName}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label className="text-white/80">Teléfono</Label>
                            <Input
                                value={contactPhone || ""}
                                disabled
                                className="bg-white/5 border-white/10 text-white text-lg font-mono"
                            />
                        </div>

                        <div>
                            <Label htmlFor="callNotes" className="text-white/80">Notas de la llamada (opcional)</Label>
                            <Textarea
                                id="callNotes"
                                value={callNotes}
                                onChange={(e) => setCallNotes(e.target.value)}
                                className="bg-white/5 border-white/10 text-white resize-none"
                                rows={4}
                                placeholder="Motivo de la llamada, temas a tratar..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setCallDialog(false)}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleConfirmCall}
                            disabled={saving}
                            className="bg-green-500 hover:bg-green-600 text-white"
                        >
                            <Phone className="h-4 w-4 mr-2" />
                            Iniciar Llamada
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Note Dialog */}
            <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
                <DialogContent className="bg-zinc-900 border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-purple-400" />
                            Nota Rápida - {providerName}
                        </DialogTitle>
                    </DialogHeader>

                    <div>
                        <Textarea
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            className="bg-white/5 border-white/10 text-white resize-none"
                            rows={6}
                            placeholder="Escribe una nota sobre este proveedor..."
                            autoFocus
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setNoteDialog(false)}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSaveNote}
                            disabled={!noteContent.trim() || saving}
                            className="bg-purple-500 hover:bg-purple-600 text-white"
                        >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Guardar Nota
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reminder Dialog */}
            <Dialog open={reminderDialog} onOpenChange={setReminderDialog}>
                <DialogContent className="bg-zinc-900 border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2">
                            <Bell className="h-5 w-5 text-amber-400" />
                            Recordatorio - {providerName}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="reminderDays" className="text-white/80">Recordar en (días)</Label>
                            <Input
                                id="reminderDays"
                                type="number"
                                min="1"
                                value={reminderDays}
                                onChange={(e) => setReminderDays(e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                            />
                            <p className="text-xs text-white/40 mt-2">
                                Se creará una tarea interna y opcionalmente puedes exportarla a tu calendario.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <Label className="text-white/60 text-xs mb-3 block uppercase tracking-wider">Opciones de Calendario Externo</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCalendarExport('ics')}
                                    className="border-white/10 text-white/80 hover:bg-white/10 text-xs h-9"
                                >
                                    Archivo .ics
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCalendarExport('google')}
                                    className="border-white/10 text-white/80 hover:bg-white/10 text-xs h-9"
                                >
                                    Google
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCalendarExport('outlook')}
                                    className="border-white/10 text-white/80 hover:bg-white/10 text-xs h-9"
                                >
                                    Outlook
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setReminderDialog(false)}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSetReminder}
                            disabled={saving}
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                        >
                            <Bell className="h-4 w-4 mr-2" />
                            Crear Recordatorio
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
