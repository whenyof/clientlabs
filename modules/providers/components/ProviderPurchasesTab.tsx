"use client"

import { useState, useCallback, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Plus,
  ShoppingCart,
  CheckCircle,
  Loader2,
  FileText,
  Package,
  Upload,
  ExternalLink,
} from "lucide-react"
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
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientPurchaseRow {
  id: string
  concept: string
  amount: number
  tax: number
  total: number
  status: "PENDING" | "RECEIVED" | "PAID" | "CANCELLED"
  date: string
  notes: string | null
  invoiceDocUrl: string | null
  deliveryDocUrl: string | null
}

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  PENDING:   { label: "Pendiente",  style: "bg-amber-50 text-amber-700 border-amber-200" },
  RECEIVED:  { label: "Recibido",   style: "bg-blue-50 text-blue-700 border-blue-200" },
  PAID:      { label: "Pagado",     style: "bg-green-50 text-green-700 border-green-200" },
  CANCELLED: { label: "Cancelado",  style: "bg-neutral-50 text-neutral-500 border-neutral-200" },
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchPurchases(providerId: string): Promise<ClientPurchaseRow[]> {
  const res = await fetch(`/api/client-purchases?providerId=${providerId}`)
  if (!res.ok) throw new Error("Error al cargar compras")
  return res.json()
}

async function createPurchase(data: {
  providerId: string
  concept: string
  amount: number
  tax: number
  date?: string
  notes?: string
}): Promise<{ purchase: ClientPurchaseRow }> {
  const res = await fetch("/api/client-purchases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? "Error al crear compra")
  }
  return res.json()
}

