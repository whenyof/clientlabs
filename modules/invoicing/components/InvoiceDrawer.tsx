"use client"

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
} from "@heroicons/react/24/outline"
import { formatCurrency, formatDate, formatDateTime } from "@/app/dashboard/other/finance/lib/formatters"
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
  meta: {
    daysOverdue?: number
    ruleKey?: string
    label?: string
    originalNumber?: string
    rectifyingNumber?: string
  } | null
): string {
  if (type === "SENT" && meta?.label) return meta.label
  switch (type) {
    case "CREATED":
      return "Factura creada"
    case "EDITED":
      return "Factura editada"
    case "SENT":
      return "Factura emitida oficialmente"
    case "PAID":
      return "Factura pagada"
    case "CANCELED":
      return "Factura cancelada"
    case "REMINDER_SENT":
      return meta?.daysOverdue != null
        ? `Recordatorio enviado — ${meta.daysOverdue} ${meta.daysOverdue === 1 ? "día de retraso" : "días de retraso"}`
        : "Recordatorio enviado"
    case "RECTIFIES":
      return meta?.originalNumber != null ? `Rectifica factura Nº ${meta.originalNumber}` : "Rectifica factura"
    case "RECTIFICATION_ISSUED":
      return meta?.rectifyingNumber != null ? `Generada rectificativa Nº ${meta.rectifyingNumber}` : "Generada rectificativa"
    default:
      return type
  }
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  SENT: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  VIEWED: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  PARTIAL: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  PAID: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  OVERDUE: "bg-red-500/20 text-red-400 border-red-500/30",
  CANCELED: "bg-red-500/10 text-red-400/80 border-red-500/20",
}

interface InvoiceDrawerProps {
  invoice: InvoiceDetail | null
  open: boolean
  onClose: () => void
  onRefresh: () => void
  onEdit: (id: string) => void
  /** When user clicks "Editar" on an issued/paid/cancelled invoice (show rectificativa modal). */
  onEditBlocked?: () => void
  /** After creating a rectificativa: refresh and open the new invoice in the drawer. */
  onRectificationCreated?: (newInvoiceId: string) => void
  /** When true, open the rectificativa modal (e.g. from edit-blocked modal). */
  openRectificativaModal?: boolean
  /** Called when rectificativa modal open state changes (so parent can reset openRectificativaModal). */
  onRectificativaModalOpenChange?: (open: boolean) => void
}

