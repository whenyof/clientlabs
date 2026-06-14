"use client"

import { useState, useEffect, useCallback } from "react"
import { FileText, ExternalLink, ClipboardList, Package, Receipt, ChevronDown, ChevronRight, Link2, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type DocInfo = { id: string; number: string; status: string; issueDate: string; total?: number | null }

type OrderGroup = {
  orderId: string
  order: DocInfo
  quote: DocInfo | null
  deliveryNote: DocInfo | null
  invoice: DocInfo | null
}

type StandaloneData = {
  quotes: DocInfo[]
  deliveries: DocInfo[]
  invoices: DocInfo[]
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador", SENT: "Enviado", ACCEPTED: "Aceptado", REJECTED: "Rechazado",
  EXPIRED: "Expirado", CONVERTED: "Convertido", DELIVERED: "Entregado",
  SIGNED: "Firmado", CONFIRMED: "Confirmado", IN_PROGRESS: "En preparación",
  COMPLETED: "Completado", CANCELLED: "Cancelado", PAID: "Pagada",
  OVERDUE: "Vencida", CANCELED: "Anulada", PARTIAL: "Parcial",
}

// Convención: borrador = gris; estados positivos/avanzados = verde.
const POSITIVE = "bg-[#E1F5EE] text-[#0F6E56] border border-[#9FE1CB]"
const STATUS_CLASS: Record<string, string> = {
  PAID: POSITIVE,
  ACCEPTED: POSITIVE,
  COMPLETED: POSITIVE,
  CONFIRMED: POSITIVE,
  DELIVERED: POSITIVE,
  SIGNED: POSITIVE,
  IN_PROGRESS: POSITIVE,
  DRAFT: "bg-slate-100 text-slate-600",
  SENT: "bg-blue-50 text-blue-700 border border-blue-200",
  OVERDUE: "bg-red-50 text-red-700 border border-red-200",
  REJECTED: "bg-red-50 text-red-700 border border-red-200",
}

function fmt(n?: number | null) {
  if (n == null) return null
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n)
}

function fmtDate(d: string) {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(new Date(d))
}

type DocType = "quote" | "deliveryNote" | "purchaseOrder" | "invoice"

const STATUS_ENDPOINT_BASE: Record<Exclude<DocType, "invoice">, string> = {
  quote: "/api/quotes",
  deliveryNote: "/api/delivery-notes",
  purchaseOrder: "/api/purchase-orders",
}

/** Allowed manual status transitions per document type (maps to existing endpoints).
 *  La FACTURA no aparece aquí: su paso a emitida va solo por el flujo Verifactu. */