async function patchPurchase(id: string, data: Record<string, unknown>): Promise<void> {
  const res = await fetch(`/api/client-purchases/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Error al actualizar compra")
}

async function uploadDoc(purchaseId: string, file: File, docType: "invoice" | "delivery"): Promise<string> {
  const fd = new FormData()
  fd.append("file", file)
  fd.append("purchaseId", purchaseId)
  fd.append("docType", docType)
  const res = await fetch("/api/client-purchases/upload", { method: "POST", body: fd })
  if (!res.ok) throw new Error("Error al subir archivo")
  const data = await res.json()
  return data.url as string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(v: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(v)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
}

// ─── Register Purchase Modal ──────────────────────────────────────────────────

interface FormData {
  concept: string
  amount: string
  tax: string
  date: string
  notes: string
}

function RegisterPurchaseModal({
  providerId,
  open,
  onClose,
  onSuccess,
}: {
  providerId: string
  open: boolean
  onClose: () => void
  onSuccess: (purchase: ClientPurchaseRow) => void
}) {
  const [form, setForm] = useState<FormData>({
    concept: "",
    amount: "",
    tax: "21",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const errs: Partial<FormData> = {}
    if (!form.concept.trim()) errs.concept = "Concepto requerido"
    const amt = parseFloat(form.amount)
    if (!form.amount || isNaN(amt) || amt <= 0) errs.amount = "Importe inválido"
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    try {
      const result = await createPurchase({
        providerId,
        concept: form.concept.trim(),
        amount: parseFloat(form.amount),
        tax: parseFloat(form.tax) || 21,
        date: form.date || undefined,
        notes: form.notes.trim() || undefined,
      })
      onSuccess(result.purchase)
      setForm({ concept: "", amount: "", tax: "21", date: new Date().toISOString().split("T")[0], notes: "" })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al registrar compra")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md w-full max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar compra</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="cp-concept">Concepto <span className="text-red-500">*</span></Label>
            <Input
              id="cp-concept"
              placeholder="Material de oficina, licencia software..."
              value={form.concept}
              onChange={(e) => handleChange("concept", e.target.value)}
              className={errors.concept ? "border-red-400" : ""}
            />
            {errors.concept && <p className="text-xs text-red-500">{errors.concept}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="cp-amount">Importe (€) <span className="text-red-500">*</span></Label>
              <Input
                id="cp-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                className={errors.amount ? "border-red-400" : ""}
              />
              {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="cp-tax">IVA (%)</Label>
              <Input
                id="cp-tax"
                type="number"
                min="0"
                max="100"
                step="1"
                placeholder="21"
                value={form.tax}
                onChange={(e) => handleChange("tax", e.target.value)}
              />
            </div>
          </div>

          {form.amount && !isNaN(parseFloat(form.amount)) && (
            <div className="rounded-md bg-neutral-50 border border-neutral-200 p-3 text-sm flex items-center justify-between">
              <span className="text-neutral-500">Total (con IVA)</span>
              <span className="font-semibold text-neutral-900">
                {formatCurrency(parseFloat(form.amount) * (1 + (parseFloat(form.tax) || 0) / 100))}
              </span>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="cp-date">Fecha</Label>
            <Input
              id="cp-date"
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="cp-notes">Notas (opcional)</Label>
            <textarea
              id="cp-notes"
              rows={2}
              placeholder="Observaciones..."
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-[#1FA97A] hover:bg-[#18916a] text-white">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Registrar compra
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  providerId: string
}

export function ProviderPurchasesTab({ providerId }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [uploading, setUploading] = useState<{ id: string; type: "invoice" | "delivery" } | null>(null)
  const invoiceInputRef = useRef<HTMLInputElement>(null)
  const deliveryInputRef = useRef<HTMLInputElement>(null)
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null)
  const [activeUploadType, setActiveUploadType] = useState<"invoice" | "delivery">("invoice")
  const queryClient = useQueryClient()

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["client-purchases", providerId],
    queryFn: () => fetchPurchases(providerId),
    staleTime: 30_000,
  })

  const handleSuccess = useCallback(
    (purchase: ClientPurchaseRow) => {
      setShowModal(false)
      queryClient.invalidateQueries({ queryKey: ["client-purchases", providerId] })
      toast.success("Compra registrada", {
        description: "Sube la factura y albarán del proveedor",
        duration: 6000,
      })
    },
    [providerId, queryClient]
  )

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, purchaseId: string, docType: "invoice" | "delivery") => {
      const file = e.target.files?.[0]
      if (!file) return
      setUploading({ id: purchaseId, type: docType })
      try {
        await uploadDoc(purchaseId, file, docType)
        queryClient.invalidateQueries({ queryKey: ["client-purchases", providerId] })
        toast.success(docType === "invoice" ? "Factura subida" : "Albarán subido")
      } catch {
        toast.error("Error al subir el archivo")
      } finally {
        setUploading(null)
        e.target.value = ""
      }
    },
    [providerId, queryClient]
  )

  const triggerUpload = (purchaseId: string, docType: "invoice" | "delivery") => {
    setActiveUploadId(purchaseId)
    setActiveUploadType(docType)
    if (docType === "invoice") invoiceInputRef.current?.click()
    else deliveryInputRef.current?.click()
  }

  return (
    <div className="p-4 sm:p-5">
      {/* Hidden file inputs */}
      <input
        ref={invoiceInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => activeUploadId && handleUpload(e, activeUploadId, "invoice")}
      />
      <input
        ref={deliveryInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => activeUploadId && handleUpload(e, activeUploadId, "delivery")}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Compras</h3>
          <p className="text-xs text-neutral-500 mt-0.5">Registra compras realizadas a este proveedor</p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowModal(true)}
          className="h-8 gap-1.5 text-xs bg-[#1FA97A] hover:bg-[#18916a] text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          Registrar compra
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10 text-neutral-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : purchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-neutral-400">
          <ShoppingCart className="h-8 w-8 opacity-30" />
          <p className="text-sm">No hay compras registradas</p>
          <p className="text-xs opacity-70">Usa el botón de arriba para añadir una</p>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((purchase) => {
            const st = STATUS_CONFIG[purchase.status] ?? {
              label: purchase.status,
              style: "bg-neutral-50 text-neutral-500 border-neutral-200",
            }
            const isUploadingInvoice = uploading?.id === purchase.id && uploading.type === "invoice"
            const isUploadingDelivery = uploading?.id === purchase.id && uploading.type === "delivery"

            return (
              <div
                key={purchase.id}
                className="rounded-lg border border-neutral-200 bg-white p-4 space-y-3"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-neutral-900 truncate">{purchase.concept}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{formatDate(purchase.date)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${st.style}`}>
                      {st.label}
                    </span>
                    <span className="font-semibold text-sm text-neutral-900 tabular-nums">
                      {formatCurrency(purchase.total)}
                    </span>
                  </div>
                </div>

                {/* Details row */}
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <span>Base: {formatCurrency(purchase.amount)}</span>
                  <span>·</span>
                  <span>IVA: {purchase.tax}%</span>
                </div>

                {/* Document buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Invoice */}
                  {purchase.invoiceDocUrl ? (
                    <a
                      href={purchase.invoiceDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Ver factura
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <button
                      onClick={() => triggerUpload(purchase.id, "invoice")}
                      disabled={isUploadingInvoice}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-700 border border-neutral-200 rounded-md px-2.5 py-1 transition-colors disabled:opacity-50"
                    >
                      {isUploadingInvoice ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3" />
                      )}
                      Subir factura
                    </button>
                  )}

                  {/* Delivery note */}
                  {purchase.deliveryDocUrl ? (
                    <a
                      href={purchase.deliveryDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
                    >
                      <Package className="h-3.5 w-3.5" />
                      Ver albarán
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <button
                      onClick={() => triggerUpload(purchase.id, "delivery")}
                      disabled={isUploadingDelivery}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-700 border border-neutral-200 rounded-md px-2.5 py-1 transition-colors disabled:opacity-50"
                    >
                      {isUploadingDelivery ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3" />
                      )}
                      Subir albarán
                    </button>
                  )}
                </div>

                {purchase.notes && (
                  <p className="text-xs text-neutral-500 border-t border-neutral-100 pt-2">{purchase.notes}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <RegisterPurchaseModal
        providerId={providerId}
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