export function InvoiceDrawer({
  invoice,
  open,
  onClose,
  onRefresh,
  onEdit,
  onEditBlocked,
  onRectificationCreated,
  openRectificativaModal = false,
  onRectificativaModalOpenChange,
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

  const handleOpenIssueDialog = useCallback(() => {
    if (!invoice) return
    setIssueDialogOpen(true)
  }, [invoice])

  const handleIssueSuccess = useCallback(() => {
    onRefresh()
  }, [onRefresh])

  const handleCancel = useCallback(() => {
    if (!invoice || !confirm("¿Cancelar esta factura?")) return
    runAction(() => fetch(`/api/billing/${invoice.id}/cancel`, { method: "POST", credentials: "include" })).then(
      () => onClose()
    )
  }, [invoice, runAction, onClose])

  const handleDelete = useCallback(() => {
    if (!invoice || !confirm("¿Eliminar este borrador de forma permanente?")) return
    runAction(() => fetch(`/api/billing/${invoice.id}/delete`, { method: "POST", credentials: "include" })).then(
      () => onClose()
    )
  }, [invoice, runAction, onClose])

  const handleMarkPaid = useCallback(() => {
    if (!invoice) return
    const remaining = invoice.total - invoice.payments.reduce((s, p) => s + p.amount, 0)
    runAction(() =>
      fetch(`/api/billing/${invoice.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: remaining, method: "FULL" }),
      })
    )
  }, [invoice, runAction])

  const handleDownloadPdf = useCallback(() => {
    if (!invoice) return
    window.open(`/api/billing/${invoice.id}/pdf`, "_blank", "noopener,noreferrer")
  }, [invoice])

  const handleRegeneratePdf = useCallback(() => {
    if (!invoice) return
    setPdfLoading(true)
    window.open(`/api/billing/${invoice.id}/pdf?regenerate=1`, "_blank", "noopener,noreferrer")
    setTimeout(() => {
      setPdfLoading(false)
      onRefresh()
    }, 1500)
  }, [invoice, onRefresh])

  const handleAddPayment = useCallback(() => {
    if (!invoice) return
    const amount = parseFloat(paymentAmount)
    if (Number.isNaN(amount) || amount <= 0) return
    setActionLoading(true)
    fetch(`/api/billing/${invoice.id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        amount,
        method: paymentMethod,
        notes: paymentNotes || null,
      }),
    })
      .then((res) => {
        if (res.ok) {
          setPaymentAmount("")
          setPaymentNotes("")
          setAddingPayment(false)
          onRefresh()
        }
      })
      .finally(() => setActionLoading(false))
  }, [invoice, paymentAmount, paymentMethod, paymentNotes, onRefresh])

  if (!invoice) return null

  const paid = invoice.payments.reduce((s, p) => s + p.amount, 0)
  const remaining = Math.max(0, invoice.total - paid)
  const statusStyle = STATUS_STYLES[invoice.status] ?? "bg-white/10 text-white/70 border-white/20"
  const issuedLabel = invoiceStatusLabel(invoice.status)
  const editable = isInvoiceEditable(invoice)
  const isDraft = invoice.status === INVOICE_STATUS.DRAFT
  const isSent = invoice.status === INVOICE_STATUS.SENT
  const isPartial = invoice.status === INVOICE_STATUS.PARTIAL
  const isPaid = invoice.status === INVOICE_STATUS.PAID
  const fiscalBlock = Boolean(invoice.clientId && invoice.Client && !calculateFiscalCompleteness(invoice.Client))

  return (
    <>
      <div
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-label="Detalle de factura"
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full max-w-md",
          "bg-[#0f0f12] border-l border-white/10 shadow-2xl flex flex-col",
          "transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="min-w-0 flex items-start gap-2">
            <div>
              <h2 className="text-base font-semibold text-white truncate">
                {invoice.number === DRAFT_NUMBER_PLACEHOLDER ? invoiceStatusLabel("DRAFT") : invoice.number}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold", statusStyle)}>
                  {issuedLabel}
                </span>
                {invoice.isRectification && (
                  <span className="inline-flex items-center rounded-md border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
                    RECTIFICATIVA
                  </span>
                )}
              </div>
            </div>
            {!editable && (
              <span
                className="shrink-0 rounded p-1 text-white/50"
                title={ISSUED_EDIT_TOOLTIP}
              >
                <LockClosedIcon className="h-5 w-5" aria-hidden />
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {invoice.clientId && invoice.Client && (
          <div className="px-5 pt-3 pb-2 shrink-0">
            <FiscalWarning
              clientId={invoice.Client.id}
              isFiscalComplete={calculateFiscalCompleteness(invoice.Client)}
              onFix={() => onEdit(invoice.id)}
            />
          </div>
        )}

        {isDraft && (
          <div className="px-5 py-2 bg-amber-500/10 border-b border-amber-500/20 shrink-0">
            <p className="text-xs text-amber-200/90">Esta factura aún no tiene número definitivo.</p>
          </div>
        )}

        {!editable && (
          <div className="px-5 py-2 bg-zinc-600/20 border-b border-white/10 shrink-0" title={ISSUED_EDIT_TOOLTIP}>
            <p className="text-xs text-white/90">
              Factura emitida — edición limitada por normativa fiscal.
            </p>
          </div>
        )}

        {/* Quick actions */}
        <div className="px-5 py-2 border-b border-white/10 flex flex-wrap gap-2 shrink-0">
          {!isDraft && onEditBlocked && (
            <button
              type="button"
              onClick={onEditBlocked}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 hover:text-white/90 transition-colors"
              title={ISSUED_EDIT_TOOLTIP}
            >
              <LockClosedIcon className="h-4 w-4" /> Editar
            </button>
          )}
          {!isDraft && !invoice.isRectification && (
            <button
              type="button"
              onClick={() => setRectificativaModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm text-amber-400 hover:bg-amber-500/20 transition-colors"
              title="Crear factura rectificativa (crédito)"
            >
              <DocumentDuplicateIcon className="h-4 w-4" /> Crear rectificativa
            </button>
          )}
          {isDraft && (
            <>
              <button
                type="button"
                onClick={() => onEdit(invoice.id)}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10 disabled:opacity-50"
              >
                <PencilSquareIcon className="w-4 h-4" /> Editar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/20 disabled:opacity-50"
              >
                <TrashIcon className="w-4 h-4" /> Eliminar
              </button>
              <button
                type="button"
                onClick={handleOpenIssueDialog}
                disabled={actionLoading || fiscalBlock}
                title={fiscalBlock ? FISCAL_DISABLED_TOOLTIP : undefined}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
              >
                <PaperAirplaneIcon className="w-4 h-4" /> Emitir
              </button>
            </>
          )}
          {(isSent || isPartial) && (
            <>
              <button
                type="button"
                onClick={handleMarkPaid}
                disabled={actionLoading || remaining <= 0 || fiscalBlock}
                title={fiscalBlock ? FISCAL_DISABLED_TOOLTIP : undefined}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" /> Marcar como pagada
              </button>
              <button
                type="button"
                onClick={() => setAddingPayment(true)}
                disabled={actionLoading || fiscalBlock}
                title={fiscalBlock ? FISCAL_DISABLED_TOOLTIP : undefined}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10 disabled:opacity-50"
              >
                <BanknotesIcon className="w-4 h-4" /> Registrar pago
              </button>
              {isSent && (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/50 cursor-not-allowed"
                  title="Recordatorio (próximamente)"
                >
                  <BellAlertIcon className="w-4 h-4" /> Recordatorio
                </button>
              )}
            </>
          )}
          {/* PDF: descargar / regenerar / enviar (todos los estados) */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10 disabled:opacity-50"
            title="Descargar PDF"
          >
            <ArrowDownTrayIcon className="w-4 h-4" /> Descargar PDF
          </button>
          <button
            type="button"
            onClick={handleRegeneratePdf}
            disabled={actionLoading || pdfLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 disabled:opacity-50"
            title="Regenerar PDF"
          >
            <ArrowPathIcon className="w-4 h-4" /> {pdfLoading ? "Generando…" : "Regenerar"}
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/50 cursor-not-allowed"
            title="Enviar por email (próximamente)"
          >
            <EnvelopeIcon className="w-4 h-4" /> Enviar por email
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          {/* Cliente */}
          <div>
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">Cliente</p>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-white/90 font-medium">{invoice.Client?.name || "—"}</p>
              <InvoiceClientRiskBadge clientId={invoice.clientId} invoiceType={invoice.type} />
            </div>
            {invoice.Client?.email && (
              <p className="text-sm text-white/60">{invoice.Client.email}</p>
            )}
          </div>

          {/* Líneas */}
          <div>
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Líneas</p>
            <div className="rounded-lg border border-white/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/10">
                    <th className="text-left py-2 px-3 text-white/60 font-medium">Descripción</th>
                    <th className="text-right py-2 px-3 text-white/60 font-medium">Cant.</th>
                    <th className="text-right py-2 px-3 text-white/60 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lines.map((line) => (
                    <tr key={line.id} className="border-b border-white/6">
                      <td className="py-2 px-3 text-white/90">{line.description}</td>
                      <td className="py-2 px-3 text-right text-white/80">{line.quantity}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-white/90">
                        {formatCurrency(line.total, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales */}
          <div>
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">Totales</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-white/80">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>IVA</span>
                <span className="tabular-nums">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
              </div>
              <div className="flex justify-between text-white font-medium pt-1 border-t border-white/10">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(invoice.total, invoice.currency)}</span>
              </div>
              <div className="flex justify-between text-emerald-400/90">
                <span>Pagado</span>
                <span className="tabular-nums">{formatCurrency(paid, invoice.currency)}</span>
              </div>
              {remaining > 0 && (
                <div className="flex justify-between text-amber-400/90">
                  <span>Pendiente</span>
                  <span className="tabular-nums">{formatCurrency(remaining, invoice.currency)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Registrar pago */}
          {addingPayment && !isPaid && (
            <div className="rounded-lg border border-white/10 p-4 space-y-3">
              <p className="text-sm font-medium text-white/80">Registrar pago</p>
              <input
                type="number"
                step="0.01"
                placeholder="Importe"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40"
              />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              >
                <option value="BANK">Banco</option>
                <option value="CARD">Tarjeta</option>
                <option value="CASH">Efectivo</option>
                <option value="OTHER">Otro</option>
              </select>
              <input
                type="text"
                placeholder="Notas"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddPayment}
                  disabled={actionLoading || !paymentAmount}
                  className="rounded-lg bg-emerald-500/20 text-emerald-400 px-3 py-2 text-sm font-medium hover:bg-emerald-500/30 disabled:opacity-50"
                >
                  Registrar
                </button>
                <button
                  type="button"
                  onClick={() => { setAddingPayment(false); setPaymentAmount(""); setPaymentNotes("") }}
                  className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Historial de pagos */}
          {invoice.payments.length > 0 && (
            <div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Pagos</p>
              <ul className="space-y-2">
                {invoice.payments.map((p) => (
                  <li
                    key={p.id}
                    className="flex justify-between items-center rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm"
                  >
                    <span className="text-white/90">{formatCurrency(p.amount, invoice.currency)}</span>
                    <span className="text-white/60 text-xs">{formatDateTime(p.paidAt)} · {p.method}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Historial */}
          {invoice.events && invoice.events.length > 0 && (
            <div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Historial</p>
              <ul className="space-y-2">
                {invoice.events.map((e) => {
                  const meta = e.metadata as {
                    daysOverdue?: number
                    ruleKey?: string
                    label?: string
                    originalNumber?: string
                    rectifyingNumber?: string
                  } | null
                  const label = eventTypeToLabel(e.type, meta)
                  return (
                    <li key={e.id} className="flex gap-2 text-sm text-white/70">
                      <span className="text-white/50 shrink-0">{formatDateTime(e.createdAt)}</span>
                      <span className="font-medium text-white/80">{label}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {invoice.notes && (
            <div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">Notas</p>
              <p className="text-sm text-white/70 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>
      </aside>

      <IssueInvoiceDialog
        invoice={invoice}
        open={issueDialogOpen}
        onClose={() => setIssueDialogOpen(false)}
        onSuccess={handleIssueSuccess}
      />
      <CreateRectificativaModal
        open={showRectificativaModal}
        onClose={() => {
          setRectificativaModalOpen(false)
          onRectificativaModalOpenChange?.(false)
        }}
        invoiceId={invoice.id}
        invoiceNumber={invoice.number === DRAFT_NUMBER_PLACEHOLDER ? "—" : invoice.number}
        onSuccess={(newId) => {
          onRefresh()
          onRectificationCreated?.(newId)
        }}
      />
    </>
  )
}