function transitionsFor(docType: DocType, status: string): { label: string; endpoint: string }[] {
  if (docType === "quote") {
    if (status === "DRAFT") return [{ label: "Marcar enviado", endpoint: "send" }, { label: "Marcar aceptado", endpoint: "accept" }, { label: "Marcar rechazado", endpoint: "reject" }]
    if (status === "SENT") return [{ label: "Marcar aceptado", endpoint: "accept" }, { label: "Marcar rechazado", endpoint: "reject" }, { label: "Marcar expirado", endpoint: "expire" }]
    return []
  }
  if (docType === "deliveryNote") {
    if (status === "DRAFT") return [{ label: "Marcar entregado", endpoint: "deliver" }]
    if (status === "DELIVERED") return [{ label: "Marcar firmado", endpoint: "deliver" }]
    return []
  }
  if (docType === "purchaseOrder") {
    if (status === "DRAFT") return [{ label: "Confirmar", endpoint: "confirm" }]
    if (status === "CONFIRMED") return [{ label: "Marcar en preparación", endpoint: "confirm" }]
    if (status === "IN_PROGRESS") return [{ label: "Marcar completado", endpoint: "confirm" }]
    return []
  }
  return []
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium", STATUS_CLASS[status] ?? "bg-slate-100 text-slate-600")}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

/** Status badge that, for editable doc types, opens a dropdown of allowed transitions. */
function StatusControl({ docType, docId, status, onChanged }: {
  docType: DocType; docId: string; status: string; onChanged: () => void
}) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const transitions = docType === "invoice" ? [] : transitionsFor(docType, status)
  if (transitions.length === 0) return <StatusBadge status={status} />

  async function go(endpoint: string) {
    setSaving(true)
    try {
      const base = STATUS_ENDPOINT_BASE[docType as Exclude<DocType, "invoice">]
      const res = await fetch(`${base}/${docId}/${endpoint}`, { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { toast.error(data.error ?? "No se pudo cambiar el estado"); return }
      setOpen(false)
      onChanged()
    } catch { toast.error("Error de conexión") }
    finally { setSaving(false) }
  }

  return (
    <span className="relative ml-1" onClick={(e) => e.stopPropagation()}>
      <button type="button" onClick={() => setOpen(v => !v)} disabled={saving} title="Cambiar estado"
        className="inline-flex items-center gap-0.5 disabled:opacity-50">
        <StatusBadge status={status} />
        <ChevronDown className="h-3 w-3 text-[var(--text-secondary)]" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 left-0 min-w-[170px] rounded-lg border border-[var(--border-subtle)] bg-white shadow-lg py-1">
          {transitions.map(t => (
            <button key={t.endpoint + t.label} type="button" onClick={() => go(t.endpoint)} disabled={saving}
              className="block w-full text-left px-3 py-1.5 text-[12px] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] disabled:opacity-50">
              {t.label}
            </button>
          ))}
        </div>
      )}
    </span>
  )
}

function LinkedDocRow({ icon, label, doc, pdfHref, docType, onChanged }: {
  icon: React.ReactNode; label: string; doc: DocInfo; pdfHref: string
  docType?: DocType; onChanged?: () => void
}) {
  return (
    <div
      onClick={() => window.open(pdfHref, "_blank")}
      className="flex items-center gap-2 pl-5 py-1.5 border-l-2 border-[var(--border-subtle)] ml-4 cursor-pointer hover:bg-[var(--bg-card)] rounded-r transition-colors"
    >
      <span className="text-[var(--text-secondary)] shrink-0">{icon}</span>
      <span className="text-[11px] text-[var(--text-secondary)] w-20 shrink-0">{label}</span>
      <span className="font-mono text-[11px] font-semibold text-[var(--text-primary)]">{doc.number}</span>
      {docType && docType !== "invoice" && onChanged
        ? <StatusControl docType={docType} docId={doc.id} status={doc.status} onChanged={onChanged} />
        : <span className="ml-1"><StatusBadge status={doc.status} /></span>}
      {/* Always carry ml-auto (even with no total) so the preview icon stays
          right-aligned across all rows — e.g. albarán has no total. */}
      <span className="ml-auto text-[11px] font-semibold tabular-nums text-[var(--text-primary)]">{doc.total != null ? fmt(doc.total) : ""}</span>
      <a href={pdfHref} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
        className="p-1 rounded hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shrink-0">
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  )
}

