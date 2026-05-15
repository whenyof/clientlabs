"use client"

import { useState, useEffect, useCallback } from "react"
import { FileText, ExternalLink, ClipboardList, Package, Receipt, ChevronDown, ChevronRight, Link2, Plus } from "lucide-react"
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

const STATUS_CLASS: Record<string, string> = {
  PAID: "bg-[#E1F5EE] text-[#0F6E56] border border-[#9FE1CB]",
  ACCEPTED: "bg-[#E1F5EE] text-[#0F6E56] border border-[#9FE1CB]",
  COMPLETED: "bg-[#E1F5EE] text-[#0F6E56] border border-[#9FE1CB]",
  DRAFT: "bg-slate-100 text-slate-600",
  SENT: "bg-blue-50 text-blue-700 border border-blue-200",
  OVERDUE: "bg-red-50 text-red-700 border border-red-200",
}

function fmt(n?: number | null) {
  if (n == null) return null
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n)
}

function fmtDate(d: string) {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" }).format(new Date(d))
}

function LinkedDocRow({ icon, label, doc, pdfHref }: {
  icon: React.ReactNode; label: string; doc: DocInfo; pdfHref: string
}) {
  return (
    <div className="flex items-center gap-2 pl-5 py-1.5 border-l-2 border-[var(--border-subtle)] ml-4">
      <span className="text-[var(--text-secondary)] shrink-0">{icon}</span>
      <span className="text-[11px] text-[var(--text-secondary)] w-20 shrink-0">{label}</span>
      <span className="font-mono text-[11px] font-semibold text-[var(--text-primary)]">{doc.number}</span>
      <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ml-1", STATUS_CLASS[doc.status] ?? "bg-slate-100 text-slate-600")}>
        {STATUS_LABEL[doc.status] ?? doc.status}
      </span>
      {doc.total != null && (
        <span className="ml-auto text-[11px] font-semibold tabular-nums text-[var(--text-primary)]">{fmt(doc.total)}</span>
      )}
      <a href={pdfHref} target="_blank" rel="noopener noreferrer"
        className="p-1 rounded hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shrink-0">
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  )
}

function GenerateDocRow({ orderId, docType, label, icon, onGenerated }: {
  orderId: string
  docType: "quote" | "deliveryNote" | "invoice"
  label: string
  icon: React.ReactNode
  onGenerated: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [invoiceDocType, setInvoiceDocType] = useState<"F1" | "F2">("F1")

  async function generate() {
    setSaving(true)
    try {
      const res = await fetch(`/api/purchase-orders/${orderId}/generate-doc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType, invoiceDocType: docType === "invoice" ? invoiceDocType : undefined }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "Error al generar"); return }
      toast.success(`${data.number} creado como borrador`)
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
              <input type="radio" value={t} checked={invoiceDocType === t} onChange={() => setInvoiceDocType(t)} className="accent-[#1FA97A]" />
              {t === "F1" ? "F1 completa" : "F2 simplificada"}
            </label>
          ))}
        </div>
      )}
      <button
        onClick={generate}
        disabled={saving}
        className="ml-auto flex items-center gap-1 text-[11px] text-[#1FA97A] font-medium hover:underline disabled:opacity-50 shrink-0"
      >
        <Plus className="h-3 w-3" />
        {saving ? "Generando..." : "Generar"}
      </button>
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
          className="ml-auto flex items-center gap-1 text-[11px] text-[#1FA97A] font-medium hover:underline shrink-0"
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
            className="flex-1 text-[12px] border border-[var(--border-subtle)] rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/30"
          >
            <option value="">Selecciona un pedido...</option>
            {orders.map(o => <option key={o.id} value={o.id}>{o.number}</option>)}
          </select>
          <button
            onClick={link}
            disabled={!selected || saving}
            className="px-3 py-1.5 text-[12px] font-medium rounded-md bg-[#1FA97A] text-white hover:bg-[#178f68] disabled:opacity-50 transition-colors shrink-0"
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
                  ? <LinkedDocRow icon={<FileText className="h-3.5 w-3.5 text-blue-400" />} label="Presupuesto" doc={g.quote} pdfHref={`/api/quotes/${g.quote.id}/pdf`} />
                  : <GenerateDocRow orderId={g.orderId} docType="quote" label="Presupuesto" icon={<FileText className="h-3.5 w-3.5" />} onGenerated={load} />
                }
                {/* Hoja de pedido (el propio PO) */}
                <LinkedDocRow icon={<ClipboardList className="h-3.5 w-3.5 text-blue-500" />} label="Hoja de pedido" doc={g.order} pdfHref={`/api/purchase-orders/${g.orderId}/pdf`} />
                {/* Albarán */}
                {g.deliveryNote
                  ? <LinkedDocRow icon={<Package className="h-3.5 w-3.5 text-amber-500" />} label="Albarán" doc={g.deliveryNote} pdfHref={`/api/delivery-notes/${g.deliveryNote.id}/pdf`} />
                  : <GenerateDocRow orderId={g.orderId} docType="deliveryNote" label="Albarán" icon={<Package className="h-3.5 w-3.5" />} onGenerated={load} />
                }
                {/* Factura */}
                {g.invoice
                  ? <LinkedDocRow icon={<Receipt className="h-3.5 w-3.5 text-[#1FA97A]" />} label="Factura" doc={g.invoice} pdfHref={`/api/invoicing/${g.invoice.id}/pdf`} />
                  : <GenerateDocRow orderId={g.orderId} docType="invoice" label="Factura" icon={<Receipt className="h-3.5 w-3.5" />} onGenerated={load} />
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
              <StandaloneRow key={i.id} clientId={clientId} icon={<Receipt className="h-3.5 w-3.5 text-[#1FA97A]" />} label="Factura" doc={i} docType="invoice" orders={orders} onLinked={load} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
