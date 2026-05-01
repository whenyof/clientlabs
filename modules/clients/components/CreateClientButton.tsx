"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { Plus, X, User, Building2, Mail, Phone, MapPin, FileText, ChevronDown, ChevronUp, Euro } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const EMPTY_FORM = {
  name: "", email: "", phone: "",
  estimatedValue: "",
  legalType: "", taxId: "",
  companyName: "", legalName: "",
  address: "", city: "",
  postalCode: "", country: "España",
  notes: "",
}

export function CreateClientButton() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showExtra, setShowExtra] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const isSubmitting = useRef(false)

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const handleClose = () => {
    setOpen(false)
    setForm(EMPTY_FORM)
    setShowExtra(false)
  }

  const handleCreate = async () => {
    if (isSubmitting.current) return
    if (!form.name.trim()) {
      toast.error("El nombre es obligatorio")
      return
    }

    isSubmitting.current = true
    setIsLoading(true)

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          totalSpent: form.estimatedValue ? parseFloat(form.estimatedValue) : 0,
          taxId: form.taxId || undefined,
          companyName: form.companyName || undefined,
          address: form.address || undefined,
          city: form.city || undefined,
          postalCode: form.postalCode || undefined,
          country: form.country || undefined,
          notes: form.notes || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Error al crear cliente")
      }

      toast.success("Cliente creado correctamente")
      handleClose()
      await queryClient.invalidateQueries({ queryKey: ["clients"] })
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Error al crear cliente")
    } finally {
      setIsLoading(false)
      isSubmitting.current = false
    }
  }

  const inputClass = "w-full py-2.5 border border-slate-200 rounded-xl text-[13px] text-slate-700 outline-none focus:border-[#1FA97A] focus:ring-1 focus:ring-[#1FA97A]/20 placeholder:text-slate-300"

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#1FA97A] text-white text-[13px] font-medium rounded-xl hover:bg-[#1a9068] transition-colors"
      >
        <Plus className="h-4 w-4" />
        Nuevo Cliente
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-[15px] font-semibold text-slate-900">Nuevo Cliente</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Añade un cliente manualmente</p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">

              {/* Nombre */}
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Nombre *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                  <input
                    value={form.name}
                    onChange={e => set("name", e.target.value)}
                    placeholder="Nombre completo"
                    className={cn(inputClass, "pl-9 pr-4")}
                  />
                </div>
              </div>

              {/* Email + Teléfono */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => set("email", e.target.value)}
                      placeholder="email@ejemplo.com"
                      className={cn(inputClass, "pl-9 pr-4")}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                    <input
                      value={form.phone}
                      onChange={e => set("phone", e.target.value)}
                      placeholder="+34 600 000 000"
                      className={cn(inputClass, "pl-9 pr-4")}
                    />
                  </div>
                </div>
              </div>

              {/* Valor Estimado */}
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Valor Estimado (€)
                </label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.estimatedValue}
                    onChange={e => set("estimatedValue", e.target.value)}
                    placeholder="0.00"
                    className={cn(inputClass, "pl-9 pr-4")}
                  />
                </div>
              </div>

              {/* Tipo + NIF */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Tipo</label>
                  <select
                    value={form.legalType}
                    onChange={e => set("legalType", e.target.value)}
                    className={cn(inputClass, "px-3 bg-white")}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="AUTONOMO">Autónomo</option>
                    <option value="EMPRESA">Empresa</option>
                    <option value="PARTICULAR">Particular</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">NIF/CIF</label>
                  <input
                    value={form.taxId}
                    onChange={e => set("taxId", e.target.value)}
                    placeholder="12345678A"
                    className={cn(inputClass, "px-4")}
                  />
                </div>
              </div>

              {/* Toggle datos extra */}
              <button
                type="button"
                onClick={() => setShowExtra(prev => !prev)}
                className="flex items-center gap-2 text-[11px] font-medium text-slate-400 hover:text-[#1FA97A] transition-colors w-full pt-1"
              >
                {showExtra ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {showExtra ? "Ocultar datos adicionales" : "Añadir datos fiscales y dirección"}
              </button>

              {showExtra && (
                <div className="space-y-4 pt-1 border-t border-slate-100">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Razón Social</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                      <input
                        value={form.companyName}
                        onChange={e => set("companyName", e.target.value)}
                        placeholder="Nombre de empresa"
                        className={cn(inputClass, "pl-9 pr-4")}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Dirección</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                      <input
                        value={form.address}
                        onChange={e => set("address", e.target.value)}
                        placeholder="Calle y número"
                        className={cn(inputClass, "pl-9 pr-4")}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Ciudad</label>
                      <input
                        value={form.city}
                        onChange={e => set("city", e.target.value)}
                        placeholder="Madrid"
                        className={cn(inputClass, "px-4")}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Código Postal</label>
                      <input
                        value={form.postalCode}
                        onChange={e => set("postalCode", e.target.value)}
                        placeholder="28001"
                        className={cn(inputClass, "px-4")}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notas */}
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Notas</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-300" />
                  <textarea
                    value={form.notes}
                    onChange={e => set("notes", e.target.value)}
                    placeholder="Información adicional..."
                    rows={3}
                    className={cn(inputClass, "pl-9 pr-4 resize-none")}
                  />
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2.5 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={isLoading || !form.name.trim()}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[13px] font-medium text-white transition-all",
                  isLoading || !form.name.trim()
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-[#1FA97A] hover:bg-[#1a9068]"
                )}
              >
                {isLoading ? "Creando..." : "Crear Cliente"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
