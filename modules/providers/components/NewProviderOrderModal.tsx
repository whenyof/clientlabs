"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { createProviderOrderWithItems } from "@/app/dashboard/providers/actions"
import { renderOrderEmail, formatProductsTable } from "@/modules/providers/services/renderOrderEmail"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Mail, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

export type ProductForOrder = {
    id: string
    code: string
    name: string
    unit: string | null
    price: number
    isActive: boolean
}

export type TemplateForOrder = {
    id: string
    name: string
    subject: string
    body: string
    isDefault: boolean
}

type OrderLine = {
    productId: string | null
    code: string
    name: string
    unit: string | null
    unitPrice: number
    quantity: number
    subtotal: number
}

const formatCurrency = (n: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n)

type NewProviderOrderModalProps = {
    providerId: string
    providerName: string
    contactEmail?: string | null
    products: ProductForOrder[]
    templates: TemplateForOrder[]
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function NewProviderOrderModal({
    providerId,
    providerName,
    contactEmail,
    products,
    templates,
    open,
    onOpenChange,
    onSuccess
}: NewProviderOrderModalProps) {
    const router = useRouter()
    const [lines, setLines] = useState<OrderLine[]>([])
    const [notes, setNotes] = useState("")
    const [emailTo, setEmailTo] = useState(contactEmail ?? "")
    const [templateId, setTemplateId] = useState<string | null>(null)
    const [productSearch, setProductSearch] = useState("")
    const [saving, setSaving] = useState(false)

    const activeProducts = useMemo(
        () =>
            products.filter(
                (p) =>
                    p.isActive &&
                    (productSearch.trim() === "" ||
                        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                        (p.code || "").toLowerCase().includes(productSearch.toLowerCase()))
            ),
        [products, productSearch]
    )

    const defaultTemplate = useMemo(() => templates.find((t) => t.isDefault) ?? templates[0], [templates])
    const selectedTemplate = templateId ? templates.find((t) => t.id === templateId) : defaultTemplate

    const orderNumberPlaceholder = `PRO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-XXXX`
    const orderDateStr = new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    })
    const total = useMemo(() => lines.reduce((sum, l) => sum + l.subtotal, 0), [lines])
    const productsTableText = useMemo(
        () =>
            formatProductsTable(
                lines.map((l) => ({
                    code: l.code,
                    name: l.name,
                    unit: l.unit,
                    quantity: l.quantity,
                    unitPrice: l.unitPrice,
                    subtotal: l.subtotal
                })),
                formatCurrency
            ),
        [lines]
    )
    const emailPreview = useMemo(() => {
        if (!selectedTemplate || lines.length === 0) return { subject: "", body: "" }
        return renderOrderEmail(selectedTemplate.subject, selectedTemplate.body, {
            providerName,
            orderDate: orderDateStr,
            orderNumber: orderNumberPlaceholder,
            productsTable: productsTableText,
            totalAmount: formatCurrency(total),
            notes
        })
    }, [selectedTemplate, providerName, orderDateStr, orderNumberPlaceholder, productsTableText, total, notes, lines.length])

    const addLine = (p: ProductForOrder, qty: number = 1) => {
        const quantity = Math.max(0.01, qty)
        const subtotal = p.price * quantity
        const existing = lines.findIndex((l) => l.productId === p.id)
        if (existing >= 0) {
            setLines((prev) => {
                const next = [...prev]
                const newQty = next[existing].quantity + quantity
                next[existing] = {
                    ...next[existing],
                    quantity: newQty,
                    subtotal: next[existing].unitPrice * newQty
                }
                return next
            })
        } else {
            setLines((prev) => [
                ...prev,
                {
                    productId: p.id,
                    code: p.code,
                    name: p.name,
                    unit: p.unit,
                    unitPrice: p.price,
                    quantity,
                    subtotal
                }
            ])
        }
    }

    const updateLineQuantity = (index: number, quantity: number) => {
        const q = Math.max(0.01, quantity)
        setLines((prev) => {
            const next = [...prev]
            next[index] = { ...next[index], quantity: q, subtotal: next[index].unitPrice * q }
            return next
        })
    }

    const removeLine = (index: number) => {
        setLines((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSave = async (openEmailAfter?: boolean) => {
        if (lines.length === 0) {
            toast.error("Añade al menos una línea al pedido")
            return
        }
        setSaving(true)
        try {
            const result = await createProviderOrderWithItems({
                providerId,
                orderDate: new Date(),
                templateId: selectedTemplate?.id ?? null,
                notes: notes.trim() || null,
                emailTo: emailTo.trim() || null,
                items: lines.map((l) => ({
                    productId: l.productId,
                    code: l.code,
                    name: l.name,
                    unit: l.unit,
                    unitPrice: l.unitPrice,
                    quantity: l.quantity,
                    subtotal: l.subtotal
                }))
            })
            if (result.success) {
                toast.success("Pedido guardado")
                onOpenChange(false)
                router.refresh()
                onSuccess?.()
                setLines([])
                setNotes("")
                setEmailTo(contactEmail ?? "")
                if (openEmailAfter && result.emailTo && result.emailSubject != null && result.emailBody != null) {
                    const mailto = `mailto:${encodeURIComponent(result.emailTo)}?subject=${encodeURIComponent(result.emailSubject)}&body=${encodeURIComponent(result.emailBody)}`
                    window.open(mailto, "_blank")
                }
            } else {
                toast.error(result.error || "Error al guardar el pedido")
            }
        } catch {
            toast.error("Error al guardar el pedido")
        } finally {
            setSaving(false)
        }
    }

    const handleCopyEmail = () => {
        const text = emailPreview.body || emailPreview.subject
        if (!text) {
            toast.error("No hay contenido para copiar. Añade líneas y selecciona plantilla.")
            return
        }
        navigator.clipboard.writeText(emailPreview.subject ? `${emailPreview.subject}\n\n${emailPreview.body}` : emailPreview.body)
        toast.success("Copiado al portapapeles")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col bg-[var(--bg-card)] border-[var(--border-main)] p-0 gap-0">
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="text-[var(--text-primary)]">Nuevo pedido</DialogTitle>
                    <p className="text-sm text-[var(--text-secondary)]">{providerName}</p>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 pt-0 flex-1 min-h-0 overflow-hidden">
                    {/* Left: product search + list */}
                    <div className="flex flex-col min-h-0 border border-[var(--border-main)] rounded-lg overflow-hidden">
                        <div className="p-3 border-b border-[var(--border-main)] bg-[var(--bg-main)]/50">
                            <Label className="text-xs font-medium text-[var(--text-secondary)]">Añadir productos del catálogo</Label>
                            <Input
                                placeholder="Buscar por nombre o código..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className="mt-2 h-9 bg-[var(--bg-card)] border-[var(--border-main)] text-sm"
                            />
                        </div>
                        <div className="flex-1 overflow-auto min-h-0">
                            {activeProducts.length === 0 ? (
                                <div className="p-6 text-center text-sm text-[var(--text-secondary)]">
                                    {products.length === 0
                                        ? "Este proveedor no tiene productos. Añade productos en la pestaña Productos."
                                        : "No hay productos que coincidan con la búsqueda."}
                                </div>
                            ) : (
                                <ul className="p-2 space-y-1">
                                    {activeProducts.map((p) => (
                                        <li
                                            key={p.id}
                                            className={cn(
                                                "flex items-center justify-between gap-2 rounded-lg border p-2 text-sm",
                                                "border-[var(--border-main)] bg-[var(--bg-card)] hover:bg-[var(--bg-main)]/50"
                                            )}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <span className="font-medium text-[var(--text-primary)] truncate block">{p.name}</span>
                                                <span className="text-xs text-[var(--text-secondary)] font-mono">{p.code}</span>
                                                <span className="text-xs text-[var(--text-secondary)] ml-2">{formatCurrency(p.price)}</span>
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="shrink-0"
                                                onClick={() => addLine(p)}
                                            >
                                                <Plus className="h-4 w-4 mr-1" /> Añadir
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Right: order summary + notes + template + email preview */}
                    <div className="flex flex-col min-h-0 gap-4">
                        <div className="rounded-lg border border-[var(--border-main)] overflow-hidden flex-1 min-h-0 flex flex-col">
                            <div className="p-3 border-b border-[var(--border-main)] bg-[var(--bg-main)]/50">
                                <span className="text-xs font-medium text-[var(--text-secondary)]">Resumen del pedido</span>
                            </div>
                            <div className="flex-1 overflow-auto p-3 min-h-0">
                                {lines.length === 0 ? (
                                    <p className="text-sm text-[var(--text-secondary)]">Añade productos desde la lista de la izquierda.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {lines.map((l, i) => (
                                            <li
                                                key={i}
                                                className="flex items-center gap-2 text-sm border-b border-[var(--border-main)]/50 pb-2"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <span className="font-medium text-[var(--text-primary)]">{l.name}</span>
                                                    <span className="text-xs text-[var(--text-secondary)] ml-2 font-mono">{l.code}</span>
                                                </div>
                                                <Input
                                                    type="number"
                                                    min={0.01}
                                                    step={0.01}
                                                    value={l.quantity}
                                                    onChange={(e) => updateLineQuantity(i, parseFloat(e.target.value) || 0)}
                                                    className="w-20 h-8 text-right text-sm"
                                                />
                                                <span className="w-20 text-right text-[var(--text-primary)]">{formatCurrency(l.subtotal)}</span>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                                    onClick={() => removeLine(i)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {lines.length > 0 && (
                                    <p className="mt-3 font-semibold text-[var(--text-primary)]">
                                        Total: {formatCurrency(total)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-[var(--text-secondary)]">Notas del pedido</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Opcional"
                                className="min-h-[60px] text-sm resize-none bg-[var(--bg-card)] border-[var(--border-main)]"
                                rows={2}
                            />
                        </div>

                        {templates.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-[var(--text-secondary)]">Plantilla de correo</Label>
                                <Select value={templateId ?? defaultTemplate?.id ?? ""} onValueChange={(v) => setTemplateId(v || null)}>
                                    <SelectTrigger className="bg-[var(--bg-card)] border-[var(--border-main)]">
                                        <SelectValue placeholder="Seleccionar plantilla" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {templates.map((t) => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.name} {t.isDefault ? "(predeterminada)" : ""}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {(selectedTemplate && lines.length > 0) && (
                            <div className="rounded-lg border border-[var(--border-main)] overflow-hidden">
                                <div className="p-2 border-b border-[var(--border-main)] bg-[var(--bg-main)]/50 flex items-center justify-between">
                                    <span className="text-xs font-medium text-[var(--text-secondary)]">Vista previa del correo</span>
                                    <Button type="button" size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={handleCopyEmail}>
                                        <Copy className="h-3.5 w-3.5" /> Copiar
                                    </Button>
                                </div>
                                <div className="p-3 max-h-32 overflow-auto text-xs whitespace-pre-wrap text-[var(--text-secondary)] font-mono bg-[var(--bg-main)]/30">
                                    {emailPreview.body || "—"}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-[var(--text-secondary)]">Enviar a (email)</Label>
                            <Input
                                type="email"
                                value={emailTo}
                                onChange={(e) => setEmailTo(e.target.value)}
                                placeholder={contactEmail || "correo@proveedor.com"}
                                className="bg-[var(--bg-card)] border-[var(--border-main)] text-sm"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-4 border-t border-[var(--border-main)] gap-2 flex-wrap">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        disabled={lines.length === 0 || saving}
                        onClick={() => handleSave(false)}
                    >
                        {saving ? "Guardando…" : "Guardar pedido"}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        disabled={lines.length === 0 || saving}
                        onClick={() => handleSave(true)}
                        className="gap-2"
                    >
                        <Mail className="h-4 w-4" /> Guardar y abrir email
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
