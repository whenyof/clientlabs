"use client"

import { useState, useMemo } from "react"
import { Search, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"
import { SalesLedger } from "@/modules/sales/components/SalesLedger"
import { SaleSidePanel } from "@/modules/sales/components/SaleSidePanel"
import type { Sale } from "@/modules/sales/types"

const STATUS_FILTERS = ["Todas", "Pagada", "Pendiente", "Vencida"] as const
type StatusFilter = (typeof STATUS_FILTERS)[number]

function matchesFilter(sale: Sale, filter: StatusFilter): boolean {
  if (filter === "Todas") return true
  const status = (sale.status || "").toUpperCase()
  if (filter === "Pagada") return status === "PAID" || status === "PAGADO"
  if (filter === "Pendiente") return status === "PENDING" || status === "ENVIADA" || status === "SENT"
  if (filter === "Vencida") return status === "OVERDUE" || status === "VENCIDA"
  return true
}

type Props = {
  initialSales: Sale[]
}

export function PurchasesView({ initialSales }: Props) {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("Todas")
  const [search, setSearch] = useState("")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const filtered = useMemo(() => {
    return initialSales.filter((sale) => {
      const matchFilter = matchesFilter(sale, activeFilter)
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        (sale.clientName || "").toLowerCase().includes(q) ||
        (sale.product || "").toLowerCase().includes(q)
      return matchFilter && matchSearch
    })
  }, [initialSales, activeFilter, search])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[15px] font-semibold text-slate-900">Compras</h2>
          <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {initialSales.length} {initialSales.length === 1 ? "compra" : "compras"}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={cn(
                "text-[11px] px-3 py-1.5 rounded-lg border transition-colors",
                activeFilter === f
                  ? "bg-[#1FA97A] text-white border-[#1FA97A]"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              {f}
            </button>
          ))}
          <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg bg-white w-44">
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="text-[12px] outline-none flex-1 text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      <SalesLedger mode="purchases" sales={filtered} onSelectSale={setSelectedSale} />

      {selectedSale && (
        <SaleSidePanel
          sale={selectedSale}
          open={!!selectedSale}
          onClose={() => setSelectedSale(null)}
          onSaleUpdate={(id, data) =>
            setSelectedSale((prev) => (prev && prev.id === id ? { ...prev, ...data } : prev))
          }
        />
      )}
    </div>
  )
}
