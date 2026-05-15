"use client"

import { useState, useEffect, useCallback } from "react"
import {
  FileText, Send, CheckCircle, XCircle, Clock,
  Trash2, Search, Upload, X, Plus
} from "lucide-react"
import { cn } from "@/lib/utils"
import { BannerLegal } from "@/components/finance/BannerLegal"
import { ImportarDocumento } from "@/components/finance/ImportarDocumento"
import { NewQuoteModal } from "./NewQuoteModal"
import { GenerateDocumentsModal } from "./GenerateDocumentsModal"

type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CONVERTED"

type DocRef = { id: string; number: string; status?: string } | null

type Quote = {
  id: string
  number: string
  status: QuoteStatus
  issueDate: string
  validUntil: string
  total: number
  convertedToInvoiceId: string | null
  client: { id: string; name: string | null; email: string | null }
  items: { id: string; description: string; quantity: number; unitPrice: number; taxRate: number; subtotal: number }[]
  purchaseOrder: DocRef
  deliveryNote: DocRef
  invoice: DocRef
}

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: "", label: "Todos" },
  { key: "DRAFT", label: "Borrador" },
  { key: "SENT", label: "Enviado" },
  { key: "ACCEPTED", label: "Aceptado" },
  { key: "REJECTED", label: "Rechazado" },
  { key: "EXPIRED", label: "Expirado" },
  { key: "CONVERTED", label: "Convertido" },
]

const STATUS_BADGE: Record<QuoteStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  SENT: "bg-blue-50 text-blue-700 border border-blue-200",
  ACCEPTED: "bg-[#E1F5EE] text-[#0F6E56] border border-[#9FE1CB]",
  REJECTED: "bg-red-50 text-red-700 border border-red-200",
  EXPIRED: "bg-amber-50 text-amber-700 border border-amber-200",
  CONVERTED: "bg-purple-50 text-purple-700 border border-purple-200",
}

const STATUS_LABEL: Record<QuoteStatus, string> = {
  DRAFT: "Borrador",
  SENT: "Enviado",
  ACCEPTED: "Aceptado",
  REJECTED: "Rechazado",
  EXPIRED: "Expirado",
  CONVERTED: "Convertido",
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n)
}

function fmtDate(d: string) {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d))
}

type Props = {
  clientId?: string
  onNavigateToInvoices?: () => void
  onNavigateToPurchaseOrders?: () => void
  onNavigateToDelivery?: () => void
}

