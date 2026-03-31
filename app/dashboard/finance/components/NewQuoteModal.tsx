"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X, Plus, Trash2, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type Client = { id: string; name: string | null; email?: string | null }
type Product = { id: string; name: string; description: string | null; price: number; taxRate: number; unit: string | null }

type LineItem = {
  _key: string
  productId: string | null
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
}

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  defaultClientId?: string
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n)
}

let keySeq = 0
function newKey() { return String(++keySeq) }

const DEFAULT_ITEM = (): LineItem => ({
  _key: newKey(),
  productId: null,
  description: "",
  quantity: 1,
  unitPrice: 0,
  taxRate: 21,
})

export function NewQuoteModal({ open, onClose, onSuccess, defaultClientId }: Props) {
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [clientId, setClientId] = useState(defaultClientId ?? "")
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0, 10)
  })
  const [notes, setNotes] = useState("")
  const [terms, setTerms] = useState("")
  const [items, setItems] = useState<LineItem[]>([DEFAULT_ITEM()])
  const [saving, setSaving] = useState(false)
  const [autocomplete, setAutocomplete] = useState<{ idx: number; query: string; open: boolean }>({ idx: -1, query: "", open: false })

  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    fetch("/api/clients").then(r => r.json()).then(d => {
      if (Array.isArray(d)) setClients(d)
    }).catch(() => {})
    fetch("/api/products").then(r => r.json()).then(d => {
      if (d.products) setProducts(d.products)
    }).catch(() => {})
  }, [open])

  useEffect(() => {
    if (open && defaultClientId) setClientId(defaultClientId)
  }, [open, defaultClientId])

  const filteredProducts = useCallback((q: string) => {
    if (!q) return products.slice(0, 6)
    return products.filter(p => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
  }, [products])

  const addItem = () => setItems(prev => [...prev, DEFAULT_ITEM()])

  const removeItem = (key: string) => setItems(prev => prev.filter(i => i._key !== key))

  const updateItem = (key: string, patch: Partial<LineItem>) =>
    setItems(prev => prev.map(i => i._key === key ? { ...i, ...patch } : i))

  const selectProduct = (idx: number, product: Product) => {
    setItems(prev => prev.map((item, i) => i !== idx ? item : {
      ...item,
      productId: product.id,
      description: product.name,
      unitPrice: product.price,
      taxRate: product.taxRate,
    }))
    setAutocomplete({ idx: -1, query: "", open: false })
  }

  // Computed totals
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const taxTotal = items.reduce((s, i) => s + i.quantity * i.unitPrice * (i.taxRate / 100), 0)
  const total = subtotal + taxTotal

  const handleSave = async (sendAfter = false) => {
    if (!clientId || !validUntil) return
    setSaving(true)
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          validUntil,
          notes: notes || null,
          terms: terms || null,
          items: items.map(({ _key: _, ...rest }) => rest),
        }),
      })
      const data = await res.json()
      if (!res.ok) return
      if (sendAfter && data.quote?.id) {
        await fetch(`/api/quotes/${data.quote.id}/send`, { method: "POST" })
      }
      reset()
      onSuccess()
    } finally {
      setSaving(false)
    }
  }

  const reset = () => {
    setClientId(defaultClientId ?? "")
    const d = new Date(); d.setDate(d.getDate() + 30)
    setValidUntil(d.toISOString().slice(0, 10))
    setNotes("")
    setTerms("")
    setItems([DEFAULT_ITEM()])
  }

  const handleClose = () => { reset(); onClose() }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div
        ref={modalRef}
        className="w-full max-w-3xl bg-white rounded-xl border border-slate-200 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-[15px] font-semibold text-slate-900">Nuevo presupuesto</h2>
          <button onClick={handleClose} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* SECCIÓN 1 — Cliente y fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Cliente *</label>
              <div className="relative">
                <select
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  className="w-full appearance-none text-[13px] border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A] pr-8"
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name ?? c.email ?? c.id}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Fecha de emisión</label>
              <input
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="w-full text-[13px] border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Válido hasta *</label>
              <input
                type="date"
                value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
                className="w-full text-[13px] border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A]"
              />
            </div>
          </div>

          {/* SECCIÓN 2 — Líneas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Líneas del presupuesto</label>
            </div>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_72px_90px_72px_80px_32px] gap-px bg-slate-100 text-[10px] font-medium text-slate-500 uppercase tracking-wider px-3 py-2">
                <span>Descripción</span>
                <span>Cant.</span>
                <span>P. Unit.</span>
                <span>IVA %</span>
                <span className="text-right">Total</span>
                <span />
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100">
                {items.map((item, idx) => {
                  const lineTotal = item.quantity * item.unitPrice * (1 + item.taxRate / 100)
                  const isAuto = autocomplete.idx === idx && autocomplete.open
                  const suggestions = filteredProducts(autocomplete.query)
                  return (
                    <div key={item._key} className="relative grid grid-cols-[1fr_72px_90px_72px_80px_32px] gap-px bg-white px-3 py-2 items-center">
                      {/* Description with autocomplete */}
                      <div className="relative pr-2">
                        <input
                          value={item.description}
                          onChange={e => {
                            updateItem(item._key, { description: e.target.value, productId: null })
                            setAutocomplete({ idx, query: e.target.value, open: true })
                          }}
                          onFocus={() => setAutocomplete({ idx, query: item.description, open: true })}
                          onBlur={() => setTimeout(() => setAutocomplete(prev => ({ ...prev, open: false })), 150)}
                          placeholder="Descripción del servicio o producto"
                          className="w-full text-[12px] border border-slate-200 rounded-md px-2 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A]"
                        />
                        {isAuto && suggestions.length > 0 && (
                          <div className="absolute left-0 top-full mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
                            {suggestions.map(p => (
                              <button
                                key={p.id}
                                type="button"
                                onMouseDown={() => selectProduct(idx, p)}
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 text-left transition-colors"
                              >
                                <div>
                                  <p className="text-[12px] font-medium text-slate-900">{p.name}</p>
                                  {p.description && <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{p.description}</p>}
                                </div>
                                <span className="text-[11px] font-medium text-slate-600 shrink-0 ml-2">{fmt(p.price)}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={item.quantity}
                        onChange={e => updateItem(item._key, { quantity: Math.max(0, Number(e.target.value)) })}
                        className="w-full text-[12px] border border-slate-200 rounded-md px-2 py-1.5 text-slate-900 text-center focus:outline-none focus:ring-1 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A]"
                      />
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unitPrice}
                        onChange={e => updateItem(item._key, { unitPrice: Math.max(0, Number(e.target.value)) })}
                        className="w-full text-[12px] border border-slate-200 rounded-md px-2 py-1.5 text-slate-900 text-right focus:outline-none focus:ring-1 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A]"
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={item.taxRate}
                        onChange={e => updateItem(item._key, { taxRate: Math.max(0, Number(e.target.value)) })}
                        className="w-full text-[12px] border border-slate-200 rounded-md px-2 py-1.5 text-slate-900 text-center focus:outline-none focus:ring-1 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A]"
                      />
                      <span className="text-[12px] font-medium text-slate-900 text-right tabular-nums pr-1">{fmt(lineTotal)}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(item._key)}
                        disabled={items.length === 1}
                        className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Add line */}
              <div className="border-t border-slate-100 px-3 py-2">
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1.5 text-[12px] text-[#1FA97A] hover:text-[#178f68] font-medium transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Añadir línea
                </button>
              </div>
            </div>

            {/* Totals */}
            <div className="mt-3 flex justify-end">
              <div className="w-52 space-y-1.5">
                <div className="flex justify-between text-[12px] text-slate-500">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[12px] text-slate-500">
                  <span>IVA</span>
                  <span className="tabular-nums">{fmt(taxTotal)}</span>
                </div>
                <div className="flex justify-between text-[14px] font-semibold text-slate-900 border-t border-slate-200 pt-1.5">
                  <span>Total</span>
                  <span className="tabular-nums">{fmt(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3 — Notas y términos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Notas internas</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Notas visibles en el PDF..."
                rows={3}
                className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Condiciones</label>
              <textarea
                value={terms}
                onChange={e => setTerms(e.target.value)}
                placeholder="Términos y condiciones del presupuesto..."
                rows={3}
                className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A]"
              />
            </div>
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
            onClick={() => handleSave(false)}
            disabled={saving || !clientId || !validUntil}
            className={cn(
              "px-4 py-2 text-[13px] font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {saving ? "Guardando..." : "Guardar borrador"}
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving || !clientId || !validUntil}
            className={cn(
              "px-4 py-2 text-[13px] font-medium rounded-lg bg-[#1FA97A] text-white hover:bg-[#178f68] transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {saving ? "Guardando..." : "Guardar y enviar"}
          </button>
        </div>
      </div>
    </div>
  )
}
