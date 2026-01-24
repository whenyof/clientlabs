"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Lead } from "@prisma/client"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MoreVertical, Edit, MessageSquare, XCircle, CheckCircle, Phone, ExternalLink } from "lucide-react"
import { changeLeadStatus, addLeadNote, registerLeadCall, markLeadLost, convertLeadToClient } from "../actions"

export function LeadRowActions({ lead }: { lead: Lead }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [noteDialog, setNoteDialog] = useState(false)
    const [callDialog, setCallDialog] = useState(false)
    const [lostDialog, setLostDialog] = useState(false)
    const [note, setNote] = useState("")
    const [callNotes, setCallNotes] = useState("")
    const [lostReason, setLostReason] = useState("")

    const isReadOnly = lead.leadStatus === "CONVERTED" || lead.leadStatus === "LOST"

    const handleStatusChange = async (status: typeof lead.leadStatus) => {
        setLoading(true)
        try {
            await changeLeadStatus(lead.id, status)
            router.refresh()
            // Success feedback
            const statusLabels = {
                NEW: "Nuevo",
                CONTACTED: "Contactado",
                INTERESTED: "Interesado",
                QUALIFIED: "Cualificado",
                CONVERTED: "Convertido",
                LOST: "Perdido"
            }
            alert(`✅ Lead marcado como ${statusLabels[status]}`)
        } catch (error) {
            console.error(error)
            alert("❌ Error al cambiar estado")
        } finally {
            setLoading(false)
        }
    }

    const handleAddNote = async () => {
        if (!note.trim()) return
        setLoading(true)
        try {
            await addLeadNote(lead.id, note)
            setNote("")
            setNoteDialog(false)
            router.refresh()
            alert("✅ Nota añadida correctamente")
        } catch (error) {
            console.error(error)
            const message = error instanceof Error ? error.message : "Error al añadir nota"
            alert(`❌ ${message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleRegisterCall = async () => {
        if (!callNotes.trim()) return
        setLoading(true)
        try {
            await registerLeadCall(lead.id, callNotes)
            setCallNotes("")
            setCallDialog(false)
            router.refresh()
            alert("✅ Llamada registrada correctamente")
        } catch (error) {
            console.error(error)
            const message = error instanceof Error ? error.message : "Error al registrar llamada"
            alert(`❌ ${message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleMarkLost = async () => {
        if (!lostReason.trim()) return
        setLoading(true)
        try {
            await markLeadLost(lead.id, lostReason)
            setLostReason("")
            setLostDialog(false)
            router.refresh()
            alert("✅ Lead marcado como perdido")
        } catch (error) {
            console.error(error)
            alert("❌ Error al marcar como perdido")
        } finally {
            setLoading(false)
        }
    }

    const handleConvert = async () => {
        const confirmed = confirm(
            "⚠️ ¿Convertir este lead a cliente?\n\n" +
            "Esta acción es IRREVERSIBLE.\n" +
            "El lead quedará marcado como CONVERTIDO y no podrás modificarlo.\n\n" +
            "¿Continuar?"
        )
        if (!confirmed) return

        setLoading(true)
        try {
            const result = await convertLeadToClient(lead.id)
            router.refresh()

            if (result.clientCreated) {
                alert("✅ Lead convertido a cliente")
            } else {
                alert("✅ Lead convertido y vinculado a cliente existente")
            }
        } catch (error) {
            console.error(error)
            const message = error instanceof Error ? error.message : "Error al convertir lead"
            alert(`❌ ${message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="flex items-center justify-end gap-1">
                {/* View Client button for converted leads */}
                {lead.leadStatus === "CONVERTED" && lead.clientId && (
                    <Link href="/dashboard/other/clients">
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Ver Cliente
                        </Button>
                    </Link>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="sm"
                            variant="ghost"
                            disabled={loading}
                            className="h-8 w-8 p-0"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setNoteDialog(true)} disabled={isReadOnly}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Añadir nota
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCallDialog(true)} disabled={isReadOnly}>
                            <Phone className="mr-2 h-4 w-4" />
                            Registrar llamada
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("CONTACTED")} disabled={isReadOnly}>
                            <Edit className="mr-2 h-4 w-4" />
                            Marcar contactado
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("INTERESTED")} disabled={isReadOnly}>
                            <Edit className="mr-2 h-4 w-4" />
                            Marcar interesado
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("QUALIFIED")} disabled={isReadOnly}>
                            <Edit className="mr-2 h-4 w-4" />
                            Marcar cualificado
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleConvert} disabled={isReadOnly}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Convertir a cliente
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLostDialog(true)} disabled={isReadOnly}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Marcar perdido
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Note Dialog */}
            <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Añadir nota</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Nota</Label>
                            <Textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Escribe una nota..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNoteDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleAddNote} disabled={loading || !note.trim()}>
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Lost Dialog */}
            <Dialog open={lostDialog} onOpenChange={setLostDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Marcar como perdido</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Razón</Label>
                            <Input
                                value={lostReason}
                                onChange={(e) => setLostReason(e.target.value)}
                                placeholder="¿Por qué se perdió este lead?"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLostDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleMarkLost}
                            disabled={loading || !lostReason.trim()}
                            variant="destructive"
                        >
                            Marcar perdido
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
