"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { toast } from "sonner"
import { addProviderNote } from "../actions"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { useSectorConfig } from "@/hooks/useSectorConfig"

type AddNoteDialogProps = {
 providerId: string
 providerName: string
 open: boolean
 onOpenChange: (open: boolean) => void
 onSuccess?: () => void
}

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] text-slate-900 placeholder:text-slate-400 bg-slate-50 focus:bg-white focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 outline-none transition-all"
const labelClass = "text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500"

export function AddNoteDialog({ providerId, providerName, open, onOpenChange, onSuccess }: AddNoteDialogProps) {
 const { labels } = useSectorConfig()
 const [loading, setLoading] = useState(false)
 const [content, setContent] = useState("")
 const router = useRouter()

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!content.trim()) {
   toast.error("La nota no puede estar vacía")
   return
  }
  setLoading(true)
  try {
   const result = await addProviderNote(providerId, content)
   if (result.success) {
    toast.success(labels.common.success)
    onOpenChange(false)
    router.refresh()
    if (onSuccess) onSuccess()
    setContent("")
   } else {
    toast.error(result.error || labels.common.error)
   }
  } catch {
   toast.error(labels.common.error)
  } finally {
   setLoading(false)
  }
 }

 return (
  <Dialog open={open} onOpenChange={onOpenChange}>
   <DialogContent className="bg-white rounded-2xl p-0 !max-w-md w-full overflow-hidden border-0 shadow-xl">
    <div className="px-6 pt-6 pb-5 border-b border-slate-100">
     <h2 className="text-[17px] font-semibold text-slate-900">{labels.providers.actions.addNote}</h2>
     <p className="text-[13px] text-slate-500 mt-1">{providerName}</p>
    </div>

    <form onSubmit={handleSubmit}>
     <div className="px-6 py-5 space-y-4">
      <div className="space-y-1.5">
       <label className={labelClass}>NOTA <span className="text-[#1FA97A]">*</span></label>
       <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe tu nota aquí..."
        rows={5}
        required
        className={`${inputClass} resize-none`}
       />
      </div>
     </div>

     <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
      <button type="button" onClick={() => onOpenChange(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">
       {labels.common.cancel}
      </button>
      <button type="submit" disabled={loading || !content.trim()} className="px-5 py-2.5 rounded-xl bg-[#1FA97A] text-white text-[13px] font-medium hover:bg-[#178f68] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
       {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : labels.providers.actions.addNote}
      </button>
     </div>
    </form>
   </DialogContent>
  </Dialog>
 )
}