/** Modal to fill the client's missing fiscal data so an F1 invoice can be generated. */
function FiscalDataModal({ clientId, onClose, onSaved }: {
  clientId: string; onClose: () => void; onSaved: () => void
}) {
  const [form, setForm] = useState({ legalName: "", taxId: "", address: "", postalCode: "", city: "", country: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/clients/${clientId}`)
      .then(r => r.json())
      .then(c => setForm({
        legalName: c.legalName ?? "", taxId: c.taxId ?? "", address: c.address ?? "",
        postalCode: c.postalCode ?? "", city: c.city ?? "", country: c.country ?? "",
      }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [clientId])

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast.error(d.error ?? "No se pudo guardar"); return }
      onSaved()
    } catch { toast.error("Error de conexión") }
    finally { setSaving(false) }
  }

  const fields: { key: keyof typeof form; label: string }[] = [
    { key: "legalName", label: "Razón social / Nombre fiscal" },
    { key: "taxId", label: "NIF / CIF" },
    { key: "address", label: "Dirección fiscal" },
    { key: "postalCode", label: "Código postal" },
    { key: "city", label: "Ciudad" },
    { key: "country", label: "País" },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">Completar datos fiscales del cliente</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">Necesarios para una factura completa (F1).</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100"><X className="h-4 w-4 text-slate-400" /></button>
        </div>
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <p className="text-[13px] text-slate-400 animate-pulse py-4 text-center">Cargando...</p>
          ) : fields.map(f => (
            <div key={f.key}>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">{f.label}</label>
              <input
                value={form[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full text-[13px] border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30"
              />
            </div>
          ))}
        </div>
        <div className="px-5 pb-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button onClick={save} disabled={saving || loading} className="px-5 py-2 rounded-lg bg-[#0F766E] text-white text-[13px] font-medium hover:bg-[#0E665F] disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar y continuar"}
          </button>
        </div>
      </div>
    </div>
  )
}

function GenerateDocRow({ orderId, clientId, docType, label, icon, onGenerated }: {
  orderId: string
  clientId: string
  docType: "quote" | "deliveryNote" | "invoice"
  label: string
  icon: React.ReactNode
  onGenerated: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [invoiceDocType, setInvoiceDocType] = useState<"F1" | "F2">("F1")
  const [fiscalModal, setFiscalModal] = useState(false)

  async function generate() {
    setSaving(true)
    try {
      const res = await fetch(`/api/purchase-orders/${orderId}/generate-doc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType, invoiceDocType: docType === "invoice" ? invoiceDocType : undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        // F1 sin datos fiscales del cliente → formulario para completarlos y seguir.
        if (data.needsClientFiscalData) { setFiscalModal(true); return }
        toast.error(data.error ?? "Error al generar"); return
      }
      toast.success(`${data.number} creado como borrador`)
      if (data.fiscalWarning) toast.warning(data.fiscalWarning)
      onGenerated()
    } catch { toast.error("Error de conexión") }
    finally { setSaving(false) }
  }

  return (
    <div className="flex items-center gap-2 pl-5 py-1.5 border-l-2 border-[var(--border-subtle)] ml-4">
      <span className="text-[var(--text-secondary)] opacity-40 shrink-0">{icon}</span>
      <span className="text-[11px] text-[var(--text-secondary)] w-20 shrink-0">{label}</span>
      {docType === "invoice" && (
        <div className="flex items-center gap-2">
          {(["F1", "F2"] as const).map(t => (
            <label key={t} className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)] cursor-pointer">
              <input type="radio" value={t} checked={invoiceDocType === t} onChange={() => setInvoiceDocType(t)} className="accent-[#0F766E]" />
              {t === "F1" ? "F1 completa" : "F2 simplificada"}
            </label>
          ))}
        </div>
      )}
      <button
        onClick={generate}
        disabled={saving}
        className="ml-auto flex items-center gap-1 text-[11px] text-[#0F766E] font-medium hover:underline disabled:opacity-50 shrink-0"
      >
        <Plus className="h-3 w-3" />
        {saving ? "Generando..." : "Generar"}
      </button>
      {fiscalModal && (
        <FiscalDataModal
          clientId={clientId}
          onClose={() => setFiscalModal(false)}
          onSaved={() => { setFiscalModal(false); generate() }}
        />
      )}
    </div>
  )
}

