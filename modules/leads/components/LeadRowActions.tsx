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
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { DeleteLeadDialog } from "./DeleteLeadDialog"
import { useSectorConfig } from "@/hooks/useSectorConfig"

export function LeadRowActions({ lead }: { lead: Lead }) {
 const { labels } = useSectorConfig()
 const ui = labels.leads.ui
 const statusLabels = labels.leads.status as Record<string, string>
 const router = useRouter()
 const queryClient = useQueryClient()
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
   queryClient.setQueriesData(
     { queryKey: ["leads"] },
     (old: any) => {
       if (!old?.pages) return old
       return {
         ...old,
         pages: old.pages.map((page: any) => ({
           ...page,
           leads: page.leads.map((l: any) =>
             l.id === lead.id ? { ...l, leadStatus: status } : l
           )
         }))
       }
     }
   )
   const result = await changeLeadStatus(lead.id, status)
   if (result.success) {
     toast.success(`${labels.leads.singular} marcado como ${(statusLabels[status] ?? status).toLowerCase()}`)
   } else {
     toast.error(result.error ?? ui.toastErrorStatus)
   }
   queryClient.invalidateQueries({ queryKey: ["leads"] })
   queryClient.invalidateQueries({ queryKey: ["leads-kpis"] })
 } catch {
   queryClient.invalidateQueries({ queryKey: ["leads"] })
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
   queryClient.setQueriesData(
     { queryKey: ["leads"] },
     (old: any) => {
       if (!old?.pages) return old
       return {
         ...old,
         pages: old.pages.map((page: any) => ({
           ...page,
           leads: page.leads.map((l: any) =>
             l.id === lead.id ? { ...l, leadStatus: "LOST" } : l
           )
         }))
       }
     }
   )
   await markLeadLost(lead.id, lostReason)
   setLostReason("")
   setLostDialog(false)
   toast.success(ui.toastMarkedLost)
   queryClient.invalidateQueries({ queryKey: ["leads"] })
   queryClient.invalidateQueries({ queryKey: ["leads-kpis"] })
 } catch (error) {
   console.error(error)
   queryClient.invalidateQueries({ queryKey: ["leads"] })
   toast.error(ui.toastErrorConvert)
 } finally {
   setLoading(false)
 }
 }

 const handleConvert = async () => {
 setLoading(true)
 try {
   // Optimistic update — quitar de la lista
   queryClient.setQueriesData(
     { queryKey: ["leads"] },
     (old: any) => {
       if (!old?.pages) return old
       return {
         ...old,
         pages: old.pages.map((page: any) => ({
           ...page,
           leads: page.leads.filter(
             (l: any) => l.id !== lead.id
           )
         }))
       }
     }
   )
   const result = await convertLeadToClient(lead.id)
   setConvertDialog(false)
   toast.success(result.clientCreated ? ui.toastConverted : ui.toastConvertedLinked)
   queryClient.invalidateQueries({ queryKey: ["leads"] })
   queryClient.invalidateQueries({ queryKey: ["leads-kpis"] })
 } catch (error) {
   console.error(error)
   queryClient.invalidateQueries({ queryKey: ["leads"] })
   const message = error instanceof Error ? error.message : ui.toastErrorConvert
   toast.error(message)
 } finally {
   setLoading(false)
 }
 }

 const iconBtn =
  "flex items-center justify-center w-[26px] h-[26px] rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

 return (
 <>
 <div className="flex items-center gap-1 ml-auto">
 {lead.leadStatus === "CONVERTED" && lead.clientId && (
 <Link
 href="/dashboard/clients"
 className={iconBtn}
 style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}
 title={ui.viewClient}
 >
 <ExternalLink className="h-3.5 w-3.5" />
 </Link>
 )}

 {!isReadOnly && (
         <>
         <button
         type="button"
         onClick={() => setNoteDialog(true)}
         disabled={loading}
         className={iconBtn}
         style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "transparent" }}
         title="Nota"
         >
         {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageSquare className="h-3.5 w-3.5" />}
         </button>
         <button
         type="button"
         onClick={handleEmailClick}
         disabled={!lead.email}
         className={iconBtn}
         style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "transparent" }}
         title="Email"
         >
         <Mail className="h-3.5 w-3.5" />
         </button>
         <button
         type="button"
         onClick={() => setConvertDialog(true)}
         disabled={loading}
         className={iconBtn}
         style={{ borderColor: "var(--border-subtle)", color: "var(--text-secondary)", background: "transparent" }}
         title="Convertir en cliente"
         >
         {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
         </button>
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
 <DialogContent className="bg-[var(--color-background-primary,#fff)] border-[var(--border-subtle)]">
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
 <DialogContent className="bg-[var(--color-background-primary,#fff)] border-[var(--border-subtle)]">
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
 <DialogContent className="bg-[var(--color-background-primary,#fff)] border-[var(--border-subtle)]">
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
