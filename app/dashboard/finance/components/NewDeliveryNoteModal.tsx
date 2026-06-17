"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProductPicker } from "@/components/finance/ProductPicker"
import { useProductCatalog, type CatalogProduct } from "@/hooks/use-product-catalog"

type Client = { id: string; name: string | null; email?: string | null }
type Quote = { id: string; number: string; client: { id: string; name: string | null } }

type LineItem = {
  _key: string
  productId: string | null
  description: string
  quantity: number
  unit: string
  unitPrice: number
  taxRate: number
  delivered: boolean
  productRef?: string
  lotNumber?: string
  expiryDate?: string
}

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  defaultClientId?: string
}

let keySeq = 0
function newKey() { return String(++keySeq) }

const DEFAULT_ITEM = (): LineItem => ({
  _key: newKey(),
  productId: null,
  description: "",
  quantity: 0,
  unit: "uds.",
  unitPrice: 0,
  taxRate: 21,
  delivered: false,
})

const TAX_RATES = [21, 10, 4, 0] as const

export function NewDeliveryNoteModal({ open, onClose, onSuccess, defaultClientId }: Props) {
  const [clients, setClients] = useState<Client[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [clientId, setClientId] = useState(defaultClientId ?? "")
  const [quoteId, setQuoteId] = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<LineItem[]>([DEFAULT_ITEM()])
  const [saving, setSaving] = useState(false)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [enableLots, setEnableLots] = useState(false)
  const [enableExpiry, setEnableExpiry] = useState(false)
  const { products, createProduct } = useProductCatalog()

  useEffect(() => {
    if (!open) return
    fetch("/api/clients").then(r => r.json()).then(d => {
      if (Array.isArray(d)) setClients(d)
    }).catch(() => {})
    fetch("/api/settings/business-profile").then(r => r.json()).then(d => {
      if (d.success && d.profile) {
        setEnableLots(d.profile.enableProductLots ?? false)
        setEnableExpiry(d.profile.enableProductExpiry ?? false)
      }
    }).catch(() => {})
  }, [open])

  useEffect(() => {
    if (open && defaultClientId) setClientId(defaultClientId)
  }, [open, defaultClientId])

  // Load client quotes when clientId changes
  useEffect(() => {
    if (!clientId) { setQuotes([]); setQuoteId(""); return }
    fetch(`/api/quotes?clientId=${clientId}&status=ACCEPTED`)
      .then(r => r.json())
      .then(d => { if (d.quotes) setQuotes(d.quotes) })
      .catch(() => {})
  }, [clientId])

  // Pre-fill lines from quote
  const loadFromQuote = useCallback(async (id: string) => {
    if (!id) { setItems([DEFAULT_ITEM()]); return }
    setLoadingQuote(true)
    try {
      const res = await fetch(`/api/quotes/${id}`)
      const data = await res.json()
      if (data.quote?.items?.length) {
        // Arrastrar precio e IVA reales de cada línea del presupuesto —
        // así la conversión albarán → factura respeta el taxRate original (ej. 10%)
        setItems(data.quote.items.map((i: { productId?: string | null; description: string; quantity: number; unitPrice?: number; taxRate?: number }) => ({
          _key: newKey(),
          productId: typeof i.productId === "string" ? i.productId : null,
          description: i.description,
          quantity: i.quantity,
          unit: "uds.",
          unitPrice: typeof i.unitPrice === "number" ? i.unitPrice : 0,
          taxRate: typeof i.taxRate === "number" ? i.taxRate : 21,
          delivered: false,
        })))
      }
    } finally {
      setLoadingQuote(false)
    }
  }, [])

  const addItem = () => setItems(prev => [...prev, DEFAULT_ITEM()])
  const removeItem = (key: string) => setItems(prev => prev.filter(i => i._key !== key))
  const updateItem = (key: string, patch: Partial<LineItem>) =>
    setItems(prev => prev.map(i => i._key === key ? { ...i, ...patch } : i))

  const handleSave = async () => {
    if (!clientId) return
    // Descartar líneas vacías y normalizar cantidades (el API exige quantity > 0)
    const validItems = items
      .filter(i => i.description.trim().length > 0)
      .map(({ _key: _, ...rest }) => ({ ...rest, quantity: rest.quantity > 0 ? rest.quantity : 1 }))
    if (validItems.length === 0) {
      toast.error("Añade al menos un artículo con descripción")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/delivery-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          quoteId: quoteId || null,
          deliveryDate: deliveryDate || null,
          notes: notes || null,
          items: validItems,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        toast.error(data?.error ?? "No se pudo crear el albarán")
        return
      }
      reset()
      onSuccess()
    } finally {
      setSaving(false)
    }
  }

  const reset = () => {
    setClientId(defaultClientId ?? "")
    setQuoteId("")
    setDeliveryDate("")
    setNotes("")
    setItems([DEFAULT_ITEM()])
    setQuotes([])
  }

  const handleClose = () => { reset(); onClose() }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div
        className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-[15px] font-semibold text-slate-900">Nuevo albarán</h2>
          <button onClick={handleClose} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* SECCIÓN 1 — Cliente y fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Cliente *</label>
              <Select
                value={clientId}
                onValueChange={(v) => { setClientId(v); setQuoteId("") }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name ?? c.email ?? c.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Desde presupuesto</label>
              <Select
                value={quoteId}
                onValueChange={(v) => { setQuoteId(v); loadFromQuote(v) }}
                disabled={!clientId || quotes.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Ninguno" />
                </SelectTrigger>
                <SelectContent>
                  {quotes.map(q => (
                    <SelectItem key={q.id} value={q.id}>{q.number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Fecha de entrega</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={e => setDeliveryDate(e.target.value)}
                className="w-full text-[13px] border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E]"
              />
            </div>
          </div>

          {/* SECCIÓN 2 — Líneas */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">
              Artículos
              {loadingQuote && <span className="ml-2 text-slate-400">Cargando...</span>}
            </label>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_64px_64px_84px_72px_64px_32px] gap-px bg-slate-100 text-[10px] font-medium text-slate-500 uppercase tracking-wider px-3 py-2">
                <span>Descripción</span>
                <span>Cant.</span>
                <span>Unidad</span>
                <span>Precio €</span>
                <span>IVA %</span>
                <span>Entreg.</span>
                <span />
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item._key} className="bg-white px-3 py-2">
                    <div className="grid grid-cols-[1fr_64px_64px_84px_72px_64px_32px] gap-px items-center">
                      <ProductPicker
                        className="min-w-0 mr-2"
                        products={products}
                        value={item.description}
                        unitPrice={item.unitPrice}
                        taxRate={item.taxRate}
                        unit={item.unit}
                        placeholder="Descripción del artículo"
                        onChange={(text) => updateItem(item._key, { description: text, productId: null })}
                        onSelect={(p: CatalogProduct) => updateItem(item._key, {
                          description: p.name,
                          unitPrice: p.price,
                          taxRate: p.taxRate,
                          productId: p.id,
                        })}
                        onCreateProduct={createProduct}
                      />
                      <input
                        type="number"
                        min={0}
                        step={1}
                        placeholder="1"
                        value={item.quantity || ""}
                        onChange={e => updateItem(item._key, { quantity: Math.max(0, Number(e.target.value)) })}
                        className="w-full text-[12px] border border-slate-200 rounded-md px-2 py-1.5 text-slate-900 placeholder-slate-300 text-center focus:outline-none focus:ring-1 focus:ring-[#0F766E]/30 focus:border-[#0F766E]"
                      />
                      <input
                        value={item.unit}
                        onChange={e => updateItem(item._key, { unit: e.target.value })}
                        placeholder="uds."
                        className="w-full text-[12px] border border-slate-200 rounded-md px-2 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0F766E]/30 focus:border-[#0F766E]"
                      />
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0,00"
                        value={item.unitPrice || ""}
                        onChange={e => updateItem(item._key, { unitPrice: Math.max(0, Number(e.target.value)) })}
                        className="w-full text-[12px] border border-slate-200 rounded-md px-2 py-1.5 text-slate-900 placeholder-slate-300 text-right focus:outline-none focus:ring-1 focus:ring-[#0F766E]/30 focus:border-[#0F766E]"
                      />
                      <select
                        value={item.taxRate}
                        onChange={e => updateItem(item._key, { taxRate: Number(e.target.value) })}
                        className="w-full text-[12px] border border-slate-200 rounded-md px-1.5 py-1.5 text-slate-900 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0F766E]/30 focus:border-[#0F766E]"
                      >
                        {TAX_RATES.map(r => (
                          <option key={r} value={r}>{r}%</option>
                        ))}
                      </select>
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={item.delivered}
                          onChange={e => updateItem(item._key, { delivered: e.target.checked })}
                          className="h-4 w-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]/30 accent-[#0F766E]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item._key)}
                        disabled={items.length === 1}
                        className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {enableLots && (
                      <div className="grid grid-cols-2 gap-2 mt-1.5">
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase tracking-wider">Lote</label>
                          <input
                            value={item.lotNumber ?? ""}
                            onChange={e => updateItem(item._key, { lotNumber: e.target.value })}
                            placeholder="Nº lote"
                            className="w-full text-[12px] border border-slate-200 rounded-md px-2 py-1.5 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-[#0F766E]/30 focus:border-[#0F766E]"
                          />
                        </div>
                        {enableExpiry && (
                          <div>
                            <label className="text-[10px] text-slate-400 uppercase tracking-wider">Caducidad</label>
                            <input
                              type="date"
                              value={item.expiryDate ?? ""}
                              onChange={e => updateItem(item._key, { expiryDate: e.target.value })}
                              className="w-full text-[12px] border border-slate-200 rounded-md px-2 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F766E]/30 focus:border-[#0F766E]"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add line */}
              <div className="border-t border-slate-100 px-3 py-2">
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1.5 text-[12px] text-[#0F766E] hover:text-[#0E665F] font-medium transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Añadir artículo
                </button>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3 — Notas */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Notas</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Observaciones, instrucciones de entrega..."
              rows={2}
              className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !clientId}
            className={cn(
              "px-4 py-2 text-[13px] font-medium rounded-lg bg-[#0F766E] text-white hover:bg-[#0E665F] transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {saving ? "Guardando..." : "Crear albarán"}
          </button>
        </div>
      </div>
    </div>
  )
}