function StandaloneRow({ clientId, icon, label, doc, docType, orders, onLinked }: {
  clientId: string
  icon: React.ReactNode
  label: string
  doc: DocInfo
  docType: "quote" | "deliveryNote" | "invoice"
  orders: { id: string; number: string }[]
  onLinked: () => void
}) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState("")
  const [saving, setSaving] = useState(false)

  async function link() {
    if (!selected) return
    setSaving(true)
    try {
      const res = await fetch(`/api/clients/${clientId}/documents`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selected, docType, docId: doc.id }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "Error al vincular"); return }
      toast.success(`${doc.number} vinculado`)
      setOpen(false)
      onLinked()
    } catch { toast.error("Error de conexión") }
    finally { setSaving(false) }
  }

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="text-[var(--text-secondary)] shrink-0">{icon}</span>
        <span className="text-[11px] text-[var(--text-secondary)] w-20 shrink-0">{label}</span>
        <span className="font-mono text-[11px] font-semibold text-[var(--text-primary)]">{doc.number}</span>
        <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ml-1", STATUS_CLASS[doc.status] ?? "bg-slate-100 text-slate-600")}>
          {STATUS_LABEL[doc.status] ?? doc.status}
        </span>
        {doc.total != null && <span className="text-[11px] tabular-nums text-[var(--text-secondary)] ml-1">{fmt(doc.total)}</span>}
        <button
          onClick={() => setOpen(v => !v)}
          className="ml-auto flex items-center gap-1 text-[11px] text-[#0F766E] font-medium hover:underline shrink-0"
        >
          <Link2 className="h-3 w-3" />
          Vincular a pedido
        </button>
      </div>
      {open && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="flex-1 text-[12px] border border-[var(--border-subtle)] rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30"
          >
            <option value="">Selecciona un pedido...</option>
            {orders.map(o => <option key={o.id} value={o.id}>{o.number}</option>)}
          </select>
          <button
            onClick={link}
            disabled={!selected || saving}
            className="px-3 py-1.5 text-[12px] font-medium rounded-md bg-[#0F766E] text-white hover:bg-[#0E665F] disabled:opacity-50 transition-colors shrink-0"
          >
            {saving ? "Vinculando..." : "Confirmar"}
          </button>
          <button onClick={() => setOpen(false)} className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shrink-0">
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}

interface Props { clientId: string }

