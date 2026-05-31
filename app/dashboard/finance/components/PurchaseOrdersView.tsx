"use client"

import { useState, useEffect, useCallback } from "react"
import {
  FileText, ClipboardList, Package, Receipt, Trash2,
  Search, ChevronRight, Upload, X, Plus, CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { BannerLegal } from "@/components/finance/BannerLegal"
import { ImportarDocumento } from "@/components/finance/ImportarDocumento"
import { toast } from "sonner"

type POStatus = "DRAFT" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

type DocRef = { id: string; number: string; status: string } | null

type PurchaseOrder = {
  id: string
  number: string
  status: POStatus
  issueDate: string
  total: number
  client: { id: string; name: string | null; email: string | null }
  quote: { id: string; number: string } | null
  deliveryNote: DocRef
  invoice: DocRef
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

function GenerateDocModal({
  order, onClose, onDone,
}: {
  order: PurchaseOrder
  onClose: () => void
  onDone: () => void
}) {
  const [docType, setDocType] = useState<"deliveryNote" | "invoice" | null>(
    !order.deliveryNote ? "deliveryNote" : !order.invoice ? "invoice" : null
  )
  const [invoiceDocType, setInvoiceDocType] = useState<"F1" | "F2">("F1")
  const [loading, setLoading] = useState(false)

  async function generate() {
    if (!docType) return
    setLoading(true)
    try {
      const res = await fetch(`/api/purchase-orders/${order.id}/generate-doc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType, invoiceDocType }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "Error al generar"); return }
      toast.success(`${data.number} creado como borrador`)
      onDone()
    } catch { toast.error("Error de conexión") }
    finally { setLoading(false) }
  }

  const canGenerate = docType !== null && (docType === "deliveryNote" ? !order.deliveryNote : !order.invoice)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">Generar documentos</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">Desde pedido {order.number}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <div className="p-5 space-y-2.5">
          {/* Albarán */}
          {order.deliveryNote ? (
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[#9FE1CB] bg-[#F0FDF9]">
              <CheckCircle className="h-4 w-4 text-[#0F766E] mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-amber-500" />
                  <span className="text-[13px] font-medium text-slate-900">Albarán de entrega</span>
                  <span className="font-mono text-[11px] text-[#0F766E] font-semibold">{order.deliveryNote.number}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Ya creado</p>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setDocType("deliveryNote")}
              className={cn(
                "rounded-xl border p-3.5 cursor-pointer transition-colors",
                docType === "deliveryNote" ? "border-[#0F766E] bg-[#F0FDF9]" : "border-slate-200 hover:bg-slate-50"
              )}
            >
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="radio"
                  checked={docType === "deliveryNote"}
                  onChange={() => setDocType("deliveryNote")}
                  className="mt-0.5 accent-[#0F766E]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-amber-500" />
                    <span className="text-[13px] font-medium text-slate-900">Albarán de entrega</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Documento de entrega. Serie ALB-{new Date().getFullYear()}-</p>
                </div>
              </label>
            </div>
          )}

          {/* Factura */}
          {order.invoice ? (
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[#9FE1CB] bg-[#F0FDF9]">
              <CheckCircle className="h-4 w-4 text-[#0F766E] mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-[#0F766E]" />
                  <span className="text-[13px] font-medium text-slate-900">Factura</span>
                  <span className="font-mono text-[11px] text-[#0F766E] font-semibold">{order.invoice.number}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Ya creada</p>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setDocType("invoice")}
              className={cn(
                "rounded-xl border p-3.5 cursor-pointer transition-colors",
                docType === "invoice" ? "border-[#0F766E] bg-[#F0FDF9]" : "border-slate-200 hover:bg-slate-50"
              )}
            >
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="radio"
                  checked={docType === "invoice"}
                  onChange={() => setDocType("invoice")}
                  className="mt-0.5 accent-[#0F766E]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-[#0F766E]" />
                    <span className="text-[13px] font-medium text-slate-900">Factura</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Se creará como borrador. Emítela desde Facturación.</p>
                  {docType === "invoice" && (
                    <div className="mt-2.5 space-y-1.5 pl-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="invDocType" value="F1" checked={invoiceDocType === "F1"} onChange={() => setInvoiceDocType("F1")} className="accent-[#0F766E]" />
                        <span className="text-[12px] text-slate-700">F1 — Completa <span className="text-slate-400">(con NIF del cliente)</span></span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="invDocType" value="F2" checked={invoiceDocType === "F2"} onChange={() => setInvoiceDocType("F2")} className="accent-[#0F766E]" />
                        <span className="text-[12px] text-slate-700">F2 — Simplificada <span className="text-slate-400">(sin NIF, máx. 3.000€)</span></span>
                      </label>
                    </div>
                  )}
                </div>
              </label>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={generate}
            disabled={loading || !canGenerate}
            className="px-5 py-2 rounded-lg bg-[#0F766E] text-white text-[13px] font-medium hover:bg-[#0E665F] disabled:opacity-50 transition-colors"
          >
            {loading ? "Generando..." : "Generar"}
          </button>
        </div>
      </div>
    </div>
  )
}

type Props = { clientId?: string; onNavigateToInvoices?: () => void; onNavigateToDelivery?: () => void }

export function PurchaseOrdersView({ clientId, onNavigateToInvoices: _ni, onNavigateToDelivery: _nd }: Props) {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("")
  const [search, setSearch] = useState("")
  const [modalImportar, setModalImportar] = useState(false)
  const [generateOrder, setGenerateOrder] = useState<PurchaseOrder | null>(null)
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

  const deleteOrder = async (orderId: string) => {
    if (!confirm("¿Eliminar esta hoja de pedido?")) return
    await fetch(`/api/purchase-orders/${orderId}`, { method: "DELETE" })
    fetchOrders()
  }

  return (
    <div className="space-y-4">
      <BannerLegal />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-[14px] font-semibold text-slate-900">Pedidos</h3>
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
                  ? "bg-[#0F766E] text-white border-[#0F766E]"
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
          <button
            onClick={() => setModalImportar(true)}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-[13px] font-medium hover:bg-slate-50 transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            Importar
          </button>
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
            <p className="text-[14px] font-medium text-slate-700 mb-1">No hay pedidos</p>
            <p className="text-[12px] text-slate-400 mb-4">Los pedidos se generan desde presupuestos aceptados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Número", "Cliente", "Fecha", "Presupuesto", "Albarán", "Factura", "Importe", "Estado", "Acciones"].map((h) => (
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
                    <td className="py-3.5 px-4">
                      {o.deliveryNote
                        ? <span className="font-mono text-[11px] text-[#0F6E56] font-semibold">{o.deliveryNote.number}</span>
                        : <span className="text-[11px] text-slate-300">—</span>
                      }
                    </td>
                    <td className="py-3.5 px-4">
                      {o.invoice
                        ? <span className="font-mono text-[11px] text-[#0F6E56] font-semibold">{o.invoice.number}</span>
                        : <span className="text-[11px] text-slate-300">—</span>
                      }
                    </td>
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
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-[#0F766E] transition-colors disabled:opacity-50"
                            title={STATUS_NEXT_LABEL[o.status]}
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {(!o.deliveryNote || !o.invoice) && (
                          <button
                            onClick={() => setGenerateOrder(o)}
                            className="px-2 py-1 rounded-md text-[11px] font-medium transition-colors bg-[#E1F5EE] text-[#0F6E56] hover:bg-[#0F766E] hover:text-white"
                          >
                            Generar
                          </button>
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

      {generateOrder && (
        <GenerateDocModal
          order={generateOrder}
          onClose={() => setGenerateOrder(null)}
          onDone={() => { setGenerateOrder(null); fetchOrders() }}
        />
      )}

      {modalImportar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setModalImportar(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900">Importar documento</h2>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  Sube el PDF de tu hoja de pedido u otro documento
                </p>
              </div>
              <button onClick={() => setModalImportar(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6">
              <ImportarDocumento tipo="pedido" onImportado={() => setModalImportar(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
