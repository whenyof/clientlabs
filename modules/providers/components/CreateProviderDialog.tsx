"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { Loader2, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { createProvider } from "../actions"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProviderCreated: (provider: any) => void
}

const TYPE_OPTIONS = [
  { value: "SERVICE",  label: "Servicio" },
  { value: "PRODUCT",  label: "Producto" },
  { value: "SOFTWARE", label: "Software" },
  { value: "OTHER",    label: "Otro" },
]

const DEPENDENCY_OPTIONS = [
  { value: "LOW",      label: "Baja" },
  { value: "MEDIUM",   label: "Media" },
  { value: "HIGH",     label: "Alta" },
  { value: "CRITICAL", label: "Crítica" },
]

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] text-slate-900 placeholder:text-slate-400 bg-slate-50 focus:bg-white focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 outline-none transition-all"
const selectClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] text-slate-900 bg-slate-50 focus:bg-white focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 outline-none transition-all appearance-none cursor-pointer"
const labelClass = "text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500"

const empty = { name: "", type: "OTHER", dependency: "LOW", contactEmail: "", contactPhone: "", website: "", notes: "" }

export function CreateProviderDialog({ open, onOpenChange, onProviderCreated }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(empty)

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return

    setLoading(true)
    try {
      const result = await createProvider({
        name: form.name,
        type: form.type,
        monthlyCost: null,
        dependency: form.dependency as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        isCritical: form.dependency === "CRITICAL" || form.dependency === "HIGH",
        contactEmail: form.contactEmail || null,
        contactPhone: form.contactPhone || null,
        website: form.website || null,
        notes: form.notes || null,
        status: "ACTIVE",
      })
      if (result.success && result.provider) {
        toast.success("Proveedor creado correctamente")
        onProviderCreated(result.provider)
        onOpenChange(false)
        setForm(empty)
      } else {
        toast.error(result.error || "Error al crear proveedor")
      }
    } catch {
      toast.error("Error al crear proveedor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white rounded-2xl p-0 !max-w-[520px] w-full overflow-hidden border-0 shadow-xl">
        <VisuallyHidden.Root><DialogTitle>Nuevo proveedor</DialogTitle></VisuallyHidden.Root>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100">
          <h2 className="text-[17px] font-semibold text-slate-900">Nuevo proveedor</h2>
          <p className="text-[13px] text-slate-500 mt-1">Rellena los datos del proveedor</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

            {/* Nombre */}
            <div className="space-y-1.5">
              <label className={labelClass}>NOMBRE <span className="text-[#1FA97A]">*</span></label>
              <input type="text" value={form.name} onChange={e => set("name", e.target.value)} placeholder="AWS, Google Workspace, etc." required className={inputClass} />
            </div>

            {/* Tipo */}
            <div className="space-y-1.5">
              <label className={labelClass}>TIPO</label>
              <div className="relative">
                <select value={form.type} onChange={e => set("type", e.target.value)} className={selectClass}>
                  {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Dependencia */}
            <div className="space-y-1.5">
              <label className={labelClass}>NIVEL DE DEPENDENCIA</label>
              <div className="relative">
                <select value={form.dependency} onChange={e => set("dependency", e.target.value)} className={selectClass}>
                  {DEPENDENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Email + Teléfono */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelClass}>EMAIL CONTACTO</label>
                <input type="email" value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} placeholder="soporte@proveedor.com" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>TELÉFONO</label>
                <input type="tel" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} placeholder="+34 600 000 000" className={inputClass} />
              </div>
            </div>

            {/* Website */}
            <div className="space-y-1.5">
              <label className={labelClass}>WEBSITE</label>
              <input type="url" value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://proveedor.com" className={inputClass} />
            </div>

            {/* Notas */}
            <div className="space-y-1.5">
              <label className={labelClass}>NOTAS</label>
              <textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Información adicional..." rows={3} className={`${inputClass} resize-none`} />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={() => onOpenChange(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading || !form.name.trim()} className="px-5 py-2.5 rounded-xl bg-[#1FA97A] text-white text-[13px] font-medium hover:bg-[#178f68] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creando...</> : "Crear proveedor"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