export function ClientDocumentsList({ clientId }: Props) {
  const [groups, setGroups] = useState<OrderGroup[]>([])
  const [standalone, setStandalone] = useState<StandaloneData | null>(null)
  const [orders, setOrders] = useState<{ id: string; number: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/clients/${clientId}/documents`)
      .then(r => r.json())
      .then(d => {
        if (d.groups) setGroups(d.groups)
        if (d.standalone) setStandalone(d.standalone)
        if (d.orders) setOrders(d.orders)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [clientId])

  useEffect(() => { load() }, [load])

  // Reload when a sibling (e.g. NewOrderModal) creates a document for this client.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ clientId?: string }>).detail
      if (!detail?.clientId || detail.clientId === clientId) load()
    }
    window.addEventListener("client360:refresh-documents", handler)
    return () => window.removeEventListener("client360:refresh-documents", handler)
  }, [load, clientId])

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  if (loading) return <div className="py-8 text-center text-[13px] text-[var(--text-secondary)] animate-pulse">Cargando...</div>

  const hasStandalone = standalone && (standalone.quotes.length + standalone.deliveries.length + standalone.invoices.length > 0)

  if (groups.length === 0 && !hasStandalone) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center mb-3">
          <FileText className="h-5 w-5 text-[var(--text-secondary)]" />
        </div>
        <p className="text-[13px] font-medium text-[var(--text-primary)] mb-1">Sin documentos</p>
        <p className="text-[12px] text-[var(--text-secondary)]">Los documentos comerciales del cliente aparecerán aquí</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 p-1">
      {groups.map(g => {
        const hasChildren = !!(g.quote || g.deliveryNote || g.invoice)
        const isOpen = expanded.has(g.orderId)
        return (
          <div key={g.orderId} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
            <div
              onClick={() => toggle(g.orderId)}
              className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-[var(--bg-card)] transition-colors"
            >
              <span className="shrink-0 p-0.5 text-[var(--text-secondary)]">
                {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </span>
              <ClipboardList className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span className="font-mono text-[12px] font-semibold text-[var(--text-primary)]">{g.order.number}</span>
              <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium", STATUS_CLASS[g.order.status] ?? "bg-slate-100 text-slate-600")}>
                {STATUS_LABEL[g.order.status] ?? g.order.status}
              </span>
              <span className="text-[11px] text-[var(--text-secondary)]">{fmtDate(g.order.issueDate)}</span>
              {g.order.total != null && (
                <span className="ml-auto text-[12px] font-semibold tabular-nums text-[var(--text-primary)]">{fmt(g.order.total)}</span>
              )}
            </div>
            {isOpen && (
              <div className="px-3 pb-2 pt-1 space-y-0.5 border-t border-[var(--border-subtle)]">
                {/* Presupuesto */}
                {g.quote
                  ? <LinkedDocRow icon={<FileText className="h-3.5 w-3.5 text-blue-400" />} label="Presupuesto" doc={g.quote} pdfHref={`/api/quotes/${g.quote.id}/pdf`} docType="quote" onChanged={load} />
                  : <GenerateDocRow orderId={g.orderId} clientId={clientId} docType="quote" label="Presupuesto" icon={<FileText className="h-3.5 w-3.5" />} onGenerated={load} />
                }
                {/* Hoja de pedido (el propio PO) */}
                <LinkedDocRow icon={<ClipboardList className="h-3.5 w-3.5 text-blue-500" />} label="Hoja de pedido" doc={g.order} pdfHref={`/api/purchase-orders/${g.orderId}/pdf`} docType="purchaseOrder" onChanged={load} />
                {/* Albarán */}
                {g.deliveryNote
                  ? <LinkedDocRow icon={<Package className="h-3.5 w-3.5 text-amber-500" />} label="Albarán" doc={g.deliveryNote} pdfHref={`/api/delivery-notes/${g.deliveryNote.id}/pdf`} docType="deliveryNote" onChanged={load} />
                  : <GenerateDocRow orderId={g.orderId} clientId={clientId} docType="deliveryNote" label="Albarán" icon={<Package className="h-3.5 w-3.5" />} onGenerated={load} />
                }
                {/* Factura */}
                {g.invoice
                  ? <LinkedDocRow icon={<Receipt className="h-3.5 w-3.5 text-[#0F766E]" />} label="Factura" doc={g.invoice} pdfHref={`/api/invoicing/${g.invoice.id}/pdf`} />
                  : <GenerateDocRow orderId={g.orderId} clientId={clientId} docType="invoice" label="Factura" icon={<Receipt className="h-3.5 w-3.5" />} onGenerated={load} />
                }
              </div>
            )}
          </div>
        )
      })}

      {hasStandalone && (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
          <p className="px-3 py-2 text-[11px] font-semibold text-[var(--text-secondary)] border-b border-[var(--border-subtle)] uppercase tracking-wider">
            Documentos sueltos
          </p>
          <div className="p-2 space-y-1.5">
            {standalone!.quotes.map(q => (
              <StandaloneRow key={q.id} clientId={clientId} icon={<FileText className="h-3.5 w-3.5 text-blue-400" />} label="Presupuesto" doc={q} docType="quote" orders={orders} onLinked={load} />
            ))}
            {standalone!.deliveries.map(d => (
              <StandaloneRow key={d.id} clientId={clientId} icon={<Package className="h-3.5 w-3.5 text-amber-500" />} label="Albarán" doc={d} docType="deliveryNote" orders={orders} onLinked={load} />
            ))}
            {standalone!.invoices.map(i => (
              <StandaloneRow key={i.id} clientId={clientId} icon={<Receipt className="h-3.5 w-3.5 text-[#0F766E]" />} label="Factura" doc={i} docType="invoice" orders={orders} onLinked={load} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
