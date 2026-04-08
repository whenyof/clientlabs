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
import { useLeadsOptimistic } from "../context/LeadsOptimisticContext"
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
 const { removeLead } = useLeadsOptimistic()
 const [loading, setLoading] = useState(false)

 const handleDelete = async () => {
 setLoading(true)
 try {
 await deleteLead(leadId)
 removeLead(leadId)
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
 <DialogContent className="bg-white border-[0.5px] border-slate-200 rounded-xl p-0 overflow-hidden max-w-md shadow-sm">
   {/* Header */}
   <div className="flex items-start gap-4 p-6 pb-4">
     <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
       <Trash2 className="h-4.5 w-4.5 text-red-500" style={{ width: 18, height: 18 }} />
     </div>
     <div className="flex-1 min-w-0">
       <DialogTitle className="text-[15px] font-semibold text-slate-900 leading-snug">
         {ui.deleteDialogTitle}
       </DialogTitle>
       <DialogDescription className="text-[13px] text-slate-500 mt-0.5 leading-relaxed">
         {ui.deleteDialogDescription}
       </DialogDescription>
     </div>
   </div>

   {/* Lead name card */}
   <div className="mx-6 mb-4 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
     <p className="text-[13px] text-slate-500 mb-0.5">Lead a eliminar</p>
     <p className="text-[14px] font-semibold text-slate-900">{leadName}</p>
   </div>

   {/* Warning */}
   <div className="mx-6 mb-5 flex items-start gap-2.5 px-3.5 py-3 bg-red-50 border border-red-100 rounded-xl">
     <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
     <p className="text-[12.5px] text-red-700 leading-relaxed">
       {ui.deleteDialogWarning}
     </p>
   </div>

   {/* Footer */}
   <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
     <Button
       variant="outline"
       onClick={onClose}
       disabled={loading}
       className="h-9 px-4 text-[13px] font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
     >
       {labels.common.cancel}
     </Button>
     <button
       type="button"
       onClick={handleDelete}
       disabled={loading}
       style={{
         display: "flex", alignItems: "center", gap: 6,
         height: 36, padding: "0 16px",
         fontSize: 13, fontWeight: 500,
         borderRadius: 8,
         background: loading ? "#fca5a5" : "#EF4444",
         color: "#fff",
         border: "none",
         cursor: loading ? "not-allowed" : "pointer",
         transition: "background 0.15s",
       }}
     >
       {loading ? (
         <>
           <Loader2 className="h-3.5 w-3.5 animate-spin" />
           {ui.deleteButtonLoading}
         </>
       ) : (
         <>
           <Trash2 className="h-3.5 w-3.5" />
           {ui.deleteButton}
         </>
       )}
     </button>
   </div>
 </DialogContent>
 </Dialog>
 )
}
