"use client"

import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, ShoppingBag, CheckCircle, XCircle, Receipt, Loader2 } from "lucide-react"
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

interface ClientSaleRow {
  id: string
  concept: string
  amount: number
  tax: number
  total: number
  status: "PENDING" | "INVOICED" | "PAID" | "CANCELLED"
  date: string
  notes: string | null
  client?: { id: string; name: string | null }
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  PENDING:   { label: "Pendiente",  style: "bg-amber-50 text-amber-700 border-amber-200" },
  INVOICED:  { label: "Facturado",  style: "bg-blue-50 text-blue-700 border-blue-200" },
  PAID:      { label: "Pagado",     style: "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]" },
  CANCELLED: { label: "Cancelado",  style: "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)]" },
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchClientSales(clientId: string): Promise<ClientSaleRow[]> {
  const res = await fetch(`/api/client-sales?clientId=${clientId}`)
  if (!res.ok) throw new Error("Error al cargar ventas")
  return res.json()
}

async function createClientSale(data: {
  clientId: string
  concept: string
  amount: number
  tax: number
  date?: string
  notes?: string
}): Promise<{ sale: ClientSaleRow; suggestInvoice: boolean }> {
  const res = await fetch("/api/client-sales", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error ?? "Error al crear venta")
  }
  return res.json()
}

