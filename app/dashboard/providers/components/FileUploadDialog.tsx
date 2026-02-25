"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Link, AlertCircle } from "lucide-react"

type FileUploadDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: (data: { name: string, url: string, category: string }) => void
    providerId: string
    entityType: 'PROVIDER' | 'ORDER'
    entityId: string
}

export function FileUploadDialog({ open, onOpenChange, onSuccess, providerId, entityType, entityId }: FileUploadDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        url: "",
        category: "OTHER"
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name || !formData.url) return

        setLoading(true)
        // Simulated upload/registration
        await onSuccess(formData)
        setLoading(false)

        // Reset
        setFormData({ name: "", url: "", category: "OTHER" })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[var(--bg-card)] border-[var(--border-subtle)] max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-[var(--text-primary)]">Registrar archivo</DialogTitle>
                    <p className="text-xs text-[var(--text-secondary)]">
                        {entityType === 'ORDER' ? 'Vinculando a pedido' : 'Archivo general del proveedor'}
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[var(--text-secondary)]">Nombre del archivo</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-primary)]"
                            placeholder="Ej: Factura Enero.pdf"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[var(--text-secondary)]">URL del archivo / Enlace</Label>
                        <div className="relative">
                            <Input
                                value={formData.url}
                                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                                className="bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-primary)] pl-9"
                                placeholder="https://..."
                                required
                            />
                            <Link className="h-4 w-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[var(--text-secondary)]">Categoría</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                        >
                            <SelectTrigger className="bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-primary)]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)]">
                                <SelectItem value="INVOICE">Factura</SelectItem>
                                <SelectItem value="ORDER">Pedido / Confirmación</SelectItem>
                                <SelectItem value="CONTRACT">Contrato</SelectItem>
                                <SelectItem value="OTHER">Otros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex gap-3 text-amber-200/80 text-xs">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p>Por ahora, registra el enlace de tu gestor de archivos (Drive, S3, etc). La subida directa estará disponible pronto.</p>
                    </div>

                    <DialogFooter className="pt-4 border-t border-[var(--border-subtle)]">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 text-[var(--text-primary)]"
                        >
                            {loading ? "Registrando..." : "Registrar archivo"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
