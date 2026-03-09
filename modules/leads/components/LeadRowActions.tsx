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
  MoreHorizontal,
  MessageSquare,
  Mail,
  Check,
  X,
  ExternalLink,
  Loader2,
  Trash2,
} from "lucide-react"
import { changeLeadStatus, addLeadNote, markLeadLost, convertLeadToClient } from "../actions"
import { toast } from "sonner"
import { DeleteLeadDialog } from "./DeleteLeadDialog"
import { useSectorConfig } from "@/hooks/useSectorConfig"

export function LeadRowActions({ lead }: { lead: Lead }) {
 const { labels } = useSectorConfig()
 const ui = labels.leads.ui
 const statusLabels = labels.leads.status as Record<string, string>
 const router = useRouter()
 const [loading, setLoading] = useState(false)
 const [noteDialog, setNoteDialog] = useState(false)
 const [lostDialog, setLostDialog] = useState(false)
 const [convertDialog, setConvertDialog] = useState(false)
 const [deleteDialog, setDeleteDialog] = useState(false)
 const [note, setNote] = useState("")
 const [lostReason, setLostReason] = useState("")

 const isReadOnly = lead.leadStatus === "CONVERTED" || lead.leadStatus === "LOST"

 const handleStatusChange = async (status: typeof lead.leadStatus) => {
 setLoading(true)
 try {
 await changeLeadStatus(lead.id, status)
 router.refresh()
 toast.success(`${labels.leads.singular} marcado como ${(statusLabels[status] ?? status).toLowerCase()}`)
 } catch (error) {
 console.error(error)
 toast.error(ui.toastErrorStatus)
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
 toast.success(ui.toastNoteSaved)
 } catch (error) {
 console.error(error)
 const message = error instanceof Error ? error.message : ui.toastErrorNote
 toast.error(message)
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
 toast.success(ui.toastMarkedLost)
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
 toast.success(result.clientCreated ? ui.toastConverted : ui.toastConvertedLinked)
 } catch (error) {
 console.error(error)
 const message = error instanceof Error ? error.message : ui.toastErrorConvert
 toast.error(message)
 } finally {
 setLoading(false)
 }
 }

 const iconBtn =
  "p-1.5 text-neutral-500 hover:text-neutral-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

 return (
 <>
 <div className="flex items-center gap-3 ml-auto">
 {lead.leadStatus === "CONVERTED" && lead.clientId && (
 <Link
 href="/dashboard/clients"
 className="p-1.5 text-neutral-500 hover:text-neutral-900 transition-colors"
 title={ui.viewClient}
 >
 <ExternalLink className="h-4 w-4" />
 </Link>
 )}

 {!isReadOnly && (
         <>
         <Button
         type="button"
         variant="outline"
         size="sm"
         onClick={() => setNoteDialog(true)}
         disabled={loading}
         className={iconBtn}
         title={ui.addNote}
         >
         {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
         </Button>
         <Button
         type="button"
         variant="outline"
         size="sm"
         onClick={handleEmailClick}
         disabled={!lead.email}
         className={iconBtn}
         title={lead.email ? `${ui.sendEmail} ${lead.email}` : ui.noEmail}
         >
         <Mail className="h-4 w-4" />
         </Button>
         <Button
         type="button"
         variant="outline"
         size="sm"
         onClick={() => setConvertDialog(true)}
         disabled={loading}
         className={iconBtn}
         title={ui.convertToClientShort}
         >
         {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
         </Button>
         <Button
         type="button"
         variant="outline"
         size="sm"
         onClick={() => setLostDialog(true)}
         disabled={loading}
         className={iconBtn}
         title={ui.markLostShort}
         >
         {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
         </Button>
         </>
 )}

 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button type="button" variant="outline" size="sm" disabled={loading} className={iconBtn}>
 <MoreHorizontal className="h-4 w-4" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" sideOffset={6} className="w-48 bg-white border border-neutral-200 shadow-lg">
 <DropdownMenuLabel className="text-xs text-[var(--text-secondary)]">{ui.changeStatus}</DropdownMenuLabel>
 <DropdownMenuSeparator />
 <DropdownMenuItem onClick={() => handleStatusChange("NEW")} disabled={isReadOnly}>
 {ui.markAs} {statusLabels.NEW}
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => handleStatusChange("CONTACTED")} disabled={isReadOnly}>
 {ui.markAs} {statusLabels.CONTACTED}
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => handleStatusChange("INTERESTED")} disabled={isReadOnly}>
 {ui.markAs} {statusLabels.INTERESTED}
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => handleStatusChange("QUALIFIED")} disabled={isReadOnly}>
 {ui.markAs} {statusLabels.QUALIFIED}
 </DropdownMenuItem>
 <DropdownMenuSeparator />
 <DropdownMenuItem
 onClick={() => setDeleteDialog(true)}
 disabled={lead.leadStatus === "CONVERTED"}
 className="text-[var(--critical)] hover:bg-[var(--bg-card)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <Trash2 className="h-4 w-4 mr-2" />
 {ui.deleteLead}
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>

 {/* Note Dialog */}
 <Dialog open={noteDialog} onOpenChange={setNoteDialog}>
 <DialogContent className="bg-zinc-900 border-[var(--border-subtle)]">
 <DialogHeader>
 <DialogTitle className="text-[var(--text-primary)]">{ui.addNote}</DialogTitle>
 </DialogHeader>
 <div className="space-y-4">
 <div>
 <Label className="text-[var(--text-secondary)]">{ui.noteLabel}</Label>
 <Textarea
 value={note}
 onChange={(e) => setNote(e.target.value)}
 placeholder={ui.notePlaceholder}
 rows={4}
 className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] mt-2"
 />
 </div>
 </div>
 <DialogFooter>
 <Button variant="outline" onClick={() => setNoteDialog(false)}>
 {labels.common.cancel}
 </Button>
 <Button
 onClick={handleAddNote}
 disabled={loading || !note.trim()}
 className="bg-[var(--bg-card)] border-blue-500/30 text-[var(--accent)] hover:bg-[var(--bg-card)]"
 >
 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 {labels.common.save}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>

 {/* Lost Dialog */}
 <Dialog open={lostDialog} onOpenChange={setLostDialog}>
 <DialogContent className="bg-zinc-900 border-[var(--border-subtle)]">
 <DialogHeader>
 <DialogTitle className="text-[var(--text-primary)]">{ui.lostDialogTitle}</DialogTitle>
 </DialogHeader>
 <div className="space-y-4">
 <div>
 <Label className="text-[var(--text-secondary)]">{ui.reason}</Label>
 <Input
 value={lostReason}
 onChange={(e) => setLostReason(e.target.value)}
 placeholder={ui.lostReasonPlaceholder}
 className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] mt-2"
 />
 </div>
 </div>
 <DialogFooter>
 <Button variant="outline" onClick={() => setLostDialog(false)}>
 {labels.common.cancel}
 </Button>
 <Button
 onClick={handleMarkLost}
 disabled={loading || !lostReason.trim()}
 className="bg-[var(--bg-card)] border-[var(--critical)] text-[var(--critical)] hover:bg-[var(--bg-card)]"
 >
 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 {ui.markLostShort}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>

 {/* Convert Confirmation Dialog */}
 <Dialog open={convertDialog} onOpenChange={setConvertDialog}>
 <DialogContent className="bg-zinc-900 border-[var(--border-subtle)]">
 <DialogHeader>
 <DialogTitle className="text-[var(--text-primary)] text-xl">{ui.convertDialogTitle}</DialogTitle>
 </DialogHeader>
 <div className="space-y-4">
 <div className="p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)]">
 <p className="text-sm text-[var(--text-secondary)] font-medium mb-2">⚠️ {ui.convertIrreversible}</p>
 <ul className="text-xs text-[var(--text-secondary)] space-y-1">
 <li>• {ui.convertBullet1}</li>
 <li>• {ui.convertBullet2}</li>
 <li>• {ui.convertBullet3}</li>
 </ul>
 </div>
 <div className="p-3 rounded-lg bg-[var(--bg-card)]">
 <p className="text-sm text-[var(--text-secondary)]"><strong>{labels.leads.singular}:</strong> {lead.name}</p>
 <p className="text-xs text-[var(--text-secondary)]">{lead.email}</p>
 </div>
 </div>
 <DialogFooter>
 <Button variant="outline" onClick={() => setConvertDialog(false)}>
 {labels.common.cancel}
 </Button>
 <Button
 onClick={handleConvert}
 disabled={loading}
 className="bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-soft)]"
 >
 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 {ui.confirmConvert}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>

 {/* Delete Dialog */}
 <DeleteLeadDialog
 open={deleteDialog}
 onClose={() => setDeleteDialog(false)}
 leadId={lead.id}
 leadName={lead.name || "Sin nombre"}
 onDeleted={() => router.refresh()}
 />
 </>
 )
}
