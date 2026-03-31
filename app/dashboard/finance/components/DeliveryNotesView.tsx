"use client"

import { useState, useEffect, useCallback } from "react"
import { FileText, Truck, CheckCircle, Receipt, Trash2, Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { NewDeliveryNoteModal } from "./NewDeliveryNoteModal"

type DNStatus = "DRAFT" | "DELIVERED" | "SIGNED" | "CONVERTED"

type DeliveryNote = {
  id: string
  number: string
  status: DNStatus
  issueDate: string
  deliveryDate: string | null
  client: { id: string; name: string | null; email: string | null }
  quote: { number: string } | null
}

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: "", label: "Todos" },
  { key: "DRAFT", label: "Borrador" },
  { key: "DELIVERED", label: "Entregado" },
  { key: "SIGNED", label: "Firmado" },
  { key: "CONVERTED", label: "Convertido" },
]

const STATUS_BADGE: Record<DNStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  DELIVERED: "bg-blue-50 text-blue-700 border border-blue-200",
  SIGNED: "bg-[#E1F5EE] text-[#0F6E56] border border-[#9FE1CB]",
  CONVERTED: "bg-purple-50 text-purple-700 border border-purple-200",
}

const STATUS_LABEL: Record<DNStatus, string> = {
  DRAFT: "Borrador",
  DELIVERED: "Entregado",
  SIGNED: "Firmado",
  CONVERTED: "Convertido",
}

function fmtDate(d: string) {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d))
}

type Props = { clientId?: string; onNavigateToInvoices?: () => void }

export function DeliveryNotesView({ clientId, onNavigateToInvoices }: Props) {
  const [notes, setNotes] = useState<DeliveryNote[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("")
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (clientId) params.set("clientId", clientId)
      if (activeFilter) params.set("status", activeFilter)
      if (search) params.set("search", search)
      const res = await fetch(`/api/delivery-notes?${params}`)
      const data = await res.json()
      if (data.success) setNotes(data.notes)
    } finally {
      setLoading(false)
    }
  }, [clientId, activeFilter, search])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  const action = async (noteId: string, endpoint: string) => {
    setActionLoading(noteId + endpoint)
    try {
      const res = await fetch(`/api/delivery-notes/${noteId}/${endpoint}`, { method: "POST" })
      if (res.ok) {
        if (endpoint === "convert-invoice") onNavigateToInvoices?.()
        fetchNotes()
      }
    } finally {
      setActionLoading(null)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm("¿Eliminar este albarán?")) return
    await fetch(`/api/delivery-notes/${noteId}`, { method: "DELETE" })
    fetchNotes()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-[14px] font-semibold text-slate-900">Albaranes</h3>
          {!loading && (
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {notes.length}
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
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1FA97A] text-white rounded-lg text-[12px] font-medium hover:bg-[#178f68] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Nuevo albarán
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-[13px] text-slate-400 animate-pulse">Cargando...</div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
              <Truck className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-[14px] font-medium text-slate-700 mb-1">No hay albaranes</p>
            <p className="text-[12px] text-slate-400 mb-4">Crea tu primer albarán de entrega</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1FA97A] text-white rounded-lg text-[12px] font-medium hover:bg-[#178f68] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Nuevo albarán
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Número", "Cliente", "Fecha", "Entrega", "Presupuesto", "Estado", "Acciones"].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {notes.map((n) => (
                  <tr key={n.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[12px] text-slate-700 font-medium">{n.number}</td>
                    <td className="py-3.5 px-4 text-[13px] text-slate-900">{n.client.name ?? n.client.email ?? "—"}</td>
                    <td className="py-3.5 px-4 text-[12px] text-slate-500">{fmtDate(n.issueDate)}</td>
                    <td className="py-3.5 px-4 text-[12px] text-slate-500">{n.deliveryDate ? fmtDate(n.deliveryDate) : "—"}</td>
                    <td className="py-3.5 px-4 text-[12px] text-slate-400 font-mono">{n.quote?.number ?? "—"}</td>
                    <td className="py-3.5 px-4">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", STATUS_BADGE[n.status])}>
                        {STATUS_LABEL[n.status]}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => window.open(`/api/delivery-notes/${n.id}/pdf`, "_blank")}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                          title="Ver PDF"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </button>
                        {(n.status === "DRAFT" || n.status === "DELIVERED") && (
                          <button
                            onClick={() => action(n.id, "deliver")}
                            disabled={actionLoading === n.id + "deliver"}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-[#1FA97A] transition-colors disabled:opacity-50"
                            title={n.status === "DRAFT" ? "Marcar entregado" : "Marcar firmado"}
                          >
                            {n.status === "DRAFT" ? <Truck className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                          </button>
                        )}
                        {(n.status === "DELIVERED" || n.status === "SIGNED") && (
                          <button
                            onClick={() => action(n.id, "convert-invoice")}
                            disabled={actionLoading === n.id + "convert-invoice"}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                            title="Convertir a Factura"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {n.status === "DRAFT" && (
                          <button
                            onClick={() => deleteNote(n.id)}
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

      <NewDeliveryNoteModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => { setCreateOpen(false); fetchNotes() }}
        defaultClientId={clientId}
      />
    </div>
  )
}
