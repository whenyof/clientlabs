"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

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

  const [discountPercent, setDiscountPercent] = useState("0")
  const [notes, setNotes] = useState("")
  const [generateInvoice, setGenerateInvoice] = useState(true)
  const [registerPayment, setRegisterPayment] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ---------------------------------------------------------
  // Item management
  // ---------------------------------------------------------

  const handleItemChange = (
    index: number,
    field: keyof OrderItem,
    value: string,
  ) => {

    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === "taxRate" ? Number(value) : value,
            }
          : item,
      ),
    )

  }

  const addLine = () => {

    setItems((prev) => [
      ...prev,
      { product: "", quantity: "1", price: "0", taxRate: 21 },
    ])

  }

  const removeItem = (index: number) => {

    if (items.length <= 1) return

    setItems((prev) => prev.filter((_, i) => i !== index))

  }

  // ---------------------------------------------------------
  // Calculations
  // ---------------------------------------------------------

  const computeLineTotal = (item: OrderItem) => {

    const q = Number(item.quantity) || 0
    const p = Number(item.price) || 0

    return q * p

  }

  const subtotal = items.reduce(
    (acc, item) => acc + computeLineTotal(item),
    0,
  )

  const discountPct = Number(discountPercent) || 0
  const discountAmount = (subtotal * discountPct) / 100

  const taxAmount = items.reduce((acc, item) => {

    const base = computeLineTotal(item)
    const rate = Number(item.taxRate) || 0

    return acc + (base * rate) / 100

  }, 0)

  const total = subtotal - discountAmount + taxAmount

  // ---------------------------------------------------------
  // Submit
  // ---------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault()

    if (isSubmitting) return
    setIsSubmitting(true)

    try {

      const payload = {
        clientId,
        items: items.map((item) => ({
          product: item.product,
          quantity: Number(item.quantity),
          price: Number(item.price),
          taxRate: item.taxRate,
        })),
        discountPercent: discountPct,
        notes,
        generateInvoice,
        registerPayment,
      }

      const res = await fetch("/api/orders/create-flow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {

        const txt = await res.text()
        console.error(txt)

        alert("Error creando pedido")
        setIsSubmitting(false)
        return

      }

      onClose()
      router.refresh()

    } catch (error) {

      console.error(error)
      alert("Error inesperado")

    } finally {

      setIsSubmitting(false)

    }

  }

  return (

    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>

      <DialogContent className="w-full max-w-6xl">

        {/* HEADER */}

        <DialogHeader>

          <DialogTitle>
            Nuevo pedido
          </DialogTitle>

          <p className="text-sm text-[var(--text-secondary)]">

            {clientName
              ? `Cliente: ${clientName}`
              : "Añade productos al pedido"}

          </p>

        </DialogHeader>

        <DialogBody>

          <form
            id="new-order-form"
            onSubmit={handleSubmit}
            className="space-y-8"
          >

            {/* PRODUCTS — single grid for header and rows */}

            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-neutral-900">
                  Productos
                </h3>
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
                      <th className="pb-3 text-left text-xs uppercase text-neutral-500 border-b border-neutral-200">
                        Producto
                      </th>
                      <th className="pb-3 text-center text-xs uppercase text-neutral-500 border-b border-neutral-200">
                        Cantidad
                      </th>
                      <th className="pb-3 text-center text-xs uppercase text-neutral-500 border-b border-neutral-200">
                        Precio
                      </th>
                      <th className="pb-3 text-center text-xs uppercase text-neutral-500 border-b border-neutral-200">
                        IVA
                      </th>
                      <th className="pb-3 text-right text-xs uppercase text-neutral-500 border-b border-neutral-200">
                        Total
                      </th>
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
                              onChange={(e) =>
                                handleItemChange(index, "product", e.target.value)
                              }
                              placeholder="Producto o servicio"
                              className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm bg-white"
                            />
                          </td>
                          <td className="py-3 pr-4 align-middle">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(index, "quantity", e.target.value)
                              }
                              className="h-10 w-full rounded-md border border-neutral-200 px-2 text-center text-sm bg-white"
                            />
                          </td>
                          <td className="py-3 pr-4 align-middle">
                            <input
                              type="number"
                              step="0.01"
                              min={0}
                              value={item.price}
                              onChange={(e) =>
                                handleItemChange(index, "price", e.target.value)
                              }
                              className="h-10 w-full rounded-md border border-neutral-200 px-2 text-center text-sm bg-white"
                            />
                          </td>
                          <td className="py-3 pr-4 align-middle">
                            <select
                              value={item.taxRate}
                              onChange={(e) =>
                                handleItemChange(index, "taxRate", e.target.value)
                              }
                              className="h-10 w-full rounded-md border border-neutral-200 px-2 text-center text-sm bg-white appearance-none"
                            >
                              {[0, 10, 21].map((rate) => (
                                <option key={rate} value={rate}>
                                  {rate}%
                                </option>
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

            {/* BOTTOM LAYOUT — 2 columns: Notes | Financial summary */}

            <section className="grid grid-cols-[1fr_340px] gap-8">
              <div className="space-y-2 min-w-0">
                <label className="text-sm font-medium text-neutral-700">
                  Notas
                </label>
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
                    <span>Descuento</span>
                    <span className="tabular-nums">-€{discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA</span>
                    <span className="tabular-nums">€{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-2 mt-2">
                    <div className="flex justify-between font-semibold text-neutral-900">
                      <span>TOTAL</span>
                      <span className="tabular-nums">€{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-neutral-200 space-y-3">
                  <p className="text-xs font-medium uppercase text-neutral-500">
                    Automatización
                  </p>
                  <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generateInvoice}
                      onChange={(e) => {
                        const v = e.target.checked
                        setGenerateInvoice(v)
                        if (!v) setRegisterPayment(false)
                      }}
                      className="h-4 w-4 rounded border-neutral-300"
                    />
                    Generar factura automáticamente
                  </label>
                  <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!generateInvoice}
                      checked={registerPayment}
                      onChange={(e) =>
                        setRegisterPayment(e.target.checked)
                      }
                      className="h-4 w-4 rounded border-neutral-300 disabled:opacity-50"
                    />
                    Registrar pago automáticamente
                  </label>
                </div>
              </div>
            </section>

          </form>

        </DialogBody>

        {/* FOOTER */}

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
