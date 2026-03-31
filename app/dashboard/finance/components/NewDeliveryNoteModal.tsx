"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Plus, Trash2, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type Client = { id: string; name: string | null; email?: string | null }
type Quote = { id: string; number: string; client: { id: string; name: string | null } }

type LineItem = {
  _key: string
  description: string
  quantity: number
  unit: string
  delivered: boolean
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
  description: "",
  quantity: 1,
  unit: "uds.",
  delivered: false,
})

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

  useEffect(() => {
    if (!open) return
    fetch("/api/clients").then(r => r.json()).then(d => {
      if (Array.isArray(d)) setClients(d)
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
        setItems(data.quote.items.map((i: { description: string; quantity: number }) => ({
          _key: newKey(),
          description: i.description,
          quantity: i.quantity,
          unit: "uds.",
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
          items: items.map(({ _key: _, ...rest }) => rest),
        }),
      })
      if (!res.ok) return
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
              <div className="relative">
                <select
                  value={clientId}
                  onChange={e => { setClientId(e.target.value); setQuoteId("") }}
                  className="w-full appearance-none text-[13px] border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A] pr-8"
                >
                  <option value="">Seleccionar</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name ?? c.email ?? c.id}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Desde presupuesto</label>
              <div className="relative">
                <select
                  value={quoteId}
                  onChange={e => { setQuoteId(e.target.value); loadFromQuote(e.target.value) }}
                  disabled={!clientId || quotes.length === 0}
                  className="w-full appearance-none text-[13px] border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A] pr-8 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">Ninguno</option>
                  {quotes.map(q => (
                    <option key={q.id} value={q.id}>{q.number}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">Fecha de entrega</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={e => setDeliveryDate(e.target.value)}
                className="w-full text-[13px] border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A]"
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
              <div className="grid grid-cols-[1fr_80px_72px_80px_32px] gap-px bg-slate-100 text-[10px] font-medium text-slate-500 uppercase tracking-wider px-3 py-2">
                <span>Descripción</span>
                <span>Cant.</span>
                <span>Unidad</span>
                <span>Entregado</span>
                <span />
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item._key} className="grid grid-cols-[1fr_80px_72px_80px_32px] gap-px bg-white px-3 py-2 items-center">
                    <input
                      value={item.description}
                      onChange={e => updateItem(item._key, { description: e.target.value })}
                      placeholder="Descripción del artículo"
                      className="w-full text-[12px] border border-slate-200 rounded-md px-2 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A] mr-2"
                    />
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={item.quantity}
                      onChange={e => updateItem(item._key, { quantity: Math.max(0, Number(e.target.value)) })}
                      className="w-full text-[12px] border border-slate-200 rounded-md px-2 py-1.5 text-slate-900 text-center focus:outline-none focus:ring-1 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A]"
                    />
                    <input
                      value={item.unit}
                      onChange={e => updateItem(item._key, { unit: e.target.value })}
                      placeholder="uds."
                      className="w-full text-[12px] border border-slate-200 rounded-md px-2 py-1.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A]"
                    />
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={item.delivered}
                        onChange={e => updateItem(item._key, { delivered: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-[#1FA97A] focus:ring-[#1FA97A]/30 accent-[#1FA97A]"
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
                ))}
              </div>

              {/* Add line */}
              <div className="border-t border-slate-100 px-3 py-2">
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1.5 text-[12px] text-[#1FA97A] hover:text-[#178f68] font-medium transition-colors"
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
              className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A]"
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
              "px-4 py-2 text-[13px] font-medium rounded-lg bg-[#1FA97A] text-white hover:bg-[#178f68] transition-colors",
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
