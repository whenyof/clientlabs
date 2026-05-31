"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog"

interface NewOrderModalProps {
  open: boolean
  onClose: () => void
  clientId: string
  clientName?: string | null
}

type OrderItem = {
  product: string
  quantity: string
  price: string
  taxRate: number
}

export function NewOrderModal({
  open,
  onClose,
  clientId,
  clientName,
}: NewOrderModalProps) {
  const router = useRouter()

  const [items, setItems] = useState<OrderItem[]>([
    { product: "", quantity: "", price: "", taxRate: 21 },
  ])
  const [notes, setNotes] = useState("")
  const [createQuote, setCreateQuote] = useState(false)
  const [createDeliveryNote, setCreateDeliveryNote] = useState(false)
  const [createInvoice, setCreateInvoice] = useState(false)
  const [invoiceDocType, setInvoiceDocType] = useState<"F1" | "F2">("F1")
  const [irpfRate, setIrpfRate] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleItemChange = (index: number, field: keyof OrderItem, value: string) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: field === "taxRate" ? Number(value) : value } : item,
      ),
    )
  }

  const addLine = () => {
    setItems((prev) => [...prev, { product: "", quantity: "", price: "", taxRate: 21 }])
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const computeLineTotal = (item: OrderItem) => {
    const q = Number(item.quantity) || 0
    const p = Number(item.price) || 0
    return q * p
  }

  const subtotal = items.reduce((acc, item) => acc + computeLineTotal(item), 0)
  const taxAmount = items.reduce((acc, item) => {
    const base = computeLineTotal(item)
    return acc + (base * (Number(item.taxRate) || 0)) / 100
  }, 0)
  const irpfAmount = subtotal * (irpfRate / 100)
  const total = subtotal + taxAmount - irpfAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const payload = {
        clientId,
        notes,
        createQuote,
        createOrder: true,
        createDeliveryNote,
        createInvoice,
        invoiceDocType,
        irpfRate,
        items: items.map((item) => ({
          description: item.product,
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.price) || 0,
          taxRate: item.taxRate,
        })),
      }

      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error ?? "Error creando pedido")
        return
      }

      const data = await res.json()
      const names: string[] = [data.order?.number].filter(Boolean)
      if (data.quote) names.push(data.quote.number)
      if (data.deliveryNote) names.push(data.deliveryNote.number)
      if (data.invoice) names.push(data.invoice.number)
      toast.success(`Pedido creado: ${names.join(", ")}`)
      onClose()
      router.refresh()
    } catch {
      toast.error("Error inesperado")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-6xl">
        <DialogHeader>
          <DialogTitle>Nuevo pedido</DialogTitle>
          <p className="text-sm text-[var(--text-secondary)]">
            {clientName ? `Cliente: ${clientName}` : "Añade productos al pedido"}
          </p>
        </DialogHeader>

        <DialogBody>
          <form id="new-order-form" onSubmit={handleSubmit} className="space-y-8">
            {/* PRODUCTS */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-neutral-900">Productos</h3>
                <button
                  type="button"
                  onClick={addLine}
                  className="text-sm text-[var(--accent)] font-medium hover:underline"
                >
                  + Añadir producto
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full table-fixed border-collapse">
                  <colgroup>
                    <col style={{ width: "58%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "8%" }} />
                    <col style={{ width: "2%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="pb-3 text-left text-xs uppercase text-neutral-500 border-b border-neutral-200">Producto</th>
                      <th className="pb-3 text-center text-xs uppercase text-neutral-500 border-b border-neutral-200">Cantidad</th>
                      <th className="pb-3 text-center text-xs uppercase text-neutral-500 border-b border-neutral-200">Precio</th>
                      <th className="pb-3 text-center text-xs uppercase text-neutral-500 border-b border-neutral-200">IVA</th>
                      <th className="pb-3 text-right text-xs uppercase text-neutral-500 border-b border-neutral-200">Total</th>
                      <th className="pb-3 text-xs uppercase text-neutral-500 border-b border-neutral-200" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const lineTotal = computeLineTotal(item)
                      return (
                        <tr key={index} className="border-b border-neutral-100">
                          <td className="py-3 pr-4 align-middle">
                            <input
                              value={item.product}
                              onChange={(e) => handleItemChange(index, "product", e.target.value)}
                              placeholder="Producto o servicio"
                              className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm bg-white"
                            />
                          </td>
                          <td className="py-3 pr-4 align-middle">
                            <input
                              type="number"
                              min={1}
                              placeholder="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                              className="h-10 w-full rounded-md border border-neutral-200 px-2 text-center text-sm bg-white placeholder-neutral-400"
                            />
                          </td>
                          <td className="py-3 pr-4 align-middle">
                            <input
                              type="number"
                              step="0.01"
                              min={0}
                              placeholder="0"
                              value={item.price}
                              onChange={(e) => handleItemChange(index, "price", e.target.value)}
                              className="h-10 w-full rounded-md border border-neutral-200 px-2 text-center text-sm bg-white placeholder-neutral-400"
                            />
                          </td>
                          <td className="py-3 pr-4 align-middle">
                            <select
                              value={item.taxRate}
                              onChange={(e) => handleItemChange(index, "taxRate", e.target.value)}
                              className="h-10 w-full rounded-md border border-neutral-200 px-2 text-center text-sm bg-white appearance-none"
                            >
                              {[0, 10, 21].map((rate) => (
                                <option key={rate} value={rate}>{rate}%</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 pr-2 text-right text-sm font-medium tabular-nums text-neutral-700 whitespace-nowrap align-middle">
                            €{lineTotal.toFixed(2)}
                          </td>
                          <td className="py-3 text-center align-middle">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              disabled={items.length <= 1}
                              className="h-8 w-8 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                              aria-label="Eliminar línea"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* BOTTOM LAYOUT */}
            <section className="grid grid-cols-[1fr_320px] gap-8">
              <div className="space-y-2 min-w-0">
                <label className="text-sm font-medium text-neutral-700">Notas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Información adicional..."
                  className="w-full min-h-[120px] py-3 text-sm rounded-md border border-neutral-200 px-3 bg-white resize-y"
                />
              </div>

              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-4">
                <div className="space-y-2 text-sm text-neutral-700">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="tabular-nums">€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA</span>
                    <span className="tabular-nums">€{taxAmount.toFixed(2)}</span>
                  </div>
                  {irpfRate > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>IRPF -{irpfRate}%</span>
                      <span className="tabular-nums">-€{irpfAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-neutral-200 pt-2 mt-2">
                    <div className="flex justify-between font-semibold text-neutral-900">
                      <span>TOTAL</span>
                      <span className="tabular-nums">€{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200 space-y-3">
                  <p className="text-xs font-medium uppercase text-neutral-500">Retención IRPF</p>
                  <div className="relative">
                    <select
                      value={irpfRate}
                      onChange={(e) => setIrpfRate(Number(e.target.value))}
                      className="w-full appearance-none text-sm border border-neutral-200 rounded-md px-3 py-2 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E] pr-8"
                    >
                      <option value={0}>Sin retención (0%)</option>
                      <option value={7}>7% — primeros 2 años</option>
                      <option value={15}>15% — retención estándar</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-200 space-y-3">
                  <p className="text-xs font-medium uppercase text-neutral-500">Documentos adicionales</p>
                  <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createQuote}
                      onChange={(e) => setCreateQuote(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 accent-[#0F766E]"
                    />
                    Presupuesto (borrador)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createDeliveryNote}
                      onChange={(e) => setCreateDeliveryNote(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 accent-[#0F766E]"
                    />
                    Albarán de entrega (borrador)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createInvoice}
                      onChange={(e) => setCreateInvoice(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 accent-[#0F766E]"
                    />
                    Factura (borrador)
                  </label>
                  {createInvoice && (
                    <div className="ml-6 space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="invoiceDocType"
                          value="F1"
                          checked={invoiceDocType === "F1"}
                          onChange={() => setInvoiceDocType("F1")}
                          className="accent-[#0F766E]"
                        />
                        <span className="text-xs text-neutral-600">F1 — Completa <span className="text-neutral-400">(con NIF del cliente)</span></span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="invoiceDocType"
                          value="F2"
                          checked={invoiceDocType === "F2"}
                          onChange={() => setInvoiceDocType("F2")}
                          className="accent-[#0F766E]"
                        />
                        <span className="text-xs text-neutral-600">F2 — Simplificada <span className="text-neutral-400">(sin NIF, máx. 3.000€)</span></span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </form>
        </DialogBody>

        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 text-sm font-medium rounded-md border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="new-order-form"
            disabled={isSubmitting}
            className="h-9 px-6 text-sm font-medium rounded-md bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? "Creando..." : "Crear pedido"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
