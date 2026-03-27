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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { createLead } from "../actions"
import { toast } from "sonner"

export function CreateLeadManualDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
 const router = useRouter()
 const [loading, setLoading] = useState(false)
 const [formData, setFormData] = useState({
 name: "",
 email: "",
 phone: "",
 source: "",
 })

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 if (!formData.name.trim()) return

 setLoading(true)
 try {
 await createLead(formData)
 setFormData({ name: "", email: "", phone: "", source: "" })
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

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="bg-[var(--color-background-primary,#fff)] border-[var(--color-border-secondary,#e5e7eb)]" style={{ borderRadius: "var(--border-radius-lg, 12px)", padding: 24 }}>
 <DialogHeader>
 <DialogTitle className="text-[var(--color-text-primary,#0B1F2A)] text-xl">Crear Nuevo Lead</DialogTitle>
 </DialogHeader>
 <form onSubmit={handleSubmit}>
 <div className="space-y-4">
 <div>
 <Label htmlFor="name" className="text-[var(--color-text-primary,#0B1F2A)]">
 Nombre <span className="text-red-500">*</span>
 </Label>
 <Input
 id="name"
 value={formData.name}
 onChange={(e) =>
 setFormData({ ...formData, name: e.target.value })
 }
 placeholder="Juan Pérez"
 required
 className="mt-2 text-[var(--color-text-primary,#0B1F2A)] placeholder:text-neutral-400"
 style={{ border: "0.5px solid var(--color-border-secondary, #e5e7eb)" }}
 />
 </div>
 <div>
 <Label htmlFor="email" className="text-[var(--color-text-primary,#0B1F2A)]">Email</Label>
 <Input
 id="email"
 type="email"
 value={formData.email}
 onChange={(e) =>
 setFormData({ ...formData, email: e.target.value })
 }
 placeholder="juan@example.com"
 className="mt-2 text-[var(--color-text-primary,#0B1F2A)] placeholder:text-neutral-400"
 style={{ border: "0.5px solid var(--color-border-secondary, #e5e7eb)" }}
 />
 </div>
 <div>
 <Label htmlFor="phone" className="text-[var(--color-text-primary,#0B1F2A)]">Teléfono</Label>
 <Input
 id="phone"
 value={formData.phone}
 onChange={(e) =>
 setFormData({ ...formData, phone: e.target.value })
 }
 placeholder="+34 600 000 000"
 className="mt-2 text-[var(--color-text-primary,#0B1F2A)] placeholder:text-neutral-400"
 style={{ border: "0.5px solid var(--color-border-secondary, #e5e7eb)" }}
 />
 </div>
 <div>
 <Label htmlFor="source" className="text-[var(--color-text-primary,#0B1F2A)]">Fuente</Label>
 <Input
 id="source"
 value={formData.source}
 onChange={(e) =>
 setFormData({ ...formData, source: e.target.value })
 }
 placeholder="Web, Referido, LinkedIn..."
 className="mt-2 text-[var(--color-text-primary,#0B1F2A)] placeholder:text-neutral-400"
 style={{ border: "0.5px solid var(--color-border-secondary, #e5e7eb)" }}
 />
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
 Crear Lead
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 )
}
