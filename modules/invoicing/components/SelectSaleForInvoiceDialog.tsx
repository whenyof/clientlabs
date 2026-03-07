"use client"

import { useState, useEffect, useCallback } from "react"
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { formatCurrency, formatDate } from "@/app/dashboard/other/finance/lib/formatters"

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
      const res = await fetch("/api/sales", { credentials: "include" })
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
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-label="Elegir venta"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0f0f12] shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-lg font-semibold text-white">Elegir venta</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-white/10 shrink-0">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Buscar por cliente"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto min-h-0">
          {loading ? (
            <div className="px-5 py-8 text-center text-white/50 text-sm">
              Cargando ventas…
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-12 text-center text-white/50">
              <p className="text-sm font-medium text-white/70">
                {sales.length === 0 ? "No hay ventas" : "Ninguna venta coincide con la búsqueda"}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] sticky top-0">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-semibold text-white/60 uppercase tracking-wider">
                    Importe
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sale) => (
                  <tr
                    key={sale.id}
                    onClick={() => !creating && onSelect(sale.id)}
                    className={`border-b border-white/6 transition-colors ${
                      creating ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-white/[0.04]"
                    }`}
                  >
                    <td className="py-3.5 px-4 text-white/90 whitespace-nowrap">
                      {formatDate(sale.saleDate)}
                    </td>
                    <td className="py-3.5 px-4 text-white/90 max-w-[200px] truncate" title={sale.clientName}>
                      {sale.clientName || sale.clientEmail || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums font-medium text-white/90 whitespace-nowrap">
                      {formatCurrency(sale.total, sale.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-white/80">
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
