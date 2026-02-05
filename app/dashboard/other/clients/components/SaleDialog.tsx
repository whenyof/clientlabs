"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createClientSale, updateClientSale } from "../actions"

type Sale = {
    id: string
    product: string
    total: number
    saleDate: Date
    status: string
    notes: string | null
}

type SaleDialogProps = {
    clientId: string
    sale?: Sale | null
    isOpen: boolean
    onClose: () => void
    onSuccess: (result?: any) => void
}

const STATUS_OPTIONS = [
    { value: "PAID", label: "Pagado" },
    { value: "PENDING", label: "Pendiente" },
    { value: "CANCELLED", label: "Cancelado" },
]

export function SaleDialog({ clientId, sale, isOpen, onClose, onSuccess }: SaleDialogProps) {
    const [product, setProduct] = useState(sale?.product || "")
    const [total, setTotal] = useState(sale?.total?.toString() || "")
    const [saleDate, setSaleDate] = useState(
        sale?.saleDate ? new Date(sale.saleDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    )
    const [status, setStatus] = useState(sale?.status || "PAID")
    const [notes, setNotes] = useState(sale?.notes || "")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!product.trim() || !total || parseFloat(total) <= 0) {
            toast.error("Completa todos los campos obligatorios")
            return
        }

        setLoading(true)
        try {
            if (sale) {
                // Update existing sale
                const result = await updateClientSale(sale.id, {
                    product: product.trim(),
                    total: parseFloat(total),
                    saleDate: new Date(saleDate),
                    status,
                    notes: notes.trim() || undefined,
                })
                toast.success("Venta actualizada correctamente")
                onSuccess(result)
            } else {
                // Create new sale
                const result = await createClientSale(clientId, {
                    product: product.trim(),
                    total: parseFloat(total),
                    saleDate: new Date(saleDate),
                    status,
                    notes: notes.trim() || undefined,
                })
                toast.success("Venta creada correctamente")
                onSuccess(result)
            }
            onClose()
            resetForm()
        } catch (error) {
            toast.error(sale ? "Error al actualizar venta" : "Error al crear venta")
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setProduct("")
        setTotal("")
        setSaleDate(new Date().toISOString().split('T')[0])
        setStatus("PAID")
        setNotes("")
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-900 border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-white">
                        {sale ? "Editar Venta" : "Añadir Venta"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Product/Concept */}
                    <div>
                        <Label className="text-white">Concepto *</Label>
                        <Input
                            value={product}
                            onChange={(e) => setProduct(e.target.value)}
                            placeholder="Ej: Desarrollo web, Consultoría..."
                            className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                            autoFocus
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <Label className="text-white">Importe (€) *</Label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={total}
                            onChange={(e) => setTotal(e.target.value)}
                            placeholder="0.00"
                            className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <Label className="text-white">Fecha</Label>
                        <input
                            type="date"
                            value={saleDate}
                            onChange={(e) => setSaleDate(e.target.value)}
                            className="w-full mt-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <Label className="text-white">Estado</Label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full mt-1 rounded-md border border-white/10 bg-white/5 p-2 text-white"
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label className="text-white">Notas (opcional)</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Detalles adicionales sobre esta venta..."
                            className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !product.trim() || !total || parseFloat(total) <= 0}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {sale ? "Actualizar Venta" : "Crear Venta"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
