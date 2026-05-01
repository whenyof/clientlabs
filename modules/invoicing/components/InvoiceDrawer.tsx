"use client"
import { getBaseUrl } from "@/lib/api/baseUrl"
import { useState, useCallback, useEffect } from "react"
import {
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  PaperAirplaneIcon,
  BanknotesIcon,
  BellAlertIcon,
  CheckIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  LockClosedIcon,
  DocumentDuplicateIcon,
  EyeIcon,
} from "@heroicons/react/24/outline"
import { formatCurrency, formatDate, formatDateTime } from "@/app/dashboard/finance/lib/formatters"
import { cn } from "@/lib/utils"
import type { InvoiceDetail } from "./types"
import { INVOICE_STATUS } from "@/modules/invoicing/types"
import { DRAFT_NUMBER_PLACEHOLDER } from "@/modules/invoicing/engine/invoice.engine"
import { isInvoiceEditable } from "@/modules/invoicing/utils/isInvoiceEditable"
import { invoiceStatusLabel } from "@/modules/invoicing/utils/invoiceStatusLabel"
import { IssueInvoiceDialog } from "./IssueInvoiceDialog"
import { CreateRectificativaModal } from "./CreateRectificativaModal"
import { InvoiceClientRiskBadge } from "./InvoiceClientRiskBadge"
import { FiscalWarning, FISCAL_DISABLED_TOOLTIP } from "@/components/fiscal/FiscalWarning"
import { calculateFiscalCompleteness } from "@/lib/clients/calculateFiscalCompleteness"

const ISSUED_EDIT_TOOLTIP = "Factura emitida — edición limitada por normativa fiscal"

function eventTypeToLabel(
  type: string,
  meta: { daysOverdue?: number; ruleKey?: string; label?: string; originalNumber?: string; rectifyingNumber?: string } | null
): string {
  if (type === "SENT" && meta?.label) return meta.label
  switch (type) {
    case "CREATED": return "Factura creada"
    case "EDITED": return "Factura editada"
    case "SENT": return "Factura emitida oficialmente"
    case "PAID": return "Factura pagada"
    case "CANCELED": return "Factura cancelada"
    case "REMINDER_SENT":
      return meta?.daysOverdue != null
        ? `Recordatorio enviado — ${meta.daysOverdue} ${meta.daysOverdue === 1 ? "día de retraso" : "días de retraso"}`
        : "Recordatorio enviado"
    case "RECTIFIES":
      return meta?.originalNumber != null ? `Rectifica factura Nº ${meta.originalNumber}` : "Rectifica factura"
    case "RECTIFICATION_ISSUED":
      return meta?.rectifyingNumber != null ? `Generada rectificativa Nº ${meta.rectifyingNumber}` : "Generada rectificativa"
    default: return type
  }
}

const STATUS_BADGE: Record<string, string> = {
  DRAFT:    "bg-slate-100 text-slate-500 border-slate-200",
  SENT:     "bg-blue-50 text-blue-600 border-blue-200",
  VIEWED:   "bg-sky-50 text-sky-600 border-sky-200",
  PARTIAL:  "bg-amber-50 text-amber-600 border-amber-200",
  PAID:     "bg-emerald-50 text-emerald-600 border-emerald-200",
  OVERDUE:  "bg-red-50 text-red-600 border-red-200",
  CANCELED: "bg-slate-50 text-slate-400 border-slate-200",
}

interface InvoiceDrawerProps {
  invoice: InvoiceDetail | null
  open: boolean
  onClose: () => void
  onRefresh: () => void
  onEdit: (id: string) => void
  onEditBlocked?: () => void
  onRectificationCreated?: (newInvoiceId: string) => void
  openRectificativaModal?: boolean
  onRectificativaModalOpenChange?: (open: boolean) => void
}

