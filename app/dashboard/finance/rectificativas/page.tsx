"use client"

import { useState, useEffect, useCallback } from "react"
import { FileMinus, FileText, Search, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { BannerLegal } from "@/components/finance/BannerLegal"
import { ImportarDocumento } from "@/components/finance/ImportarDocumento"

type RectStatus = "DRAFT" | "SENT" | "VIEWED" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELED"

type Rectificativa = {
  id: string
  number: string
  status: RectStatus
  issueDate: string
  dueDate: string
  total: number
  rectificationReason: string | null
  client: { id: string; name: string | null; email: string | null } | null
  rectifiesInvoice: { id: string; number: string } | null
}

const STATUS_BADGE: Record<RectStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  SENT: "bg-blue-50 text-blue-700 border border-blue-200",
  VIEWED: "bg-purple-50 text-purple-700 border border-purple-200",
  PARTIAL: "bg-amber-50 text-amber-700 border border-amber-200",
  PAID: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  OVERDUE: "bg-red-50 text-red-700 border border-red-200",
  CANCELED: "bg-gray-100 text-gray-500",
}

const STATUS_LABEL: Record<RectStatus, string> = {
  DRAFT: "Borrador",
  SENT: "Enviada",
  VIEWED: "Vista",
  PARTIAL: "Parcial",
  PAID: "Pagada",
  OVERDUE: "Vencida",
  CANCELED: "Cancelada",
}

const STATUS_FILTERS = [
  { key: "", label: "Todas" },
  { key: "DRAFT", label: "Borrador" },
  { key: "SENT", label: "Enviada" },
  { key: "PAID", label: "Pagada" },
  { key: "OVERDUE", label: "Vencida" },
]

function fmt(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n)
}

function fmtDate(d: string) {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d))
}

export default function RectificativasPage() {
  const [items, setItems] = useState<Rectificativa[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("")
  const [modalImportar, setModalImportar] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ rectificativas: "true" })
      if (activeFilter) params.set("status", activeFilter)
      if (search.trim()) params.set("search", search.trim())
      const res = await fetch(`/api/billing?${params}`, { credentials: "include" })
      if (!res.ok) return
      const data = await res.json()
      if (data.success && Array.isArray(data.invoices)) {
        const rects = data.invoices.filter(
          (i: { isRectification?: boolean }) => i.isRectification === true
        )
        setItems(rects)
      }
    } finally {
      setLoading(false)
    }
  }, [activeFilter, search])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="w-full space-y-5">
      <BannerLegal />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[15px] font-semibold text-slate-900">Facturas Rectificativas</h2>
          {!loading && (
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {items.length} {items.length === 1 ? "rectificativa" : "rectificativas"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[12px] text-slate-500">
            Facturas correctoras emitidas para anular o modificar facturas anteriores
          </p>
          <button
            onClick={() => setModalImportar(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1FA97A] text-white rounded-xl text-[13px] font-semibold hover:bg-[#1a9068] transition-colors shrink-0"
          >
            <Upload className="h-4 w-4" />
            Importar documento
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              "text-[11px] px-3 py-1.5 rounded-lg border transition-colors",
              activeFilter === f.key
                ? "bg-[#1FA97A] text-white border-[#1FA97A]"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            {f.label}
          </button>
        ))}
        <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg bg-white w-48 ml-auto">
          <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="text-[12px] outline-none flex-1 text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-[13px] text-slate-400 animate-pulse">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
              <FileMinus className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-[14px] font-medium text-slate-700 mb-1">No hay facturas rectificativas</p>
            <p className="text-[12px] text-slate-400">
              Las rectificativas se crean desde el panel de facturas, en las acciones de cada factura emitida
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Nº Rectificativa", "Cliente", "Fecha", "Motivo", "Factura original", "Total", "Estado"].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const status = (item.status as RectStatus) ?? "DRAFT"
                  return (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[12px] text-slate-700 font-medium">
                        {item.number}
                      </td>
                      <td className="py-3.5 px-4 text-[13px] text-slate-900">
                        {item.client?.name ?? item.client?.email ?? "—"}
                      </td>
                      <td className="py-3.5 px-4 text-[12px] text-slate-500">{fmtDate(item.issueDate)}</td>
                      <td className="py-3.5 px-4 text-[12px] text-slate-500 max-w-[200px] truncate">
                        {item.rectificationReason ?? "—"}
                      </td>
                      <td className="py-3.5 px-4 text-[12px] text-slate-400 font-mono">
                        {item.rectifiesInvoice?.number ?? "—"}
                      </td>
                      <td className="py-3.5 px-4 text-[13px] font-semibold text-slate-900 text-right tabular-nums">
                        {fmt(item.total)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold", STATUS_BADGE[status])}>
                          {STATUS_LABEL[status]}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-3">
        <FileText className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-[12px] font-medium text-slate-700 mb-0.5">¿Cómo crear una rectificativa?</p>
          <p className="text-[12px] text-slate-500">
            Accede al panel de Facturas, selecciona la factura emitida que quieres rectificar y usa la acción
            &ldquo;Crear rectificativa&rdquo; en el drawer de detalle.
          </p>
        </div>
      </div>

      {modalImportar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setModalImportar(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900">Importar documento</h2>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  Sube el PDF de tu rectificativa u otro documento
                </p>
              </div>
              <button onClick={() => setModalImportar(false)} className="p-2 rounded-xl hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6">
              <ImportarDocumento tipo="rectificativa" onImportado={() => setModalImportar(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
