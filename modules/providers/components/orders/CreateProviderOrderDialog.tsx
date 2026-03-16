"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, Mail, ShoppingBag, Plus, Minus, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createProviderOrderWithItems, setOrderPendingSendConfirmation, getProviderOrder } from "@/app/dashboard/providers/actions"
import {
  renderOrderEmail,
  formatProductsTableSpanish,
} from "@/modules/providers/services/renderOrderEmail"
import type { ProviderProductRow } from "@/modules/providers/types"
import type { ProviderTemplateRow } from "@/modules/providers/types"

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n)

const STEPS = [
  { id: 1, label: "Datos" },
  { id: 2, label: "Plantilla" },
  { id: 3, label: "Productos" },
  { id: 4, label: "Revisar" },
] as const

function OrderStepper({
  currentStep,
  className,
}: {
  currentStep: number
  className?: string
}) {
  return (
    <nav
      aria-label="Pasos del pedido"
      className={cn("flex items-center justify-between gap-1", className)}
    >
      {STEPS.map((s, i) => {
        const isActive = currentStep === s.id
        const isCompleted = currentStep > s.id
        return (
          <div key={s.id} className="flex flex-1 items-center">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                isActive &&
                  "bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30",
                isCompleted && !isActive && "text-[var(--text-muted)]",
                !isActive && !isCompleted && "text-[var(--text-muted)]"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px]",
                  isCompleted && "bg-[var(--accent)]/20 text-[var(--accent)]",
                  isActive && "bg-[var(--accent)] text-white",
                  !isActive && !isCompleted && "bg-[var(--bg-main)] text-[var(--text-muted)]"
                )}
              >
                {isCompleted ? <Check className="h-3 w-3" /> : s.id}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-1 h-px flex-1 min-w-[8px]",
                  isCompleted ? "bg-[var(--accent)]/30" : "bg-[var(--border-main)]"
                )}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}

type LoadedDraft = {
  id: string
  status?: string
  emailTo: string | null
  emailSubject: string | null
  emailBody: string | null
}

export type CreateProviderOrderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  providerId: string
  providerName?: string | null
  contactEmail?: string | null
  products?: ProviderProductRow[]
  templates?: ProviderTemplateRow[]
  onSaveDraft?: () => void
  onCreateTemplate?: () => void
  /** Si se pasa, al abrir se carga el borrador y se va al paso de revisión para abrir el correo. */
  initialDraftOrderId?: string | null
}

