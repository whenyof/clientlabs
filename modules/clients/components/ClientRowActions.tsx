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
import { MoreVertical, Edit, MessageSquare, Phone, Mail, Users, Star } from "lucide-react"
import { updateClientInfo, addClientNote, registerClientInteraction } from "../actions"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { toast } from "sonner"

export function ClientRowActions({ client }: { client: Client }) {
 const { labels } = useSectorConfig()
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
 const result = await updateClientInfo(client.id, editData)
 if (!result.success) {
 toast.error((result as any).error || "Error al actualizar " + labels.clients.singular.toLowerCase())
 return
 }
 setEditDialog(false)
 router.refresh()
 toast.success(labels.clients.singular + " actualizado correctamente")
 } catch (error) {
 console.error(error)
 toast.error("Error al actualizar " + labels.clients.singular.toLowerCase())
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
 toast.success("Nota añadida correctamente")
 } catch (error) {
 console.error(error)
 const message = error instanceof Error ? error.message : "Error al añadir nota"
 toast.error(message)
 } finally {
 setLoading(false)
 }
 }

 const handleToggleVip = async () => {
   const isCurrentlyVip = client.status === "VIP"
   try {
     const res = await fetch(`/api/clients/${client.id}`, {
       method: "PATCH",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         isVip: !isCurrentlyVip,
         status: isCurrentlyVip ? "ACTIVE" : "VIP",
       }),
     })
     if (!res.ok) throw new Error()
     toast.success(isCurrentlyVip ? "Cliente ya no es VIP" : "Cliente marcado como VIP")
     router.refresh()
   } catch {
     toast.error("Error al actualizar")
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
 toast.success("Interacción registrada correctamente")
 } catch (error) {
 console.error(error)
 const message = error instanceof Error ? error.message : "Error al registrar interacción"
 toast.error(message)
 } finally {
 setLoading(false)
 }
 }

 return (
 <>
 <div className="flex items-center justify-end gap-2">
 {/* Inline Quick Actions - always visible */}
 <div className="flex items-center gap-1 text-neutral-400">
 {client.email && (
 <Button
 size="sm"
 variant="ghost"
 className="h-8 w-8 p-0 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-card)]"
 onClick={() => window.location.href = `mailto:${client.email}`}
 title="Enviar email"
 >
 <Mail className="h-4 w-4" />
 </Button>
 )}
 {client.phone && (
 <Button
 size="sm"
 variant="ghost"
 className="h-8 w-8 p-0 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]"
 onClick={() => window.location.href = `tel:${client.phone}`}
 title="Llamar"
 >
 <Phone className="h-4 w-4" />
 </Button>
 )}
 <Button
 size="sm"
 variant="ghost"
 className="h-8 w-8 p-0 text-[var(--text-secondary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card)]"
 onClick={() => setNoteDialog(true)}
 title="Crear nota"
 >
 <MessageSquare className="h-4 w-4" />
 </Button>
 <Button
 size="sm"
 variant="ghost"
 className="h-8 w-8 p-0 text-[var(--text-secondary)] hover:text-emerald-400 hover:bg-emerald-500/10"
 onClick={() => setInteractionDialog(true)}
 title="Asignar tarea"
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
 className="h-8 w-8 p-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
 title="Más acciones"
 >
 <MoreVertical className="h-4 w-4" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="bg-white border-slate-200 shadow-lg shadow-slate-200/50 rounded-xl py-1 min-w-[170px]">
 <DropdownMenuItem onClick={() => setEditDialog(true)} className="text-slate-700 hover:bg-slate-50 cursor-pointer text-[12px] font-medium">
 <Edit className="mr-2 h-3.5 w-3.5" />
 {labels.common.edit} {labels.clients.singular.toLowerCase()}
 </DropdownMenuItem>
 <DropdownMenuItem
   onClick={handleToggleVip}
   className="cursor-pointer text-[12px] font-medium text-amber-600 hover:bg-amber-50 focus:bg-amber-50 focus:text-amber-600"
 >
   <Star className={`mr-2 h-3.5 w-3.5 ${client.status === "VIP" ? "fill-amber-400 text-amber-400" : "text-amber-400"}`} />
   {client.status === "VIP" ? "Quitar VIP" : "Marcar como VIP"}
 </DropdownMenuItem>
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
 className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2 text-[var(--text-primary)]"
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
