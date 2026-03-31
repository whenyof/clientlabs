"use client"

import { useState, useEffect, useCallback } from "react"
import { FileText, ClipboardList, Truck, Receipt, Trash2, Plus, Search, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type POStatus = "DRAFT" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

type PurchaseOrder = {
  id: string
  number: string
  status: POStatus
  issueDate: string
  total: number
  client: { id: string; name: string | null; email: string | null }
  quote: { number: string } | null
}

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: "", label: "Todos" },
  { key: "DRAFT", label: "Borrador" },
  { key: "CONFIRMED", label: "Confirmado" },
  { key: "IN_PROGRESS", label: "En preparación" },
  { key: "COMPLETED", label: "Completado" },
  { key: "CANCELLED", label: "Cancelado" },
]

const STATUS_BADGE: Record<POStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  CONFIRMED: "bg-blue-50 text-blue-700 border border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border border-amber-200",
  COMPLETED: "bg-[#E1F5EE] text-[#0F6E56] border border-[#9FE1CB]",
  CANCELLED: "bg-red-50 text-red-700 border border-red-200",
}

const STATUS_LABEL: Record<POStatus, string> = {
  DRAFT: "Borrador",
  CONFIRMED: "Confirmado",
  IN_PROGRESS: "En preparación",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
}

const STATUS_NEXT_LABEL: Record<string, string> = {
  DRAFT: "Confirmar",
  CONFIRMED: "En preparación",
  IN_PROGRESS: "Completar",
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n)
}

function fmtDate(d: string) {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d))
}

type Props = { clientId?: string; onNavigateToInvoices?: () => void; onNavigateToDelivery?: () => void }

export function PurchaseOrdersView({ clientId, onNavigateToInvoices, onNavigateToDelivery }: Props) {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("")
  const [search, setSearch] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (clientId) params.set("clientId", clientId)
      if (activeFilter) params.set("status", activeFilter)
      if (search) params.set("search", search)
      const res = await fetch(`/api/purchase-orders?${params}`)
      const data = await res.json()
      if (data.success) setOrders(data.orders)
    } finally {
      setLoading(false)
    }
  }, [clientId, activeFilter, search])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const advance = async (orderId: string) => {
    setActionLoading(orderId + "confirm")
    try {
      const res = await fetch(`/api/purchase-orders/${orderId}/confirm`, { method: "POST" })
      if (res.ok) fetchOrders()
    } finally {
      setActionLoading(null)
    }
  }

  const convertDelivery = async (orderId: string) => {
    setActionLoading(orderId + "delivery")
    try {
      const res = await fetch(`/api/purchase-orders/${orderId}/convert-delivery`, { method: "POST" })
      if (res.ok) { onNavigateToDelivery?.(); fetchOrders() }
    } finally {
      setActionLoading(null)
    }
  }

  const convertInvoice = async (orderId: string) => {
    setActionLoading(orderId + "invoice")
    try {
      const res = await fetch(`/api/purchase-orders/${orderId}/convert-invoice`, { method: "POST" })
      if (res.ok) { onNavigateToInvoices?.(); fetchOrders() }
    } finally {
      setActionLoading(null)
    }
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm("¿Eliminar esta hoja de pedido?")) return
    await fetch(`/api/purchase-orders/${orderId}`, { method: "DELETE" })
    fetchOrders()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-[14px] font-semibold text-slate-900">Hojas de pedido</h3>
          {!loading && (
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {orders.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
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

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-[13px] text-slate-400 animate-pulse">Cargando...</div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
              <ClipboardList className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-[14px] font-medium text-slate-700 mb-1">No hay hojas de pedido</p>
            <p className="text-[12px] text-slate-400">Convierte un presupuesto aceptado para crear una hoja de pedido</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Número", "Cliente", "Fecha", "Presupuesto", "Importe", "Estado", "Acciones"].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[12px] text-slate-700 font-medium">{o.number}</td>
                    <td className="py-3.5 px-4 text-[13px] text-slate-900">{o.client.name ?? o.client.email ?? "—"}</td>
                    <td className="py-3.5 px-4 text-[12px] text-slate-500">{fmtDate(o.issueDate)}</td>
                    <td className="py-3.5 px-4 text-[12px] text-slate-400 font-mono">{o.quote?.number ?? "—"}</td>
                    <td className="py-3.5 px-4 text-[13px] font-semibold text-slate-900 text-right">{fmt(o.total)}</td>
                    <td className="py-3.5 px-4">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", STATUS_BADGE[o.status])}>
                        {STATUS_LABEL[o.status]}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => window.open(`/api/purchase-orders/${o.id}/pdf`, "_blank")}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                          title="Ver PDF"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </button>
                        {STATUS_NEXT_LABEL[o.status] && (
                          <button
                            onClick={() => advance(o.id)}
                            disabled={actionLoading === o.id + "confirm"}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-[#1FA97A] transition-colors disabled:opacity-50"
                            title={STATUS_NEXT_LABEL[o.status]}
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {(o.status === "CONFIRMED" || o.status === "IN_PROGRESS" || o.status === "COMPLETED") && (
                          <>
                            <button
                              onClick={() => convertDelivery(o.id)}
                              disabled={actionLoading === o.id + "delivery"}
                              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-purple-600 transition-colors disabled:opacity-50"
                              title="Generar Albarán"
                            >
                              <Truck className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => convertInvoice(o.id)}
                              disabled={actionLoading === o.id + "invoice"}
                              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                              title="Generar Factura"
                            >
                              <Receipt className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                        {o.status === "DRAFT" && (
                          <button
                            onClick={() => deleteOrder(o.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
