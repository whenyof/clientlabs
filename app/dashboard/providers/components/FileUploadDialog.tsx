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
            <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white">Registrar archivo</DialogTitle>
                    <p className="text-xs text-white/40">
                        {entityType === 'ORDER' ? 'Vinculando a pedido' : 'Archivo general del proveedor'}
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-400">Nombre del archivo</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-zinc-800 border-white/5 text-white"
                            placeholder="Ej: Factura Enero.pdf"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-400">URL del archivo / Enlace</Label>
                        <div className="relative">
                            <Input
                                value={formData.url}
                                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                                className="bg-zinc-800 border-white/5 text-white pl-9"
                                placeholder="https://..."
                                required
                            />
                            <Link className="h-4 w-4 text-white/20 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-400">Categoría</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                        >
                            <SelectTrigger className="bg-zinc-800 border-white/5 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
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

                    <DialogFooter className="pt-4 border-t border-white/5">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-white/60 hover:text-white"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            {loading ? "Registrando..." : "Registrar archivo"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
