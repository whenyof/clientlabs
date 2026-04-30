"use client"

import { useState, useMemo } from "react"
import { X, Search, FileText } from "lucide-react"
import { formatCurrency, formatDate } from "@/app/dashboard/finance/lib/formatters"
import type { InvoiceListItem } from "./types"

interface Props {
  open: boolean
  invoices: InvoiceListItem[]
  onClose: () => void
  onSelect: (invoiceId: string, invoiceNumber: string, invoiceDocType: string | null) => void
}

const ISSUED_STATUSES = new Set(["SENT", "VIEWED", "PARTIAL", "PAID", "OVERDUE"])

export function SelectInvoiceForRectificationDialog({ open, invoices, onClose, onSelect }: Props) {
  const [search, setSearch] = useState("")

  const candidates = useMemo(() => {
    const issued = invoices.filter(
      (i) => ISSUED_STATUSES.has(i.status) && !i.isRectification && i.type === "CUSTOMER"
    )
    if (!search.trim()) return issued
    const q = search.trim().toLowerCase()
    return issued.filter(
      (i) =>
        i.number?.toLowerCase().includes(q) ||
        i.Client?.name?.toLowerCase().includes(q) ||
        i.Client?.email?.toLowerCase().includes(q)
    )
  }, [invoices, search])

  if (!open) return null

  return (
    <>
      <div aria-hidden className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-labelledby="select-rect-title"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 id="select-rect-title" className="text-[15px] font-semibold text-slate-900">
              Selecciona la factura a rectificar
            </h2>
            <p className="text-[12px] text-slate-400 mt-0.5">Solo facturas emitidas a clientes</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              autoFocus
              type="search"
              placeholder="Buscar por número o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-4 py-2 text-[13px] text-slate-700 placeholder-slate-400 focus:border-[#1FA97A] focus:outline-none focus:ring-1 focus:ring-[#1FA97A]/20"
            />
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto px-2 pb-2">
          {candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                <FileText className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-[13px] font-medium text-slate-700 mb-1">Sin facturas emitidas</p>
              <p className="text-[11px] text-slate-400">
                {search.trim() ? "Ninguna coincide con tu búsqueda" : "No hay facturas emitidas a clientes todavía"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {candidates.map((inv) => {
                const docType = (inv as { invoiceDocType?: string | null }).invoiceDocType
                const contactName = inv.Client?.name || inv.Client?.email || "—"
                return (
                  <button
                    key={inv.id}
                    type="button"
                    onClick={() => {
                      onSelect(inv.id, inv.number, docType ?? null)
                      onClose()
                    }}
                    className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <FileText className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-slate-800 truncate">{inv.number}</p>
                        <p className="text-[11px] text-slate-400 truncate">{contactName}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[13px] font-semibold text-slate-800 tabular-nums">
                        {formatCurrency(inv.total, inv.currency)}
                      </p>
                      <p className="text-[11px] text-slate-400">{formatDate(inv.issueDate)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