async function patchClientSale(id: string, status: string): Promise<void> {
  const res = await fetch(`/api/client-sales/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error("Error al actualizar venta")
}

// ─── Format helpers ───────────────────────────────────────────────────────────

function formatCurrency(v: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(v)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface SaleFormData {
  concept: string
  amount: string
  tax: string
  date: string
  notes: string
}

function RegisterSaleModal({
  clientId,
  open,
  onClose,
  onSuccess,
}: {
  clientId: string
  open: boolean
  onClose: () => void
  onSuccess: (sale: ClientSaleRow) => void
}) {
  const [form, setForm] = useState<SaleFormData>({
    concept: "",
    amount: "",
    tax: "21",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<SaleFormData>>({})

  const handleChange = (field: keyof SaleFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const errs: Partial<SaleFormData> = {}
    if (!form.concept.trim()) errs.concept = "Concepto requerido"
    const amt = parseFloat(form.amount)
    if (!form.amount || isNaN(amt) || amt <= 0) errs.amount = "Importe inválido"
    return errs
  }

  const handleSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setLoading(true)
    try {
      const result = await createClientSale({
        clientId,
        concept: form.concept.trim(),
        amount: parseFloat(form.amount),
        tax: parseFloat(form.tax) || 21,
        date: form.date || undefined,
        notes: form.notes.trim() || undefined,
      })
      onSuccess(result.sale)
      // Reset
      setForm({ concept: "", amount: "", tax: "21", date: new Date().toISOString().split("T")[0], notes: "" })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al registrar venta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md w-full max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar venta</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Concepto */}
          <div className="space-y-1">
            <Label htmlFor="qs-concept">Concepto <span className="text-red-500">*</span></Label>
            <Input
              id="qs-concept"
              placeholder="Servicio de diseño web, consultoría..."
              value={form.concept}
              onChange={(e) => handleChange("concept", e.target.value)}
              className={errors.concept ? "border-red-400" : ""}
            />
            {errors.concept && <p className="text-xs text-red-500">{errors.concept}</p>}
          </div>

          {/* Importe + IVA */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="qs-amount">Importe (€) <span className="text-red-500">*</span></Label>
              <Input
                id="qs-amount"
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
              <Label htmlFor="qs-tax">IVA (%)</Label>
              <Input
                id="qs-tax"
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

          {/* Total preview */}
          {form.amount && !isNaN(parseFloat(form.amount)) && (
            <div className="rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-3 text-sm flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Total (con IVA)</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {formatCurrency(parseFloat(form.amount) * (1 + (parseFloat(form.tax) || 0) / 100))}
              </span>
            </div>
          )}

          {/* Fecha */}
          <div className="space-y-1">
            <Label htmlFor="qs-date">Fecha</Label>
            <Input
              id="qs-date"
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
          </div>

          {/* Notas */}
          <div className="space-y-1">
            <Label htmlFor="qs-notes">Notas (opcional)</Label>
            <textarea
              id="qs-notes"
              rows={2}
              placeholder="Observaciones adicionales..."
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
          <Button
            onClick={handleSubmit}
            disabled={loading}
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Registrar venta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  clientId: string
}

export function ClientQuickSalesTab({ clientId }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [patchingId, setPatchingId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["client-sales", clientId],
    queryFn: () => fetchClientSales(clientId),
    staleTime: 30_000,
  })

  const handleSuccess = useCallback(
    (sale: ClientSaleRow) => {
      setShowModal(false)
      queryClient.invalidateQueries({ queryKey: ["client-sales", clientId] })
      toast.success("Venta registrada", {
        description: "¿Generar factura?",
        action: {
          label: "Generar factura",
          onClick: () => {
            window.location.href = `/dashboard/finance/invoicing?newInvoice=1&clientId=${clientId}&concept=${encodeURIComponent(sale.concept)}&amount=${sale.total}`
          },
        },
        duration: 8000,
      })
    },
    [clientId, queryClient]
  )

  const handleMarkPaid = useCallback(
    async (id: string) => {
      setPatchingId(id)
      try {
        await patchClientSale(id, "PAID")
        queryClient.invalidateQueries({ queryKey: ["client-sales", clientId] })
        toast.success("Marcada como pagada")
      } catch {
        toast.error("Error al actualizar")
      } finally {
        setPatchingId(null)
      }
    },
    [clientId, queryClient]
  )

  const handleCancel = useCallback(
    async (id: string) => {
      setPatchingId(id)
      try {
        await patchClientSale(id, "CANCELLED")
        queryClient.invalidateQueries({ queryKey: ["client-sales", clientId] })
        toast.success("Venta cancelada")
      } catch {
        toast.error("Error al actualizar")
      } finally {
        setPatchingId(null)
      }
    },
    [clientId, queryClient]
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--border-subtle)]">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Ventas rápidas</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Registra ventas manuales para este cliente
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowModal(true)}
          style={{ background: "var(--accent)", color: "#fff" }}
          className="h-8 gap-1.5 text-xs font-medium"
        >
          <Plus className="h-3.5 w-3.5" />
          Registrar venta
        </Button>
      </div>

      {/* Content */}
      <div className="p-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-[var(--text-secondary)]">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-[var(--text-secondary)]">
            <ShoppingBag className="h-8 w-8 opacity-30" />
            <p className="text-sm">No hay ventas rápidas registradas</p>
            <p className="text-xs opacity-70">Usa el botón de arriba para añadir una</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  {["Concepto", "Fecha", "Importe", "IVA", "Total", "Estado", ""].map((h) => (
                    <th
                      key={h}
                      className="py-2.5 px-3 text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap last:w-0"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => {
                  const st = STATUS_CONFIG[sale.status] ?? {
                    label: sale.status,
                    style: "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
                  }
                  const isPending = sale.status === "PENDING"
                  const isBusy = patchingId === sale.id

                  return (
                    <tr
                      key={sale.id}
                      className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] transition-colors"
                    >
                      <td className="py-3 px-3 font-medium text-[var(--text-primary)] max-w-[200px] truncate">
                        {sale.concept}
                      </td>
                      <td className="py-3 px-3 text-[var(--text-secondary)] whitespace-nowrap text-xs">
                        {formatDate(sale.date)}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-[var(--text-secondary)] whitespace-nowrap">
                        {formatCurrency(sale.amount)}
                      </td>
                      <td className="py-3 px-3 text-[var(--text-secondary)] whitespace-nowrap">
                        {sale.tax}%
                      </td>
                      <td className="py-3 px-3 tabular-nums font-medium text-[var(--text-primary)] whitespace-nowrap">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${st.style}`}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          {isPending && (
                            <>
                              <button
                                title="Marcar como pagada"
                                disabled={isBusy}
                                onClick={() => handleMarkPaid(sale.id)}
                                className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-[var(--accent-soft)] text-[var(--accent)] transition-colors disabled:opacity-50"
                              >
                                {isBusy ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <button
                                title="Cancelar venta"
                                disabled={isBusy}
                                onClick={() => handleCancel(sale.id)}
                                className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-red-50 text-[var(--text-secondary)] hover:text-red-500 transition-colors disabled:opacity-50"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          {sale.status === "PAID" || sale.status === "INVOICED" ? null : null}
                          <button
                            title="Generar factura"
                            onClick={() => {
                              window.location.href = `/dashboard/finance/invoicing?newInvoice=1&clientId=${clientId}&concept=${encodeURIComponent(sale.concept)}&amount=${sale.total}`
                            }}
                            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <RegisterSaleModal
        clientId={clientId}
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