export function QuotesView({ clientId, onNavigateToInvoices, onNavigateToPurchaseOrders, onNavigateToDelivery }: Props) {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState("")
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [modalImportar, setModalImportar] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [generateModalQuote, setGenerateModalQuote] = useState<Quote | null>(null)

  const fetchQuotes = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (clientId) params.set("clientId", clientId)
      if (activeFilter) params.set("status", activeFilter)
      if (search) params.set("search", search)
      const res = await fetch(`/api/quotes?${params}`)
      const data = await res.json()
      if (data.success) setQuotes(data.quotes)
    } finally {
      setLoading(false)
    }
  }, [clientId, activeFilter, search])

  useEffect(() => { fetchQuotes() }, [fetchQuotes])

  const action = async (quoteId: string, endpoint: string, onSuccess?: () => void) => {
    setActionLoading(quoteId + endpoint)
    try {
      const res = await fetch(`/api/quotes/${quoteId}/${endpoint}`, { method: "POST" })
      if (res.ok) {
        onSuccess?.()
        fetchQuotes()
      }
    } finally {
      setActionLoading(null)
    }
  }

  const deleteQuote = async (quoteId: string) => {
    if (!confirm("¿Eliminar este presupuesto?")) return
    await fetch(`/api/quotes/${quoteId}`, { method: "DELETE" })
    fetchQuotes()
  }

  return (
    <div className="space-y-4">
      <BannerLegal />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-[14px] font-semibold text-slate-900">Presupuestos</h3>
          {!loading && (
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {quotes.length}
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
            onClick={() => setModalImportar(true)}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-[13px] font-medium hover:bg-slate-50 transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            Importar
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1FA97A] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1a9068] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo presupuesto
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-[13px] text-slate-400 animate-pulse">Cargando...</div>
        ) : quotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
              <FileText className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-[14px] font-medium text-slate-700 mb-1">No hay presupuestos</p>
            <p className="text-[12px] text-slate-400 mb-4">Crea tu primer presupuesto o importa uno existente</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1FA97A] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1a9068] transition-colors"
              >
                <Plus className="h-4 w-4" /> Nuevo presupuesto
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
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Número", "Cliente", "Fecha", "Válido hasta", "Importe", "Estado", "Acciones"].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <>
                    <tr
                      key={q.id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-[12px] text-slate-700 font-medium">{q.number}</td>
                      <td className="py-3.5 px-4 text-[13px] text-slate-900">{q.client.name ?? q.client.email ?? "—"}</td>
                      <td className="py-3.5 px-4 text-[12px] text-slate-500">{fmtDate(q.issueDate)}</td>
                      <td className="py-3.5 px-4 text-[12px] text-slate-500">{fmtDate(q.validUntil)}</td>
                      <td className="py-3.5 px-4 text-[13px] font-semibold text-slate-900 text-right tabular-nums">{fmt(q.total)}</td>
                      <td className="py-3.5 px-4">
                        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", STATUS_BADGE[q.status])}>
                          {STATUS_LABEL[q.status]}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => window.open(`/api/quotes/${q.id}/pdf`, "_blank")}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            title="Ver PDF"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>
                          {q.status === "DRAFT" && (
                            <>
                              <button
                                onClick={() => action(q.id, "send")}
                                disabled={actionLoading === q.id + "send"}
                                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                                title="Enviar al cliente"
                              >
                                <Send className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => action(q.id, "accept")}
                                disabled={actionLoading === q.id + "accept"}
                                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-[#1FA97A] transition-colors disabled:opacity-50"
                                title="Marcar como aceptado"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => action(q.id, "reject")}
                                disabled={actionLoading === q.id + "reject"}
                                className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                title="Marcar como rechazado"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => deleteQuote(q.id)}
                                className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          {q.status === "SENT" && (
                            <>
                              <button
                                onClick={() => action(q.id, "accept")}
                                disabled={actionLoading === q.id + "accept"}
                                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-[#1FA97A] transition-colors disabled:opacity-50"
                                title="Marcar como aceptado"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => action(q.id, "reject")}
                                disabled={actionLoading === q.id + "reject"}
                                className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                title="Marcar como rechazado"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => action(q.id, "expire")}
                                disabled={actionLoading === q.id + "expire"}
                                className="p-1.5 rounded-md hover:bg-amber-50 text-slate-400 hover:text-amber-500 transition-colors disabled:opacity-50"
                                title="Marcar como expirado"
                              >
                                <Clock className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          {q.status === "ACCEPTED" && (
                            <button
                              onClick={() => setGenerateModalQuote(q)}
                              className="px-2 py-1 rounded-md text-[11px] font-medium transition-colors bg-[#E1F5EE] text-[#0F6E56] hover:bg-[#1FA97A] hover:text-white"
                            >
                              Generar documentos
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NewQuoteModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => { setCreateOpen(false); fetchQuotes() }}
        defaultClientId={clientId}
      />

      {generateModalQuote && (
        <GenerateDocumentsModal
          quoteId={generateModalQuote.id}
          quoteNumber={generateModalQuote.number}
          existing={{
            order: generateModalQuote.purchaseOrder ?? null,
            deliveryNote: generateModalQuote.deliveryNote ?? null,
            invoice: generateModalQuote.invoice ?? null,
          }}
          onClose={() => setGenerateModalQuote(null)}
          onDone={() => { setGenerateModalQuote(null); fetchQuotes() }}
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
                  Sube el PDF de tu presupuesto u otro documento
                </p>
              </div>
              <button onClick={() => setModalImportar(false)} className="p-2 rounded-xl hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6">
              <ImportarDocumento tipo="presupuesto" onImportado={() => setModalImportar(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
