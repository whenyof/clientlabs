"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogDescription,
 DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function CreateClientButton() {
 const { labels } = useSectorConfig()
 const [open, setOpen] = useState(false)
 const [loading, setLoading] = useState(false)

 const handleCreate = async () => {
 setLoading(true)
 // Visual-only for now
 setTimeout(() => {
 toast.success("Cliente creado correctamente (demo)")
 setLoading(false)
 setOpen(false)
 }, 1000)
 }

 return (
 <>
 <Button
 onClick={() => setOpen(true)}
 className="h-11 px-6 shrink-0 bg-blue-500 hover:bg-blue-600 text-[var(--text-primary)] font-semibold shadow-sm"
 >
 <Plus className="h-4 w-4 mr-2" />
 {labels.clients.newButton}
 </Button>

 <Dialog open={open} onOpenChange={setOpen}>
 <DialogContent className="bg-zinc-900 border-[var(--border-subtle)]">
 <DialogHeader>
 <DialogTitle className="text-[var(--text-primary)]">Crear Nuevo Cliente</DialogTitle>
 <DialogDescription className="text-[var(--text-secondary)]">
 Añade un cliente manualmente al sistema
 </DialogDescription>
 </DialogHeader>

 <div className="space-y-4 py-4">
 <div className="space-y-2">
 <Label htmlFor="name" className="text-[var(--text-primary)]">Nombre *</Label>
 <Input
 id="name"
 placeholder="Nombre del cliente"
 className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)]"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="email" className="text-[var(--text-primary)]">Email *</Label>
 <Input
 id="email"
 type="email"
 placeholder="email@ejemplo.com"
 className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)]"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="phone" className="text-[var(--text-primary)]">Teléfono</Label>
 <Input
 id="phone"
 placeholder="+34 600 000 000"
 className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)]"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="value" className="text-[var(--text-primary)]">Valor Estimado</Label>
 <Input
 id="value"
 type="number"
 placeholder="5000"
 className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)]"
 />
 </div>
 </div>

 <DialogFooter>
 <Button
 variant="outline"
 onClick={() => setOpen(false)}
 className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
 >
 Cancelar
 </Button>
 <Button
 onClick={handleCreate}
 disabled={loading}
 className="bg-blue-600 hover:bg-blue-700 text-[var(--text-primary)]"
 >
 {loading ? "Creando..." : "Crear Cliente"}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </>
 )
}
