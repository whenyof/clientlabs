"use client"
import { getBaseUrl } from "@/lib/api/baseUrl"


import { useState, useEffect, useCallback } from "react"
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { formatCurrency, formatDate } from "@/app/dashboard/finance/lib/formatters"

export type SaleForInvoice = {
  id: string
  saleDate: string
  clientName: string
  clientEmail?: string | null
  total: number
  currency: string
  status: string
}

interface SelectSaleForInvoiceDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (saleId: string) => void
  creating?: boolean
}

export function SelectSaleForInvoiceDialog({
  open,
  onClose,
  onSelect,
  creating = false,
}: SelectSaleForInvoiceDialogProps) {
  const [sales, setSales] = useState<SaleForInvoice[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  const fetchSales = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(getBaseUrl() + "/api/sales", { credentials: "include" })
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.sales)) {
        setSales(
          data.sales.map((s: { id: string; saleDate: string; clientName: string; clientEmail?: string | null; total: number; currency?: string; status: string }) => ({
            id: s.id,
            saleDate: s.saleDate,
            clientName: s.clientName ?? "",
            clientEmail: s.clientEmail ?? null,
            total: Number(s.total),
            currency: s.currency ?? "EUR",
            status: s.status ?? "",
          }))
        )
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setSearch("")
      fetchSales()
    }
  }, [open, fetchSales])

  const filtered = search.trim()
    ? sales.filter(
        (s) =>
          s.clientName.toLowerCase().includes(search.trim().toLowerCase()) ||
          (s.clientEmail?.toLowerCase().includes(search.trim().toLowerCase()) ?? false)
      )
    : sales

  if (!open) return null

  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-label="Elegir venta"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white shadow-xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">Elegir venta</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-slate-200 shrink-0">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1FA97A] focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/20 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto min-h-0">
          {loading ? (
            <div className="px-5 py-8 text-center text-slate-500 text-sm">
              Cargando ventas…
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-12 text-center text-slate-400">
              <p className="text-sm font-medium text-slate-600">
                {sales.length === 0 ? "No hay ventas" : "Ninguna venta coincide con la búsqueda"}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 sticky top-0">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Importe
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sale) => (
                  <tr
                    key={sale.id}
                    onClick={() => !creating && onSelect(sale.id)}
                    className={`border-b border-slate-100 transition-colors ${
                      creating ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-slate-50"
                    }`}
                  >
                    <td className="py-3.5 px-4 text-slate-800 whitespace-nowrap">
                      {formatDate(sale.saleDate)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 max-w-[200px] truncate" title={sale.clientName}>
                      {sale.clientName || sale.clientEmail || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums font-medium text-slate-800 whitespace-nowrap">
                      {formatCurrency(sale.total, sale.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {sale.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
