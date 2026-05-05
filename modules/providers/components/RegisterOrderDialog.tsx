"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { createProviderOrder } from "../actions"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"

import { useSectorConfig } from "@/hooks/useSectorConfig"

type RegisterOrderDialogProps = {
 providerId: string
 providerName: string
 open: boolean
 onOpenChange: (open: boolean) => void
 onSuccess?: () => void
}

const inputClass = "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-[14px] text-slate-900 placeholder:text-slate-400 bg-slate-50 focus:bg-white focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 outline-none transition-all"
const selectClass = "w-full px-3 py-2.5 rounded-lg border border-slate-200 text-[14px] text-slate-900 bg-slate-50 focus:bg-white focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 outline-none transition-all appearance-none cursor-pointer"
const labelClass = "text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500"

export function RegisterOrderDialog({ providerId, providerName, open, onOpenChange, onSuccess }: RegisterOrderDialogProps) {
 const { labels, features } = useSectorConfig()
 const [loading, setLoading] = useState(false)
 const router = useRouter()

 const [formData, setFormData] = useState({
  description: "",
  amount: "",
  orderDate: new Date().toISOString().split('T')[0],
  type: "ONE_TIME",
  status: "PENDING",
  createPayment: true
 })

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!formData.amount || parseFloat(formData.amount) < 0) {
   toast.error("El importe no puede ser negativo")
   return
  }

  setLoading(true)

  try {
   const result = await createProviderOrder({
    providerId,
    orderDate: new Date(formData.orderDate),
    amount: parseFloat(formData.amount),
    description: formData.description,
    type: formData.type as any,
    status: "PENDING" as any,
   })

   if (result.success) {
    toast.success(labels.common.success)
    onOpenChange(false)
    if (onSuccess) onSuccess()
    router.refresh()

    setFormData({
     description: "",
     amount: "",
     orderDate: new Date().toISOString().split('T')[0],
     type: "ONE_TIME",
     status: "PENDING",
     createPayment: true
    })
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
     <h2 className="text-[17px] font-semibold text-slate-900">{labels.providers.actions.newOrder}</h2>
     <p className="text-[13px] text-slate-500 mt-1">{providerName}</p>
    </div>

    <form onSubmit={handleSubmit}>
     <div className="px-6 py-5 space-y-4">

      {/* Concepto */}
      <div className="space-y-1.5">
       <label className={labelClass}>CONCEPTO <span className="text-[#1FA97A]">*</span></label>
       <input
        type="text"
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        className={inputClass}
        placeholder="Ej: Licencias SaaS Anuales"
        required
       />
      </div>

      <div className="grid grid-cols-2 gap-3">
       {/* Importe */}
       <div className="space-y-1.5">
        <label className={labelClass}>IMPORTE (€)</label>
        <input
         type="number"
         step="0.01"
         min="0"
         value={formData.amount}
         onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
         className={inputClass}
         placeholder="0.00"
         required
        />
       </div>

       {/* Fecha */}
       <div className="space-y-1.5">
        <label className={labelClass}>FECHA</label>
        <input
         type="date"
         value={formData.orderDate}
         onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
         className={inputClass}
         required
        />
       </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
       {/* Tipo */}
       <div className="space-y-1.5">
        <label className={labelClass}>TIPO</label>
        <div className="relative">
         <select value={formData.type} onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))} className={selectClass}>
          <option value="ONE_TIME">{labels.orders.types.ONE_TIME}</option>
          <option value="RECURRING">{labels.orders.types.RECURRING}</option>
         </select>
         <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
       </div>

       {/* Estado */}
       <div className="space-y-1.5">
        <label className={labelClass}>ESTADO</label>
        <div className="relative">
         <select value={formData.status} onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))} className={selectClass}>
          <option value="PENDING">{labels.orders.status.PENDING}</option>
          <option value="COMPLETED">{labels.orders.status.COMPLETED}</option>
         </select>
         <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
       </div>
      </div>

      {/* Auto Payment Toggle */}
      {features.providers.allowAutoPayment && (formData.status === "COMPLETED" || formData.status === "PAID") && (
       <div className="flex items-center space-x-2 py-1">
        <Checkbox
         id="createPayment"
         checked={formData.createPayment}
         onCheckedChange={(checked) => setFormData(prev => ({ ...prev, createPayment: checked as boolean }))}
        />
        <label htmlFor="createPayment" className="text-sm font-medium text-slate-700 cursor-pointer">
         Generar pago automáticamente
        </label>
       </div>
      )}
     </div>

     <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
      <button type="button" onClick={() => onOpenChange(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">
       {labels.common.cancel}
      </button>
      <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-[#1FA97A] text-white text-[13px] font-medium hover:bg-[#178f68] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
       {loading ? labels.common.loading : labels.providers.actions.newOrder}
      </button>
     </div>
    </form>
   </DialogContent>
  </Dialog>
 )
}
