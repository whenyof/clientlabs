"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Loader2, Trash2, CheckCircle, XCircle, Flame, Tag } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { changeLeadStatus, changeLeadTemperature, addLeadTag, markLeadLost, convertLeadToClient } from "../actions"
import type { LeadStatus, LeadTemp } from "@prisma/client"

type BatchActionBarProps = {
 selectedLeads: string[]
 onClearSelection: () => void
 leadsData: Array<{ id: string; leadStatus: LeadStatus }>
}

export function BatchActionBar({ selectedLeads, onClearSelection, leadsData }: BatchActionBarProps) {
 const router = useRouter()
 const [loading, setLoading] = useState(false)
 const [statusDialog, setStatusDialog] = useState(false)
 const [tempDialog, setTempDialog] = useState(false)
 const [tagDialog, setTagDialog] = useState(false)
 const [lostDialog, setLostDialog] = useState(false)
 const [convertDialog, setConvertDialog] = useState(false)
 const [deleteDialog, setDeleteDialog] = useState(false)

 const [newStatus, setNewStatus] = useState<LeadStatus>("CONTACTED")
 const [newTemp, setNewTemp] = useState<LeadTemp>("WARM")
 const [newTag, setNewTag] = useState("")
 const [lostReason, setLostReason] = useState("")

 // Filter out CONVERTED/LOST for certain actions
 const editableLeads = leadsData.filter(
 (l) => selectedLeads.includes(l.id) && l.leadStatus !== "CONVERTED" && l.leadStatus !== "LOST"
 )

 const handleBatchStatusChange = async () => {
 setLoading(true)
 let updated = 0
 let ignored = 0

 try {
 for (const leadId of editableLeads.map(l => l.id)) {
 try {
 await changeLeadStatus(leadId, newStatus)
 updated++
 } catch {
 ignored++
 }
 }

 setStatusDialog(false)
 onClearSelection()
 router.refresh()
 toast.success(`${updated} leads actualizados${ignored > 0 ? ` · ${ignored} ignorados` : ""}`)
 } catch (error) {
 toast.error("Error al actualizar leads")
 } finally {
 setLoading(false)
 }
 }

 const handleBatchTempChange = async () => {
 setLoading(true)
 let updated = 0
 let ignored = 0

 try {
 for (const leadId of editableLeads.map(l => l.id)) {
 try {
 await changeLeadTemperature(leadId, newTemp)
 updated++
 } catch {
 ignored++
 }
 }

 setTempDialog(false)
 onClearSelection()
 router.refresh()
 toast.success(`${updated} leads actualizados${ignored > 0 ? ` · ${ignored} ignorados` : ""}`)
 } catch (error) {
 toast.error("Error al actualizar temperatura")
 } finally {
 setLoading(false)
 }
 }

 const handleBatchTagAdd = async () => {
 if (!newTag.trim()) return

 setLoading(true)
 let updated = 0
 let ignored = 0

 try {
 for (const leadId of selectedLeads) {
 try {
 await addLeadTag(leadId, newTag.trim())
 updated++
 } catch {
 ignored++
 }
 }

 setTagDialog(false)
 setNewTag("")
 onClearSelection()
 router.refresh()
 toast.success(`Tag añadido a ${updated} leads${ignored > 0 ? ` · ${ignored} ya lo tenían` : ""}`)
 } catch (error) {
 toast.error("Error al añadir tags")
 } finally {
 setLoading(false)
 }
 }

 const handleBatchMarkLost = async () => {
 setLoading(true)
 let updated = 0
 let ignored = 0

 try {
 for (const leadId of editableLeads.map(l => l.id)) {
 try {
 await markLeadLost(leadId, lostReason || "Marcado como perdido en batch")
 updated++
 } catch {
 ignored++
 }
 }

 setLostDialog(false)
 setLostReason("")
 onClearSelection()
 router.refresh()
 toast.success(`${updated} leads marcados como perdidos${ignored > 0 ? ` · ${ignored} ignorados` : ""}`)
 } catch (error) {
 toast.error("Error al marcar leads")
 } finally {
 setLoading(false)
 }
 }

 const handleBatchConvert = async () => {
 setLoading(true)
 let created = 0
 let linked = 0
 let ignored = 0

 try {
 for (const leadId of editableLeads.map(l => l.id)) {
 try {
 const result = await convertLeadToClient(leadId)
 if (result.clientCreated) created++
 else linked++
 } catch {
 ignored++
 }
 }

 setConvertDialog(false)
 onClearSelection()
 router.refresh()
 toast.success(`${created} clientes creados · ${linked} leads vinculados${ignored > 0 ? ` · ${ignored} ignorados` : ""}`)
 } catch (error) {
 toast.error("Error al convertir leads")
 } finally {
 setLoading(false)
 }
 }

 if (selectedLeads.length === 0) return null

 return (
 <>
 {/* Batch Action Bar */}
 <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in- duration-200">
 <div className="bg-zinc-900 border border-[var(--border-subtle)] rounded-xl shadow-sm p-4 backdrop-">
 <div className="flex items-center gap-4">
 {/* Selection Count */}
 <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-card)] rounded-lg">
 <CheckCircle className="h-4 w-4 text-green-400" />
 <span className="text-[var(--text-primary)] font-medium">{selectedLeads.length} seleccionados</span>
 </div>

 {/* Actions */}
 <div className="flex items-center gap-2">
 <Button
 onClick={() => setStatusDialog(true)}
 size="sm"
 variant="outline"
 className="bg-[var(--bg-card)] border-blue-500/30 text-[var(--accent)] hover:bg-[var(--bg-card)]"
 disabled={editableLeads.length === 0}
 >
 Cambiar estado
 </Button>

 <Button
 onClick={() => setTempDialog(true)}
 size="sm"
 variant="outline"
 className="bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
 disabled={editableLeads.length === 0}
 >
 <Flame className="h-4 w-4 mr-1" />
 Temperatura
 </Button>

 <Button
 onClick={() => setTagDialog(true)}
 size="sm"
 variant="outline"
 className="bg-[var(--accent-soft)]-primary/15 border-[var(--accent)]-primary/30 text-[var(--accent)]-hover hover:bg-[var(--accent-soft)]-primary/20"
 >
 <Tag className="h-4 w-4 mr-1" />
 Añadir tag
 </Button>

 <Button
 onClick={() => setLostDialog(true)}
 size="sm"
 variant="outline"
 className="bg-[var(--bg-card)] border-[var(--critical)] text-[var(--critical)] hover:bg-[var(--bg-card)]"
 disabled={editableLeads.length === 0}
 >
 <XCircle className="h-4 w-4 mr-1" />
 Marcar perdidos
 </Button>

 <Button
 onClick={() => setConvertDialog(true)}
 size="sm"
 variant="outline"
 className="bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-soft)]"
 disabled={editableLeads.length === 0}
 >
 <CheckCircle className="h-4 w-4 mr-1" />
 Convertir
 </Button>
 </div>

 {/* Clear Selection */}
 <Button
 onClick={onClearSelection}
 size="sm"
 variant="ghost"
 className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
 >
 <X className="h-4 w-4 mr-1" />
 Limpiar
 </Button>
 </div>
 </div>
 </div>

 {/* Status Dialog */}
 <Dialog open={statusDialog} onOpenChange={setStatusDialog}>
 <DialogContent className="bg-zinc-900 border-[var(--border-subtle)]">
 <DialogHeader>
 <DialogTitle className="text-[var(--text-primary)]">Cambiar estado</DialogTitle>
 <DialogDescription className="text-[var(--text-secondary)]">
 {editableLeads.length} leads serán actualizados
 </DialogDescription>
 </DialogHeader>
 <div className="space-y-4">
 <div>
 <Label className="text-[var(--text-secondary)]">Nuevo estado</Label>
 <Select value={newStatus} onValueChange={(v) => setNewStatus(v as LeadStatus)}>
 <SelectTrigger className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)]">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="NEW">Nuevo</SelectItem>
 <SelectItem value="CONTACTED">Contactado</SelectItem>
 <SelectItem value="INTERESTED">Interesado</SelectItem>
 <SelectItem value="QUALIFIED">Cualificado</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 <DialogFooter>
 <Button variant="outline" onClick={() => setStatusDialog(false)}>Cancelar</Button>
 <Button onClick={handleBatchStatusChange} disabled={loading}>
 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 Actualizar
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>

 {/* Temperature Dialog */}
 <Dialog open={tempDialog} onOpenChange={setTempDialog}>
 <DialogContent className="bg-zinc-900 border-[var(--border-subtle)]">
 <DialogHeader>
 <DialogTitle className="text-[var(--text-primary)]">Cambiar temperatura</DialogTitle>
 <DialogDescription className="text-[var(--text-secondary)]">
 {editableLeads.length} leads serán actualizados
 </DialogDescription>
 </DialogHeader>
 <div className="space-y-4">
 <div>
 <Label className="text-[var(--text-secondary)]">Nueva temperatura</Label>
 <Select value={newTemp} onValueChange={(v) => setNewTemp(v as LeadTemp)}>
 <SelectTrigger className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)]">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="HOT">🔥 HOT</SelectItem>
 <SelectItem value="WARM">🌤️ WARM</SelectItem>
 <SelectItem value="COLD">❄️ COLD</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 <DialogFooter>
 <Button variant="outline" onClick={() => setTempDialog(false)}>Cancelar</Button>
 <Button onClick={handleBatchTempChange} disabled={loading}>
 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 Actualizar
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>

 {/* Tag Dialog */}
 <Dialog open={tagDialog} onOpenChange={setTagDialog}>
 <DialogContent className="bg-zinc-900 border-[var(--border-subtle)]">
 <DialogHeader>
 <DialogTitle className="text-[var(--text-primary)]">Añadir tag</DialogTitle>
 <DialogDescription className="text-[var(--text-secondary)]">
 Se añadirá a {selectedLeads.length} leads
 </DialogDescription>
 </DialogHeader>
 <div className="space-y-4">
 <div>
 <Label className="text-[var(--text-secondary)]">Tag</Label>
 <Input
 value={newTag}
 onChange={(e) => setNewTag(e.target.value)}
 placeholder="Ej: campaña-2024"
 className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)]"
 onKeyDown={(e) => e.key === "Enter" && handleBatchTagAdd()}
 />
 </div>
 </div>
 <DialogFooter>
 <Button variant="outline" onClick={() => setTagDialog(false)}>Cancelar</Button>
 <Button onClick={handleBatchTagAdd} disabled={loading || !newTag.trim()}>
 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 Añadir
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>

 {/* Lost Dialog */}
 <Dialog open={lostDialog} onOpenChange={setLostDialog}>
 <DialogContent className="bg-zinc-900 border-[var(--border-subtle)]">
 <DialogHeader>
 <DialogTitle className="text-[var(--text-primary)]">Marcar como perdidos</DialogTitle>
 <DialogDescription className="text-[var(--text-secondary)]">
 {editableLeads.length} leads serán marcados como perdidos
 </DialogDescription>
 </DialogHeader>
 <div className="space-y-4">
 <div>
 <Label className="text-[var(--text-secondary)]">Razón (opcional)</Label>
 <Input
 value={lostReason}
 onChange={(e) => setLostReason(e.target.value)}
 placeholder="Ej: No responde"
 className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)]"
 />
 </div>
 </div>
 <DialogFooter>
 <Button variant="outline" onClick={() => setLostDialog(false)}>Cancelar</Button>
 <Button onClick={handleBatchMarkLost} disabled={loading} className="bg-[var(--bg-card)] text-[var(--critical)]">
 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 Marcar perdidos
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>

 {/* Convert Dialog */}
 <Dialog open={convertDialog} onOpenChange={setConvertDialog}>
 <DialogContent className="bg-zinc-900 border-[var(--border-subtle)]">
 <DialogHeader>
 <DialogTitle className="text-[var(--text-primary)]">Convertir a clientes</DialogTitle>
 <DialogDescription className="text-[var(--text-secondary)]">
 {editableLeads.length} leads serán convertidos a clientes
 </DialogDescription>
 </DialogHeader>
 <div className="p-4 bg-[var(--accent-soft)] border border-[var(--accent)] rounded-lg">
 <p className="text-sm text-[var(--accent)]">
 Se crearán clientes automáticamente. Si ya existe un cliente con el mismo email, se vinculará el lead.
 </p>
 </div>
 <DialogFooter>
 <Button variant="outline" onClick={() => setConvertDialog(false)}>Cancelar</Button>
 <Button onClick={handleBatchConvert} disabled={loading} className="bg-[var(--accent-soft)] text-[var(--accent)]">
 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 Convertir
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </>
 )
}
