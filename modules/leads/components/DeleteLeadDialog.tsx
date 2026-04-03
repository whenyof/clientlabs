"use client"

import { useState } from "react"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogDescription,
 DialogFooter,
} from "@/components/ui/dialog"
import { deleteLead } from "../actions"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useSectorConfig } from "@/hooks/useSectorConfig"

type DeleteLeadDialogProps = {
 open: boolean
 onClose: () => void
 leadId: string
 leadName: string
 onDeleted?: () => void
}

export function DeleteLeadDialog({ open, onClose, leadId, leadName, onDeleted }: DeleteLeadDialogProps) {
 const { labels } = useSectorConfig()
 const ui = labels.leads.ui
 const queryClient = useQueryClient()
 const [loading, setLoading] = useState(false)

 const handleDelete = async () => {
 setLoading(true)
 try {
 await deleteLead(leadId)
 // Instantly remove from UI (mirrors providers pattern)
 window.dispatchEvent(new CustomEvent("lead-deleted", { detail: { leadId } }))
 queryClient.invalidateQueries({ queryKey: ["leads"] })
 queryClient.invalidateQueries({ queryKey: ["leads-kpis"] })
 toast.success(ui.toastDeleted)
 onClose()
 if (onDeleted) {
 onDeleted()
 }
 } catch (error: any) {
 toast.error(error.message || ui.toastErrorDelete)
 } finally {
 setLoading(false)
 }
 }

 return (
 <Dialog open={open} onOpenChange={onClose}>
 <DialogContent className="bg-zinc-900 border-[var(--border-subtle)]">
 <DialogHeader>
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--critical)]">
 <AlertTriangle className="h-5 w-5 text-[var(--critical)]" />
 </div>
 <div>
 <DialogTitle className="text-[var(--text-primary)]">{ui.deleteDialogTitle}</DialogTitle>
 <DialogDescription className="text-[var(--text-secondary)]">
 {ui.deleteDialogDescription}
 </DialogDescription>
 </div>
 </div>
 </DialogHeader>

 <div className="py-4">
 <p className="text-[var(--text-secondary)]">
 {ui.deleteDialogConfirm}{" "}
 <span className="font-semibold text-[var(--text-primary)]">{leadName}</span>
 </p>
 <p className="text-sm text-[var(--text-secondary)] mt-2">
 {ui.deleteDialogWarning}
 </p>
 </div>

 <DialogFooter>
 <Button
 variant="outline"
 onClick={onClose}
 disabled={loading}
 className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
 >
 {labels.common.cancel}
 </Button>
 <Button
 variant="destructive"
 onClick={handleDelete}
 disabled={loading}
 className="bg-[var(--bg-card)] text-[var(--critical)] hover:bg-[var(--bg-card)] border border-[var(--critical)]"
 >
 {loading ? (
 <>
 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
 {ui.deleteButtonLoading}
 </>
 ) : (
 <>
 <Trash2 className="h-4 w-4 mr-2" />
 {ui.deleteButton}
 </>
 )}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 )
}