export function InvoiceDrawer({
  invoice, open, onClose, onRefresh, onEdit,
  onEditBlocked, onRectificationCreated,
  openRectificativaModal = false, onRectificativaModalOpenChange,
}: InvoiceDrawerProps) {
  const [addingPayment, setAddingPayment] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("OTHER")
  const [paymentNotes, setPaymentNotes] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [issueDialogOpen, setIssueDialogOpen] = useState(false)
  const [rectificativaModalOpen, setRectificativaModalOpen] = useState(false)
  const showRectificativaModal = rectificativaModalOpen || openRectificativaModal
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [emailTo, setEmailTo] = useState("")
  const [sendMessage, setSendMessage] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (openRectificativaModal) setRectificativaModalOpen(true)
  }, [openRectificativaModal])

  const runAction = useCallback(
    async (fn: () => Promise<Response>) => {
      if (!invoice) return
      setActionLoading(true)
      try {
        const res = await fn()
        if (res.ok) {
          onRefresh()
          if (res.headers.get("content-type")?.includes("json")) {
            const data = await res.json()
            if (data.newStatus === "PAID") setAddingPayment(false)
          }
        }
      } finally {
        setActionLoading(false)
      }
    },
    [invoice, onRefresh]
  )

  const handleCancel = useCallback(() => {
    if (!invoice || !confirm("¿Cancelar esta factura?")) return
    runAction(() => fetch(`${getBaseUrl()}/api/billing/${invoice.id}/cancel`, { method: "POST", credentials: "include" })).then(() => onClose())
  }, [invoice, runAction, onClose])

  const handleDelete = useCallback(() => {
    if (!invoice || !confirm("¿Eliminar este borrador de forma permanente?")) return
    runAction(() => fetch(`${getBaseUrl()}/api/billing/${invoice.id}/delete`, { method: "POST", credentials: "include" })).then(() => onClose())
  }, [invoice, runAction, onClose])

  const handleMarkPaid = useCallback(() => {
    if (!invoice) return
    const remaining = invoice.total - invoice.payments.reduce((s, p) => s + p.amount, 0)
    runAction(() =>
      fetch(`${getBaseUrl()}/api/billing/${invoice.id}/payments`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ amount: remaining, method: "FULL" }),
      })
    )
  }, [invoice, runAction])

  const handleDownloadPdf = useCallback(() => {
    if (!invoice) return
    window.open(`/api/billing/${invoice.id}/pdf`, "_blank", "noopener,noreferrer")
  }, [invoice])

  const handlePreviewPdf = useCallback(() => {
    if (!invoice) return
    window.open(`/api/billing/${invoice.id}/pdf`, "_blank", "noopener,noreferrer")
  }, [invoice])

  const handleOpenSendModal = useCallback(() => {
    if (!invoice) return
    setEmailTo(invoice.Client?.email ?? "")
    setSendMessage("")
    setSendModalOpen(true)
  }, [invoice])

  const handleSendEmail = useCallback(async () => {
    if (!invoice || !emailTo.trim()) return
    setSending(true)
    try {
      const res = await fetch(`${getBaseUrl()}/api/billing/${invoice.id}/send`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ emailTo: emailTo.trim(), message: sendMessage.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al enviar")
      setSendModalOpen(false)
      onRefresh()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al enviar la factura")
    } finally {
      setSending(false)
    }
  }, [invoice, emailTo, sendMessage, onRefresh])

  const handleRegeneratePdf = useCallback(() => {
    if (!invoice) return
    setPdfLoading(true)
    window.open(`/api/billing/${invoice.id}/pdf?regenerate=1`, "_blank", "noopener,noreferrer")
    setTimeout(() => { setPdfLoading(false); onRefresh() }, 1500)
  }, [invoice, onRefresh])

  const handleAddPayment = useCallback(() => {
    if (!invoice) return
    const amount = parseFloat(paymentAmount)
    if (Number.isNaN(amount) || amount <= 0) return
    setActionLoading(true)
    fetch(`${getBaseUrl()}/api/billing/${invoice.id}/payments`, {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ amount, method: paymentMethod, notes: paymentNotes || null }),
    })
      .then((res) => {
        if (res.ok) { setPaymentAmount(""); setPaymentNotes(""); setAddingPayment(false); onRefresh() }
      })
      .finally(() => setActionLoading(false))
  }, [invoice, paymentAmount, paymentMethod, paymentNotes, onRefresh])

  if (!invoice) return null

  const paid = invoice.payments.reduce((s, p) => s + p.amount, 0)
  const remaining = Math.max(0, invoice.total - paid)
  const paidPct = invoice.total > 0 ? Math.min(100, (paid / invoice.total) * 100) : 0
  const badgeStyle = STATUS_BADGE[invoice.status] ?? "bg-slate-100 text-slate-500 border-slate-200"
  const issuedLabel = invoiceStatusLabel(invoice.status)
  const editable = isInvoiceEditable(invoice)
  const isDraft = invoice.status === INVOICE_STATUS.DRAFT
  const isSent = invoice.status === INVOICE_STATUS.SENT
  const isPartial = invoice.status === INVOICE_STATUS.PARTIAL
  const isPaid = invoice.status === INVOICE_STATUS.PAID
  const fiscalBlock = Boolean(invoice.clientId && invoice.Client && !calculateFiscalCompleteness(invoice.Client))

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Detalle de factura"
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full max-w-[440px]",
          "bg-white border-l border-slate-200 shadow-2xl flex flex-col",
          "transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-slate-100 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[15px] font-bold text-slate-900 truncate">
                {invoice.number === DRAFT_NUMBER_PLACEHOLDER ? "Borrador" : invoice.number}
              </h2>
              <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold", badgeStyle)}>
                {issuedLabel}
              </span>
              {invoice.isRectification && (
                <span className="inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                  RECTIFICATIVA
                </span>
              )}
              {!editable && (
                <span className="text-slate-400" title={ISSUED_EDIT_TOOLTIP}>
                  <LockClosedIcon className="h-3.5 w-3.5" aria-hidden />
                </span>
              )}
            </div>
            {invoice.Client?.name && (
              <p className="text-[12px] text-slate-500 mt-0.5 truncate">{invoice.Client.name}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 ml-2"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Fiscal warning */}
        {invoice.clientId && invoice.Client && (
          <div className="px-5 pt-2.5 shrink-0">
            <FiscalWarning
              clientId={invoice.Client.id}
              isFiscalComplete={calculateFiscalCompleteness(invoice.Client)}
              onFix={() => onEdit(invoice.id)}
            />
          </div>
        )}

        {/* ── Scrollable body ────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── PREVIEW CARD ─────────────────────────────────── */}
          <div className="mx-5 mt-4 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            {/* Mini invoice header */}
            <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Factura</p>
                <p className="text-[14px] font-bold text-slate-900 truncate">
                  {invoice.number === DRAFT_NUMBER_PLACEHOLDER ? "—" : invoice.number}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Total</p>
                <p className="text-[18px] font-bold text-slate-900 tabular-nums">
                  {formatCurrency(invoice.total, invoice.currency)}
                </p>
              </div>
            </div>

            {/* Client + dates */}
            <div className="px-4 py-2.5 flex items-start justify-between gap-4 border-b border-slate-100 bg-white">
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 mb-0.5">Cliente</p>
                <p className="text-[12px] font-medium text-slate-700 truncate">
                  {invoice.Client?.name || invoice.Client?.email || "—"}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <InvoiceClientRiskBadge clientId={invoice.clientId} invoiceType={invoice.type} />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-slate-400 mb-0.5">Fecha emisión</p>
                <p className="text-[12px] text-slate-600">{formatDate(invoice.issueDate)}</p>
                {invoice.dueDate && (
                  <>
                    <p className="text-[10px] text-slate-400 mt-1 mb-0.5">Vencimiento</p>
                    <p className="text-[12px] text-slate-600">{formatDate(invoice.dueDate)}</p>
                  </>
                )}
              </div>
            </div>

            {/* Totals row */}
            <div className="px-4 py-2.5 grid grid-cols-3 gap-2 bg-slate-50">
              <div>
                <p className="text-[10px] text-slate-400 mb-0.5">Base</p>
                <p className="text-[12px] font-medium text-slate-700 tabular-nums">
                  {formatCurrency(invoice.subtotal, invoice.currency)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 mb-0.5">IVA</p>
                <p className="text-[12px] font-medium text-slate-700 tabular-nums">
                  {formatCurrency(invoice.taxAmount, invoice.currency)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 mb-0.5">Pagado</p>
                <p className="text-[12px] font-medium text-emerald-600 tabular-nums">
                  {formatCurrency(paid, invoice.currency)}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            {invoice.total > 0 && (
              <div className="px-4 pb-3 pt-1 bg-slate-50">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-slate-400">Cobrado</p>
                  <p className="text-[10px] font-medium text-slate-600">{Math.round(paidPct)}%</p>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isPaid ? "bg-emerald-500" : isPartial ? "bg-amber-400" : "bg-slate-300"
                    )}
                    style={{ width: `${paidPct}%` }}
                  />
                </div>
                {remaining > 0 && (
                  <p className="text-[10px] text-amber-600 mt-1">
                    Pendiente: {formatCurrency(remaining, invoice.currency)}
                  </p>
                )}
              </div>
            )}

            {/* Preview button */}
            <div className="px-4 py-2.5 bg-white border-t border-slate-100">
              <button
                type="button"
                onClick={handlePreviewPdf}
                disabled={actionLoading}
                className="w-full inline-flex items-center justify-center gap-2 h-8 rounded-lg border border-slate-200 text-[12px] font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50"
              >
                <EyeIcon className="h-3.5 w-3.5" />
                Visualizar factura (PDF)
              </button>
            </div>
          </div>

          {/* ── ACCIONES RÁPIDAS ──────────────────────────────── */}
          <div className="px-5 mt-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Acciones rápidas
            </p>

            {isDraft && (
              <div className="space-y-1.5">
                {/* Editar */}
                <ActionBtn
                  icon={<PencilSquareIcon className="h-4 w-4" />}
                  label="Editar borrador"
                  onClick={() => onEdit(invoice.id)}
                  disabled={actionLoading}
                  variant="default"
                />
                {/* Emitir */}
                <ActionBtn
                  icon={<PaperAirplaneIcon className="h-4 w-4" />}
                  label="Emitir factura"
                  sublabel="Asigna número definitivo y bloquea edición"
                  onClick={() => setIssueDialogOpen(true)}
                  disabled={actionLoading || fiscalBlock}
                  title={fiscalBlock ? FISCAL_DISABLED_TOOLTIP : undefined}
                  variant="primary"
                />
                {/* Eliminar */}
                <ActionBtn
                  icon={<TrashIcon className="h-4 w-4" />}
                  label="Eliminar borrador"
                  onClick={handleDelete}
                  disabled={actionLoading}
                  variant="danger"
                />
              </div>
            )}

            {!isDraft && (
              <div className="space-y-1.5">
                {/* Enviar por email */}
                <ActionBtn
                  icon={<EnvelopeIcon className="h-4 w-4" />}
                  label="Enviar por email"
                  sublabel={invoice.Client?.email ? `→ ${invoice.Client.email}` : "Introduce el email del cliente"}
                  onClick={handleOpenSendModal}
                  disabled={actionLoading}
                  variant="primary"
                />

                {/* Marcar como pagada / registrar pago */}
                {(isSent || isPartial) && (
                  <>
                    <ActionBtn
                      icon={<CheckIcon className="h-4 w-4" />}
                      label="Marcar como pagada"
                      sublabel={`Registra ${formatCurrency(remaining, invoice.currency)} de golpe`}
                      onClick={handleMarkPaid}
                      disabled={actionLoading || remaining <= 0 || fiscalBlock}
                      title={fiscalBlock ? FISCAL_DISABLED_TOOLTIP : undefined}
                      variant="success"
                    />
                    <ActionBtn
                      icon={<BanknotesIcon className="h-4 w-4" />}
                      label="Registrar pago parcial"
                      onClick={() => setAddingPayment(true)}
                      disabled={actionLoading || fiscalBlock}
                      title={fiscalBlock ? FISCAL_DISABLED_TOOLTIP : undefined}
                      variant="default"
                    />
                    <ActionBtn
                      icon={<BellAlertIcon className="h-4 w-4" />}
                      label="Enviar recordatorio"
                      sublabel="Próximamente"
                      onClick={() => {}}
                      disabled
                      variant="default"
                    />
                  </>
                )}

                {/* Rectificativa */}
                {!invoice.isRectification && (
                  <ActionBtn
                    icon={<DocumentDuplicateIcon className="h-4 w-4" />}
                    label="Crear factura rectificativa"
                    sublabel="Nota de crédito / corrección"
                    onClick={() => setRectificativaModalOpen(true)}
                    disabled={actionLoading}
                    variant="warning"
                  />
                )}

                {/* Editar (bloqueado) */}
                {onEditBlocked && (
                  <ActionBtn
                    icon={<LockClosedIcon className="h-4 w-4" />}
                    label="Editar"
                    sublabel="Requiere rectificativa"
                    onClick={onEditBlocked}
                    disabled={actionLoading}
                    variant="default"
                    title={ISSUED_EDIT_TOOLTIP}
                  />
                )}

                {/* Cancelar factura */}
                {(isSent || isPartial) && (
                  <ActionBtn
                    icon={<XMarkIcon className="h-4 w-4" />}
                    label="Cancelar factura"
                    onClick={handleCancel}
                    disabled={actionLoading}
                    variant="danger"
                  />
                )}
              </div>
            )}
          </div>

          {/* ── PDF ──────────────────────────────────────────── */}
          <div className="px-5 mt-4 space-y-1.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">PDF</p>
            <ActionBtn
              icon={<ArrowDownTrayIcon className="h-4 w-4" />}
              label="Descargar PDF"
              onClick={handleDownloadPdf}
              disabled={actionLoading}
              variant="default"
            />
            <ActionBtn
              icon={pdfLoading ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <ArrowPathIcon className="h-4 w-4" />}
              label={pdfLoading ? "Generando PDF..." : "Regenerar PDF"}
              sublabel="Útil si has cambiado el logo o los datos"
              onClick={handleRegeneratePdf}
              disabled={actionLoading || pdfLoading}
              variant="default"
            />
          </div>

          {/* ── Registrar pago (inline form) ─────────────────── */}
          {addingPayment && !isPaid && (
            <div className="mx-5 mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <p className="text-[12px] font-semibold text-slate-700">Registrar pago parcial</p>
              <input
                type="number"
                step="0.01"
                placeholder="Importe (€)"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A]"
              />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A]"
              >
                <option value="BANK">Transferencia bancaria</option>
                <option value="CARD">Tarjeta</option>
                <option value="CASH">Efectivo</option>
                <option value="OTHER">Otro</option>
              </select>
              <input
                type="text"
                placeholder="Notas (opcional)"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1FA97A]/30 focus:border-[#1FA97A]"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddPayment}
                  disabled={actionLoading || !paymentAmount}
                  className="flex-1 h-9 rounded-lg bg-[#1FA97A] text-white text-[13px] font-medium hover:bg-[#178a64] disabled:opacity-50 transition-colors"
                >
                  Registrar
                </button>
                <button
                  type="button"
                  onClick={() => { setAddingPayment(false); setPaymentAmount(""); setPaymentNotes("") }}
                  className="px-4 h-9 rounded-lg border border-slate-200 text-[13px] text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* ── Líneas ───────────────────────────────────────── */}
          <div className="mx-5 mt-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Líneas</p>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-2 px-3 text-slate-500 font-medium">Descripción</th>
                    <th className="text-right py-2 px-3 text-slate-500 font-medium">Cant.</th>
                    <th className="text-right py-2 px-3 text-slate-500 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lines.map((line) => (
                    <tr key={line.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 px-3 text-slate-700">{line.description}</td>
                      <td className="py-2 px-3 text-right text-slate-600">{line.quantity}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-slate-700 font-medium">
                        {formatCurrency(line.total, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Historial de pagos ───────────────────────────── */}
          {invoice.payments.length > 0 && (
            <div className="mx-5 mt-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Cobros registrados</p>
              <ul className="space-y-1.5">
                {invoice.payments.map((p) => (
                  <li key={p.id} className="flex justify-between items-center rounded-lg border border-slate-200 bg-emerald-50/50 px-3 py-2">
                    <span className="text-[12px] font-semibold text-emerald-700">
                      {formatCurrency(p.amount, invoice.currency)}
                    </span>
                    <span className="text-[11px] text-slate-400">{formatDateTime(p.paidAt)} · {p.method}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Historial de eventos ─────────────────────────── */}
          {invoice.events && invoice.events.length > 0 && (
            <div className="mx-5 mt-4 mb-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Historial</p>
              <ul className="space-y-2">
                {invoice.events.map((e) => {
                  const meta = e.metadata as { daysOverdue?: number; ruleKey?: string; label?: string; originalNumber?: string; rectifyingNumber?: string } | null
                  return (
                    <li key={e.id} className="flex items-start gap-2 text-[12px]">
                      <span className="text-slate-400 shrink-0 mt-0.5">{formatDateTime(e.createdAt)}</span>
                      <span className="text-slate-700">{eventTypeToLabel(e.type, meta)}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* ── Notas ────────────────────────────────────────── */}
          {invoice.notes && (
            <div className="mx-5 mt-4 mb-6">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Notas</p>
              <p className="text-[12px] text-slate-600 whitespace-pre-wrap bg-slate-50 rounded-lg p-3 border border-slate-200">
                {invoice.notes}
              </p>
            </div>
          )}

          <div className="h-6" />
        </div>
      </aside>

      {/* ── Dialogs ─────────────────────────────────────────── */}
      <IssueInvoiceDialog
        invoice={invoice}
        open={issueDialogOpen}
        onClose={() => setIssueDialogOpen(false)}
        onSuccess={() => onRefresh()}
      />
      <CreateRectificativaModal
        open={showRectificativaModal}
        onClose={() => { setRectificativaModalOpen(false); onRectificativaModalOpenChange?.(false) }}
        invoiceId={invoice.id}
        invoiceNumber={invoice.number === DRAFT_NUMBER_PLACEHOLDER ? "—" : invoice.number}
        originalDocType={invoice.invoiceDocType}
        originalLines={invoice.lines}
        originalTotal={invoice.total}
        originalSubtotal={invoice.subtotal}
        originalTaxAmount={invoice.taxAmount}
        currency={invoice.currency}
        onSuccess={(newId) => { onRefresh(); onRectificationCreated?.(newId) }}
      />

      {/* ── Send email modal ─────────────────────────────────── */}
      {sendModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSendModalOpen(false)} aria-hidden />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-[16px] font-bold text-slate-900 mb-1">Enviar factura por email</h2>
            <p className="text-[13px] text-slate-500 mb-5">{invoice.number}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Email del cliente *
                </label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/20"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Mensaje personal (opcional)
                </label>
                <textarea
                  value={sendMessage}
                  onChange={(e) => setSendMessage(e.target.value)}
                  placeholder="Adjunto te envío la factura correspondiente..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none resize-none focus:border-[#1FA97A] focus:ring-2 focus:ring-[#1FA97A]/20"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => setSendModalOpen(false)}
                className="px-4 py-2.5 text-[13px] text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={!emailTo.trim() || sending}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1FA97A] text-white text-[13px] font-medium rounded-xl hover:bg-[#178a64] disabled:opacity-50 transition-colors"
              >
                {sending ? <><ArrowPathIcon className="h-4 w-4 animate-spin" /> Enviando...</> : <><EnvelopeIcon className="h-4 w-4" /> Enviar factura</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Reusable action button ───────────────────────────────────
type ActionBtnVariant = "default" | "primary" | "success" | "warning" | "danger"

const VARIANT_STYLES: Record<ActionBtnVariant, string> = {
  default:  "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300",
  primary:  "border-[#1FA97A]/30 bg-[#1FA97A]/5 text-[#1FA97A] hover:bg-[#1FA97A]/10",
  success:  "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  warning:  "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
  danger:   "border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
}

function ActionBtn({
  icon, label, sublabel, onClick, disabled, variant = "default", title,
}: {
  icon: React.ReactNode
  label: string
  sublabel?: string
  onClick: () => void
  disabled?: boolean
  variant?: ActionBtnVariant
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-colors",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        VARIANT_STYLES[variant]
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-medium leading-tight">{label}</span>
        {sublabel && <span className="block text-[10px] opacity-60 mt-0.5 truncate">{sublabel}</span>}
      </span>
    </button>
  )
}
