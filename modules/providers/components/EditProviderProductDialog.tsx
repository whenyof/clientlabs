"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { toast } from "sonner"
import { updateProviderProduct } from "@/app/dashboard/providers/actions"
import { useRouter } from "next/navigation"
import { useSectorConfig } from "@/hooks/useSectorConfig"
import { Loader2 } from "lucide-react"

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

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] text-slate-900 placeholder:text-slate-400 bg-slate-50 focus:bg-white focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/10 outline-none transition-all"
const labelClass = "text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500"

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
            <DialogContent className="bg-white rounded-2xl p-0 !max-w-md w-full overflow-hidden border-0 shadow-xl">
                <div className="px-6 pt-6 pb-5 border-b border-slate-100">
                    <h2 className="text-[17px] font-semibold text-slate-900">Editar producto</h2>
                    <p className="text-[13px] text-slate-500 mt-1">{providerName} · {product.code}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
                        <div className="space-y-1.5">
                            <label className={labelClass}>NOMBRE <span className="text-[#1FA97A]">*</span></label>
                            <input
                                value={formData.name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="Ej: Servicio mensual"
                                required
                                className={inputClass}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className={labelClass}>CÓDIGO <span className="text-[#1FA97A]">*</span></label>
                            <input
                                value={formData.code}
                                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                                placeholder="Ej: SRV-01"
                                required
                                className={inputClass}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className={labelClass}>UNIDAD</label>
                                <input
                                    value={formData.unit}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                                    placeholder="ud, kg"
                                    className={inputClass}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelClass}>CATEGORÍA</label>
                                <input
                                    value={formData.category}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                                    placeholder="Material"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className={labelClass}>PRECIO (€) <span className="text-[#1FA97A]">*</span></label>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={formData.price}
                                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                                placeholder="0,00"
                                required
                                className={inputClass}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className={labelClass}>DESCRIPCIÓN</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="Detalles del producto..."
                                rows={2}
                                className={`${inputClass} resize-none`}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="edit-product-active"
                                checked={formData.isActive}
                                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                                className="w-4 h-4 rounded border-slate-300 accent-[#1FA97A]"
                            />
                            <label htmlFor="edit-product-active" className="text-sm text-slate-700 cursor-pointer">
                                Producto activo (visible en catálogo y pedidos)
                            </label>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                        <button type="button" onClick={() => onOpenChange(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                            {labels.common.cancel}
                        </button>
                        <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-[#1FA97A] text-white text-[13px] font-medium hover:bg-[#178f68] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : "Guardar cambios"}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
