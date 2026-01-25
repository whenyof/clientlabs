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
    DropdownMenuSeparator,
    DropdownMenuLabel,
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
import {
    MoreVertical,
    MessageSquare,
    XCircle,
    CheckCircle,
    Phone,
    ExternalLink,
    Loader2
} from "lucide-react"
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
            <div className="flex items-center justify-end gap-1.5">
                {/* View Client button for converted leads */}
                {lead.leadStatus === "CONVERTED" && lead.clientId && (
                    <Link href="/dashboard/other/clients">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-9 text-xs gap-1.5 bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Ver Cliente
                        </Button>
                    </Link>
                )}

                {/* Quick Action Buttons */}
                {!isReadOnly && (
                    <>
                        {/* Add Note - Gray */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setNoteDialog(true)}
                            disabled={loading}
                            className="h-9 w-9 p-0 bg-white/5 border-white/20 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all"
                            title="Añadir nota"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                        </Button>

                        {/* Register Call - Blue */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCallDialog(true)}
                            disabled={loading}
                            className="h-9 w-9 p-0 bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all"
                            title="Registrar llamada"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
                        </Button>

                        {/* Convert to Client - Green */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleConvert}
                            disabled={loading}
                            className="h-9 w-9 p-0 bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/50 transition-all"
                            title="Convertir a cliente"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>

                        {/* Mark Lost - Red Outline */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setLostDialog(true)}
                            disabled={loading}
                            className="h-9 w-9 p-0 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
                            title="Marcar perdido"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                        </Button>
                    </>
                )}

                {/* More Actions Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="sm"
                            variant="ghost"
                            disabled={loading}
                            className="h-9 w-9 p-0 hover:bg-white/10 transition-all"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-xs text-white/60">Cambiar estado</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusChange("NEW")} disabled={isReadOnly}>
                            Marcar como Nuevo
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("CONTACTED")} disabled={isReadOnly}>
                            Marcar como Contactado
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("INTERESTED")} disabled={isReadOnly}>
                            Marcar como Interesado
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("QUALIFIED")} disabled={isReadOnly}>
                            Marcar como Cualificado
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Note Dialog */}
            <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
                <DialogContent className="bg-zinc-900 border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white">Añadir nota</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-white/80">Nota</Label>
                            <Textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Escribe una nota..."
                                rows={4}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 mt-2"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNoteDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleAddNote}
                            disabled={loading || !note.trim()}
                            className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Call Dialog */}
            <Dialog open={callDialog} onOpenChange={setCallDialog}>
                <DialogContent className="bg-zinc-900 border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white">Registrar llamada</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-white/80">Notas de la llamada</Label>
                            <Textarea
                                value={callNotes}
                                onChange={(e) => setCallNotes(e.target.value)}
                                placeholder="¿Qué se discutió en la llamada?"
                                rows={4}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 mt-2"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCallDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleRegisterCall}
                            disabled={loading || !callNotes.trim()}
                            className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Registrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Lost Dialog */}
            <Dialog open={lostDialog} onOpenChange={setLostDialog}>
                <DialogContent className="bg-zinc-900 border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-white">Marcar como perdido</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-white/80">Razón</Label>
                            <Input
                                value={lostReason}
                                onChange={(e) => setLostReason(e.target.value)}
                                placeholder="¿Por qué se perdió este lead?"
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 mt-2"
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
                            className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Marcar perdido
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
