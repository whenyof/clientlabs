"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import {
 Dialog,
 DialogContent,
 DialogTitle,
} from "@/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { Loader2, ChevronDown } from "lucide-react"
import { createLead } from "../actions"
import { toast } from "sonner"
import type { Lead } from "@prisma/client"

const STATUS_OPTIONS = [
 { value: "NEW", label: "Nuevo" },
 { value: "CONTACTED", label: "Contactado" },
 { value: "QUALIFIED", label: "Cualificado" },
 { value: "CONVERTED", label: "Convertido" },
 { value: "LOST", label: "Perdido" },
]

const SOURCE_OPTIONS = [
 { value: "web", label: "Web" },
 { value: "manual", label: "Manual" },
 { value: "referido", label: "Referido" },
 { value: "linkedin", label: "LinkedIn" },
 { value: "instagram", label: "Instagram" },
 { value: "facebook", label: "Facebook" },
 { value: "google", label: "Google Ads" },
 { value: "otro", label: "Otro" },
]

export function CreateLeadManualDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
 const router = useRouter()
 const queryClient = useQueryClient()
 const [loading, setLoading] = useState(false)
 const [formData, setFormData] = useState({
 name: "",
 email: "",
 phone: "",
 source: "",
 leadStatus: "NEW",
 })

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 if (!formData.name.trim()) return

 setLoading(true)
 // Cancel any in-flight refetch so it can't overwrite the optimistic update
 await queryClient.cancelQueries({ queryKey: ["leads"] })
 try {
 const result = await createLead(formData)
 const now = new Date()
 const optimisticLead = {
  id: result.leadId,
  userId: "",
  name: formData.name,
  email: formData.email || null,
  phone: formData.phone || null,
  source: formData.source || "manual",
  leadStatus: (formData.leadStatus as Lead["leadStatus"]) || "NEW",
  status: (formData.leadStatus as Lead["status"]) || "NEW",
  temperature: "COLD",
  score: 0,
  priority: null,
  tags: [],
  notes: null,
  converted: false,
  clientId: null,
  lastActionAt: now,
  createdAt: now,
  updatedAt: now,
  conversionProbability: null,
  aiSegment: null,
  metadata: {},
 } as unknown as Lead
 // Insert the new lead into all matching React Query cache entries immediately
 queryClient.setQueriesData<{
  pages: { leads: Lead[]; pagination: any }[]
  pageParams: any[]
 }>({ queryKey: ["leads"] }, (old) => {
  if (!old) return old
  return {
   ...old,
   pages: old.pages.map((page, i) =>
    i === 0
     ? { ...page, leads: [optimisticLead, ...page.leads], pagination: { ...page.pagination, total: (page.pagination?.total ?? 0) + 1 } }
     : page
   ),
  }
 })
 // Trigger a fresh fetch so server-confirmed data replaces the optimistic lead
 queryClient.invalidateQueries({ queryKey: ["leads"] })
 queryClient.invalidateQueries({ queryKey: ["leads-kpis"] })
 setFormData({ name: "", email: "", phone: "", source: "", leadStatus: "NEW" })
 onOpenChange(false)
 router.refresh()
 toast.success("Lead creado correctamente")
 } catch (error) {
 console.error(error)
 toast.error("Error al crear lead")
 } finally {
 setLoading(false)
 }
 }

 const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] text-slate-900 placeholder:text-slate-400 bg-slate-50 focus:bg-white focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 outline-none transition-all"
 const selectClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] text-slate-900 bg-slate-50 focus:bg-white focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 outline-none transition-all appearance-none cursor-pointer"
 const labelClass = "text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500"

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="bg-white rounded-2xl p-0 !max-w-[480px] w-full overflow-hidden border-0 shadow-xl">
 <VisuallyHidden.Root><DialogTitle>Nuevo lead</DialogTitle></VisuallyHidden.Root>
 <div className="px-6 pt-6 pb-5 border-b border-slate-100">
 <h2 className="text-[17px] font-semibold text-slate-900">Nuevo lead</h2>
 <p className="text-[13px] text-slate-500 mt-1">Rellena los datos del contacto</p>
 </div>

 <form onSubmit={handleSubmit}>
 <div className="px-6 py-5 space-y-4">
 {/* Nombre */}
 <div className="space-y-1.5">
 <label className={labelClass}>
 NOMBRE <span className="text-[#1FA97A]">*</span>
 </label>
 <input
 type="text"
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 placeholder="Juan García"
 required
 className={inputClass}
 />
 </div>

 {/* Email */}
 <div className="space-y-1.5">
 <label className={labelClass}>EMAIL</label>
 <input
 type="email"
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 placeholder="juan@empresa.com"
 className={inputClass}
 />
 </div>

 {/* Teléfono */}
 <div className="space-y-1.5">
 <label className={labelClass}>TELÉFONO</label>
 <input
 type="tel"
 value={formData.phone}
 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
 placeholder="+34 600 000 000"
 className={inputClass}
 />
 </div>

 {/* Estado + Fuente en grid 2 cols */}
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-1.5">
 <label className={labelClass}>ESTADO INICIAL</label>
 <div className="relative">
 <select
 value={formData.leadStatus}
 onChange={(e) => setFormData({ ...formData, leadStatus: e.target.value })}
 className={selectClass}
 >
 {STATUS_OPTIONS.map((opt) => (
 <option key={opt.value} value={opt.value}>{opt.label}</option>
 ))}
 </select>
 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
 </div>
 </div>

 <div className="space-y-1.5">
 <label className={labelClass}>FUENTE</label>
 <div className="relative">
 <select
 value={formData.source}
 onChange={(e) => setFormData({ ...formData, source: e.target.value })}
 className={selectClass}
 >
 <option value="">Seleccionar...</option>
 {SOURCE_OPTIONS.map((opt) => (
 <option key={opt.value} value={opt.value}>{opt.label}</option>
 ))}
 </select>
 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
 </div>
 </div>
 </div>
 </div>

 <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
 <button
 type="button"
 onClick={() => onOpenChange(false)}
 className="px-5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
 >
 Cancelar
 </button>
 <button
 type="submit"
 disabled={loading || !formData.name.trim()}
 className="px-5 py-2.5 rounded-xl bg-[#1FA97A] text-white text-[13px] font-medium hover:bg-[#178f68] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
 >
 {loading ? (
 <>
 <Loader2 className="h-4 w-4 animate-spin" />
 Creando...
 </>
 ) : (
 "Crear lead"
 )}
 </button>
 </div>
 </form>
 </DialogContent>
 </Dialog>
 )
}
