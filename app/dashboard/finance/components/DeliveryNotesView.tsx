"use client"

import { useState, useEffect, useCallback } from "react"
import { FileText, Truck, CheckCircle, Receipt, Trash2, Search, Upload, X, Plus, Link as LinkIcon } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { BannerLegal } from "@/components/finance/BannerLegal"
import { ImportarDocumento } from "@/components/finance/ImportarDocumento"
import { NewDeliveryNoteModal } from "./NewDeliveryNoteModal"
import { toast } from "sonner"

type DNStatus = "DRAFT" | "DELIVERED" | "SIGNED" | "CONVERTED"

type LinkedInvoice = { id: string; number: string; status: string } | null

type DeliveryNote = {
  id: string
  number: string
  status: DNStatus
  issueDate: string
  deliveryDate: string | null
  convertedToInvoiceId: string | null
  linkedInvoice: LinkedInvoice
  client: { id: string; name: string | null; email: string | null }
  quote: { number: string } | null
}

function ConvertToInvoiceModal({
  deliveryNote,
  onClose,
  onCreated,
}: {
  deliveryNote: DeliveryNote
  onClose: () => void
  onCreated: (invoice: { id: string; number: string }) => void
}) {
  const [invoiceType, setInvoiceType] = useState<"F1" | "F2">("F1")
  const [loading, setLoading] = useState(false)

  async function handleConvert() {
    setLoading(true)
    try {
      const res = await fetch(`/api/delivery-notes/${deliveryNote.id}/convert-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceDocType: invoiceType }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "Error al crear la factura"); return }
      toast.success(`Factura ${data.number} creada como borrador`)
      onCreated({ id: data.id, number: data.number })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">Crear factura desde albarán</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">Albarán {deliveryNote.number} — {deliveryNote.client.name ?? deliveryNote.client.email ?? "—"}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>
        <div className="p-5 space-y-2.5">
          <label className={cn("flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors", invoiceType === "F1" ? "border-[#0F766E] bg-[#F0FDF9]" : "border-slate-200 hover:bg-slate-50")}>
            <input type="radio" checked={invoiceType === "F1"} onChange={() => setInvoiceType("F1")} className="mt-0.5 accent-[#0F766E]" />
            <div>
              <span className="text-[13px] font-medium text-slate-900">F1 — Factura completa</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Con NIF del destinatario. Para B2B o importes elevados.</p>
            </div>
          </label>
          <label className={cn("flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors", invoiceType === "F2" ? "border-[#0F766E] bg-[#F0FDF9]" : "border-slate-200 hover:bg-slate-50")}>
            <input type="radio" checked={invoiceType === "F2"} onChange={() => setInvoiceType("F2")} className="mt-0.5 accent-[#0F766E]" />
            <div>
              <span className="text-[13px] font-medium text-slate-900">F2 — Factura simplificada</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Sin NIF, máximo 3.000 €. Para B2C.</p>
            </div>
          </label>
        </div>
        <div className="px-5 pb-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={handleConvert} disabled={loading} className="px-5 py-2 rounded-lg bg-[#0F766E] text-white text-[13px] font-medium hover:bg-[#0E665F] disabled:opacity-50 transition-colors">
            {loading ? "Creando..." : "Crear factura (borrador)"}
          </button>
        </div>
      </div>
    </div>
  )
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
  const [modalImportar, setModalImportar] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [convertModal, setConvertModal] = useState<DeliveryNote | null>(null)

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
      if (res.ok) fetchNotes()
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
      <BannerLegal />

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
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0F766E] text-white rounded-lg text-[13px] font-semibold hover:bg-[#0E665F] transition-colors"
          >
            <Plus className="h-4 w-4" />
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
            <p className="text-[12px] text-slate-400 mb-4">Crea tu primer albarán o importa uno existente</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0F766E] text-white rounded-lg text-[13px] font-semibold hover:bg-[#0E665F] transition-colors"
              >
                <Plus className="h-4 w-4" /> Nuevo albarán
              </button>
              <button
                onClick={() => setModalImportar(true)}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-[13px] font-medium hover:bg-slate-50 transition-colors"
              >
                <Upload className="h-4 w-4" /> Importar
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Número", "Cliente", "Fecha", "Entrega", "Presupuesto", "Factura", "Estado", "Acciones"].map((h) => (
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
                      {n.linkedInvoice ? (
                        <Link
                          href={`/dashboard/finance/invoicing?id=${n.linkedInvoice.id}`}
                          className="flex items-center gap-1 font-mono text-[11px] text-[#0F6E56] font-semibold hover:underline"
                          title="Ver factura vinculada"
                        >
                          <LinkIcon className="h-3 w-3" />
                          {n.linkedInvoice.number}
                        </Link>
                      ) : (
                        <span className="text-[11px] text-slate-300">—</span>
                      )}
                    </td>
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
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-[#0F766E] transition-colors disabled:opacity-50"
                            title={n.status === "DRAFT" ? "Marcar entregado" : "Marcar firmado"}
                          >
                            {n.status === "DRAFT" ? <Truck className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                          </button>
                        )}
                        {(n.status === "DELIVERED" || n.status === "SIGNED") && !n.convertedToInvoiceId && (
                          <button
                            onClick={() => setConvertModal(n)}
                            disabled={actionLoading === n.id + "convert-invoice"}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                            title="Crear factura desde este albarán"
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

      {convertModal && (
        <ConvertToInvoiceModal
          deliveryNote={convertModal}
          onClose={() => setConvertModal(null)}
          onCreated={() => { setConvertModal(null); fetchNotes() }}
        />
      )}

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
                  Sube el PDF de tu albarán u otro documento
                </p>
              </div>
              <button onClick={() => setModalImportar(false)} className="p-2 rounded-xl hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6">
              <ImportarDocumento tipo="albaran" onImportado={() => setModalImportar(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
