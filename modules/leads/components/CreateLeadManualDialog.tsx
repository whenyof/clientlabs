"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogFooter,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { createLead } from "../actions"
import { toast } from "sonner"

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
 try {
 await createLead(formData)
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

 const inputStyle: React.CSSProperties = {
  border: "0.5px solid var(--color-border-secondary, #e5e7eb)",
  borderRadius: "var(--border-radius-md, 8px)",
  padding: "8px 12px",
  fontSize: 14,
  width: "100%",
  color: "var(--color-text-primary, #0B1F2A)",
  background: "var(--color-background-primary, #fff)",
  outline: "none",
 }

 const labelClass = "text-[11px] uppercase tracking-wider font-semibold text-[var(--color-text-secondary,#6b7280)]"

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent
  className="bg-[var(--color-background-primary,#fff)] border-[var(--color-border-secondary,#e5e7eb)]"
  style={{ borderRadius: "var(--border-radius-lg, 12px)", padding: 24 }}
 >
 <DialogHeader>
 <DialogTitle style={{ fontSize: 18, fontWeight: 500, color: "var(--color-text-primary, #0B1F2A)" }}>
  Nuevo lead
 </DialogTitle>
 </DialogHeader>
 <form onSubmit={handleSubmit}>
 <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
 <div>
 <label className={labelClass}>
 Nombre <span className="text-red-500">*</span>
 </label>
 <input
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 placeholder="Juan Pérez"
 required
 style={{ ...inputStyle, marginTop: 6 }}
 />
 </div>
 <div>
 <label className={labelClass}>Email</label>
 <input
 type="email"
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 placeholder="juan@example.com"
 style={{ ...inputStyle, marginTop: 6 }}
 />
 </div>
 <div>
 <label className={labelClass}>Teléfono</label>
 <input
 value={formData.phone}
 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
 placeholder="+34 600 000 000"
 style={{ ...inputStyle, marginTop: 6 }}
 />
 </div>
 <div>
 <label className={labelClass}>Estado inicial</label>
 <select
 value={formData.leadStatus}
 onChange={(e) => setFormData({ ...formData, leadStatus: e.target.value })}
 style={{ ...inputStyle, marginTop: 6, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
 >
 {STATUS_OPTIONS.map((opt) => (
  <option key={opt.value} value={opt.value}>{opt.label}</option>
 ))}
 </select>
 </div>
 <div>
 <label className={labelClass}>Fuente</label>
 <select
 value={formData.source}
 onChange={(e) => setFormData({ ...formData, source: e.target.value })}
 style={{ ...inputStyle, marginTop: 6, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
 >
 <option value="">Seleccionar...</option>
 {SOURCE_OPTIONS.map((opt) => (
  <option key={opt.value} value={opt.value}>{opt.label}</option>
 ))}
 </select>
 </div>
 </div>
 <DialogFooter className="mt-6">
 <Button
 type="button"
 variant="outline"
 onClick={() => onOpenChange(false)}
 >
 Cancelar
 </Button>
 <Button
 type="submit"
 disabled={loading || !formData.name.trim()}
 className="bg-[#1FA97A] text-white hover:bg-[#178f68]"
 >
 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 Crear lead
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 )
}
