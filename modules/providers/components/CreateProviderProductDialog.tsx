"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createProviderProduct } from "../actions"
import { useRouter } from "next/navigation"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { cn } from "@/lib/utils"

type CreateProviderProductDialogProps = {
    providerId: string
    providerName: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function CreateProviderProductDialog({
    providerId,
    providerName,
    open,
    onOpenChange,
    onSuccess
}: CreateProviderProductDialogProps) {
    const { labels } = useSectorConfig()
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        unit: "",
        price: "",
        description: "",
        category: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name.trim()) {
            toast.error("El nombre es obligatorio")
            return
        }
        if (!formData.code.trim()) {
            toast.error("El código es obligatorio")
            return
        }
        const priceNum = parseFloat(formData.price.replace(",", "."))
        if (Number.isNaN(priceNum) || priceNum < 0) {
            toast.error("Introduce un precio válido")
            return
        }

        setLoading(true)
        try {
            const result = await createProviderProduct({
                providerId,
                name: formData.name.trim(),
                code: formData.code.trim(),
                unit: formData.unit.trim() || undefined,
                price: priceNum,
                description: formData.description.trim() || undefined,
                category: formData.category.trim() || undefined
            })

            if (result.success) {
                toast.success("Producto creado")
                onOpenChange(false)
                router.refresh()
                onSuccess?.()
                setFormData({ name: "", code: "", unit: "", price: "", description: "", category: "" })
            } else {
                toast.error(result.error || labels.common.error)
            }
        } catch {
            toast.error(labels.common.error)
        } finally {
            setLoading(false)
        }
    }

    const inputClass = cn(
        "bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-primary)]",
        "placeholder:text-[var(--text-muted)]"
    )
    const labelClass = "text-sm font-medium text-[var(--text-primary)]"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "max-w-lg p-0 gap-0 overflow-hidden",
                    "bg-[var(--bg-card)] border-[var(--border-main)]"
                )}
            >
                <DialogHeader className="p-6 pb-4 border-b border-[var(--border-main)]">
                    <DialogTitle className="text-lg font-semibold text-[var(--text-primary)]">
                        Nuevo producto
                    </DialogTitle>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                        Añade un producto al catálogo de este proveedor.
                    </p>
                    {providerName && (
                        <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                            Proveedor: {providerName}
                        </p>
                    )}
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Fila 1: nombre + código */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="product-name" className={labelClass}>Nombre *</Label>
                                <Input
                                    id="product-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                    className={cn("mt-1.5", inputClass)}
                                    placeholder="Ej. Coca-Cola 330 ml"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="product-code" className={labelClass}>Código *</Label>
                                <Input
                                    id="product-code"
                                    value={formData.code}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                                    className={cn("mt-1.5", inputClass)}
                                    placeholder="Ej. REF-CC330"
                                    required
                                />
                            </div>
                        </div>

                        {/* Fila 2: categoría + unidad + precio */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="product-category" className={labelClass}>Categoría</Label>
                                <Input
                                    id="product-category"
                                    value={formData.category}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                                    className={cn("mt-1.5", inputClass)}
                                    placeholder="Ej. Bebidas"
                                />
                            </div>
                            <div>
                                <Label htmlFor="product-unit" className={labelClass}>Unidad</Label>
                                <Input
                                    id="product-unit"
                                    value={formData.unit}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                                    className={cn("mt-1.5", inputClass)}
                                    placeholder="Ej. ud, caja, kg, litro"
                                />
                            </div>
                            <div>
                                <Label htmlFor="product-price" className={labelClass}>Precio (€) *</Label>
                                <Input
                                    id="product-price"
                                    type="text"
                                    inputMode="decimal"
                                    value={formData.price}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                                    className={cn("mt-1.5", inputClass)}
                                    placeholder="Ej. 1,20"
                                    required
                                />
                            </div>
                        </div>

                        {/* Fila 3: descripción ancho completo */}
                        <div>
                            <Label htmlFor="product-description" className={labelClass}>Descripción</Label>
                            <Textarea
                                id="product-description"
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                className={cn("mt-1.5 resize-none min-h-[72px]", inputClass)}
                                placeholder="Información adicional del producto"
                                rows={2}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-[var(--border-main)] text-[var(--text-secondary)]"
                        >
                            {labels.common.cancel}
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-[var(--accent)] hover:opacity-90 text-white"
                        >
                            {loading ? labels.common.loading : "Crear producto"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
