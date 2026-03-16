"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { updateProviderProduct } from "@/app/dashboard/providers/actions"
import { useRouter } from "next/navigation"
import { useSectorConfig } from "@/hooks/useSectorConfig"

export type ProviderProductRow = {
    id: string
    code: string
    name: string
    unit: string | null
    price: number
    description: string | null
    category: string | null
    isActive: boolean
}

type EditProviderProductDialogProps = {
    providerId: string
    providerName: string
    product: ProviderProductRow | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function EditProviderProductDialog({
    providerId,
    providerName,
    product,
    open,
    onOpenChange,
    onSuccess
}: EditProviderProductDialogProps) {
    const { labels } = useSectorConfig()
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        unit: "",
        category: "",
        price: "",
        description: "",
        isActive: true
    })

    useEffect(() => {
        if (open && product) {
            setFormData({
                name: product.name,
                code: product.code,
                unit: product.unit ?? "",
                category: product.category ?? "",
                price: String(product.price),
                description: product.description ?? "",
                isActive: product.isActive
            })
        }
    }, [open, product])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!product) return
        if (!formData.name.trim()) {
            toast.error("El nombre es obligatorio")
            return
        }
        if (!formData.code.trim()) {
            toast.error("El código es obligatorio")
            return
        }
        const priceNum = parseFloat(String(formData.price).replace(",", "."))
        if (Number.isNaN(priceNum) || priceNum < 0) {
            toast.error("Introduce un precio válido")
            return
        }

        setLoading(true)
        try {
            const result = await updateProviderProduct(product.id, {
                name: formData.name.trim(),
                code: formData.code.trim(),
                unit: formData.unit.trim() || null,
                price: priceNum,
                description: formData.description.trim() || null,
                category: formData.category.trim() || null,
                isActive: formData.isActive
            })

            if (result.success) {
                toast.success("Producto actualizado")
                onOpenChange(false)
                router.refresh()
                onSuccess?.()
            } else {
                toast.error(result.error || labels.common.error)
            }
        } catch {
            toast.error(labels.common.error)
        } finally {
            setLoading(false)
        }
    }

    if (!product) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white">Editar producto</DialogTitle>
                    <p className="text-sm text-white/60">{providerName} · {product.code}</p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="edit-product-name" className="text-white/80">Nombre *</Label>
                        <Input
                            id="edit-product-name"
                            value={formData.name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="Ej: Servicio mensual"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="edit-product-code" className="text-white/80">Código *</Label>
                        <Input
                            id="edit-product-code"
                            value={formData.code}
                            onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="Ej: SRV-01"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="edit-product-unit" className="text-white/80">Unidad</Label>
                            <Input
                                id="edit-product-unit"
                                value={formData.unit}
                                onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                                className="bg-white/5 border-white/10 text-white"
                                placeholder="ud, kg"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-product-category" className="text-white/80">Categoría</Label>
                            <Input
                                id="edit-product-category"
                                value={formData.category}
                                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                                className="bg-white/5 border-white/10 text-white"
                                placeholder="Material"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="edit-product-price" className="text-white/80">Precio (€) *</Label>
                        <Input
                            id="edit-product-price"
                            type="text"
                            inputMode="decimal"
                            value={formData.price}
                            onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="0,00"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="edit-product-description" className="text-white/80">Descripción</Label>
                        <Textarea
                            id="edit-product-description"
                            value={formData.description}
                            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                            className="bg-white/5 border-white/10 text-white resize-none"
                            placeholder="Detalles del producto..."
                            rows={2}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="edit-product-active"
                            checked={formData.isActive}
                            onCheckedChange={(c) => setFormData((prev) => ({ ...prev, isActive: Boolean(c) }))}
                            className="border-white/30 data-[state=checked]:bg-emerald-600"
                        />
                        <Label htmlFor="edit-product-active" className="text-sm text-white/80 cursor-pointer">
                            Producto activo (visible en catálogo y pedidos)
                        </Label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                            {labels.common.cancel}
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-[var(--accent)] hover:opacity-90 text-white">
                            {loading ? labels.common.loading : "Guardar cambios"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
