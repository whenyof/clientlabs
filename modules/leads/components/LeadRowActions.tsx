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
  UserCheck,
  AlertTriangle,
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
 <DialogContent className="bg-white border-[0.5px] border-slate-200 rounded-xl p-0 overflow-hidden max-w-md shadow-sm">
   {/* Header */}
   <div className="flex items-start gap-4 p-6 pb-4">
     <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center">
       <X style={{ width: 18, height: 18 }} className="text-amber-500" />
     </div>
     <div className="flex-1 min-w-0">
       <DialogTitle className="text-[15px] font-semibold text-slate-900 leading-snug">
         {ui.lostDialogTitle}
       </DialogTitle>
       <p className="text-[13px] text-slate-500 mt-0.5">
         {lead.name || lead.email || labels.leads.singular}
       </p>
     </div>
   </div>

   {/* Reason input */}
   <div className="px-6 pb-5">
     <Label className="text-[12px] font-medium text-slate-600 uppercase tracking-wide">
       {ui.reason}
     </Label>
     <Input
       value={lostReason}
       onChange={(e) => setLostReason(e.target.value)}
       placeholder={ui.lostReasonPlaceholder}
       className="mt-2 h-10 bg-slate-50 border-slate-200 text-[13px] text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-amber-400 focus-visible:border-amber-400"
       onKeyDown={(e) => { if (e.key === "Enter" && lostReason.trim()) handleMarkLost() }}
     />
   </div>

   {/* Footer */}
   <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
     <Button
       variant="outline"
       onClick={() => setLostDialog(false)}
       className="h-9 px-4 text-[13px] font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
     >
       {labels.common.cancel}
     </Button>
     <button
       type="button"
       onClick={handleMarkLost}
       disabled={loading || !lostReason.trim()}
       style={{
         display: "flex", alignItems: "center", gap: 6,
         height: 36, padding: "0 16px",
         fontSize: 13, fontWeight: 500,
         borderRadius: 8,
         background: loading || !lostReason.trim() ? "#fbbf24" : "#D97706",
         color: "#fff",
         border: "none",
         cursor: loading || !lostReason.trim() ? "not-allowed" : "pointer",
         opacity: !lostReason.trim() ? 0.55 : 1,
         transition: "all 0.15s",
       }}
     >
       {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
       {ui.markLostShort}
     </button>
   </div>
 </DialogContent>
 </Dialog>

 {/* Convert Confirmation Dialog */}
 <Dialog open={convertDialog} onOpenChange={setConvertDialog}>
 <DialogContent className="bg-white border-[0.5px] border-slate-200 rounded-xl p-0 overflow-hidden max-w-md shadow-sm">
   {/* Header */}
   <div className="flex items-start gap-4 p-6 pb-4">
     <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#E6F6F1] border border-[#9FE1CB] flex items-center justify-center">
       <UserCheck style={{ width: 18, height: 18, color: "#1FA97A" }} />
     </div>
     <div className="flex-1 min-w-0">
       <DialogTitle className="text-[15px] font-semibold text-slate-900 leading-snug">
         {ui.convertDialogTitle}
       </DialogTitle>
       <p className="text-[13px] text-slate-500 mt-0.5">
         {ui.convertIrreversible}
       </p>
     </div>
   </div>

   {/* Lead info card */}
   <div className="mx-6 mb-4 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
     <p className="text-[14px] font-semibold text-slate-900">{lead.name || labels.leads.singular}</p>
     {lead.email && <p className="text-[12px] text-slate-500 mt-0.5">{lead.email}</p>}
   </div>

   {/* What happens */}
   <div className="mx-6 mb-5 space-y-2">
     {[ui.convertBullet1, ui.convertBullet2, ui.convertBullet3].map((bullet, i) => (
       <div key={i} className="flex items-start gap-2.5">
         <div className="flex-shrink-0 w-4 h-4 rounded-full bg-[#E6F6F1] border border-[#9FE1CB] flex items-center justify-center mt-0.5">
           <Check style={{ width: 9, height: 9, color: "#1FA97A" }} />
         </div>
         <p className="text-[12.5px] text-slate-600 leading-relaxed">{bullet}</p>
       </div>
     ))}
   </div>

   {/* Footer */}
   <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
     <Button
       variant="outline"
       onClick={() => setConvertDialog(false)}
       className="h-9 px-4 text-[13px] font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
     >
       {labels.common.cancel}
     </Button>
     <button
       type="button"
       onClick={handleConvert}
       disabled={loading}
       style={{
         display: "flex", alignItems: "center", gap: 6,
         height: 36, padding: "0 16px",
         fontSize: 13, fontWeight: 500,
         borderRadius: 8,
         background: loading ? "#9FE1CB" : "#1FA97A",
         color: "#fff",
         border: "none",
         cursor: loading ? "not-allowed" : "pointer",
         transition: "background 0.15s",
       }}
     >
       {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
       {ui.confirmConvert}
     </button>
   </div>
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