export function CreateProviderOrderDialog({
  open,
  onOpenChange,
  providerId,
  providerName,
  contactEmail,
  products = [],
  templates = [],
  onSaveDraft,
  onCreateTemplate,
  initialDraftOrderId,
}: CreateProviderOrderDialogProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [orderNumber, setOrderNumber] = useState("")
  const [orderDate, setOrderDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  )
  const [notes, setNotes] = useState("")
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [productSearch, setProductSearch] = useState("")
  const [saving, setSaving] = useState(false)
  const [loadedDraftOrder, setLoadedDraftOrder] = useState<LoadedDraft | null>(null)

  useEffect(() => {
    if (open && initialDraftOrderId) {
      getProviderOrder(initialDraftOrderId).then((res) => {
        if (res.success && res.order) {
          const o = res.order as {
            id: string
            orderNumber?: string | null
            orderDate: Date
            notes?: string | null
            templateId?: string | null
            emailTo?: string | null
            emailSubject?: string | null
            emailBody?: string | null
            items: { productId: string | null; quantity: number }[]
          }
          setOrderNumber(o.orderNumber ?? "")
          setOrderDate(new Date(o.orderDate).toISOString().slice(0, 10))
          setNotes(o.notes ?? "")
          setSelectedTemplateId(o.templateId ?? null)
          const qty: Record<string, number> = {}
          o.items.forEach((i) => {
            if (i.productId) qty[i.productId] = Number(i.quantity) || 0
          })
          setQuantities(qty)
          setLoadedDraftOrder({
            id: o.id,
            emailTo: o.emailTo ?? null,
            emailSubject: o.emailSubject ?? null,
            emailBody: o.emailBody ?? null,
          })
          setStep(4)
        }
      })
    } else if (open) {
      setStep(1)
      setLoadedDraftOrder(null)
    }
  }, [open, initialDraftOrderId])

  const defaultTemplate = useMemo(
    () => templates.find((t) => t.isDefault) ?? templates[0],
    [templates]
  )
  const selectedTemplate =
    selectedTemplateId != null
      ? templates.find((t) => t.id === selectedTemplateId)
      : defaultTemplate

  useEffect(() => {
    if (open && selectedTemplateId == null && defaultTemplate) {
      setSelectedTemplateId(defaultTemplate.id)
    }
  }, [open, defaultTemplate, selectedTemplateId])

  const filteredProducts = useMemo(
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

  const lineItems = useMemo(() => {
    return products
      .filter((p) => (quantities[p.id] ?? 0) > 0)
      .map((p) => {
        const qty = quantities[p.id] ?? 0
        return {
          productId: p.id,
          code: p.code,
          name: p.name,
          unit: p.unit,
          unitPrice: p.price,
          quantity: qty,
          subtotal: qty * p.price,
        }
      })
  }, [products, quantities])

  const total = useMemo(
    () => lineItems.reduce((sum, l) => sum + l.subtotal, 0),
    [lineItems]
  )
  const totalUnits = useMemo(
    () => lineItems.reduce((sum, l) => sum + l.quantity, 0),
    [lineItems]
  )

  const orderDateStr = useMemo(() => {
    try {
      return new Date(orderDate).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    }
  }, [orderDate])

  const productsTableForEmail = useMemo(
    () =>
      formatProductsTableSpanish(
        lineItems.map((l) => ({
          code: l.code,
          name: l.name,
          unit: l.unit,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          subtotal: l.subtotal,
        })),
        formatCurrency
      ),
    [lineItems]
  )

  const emailPreview = useMemo(() => {
    if (!selectedTemplate) return { subject: "", body: "" }
    return renderOrderEmail(selectedTemplate.subject, selectedTemplate.body, {
      providerName: providerName ?? "",
      orderDate: orderDateStr,
      orderNumber: orderNumber.trim() || "—",
      productsTable: productsTableForEmail,
      totalAmount: formatCurrency(total),
      notes: notes.trim(),
    })
  }, [
    selectedTemplate,
    providerName,
    orderDateStr,
    orderNumber,
    productsTableForEmail,
    total,
    notes,
  ])

  const canOpenEmail =
    loadedDraftOrder != null
      ? (loadedDraftOrder.emailTo?.trim() ?? "") !== ""
      : orderNumber.trim() !== "" &&
        lineItems.length > 0 &&
        (contactEmail?.trim() ?? "") !== "" &&
        selectedTemplate != null

  const setQuantity = (productId: string, value: number) => {
    const q = Math.max(0, Math.floor(value))
    setQuantities((prev) => (q === 0 ? { ...prev, [productId]: 0 } : { ...prev, [productId]: q }))
  }

  const handleSaveDraft = async () => {
    if (lineItems.length === 0) {
      toast.error("Añade al menos un producto con cantidad")
      return
    }
    setSaving(true)
    try {
      const result = await createProviderOrderWithItems({
        providerId,
        orderDate: new Date(orderDate),
        templateId: selectedTemplate?.id ?? null,
        notes: notes.trim() || null,
        emailTo: contactEmail?.trim() || null,
        items: lineItems.map((l) => ({
          productId: l.productId,
          code: l.code,
          name: l.name,
          unit: l.unit,
          unitPrice: l.unitPrice,
          quantity: l.quantity,
          subtotal: l.subtotal,
        })),
      })
      if (result.success) {
        toast.success("Borrador guardado")
        onOpenChange(false)
        onSaveDraft?.()
        router.refresh()
        setQuantities({})
        setOrderNumber("")
        setNotes("")
      } else {
        toast.error(result.error ?? "Error al guardar")
      }
    } catch {
      toast.error("Error al guardar el pedido")
    } finally {
      setSaving(false)
    }
  }

  /** Handler exclusivo para «Abrir correo preparado». Persiste con PENDING_SEND_CONFIRMATION y abre el cliente de correo. No guarda como borrador. */
  const handleOpenPreparedEmail = async () => {
    if (!canOpenEmail) return
    setSaving(true)
    try {
      let orderId: string
      let mailtoUrl: string

      if (loadedDraftOrder) {
        const to = (loadedDraftOrder.emailTo ?? "").trim()
        if (!to) {
          toast.error("Este borrador no tiene correo de destino.")
          return
        }
        console.log("[OpenEmail] start (draft)", {
          orderId: loadedDraftOrder.id,
          currentStatus: loadedDraftOrder.status,
        })
        console.log("[OpenEmail] updating to PENDING_SEND_CONFIRMATION", {
          orderId: loadedDraftOrder.id,
        })
        const res = await setOrderPendingSendConfirmation(loadedDraftOrder.id)
        console.log("[OpenEmail] update result (draft)", res)
        if (!res.success) {
          toast.error(res.error ?? "Error al actualizar el estado")
          return
        }
        orderId = loadedDraftOrder.id
        const subject = loadedDraftOrder.emailSubject ?? ""
        const body = loadedDraftOrder.emailBody ?? ""
        mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      } else {
        if (lineItems.length === 0) {
          toast.error("Añade al menos un producto con cantidad")
          return
        }
        console.log("[OpenEmail] start (new order)", {
          providerId,
          orderDate,
          templateId: selectedTemplate?.id ?? null,
          lineItemsCount: lineItems.length,
        })
        const result = await createProviderOrderWithItems({
          providerId,
          orderDate: new Date(orderDate),
          templateId: selectedTemplate?.id ?? null,
          notes: notes.trim() || null,
          emailTo: contactEmail?.trim() || null,
          items: lineItems.map((l) => ({
            productId: l.productId,
            code: l.code,
            name: l.name,
            unit: l.unit,
            unitPrice: l.unitPrice,
            quantity: l.quantity,
            subtotal: l.subtotal,
          })),
        })
        if (!result.success || !result.order) {
          toast.error(result.error ?? "Error al guardar el pedido")
          return
        }
        orderId = (result.order as { id: string }).id
        console.log("[OpenEmail] created order", {
          orderId,
          status: (result.order as any).status,
        })
        console.log("[OpenEmail] updating to PENDING_SEND_CONFIRMATION", {
          orderId,
        })
        const setPending = await setOrderPendingSendConfirmation(orderId)
        console.log("[OpenEmail] update result (new order)", setPending)
        if (!setPending.success) {
          toast.error(setPending.error ?? "No se pudo actualizar el estado. El pedido se guardó como borrador.")
          return
        }
        const to = contactEmail!.trim()
        const subject = emailPreview.subject
        const body = emailPreview.body
        mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      }

      try {
        sessionStorage.setItem(
          "providerOrderPendingConfirm",
          JSON.stringify({ orderId, providerId, at: Date.now() })
        )
      } catch (_) {}

      // Abrir cliente de correo usando mailto en la pestaña actual
      if (typeof window !== "undefined") {
        window.location.href = mailtoUrl
      }

      onOpenChange(false)
      onSaveDraft?.()
      setLoadedDraftOrder(null)
      setQuantities({})
      setOrderNumber("")
      setNotes("")
    } catch {
      toast.error("Error al preparar el correo")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => onOpenChange(false)

  const canStep1 = orderNumber.trim() !== ""
  const canStep2 = selectedTemplate != null
  const canStep3 = lineItems.length > 0

  const inputClass = cn(
    "bg-[var(--bg-main)] border-[var(--border-main)] text-[var(--text-primary)]",
    "placeholder:text-[var(--text-muted)]"
  )
  const labelClass = "text-sm font-medium text-[var(--text-primary)]"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden",
          step === 4 ? "max-w-4xl" : "max-w-2xl",
          "bg-[var(--bg-card)] border-[var(--border-main)]"
        )}
      >
        <DialogHeader className="p-5 pb-3 shrink-0 border-b border-[var(--border-main)]">
          <DialogTitle className="text-lg font-semibold text-[var(--text-primary)]">
            Nuevo pedido
          </DialogTitle>
          {providerName && (
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {providerName}
            </p>
          )}
          <OrderStepper currentStep={step} className="mt-4" />
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 overflow-auto p-5">
          {/* PASO 1 — Datos del pedido */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label className={labelClass}>Número de pedido *</Label>
                <Input
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className={cn("mt-1.5", inputClass)}
                  placeholder="Ej. PED-2025-001"
                />
              </div>
              <div>
                <Label className={labelClass}>Fecha del pedido</Label>
                <Input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className={cn("mt-1.5", inputClass)}
                />
              </div>
              <div>
                <Label className={labelClass}>Observaciones / notas (opcional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={cn("mt-1.5 min-h-[80px] resize-none", inputClass)}
                  placeholder="Notas para el pedido"
                />
              </div>
            </div>
          )}

          {/* PASO 2 — Plantilla de correo */}
          {step === 2 && (
            <div className="space-y-4">
              {templates.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[var(--border-main)] p-6 text-center">
                  <FileText className="h-10 w-10 mx-auto text-[var(--text-muted)] mb-2 opacity-60" />
                  <p className="text-sm text-[var(--text-secondary)]">
                    Este proveedor aún no tiene plantillas de correo.
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Crea una para personalizar el asunto y el cuerpo del correo del pedido.
                  </p>
                  {onCreateTemplate && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={onCreateTemplate}
                    >
                      Crear primera plantilla
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-xs font-medium text-[var(--text-secondary)]">
                      Plantilla de correo
                    </Label>
                    {onCreateTemplate && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={onCreateTemplate}
                      >
                        Crear plantilla
                      </Button>
                    )}
                  </div>
                  <Select
                    value={selectedTemplateId ?? ""}
                    onValueChange={(v) => setSelectedTemplateId(v || null)}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Seleccionar plantilla" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                          {t.isDefault ? " (predeterminada)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTemplate && (
                    <div className="rounded-lg border border-[var(--border-main)] bg-[var(--bg-main)]/20 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
                        Vista previa del asunto
                      </p>
                      <p className="text-sm text-[var(--text-primary)]">
                        {emailPreview.subject || "—"}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* PASO 3 — Productos */}
          {step === 3 && (
            <div className="space-y-4">
              <Input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className={inputClass}
                placeholder="Buscar por código o nombre"
              />
              <div className="rounded-lg border border-[var(--border-main)] overflow-hidden">
                <div className="overflow-auto max-h-[280px]">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[var(--bg-card)] border-b border-[var(--border-main)]">
                      <tr>
                        <th className="text-left p-2 text-xs font-medium text-[var(--text-secondary)]">Código</th>
                        <th className="text-left p-2 text-xs font-medium text-[var(--text-secondary)]">Producto</th>
                        <th className="text-left p-2 text-xs font-medium text-[var(--text-secondary)]">Unidad</th>
                        <th className="text-right p-2 text-xs font-medium text-[var(--text-secondary)]">P. unit.</th>
                        <th className="text-center p-2 text-xs font-medium text-[var(--text-secondary)]">Cantidad</th>
                        <th className="text-right p-2 text-xs font-medium text-[var(--text-secondary)]">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-[var(--text-muted)] text-xs">
                            {products.length === 0
                              ? "No hay productos en el catálogo"
                              : "No hay coincidencias"}
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => {
                          const qty = quantities[p.id] ?? 0
                          const subtotal = qty * p.price
                          return (
                            <tr
                              key={p.id}
                              className="border-b border-[var(--border-main)]/50 hover:bg-[var(--bg-main)]/30"
                            >
                              <td className="p-2 font-mono text-xs text-[var(--text-primary)]">{p.code}</td>
                              <td className="p-2 text-[var(--text-primary)]">{p.name}</td>
                              <td className="p-2 text-[var(--text-secondary)]">{p.unit ?? "—"}</td>
                              <td className="p-2 text-right text-[var(--text-primary)]">{formatCurrency(p.price)}</td>
                              <td className="p-2">
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7 shrink-0"
                                    onClick={() => setQuantity(p.id, qty - 1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={qty}
                                    onChange={(e) =>
                                      setQuantity(p.id, parseInt(e.target.value, 10) || 0)
                                    }
                                    className={cn("h-8 w-14 text-center", inputClass)}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7 shrink-0"
                                    onClick={() => setQuantity(p.id, qty + 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                              <td className="p-2 text-right font-medium text-[var(--text-primary)]">
                                {subtotal > 0 ? formatCurrency(subtotal) : "—"}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                {lineItems.length > 0 && (
                  <div className="px-3 py-2 border-t border-[var(--border-main)] bg-[var(--bg-main)]/30 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
                    <span>{lineItems.length} línea{lineItems.length !== 1 ? "s" : ""}</span>
                    <span>{totalUnits} unidad{totalUnits !== 1 ? "es" : ""}</span>
                    <span className="font-medium text-[var(--text-primary)]">
                      Importe provisional: {formatCurrency(total)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PASO 4 — Revisión final (dos columnas: resumen | vista previa correo) */}
          {step === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-0">
              {/* Columna izquierda: resumen del pedido */}
              <div className="rounded-lg border border-[var(--border-main)] bg-[var(--bg-main)]/20 p-4 flex flex-col min-h-0">
                <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-3 shrink-0">
                  Resumen del pedido
                </h3>
                <dl className="space-y-1.5 text-sm shrink-0">
                  <div>
                    <dt className="text-[var(--text-muted)] text-xs">Nº pedido</dt>
                    <dd className="font-medium text-[var(--text-primary)]">{orderNumber.trim() || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)] text-xs">Fecha</dt>
                    <dd className="text-[var(--text-primary)]">{orderDateStr}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)] text-xs">Observaciones</dt>
                    <dd className="text-[var(--text-primary)]">{notes.trim() || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)] text-xs">Correo del proveedor</dt>
                    <dd className="text-[var(--text-primary)] truncate" title={contactEmail ?? undefined}>{contactEmail?.trim() || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)] text-xs">Plantilla</dt>
                    <dd className="text-[var(--text-primary)]">{selectedTemplate?.name ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)] text-xs">Nº de líneas</dt>
                    <dd className="text-[var(--text-primary)]">{lineItems.length}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)] text-xs">Importe total</dt>
                    <dd className="font-semibold text-[var(--text-primary)]">{formatCurrency(total)}</dd>
                  </div>
                </dl>
                {lineItems.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-main)] flex-1 min-h-0 overflow-auto">
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Productos</p>
                    <ul className="text-xs text-[var(--text-secondary)] space-y-1">
                      {lineItems.map((l) => (
                        <li key={l.productId} className="leading-snug">
                          {l.code} · {l.name} — {l.quantity} × {formatCurrency(l.unitPrice)} = {formatCurrency(l.subtotal)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* Columna derecha: vista previa del correo */}
              <div className="rounded-lg border border-[var(--border-main)] overflow-hidden bg-[var(--bg-main)]/20 flex flex-col min-h-0">
                <div className="p-2.5 border-b border-[var(--border-main)] flex items-center gap-2 shrink-0">
                  <Mail className="h-4 w-4 text-[var(--text-secondary)] shrink-0" />
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Vista previa del correo</span>
                </div>
                <div className="p-4 flex-1 min-h-0 overflow-auto">
                  {selectedTemplate ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Asunto</p>
                        <p className="text-sm text-[var(--text-primary)] leading-snug">{emailPreview.subject || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">Cuerpo</p>
                        <pre className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap font-sans leading-relaxed">
                          {emailPreview.body || "—"}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">Sin plantilla seleccionada.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-5 pt-4 border-t border-[var(--border-main)] shrink-0 gap-2 flex-wrap">
          {step === 1 && (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button
                disabled={!canStep1}
                onClick={() => setStep(2)}
                className="bg-[var(--accent)] hover:opacity-90 text-white"
              >
                Continuar
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                Volver
              </Button>
              <Button
                disabled={!canStep2}
                onClick={() => setStep(3)}
                className="bg-[var(--accent)] hover:opacity-90 text-white"
              >
                Continuar
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <Button variant="outline" onClick={() => setStep(2)}>
                Volver
              </Button>
              <Button
                disabled={!canStep3}
                onClick={() => setStep(4)}
                className="bg-[var(--accent)] hover:opacity-90 text-white"
              >
                Continuar
              </Button>
            </>
          )}
          {step === 4 && (
            <>
              <Button type="button" variant="outline" onClick={() => setStep(3)}>
                Volver
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={lineItems.length === 0 || saving}
                onClick={handleSaveDraft}
              >
                {saving ? "Guardando…" : "Guardar borrador"}
              </Button>
              <Button
                type="button"
                disabled={!canOpenEmail}
                onClick={handleOpenPreparedEmail}
                className="bg-[var(--accent)] hover:opacity-90 text-white"
              >
                Abrir correo preparado
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
