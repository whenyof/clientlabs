"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Client } from "@prisma/client"
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
import { MoreVertical, Edit, MessageSquare, Phone, Mail, Users } from "lucide-react"
import { updateClientInfo, addClientNote, registerClientInteraction } from "../actions"

export function ClientRowActions({ client }: { client: Client }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [editDialog, setEditDialog] = useState(false)
    const [noteDialog, setNoteDialog] = useState(false)
    const [interactionDialog, setInteractionDialog] = useState(false)

    const [editData, setEditData] = useState({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
    })
    const [note, setNote] = useState("")
    const [interactionType, setInteractionType] = useState<"CALL" | "MEETING" | "EMAIL">("CALL")
    const [interactionNotes, setInteractionNotes] = useState("")

    const handleUpdateInfo = async () => {
        setLoading(true)
        try {
            await updateClientInfo(client.id, editData)
            setEditDialog(false)
            router.refresh()
            alert("✅ Cliente actualizado correctamente")
        } catch (error) {
            console.error(error)
            const message = error instanceof Error ? error.message : "Error al actualizar cliente"
            alert(`❌ ${message}`)
        } finally {
            setLoading(false)
        }
    }



    const handleAddNote = async () => {
        if (!note.trim()) return
        setLoading(true)
        try {
            await addClientNote(client.id, note)
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

    const handleRegisterInteraction = async () => {
        if (!interactionNotes.trim()) return
        setLoading(true)
        try {
            await registerClientInteraction(client.id, interactionType, interactionNotes)
            setInteractionNotes("")
            setInteractionDialog(false)
            router.refresh()
            alert("✅ Interacción registrada correctamente")
        } catch (error) {
            console.error(error)
            const message = error instanceof Error ? error.message : "Error al registrar interacción"
            alert(`❌ ${message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="flex items-center justify-end gap-2">
                {/* Inline Quick Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {client.email && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-white/40 hover:text-blue-400 hover:bg-blue-500/10"
                            onClick={() => window.location.href = `mailto:${client.email}`}
                            title="Enviar Email"
                        >
                            <Mail className="h-4 w-4" />
                        </Button>
                    )}
                    {client.phone && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10"
                            onClick={() => window.location.href = `tel:${client.phone}`}
                            title="Llamar"
                        >
                            <Phone className="h-4 w-4" />
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-white/40 hover:text-amber-400 hover:bg-amber-500/10"
                        onClick={() => setNoteDialog(true)}
                        title="Añadir Nota"
                    >
                        <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-white/40 hover:text-violet-400 hover:bg-violet-500/10"
                        onClick={() => setInteractionDialog(true)}
                        title="Registrar Interacción"
                    >
                        <Users className="h-4 w-4" />
                    </Button>
                </div>

                {/* Secondary Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="sm"
                            variant="ghost"
                            disabled={loading}
                            className="h-8 w-8 p-0 text-white/40 hover:text-white"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
                        <DropdownMenuItem onClick={() => setEditDialog(true)} className="text-white hover:bg-white/10 cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar información
                        </DropdownMenuItem>
                        {/* Secondary items can go here if needed */}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Edit Dialog */}
            <Dialog open={editDialog} onOpenChange={setEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Cliente</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Nombre</Label>
                            <Input
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={editData.email}
                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Teléfono</Label>
                            <Input
                                value={editData.phone}
                                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                            />
                        </div>

                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleUpdateInfo} disabled={loading}>
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Note Dialog */}
            <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Añadir Nota</DialogTitle>
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

            {/* Interaction Dialog */}
            <Dialog open={interactionDialog} onOpenChange={setInteractionDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Interacción</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Tipo</Label>
                            <select
                                className="w-full rounded-md border border-white/10 bg-white/5 p-2 text-white"
                                value={interactionType}
                                onChange={(e) => setInteractionType(e.target.value as "CALL" | "MEETING" | "EMAIL")}
                            >
                                <option value="CALL">Llamada</option>
                                <option value="MEETING">Reunión</option>
                                <option value="EMAIL">Email</option>
                            </select>
                        </div>
                        <div>
                            <Label>Notas</Label>
                            <Textarea
                                value={interactionNotes}
                                onChange={(e) => setInteractionNotes(e.target.value)}
                                placeholder="Resumen de la interacción..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setInteractionDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleRegisterInteraction} disabled={loading || !interactionNotes.trim()}>
                            Registrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
