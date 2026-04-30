"use client"

import { memo } from "react"
import { formatCurrency, formatDate } from "@/app/dashboard/finance/lib/formatters"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Eye,
  Pencil,
  Copy,
  ArrowDownToLine,
  Banknote,
  X,
  Trash2,
} from "lucide-react"
import type { InvoiceListItem } from "./types"
import { INVOICE_STATUS } from "@/modules/invoicing/types"
import { isInvoiceEditable } from "@/modules/invoicing/utils/isInvoiceEditable"
import { invoiceStatusLabel } from "@/modules/invoicing/utils/invoiceStatusLabel"

function VerifactuBadge({ status }: { status: string | null | undefined }) {
  if (!status) return null
  const config: Record<string, { bg: string; text: string; label: string }> = {
    Pendiente: { bg: "bg-amber-50 border border-amber-200", text: "text-amber-700", label: "Pendiente AEAT" },
    Aceptado:  { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-700", label: "Verificada AEAT" },
    Rechazado: { bg: "bg-red-50 border border-red-200", text: "text-red-700", label: "Rechazada AEAT" },
  }
  const c = config[status] ?? { bg: "bg-slate-50 border border-slate-200", text: "text-slate-500", label: status }
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  SENT: "bg-blue-50 text-blue-700 border border-blue-200",
  VIEWED: "bg-sky-50 text-sky-700 border border-sky-200",
  PARTIAL: "bg-amber-50 text-amber-700 border border-amber-200",
  PAID: "bg-[#E1F5EE] text-[#0F6E56] border border-[#9FE1CB]",
  OVERDUE: "bg-red-50 text-red-700 border border-red-200",
  CANCELED: "bg-slate-100 text-slate-500",
}

const TYPE_STYLES: Record<string, string> = {
  CUSTOMER: "bg-blue-50 text-blue-700 border border-blue-200",
  VENDOR: "bg-[#E1F5EE] text-[#0F6E56] border border-[#9FE1CB]",
}

const TYPE_LABELS: Record<string, string> = {
  CUSTOMER: "Cliente",
  VENDOR: "Proveedor",
}

export interface InvoiceRowActionCallbacks {
  onView: () => void
  onPreview: (invoiceId: string) => void
  onEdit: (invoice: InvoiceListItem) => void
  onDuplicate: (invoice: InvoiceListItem) => void
  onDownloadPdf: (invoiceId: string) => void
  onRegisterPayment: (invoice: InvoiceListItem) => void
  onCancel: (invoice: InvoiceListItem) => void
  onDelete: (invoiceId: string) => void
}

interface InvoiceRowProps {
  invoice: InvoiceListItem
  isSelected: boolean
  actions: InvoiceRowActionCallbacks
}

function InvoiceRowComponent({ invoice, isSelected, actions }: InvoiceRowProps) {
  const statusStyle = STATUS_STYLES[invoice.status] ?? "bg-slate-100 text-slate-600"
  const statusLabel = invoiceStatusLabel(invoice.status)
  const typeStyle = TYPE_STYLES[invoice.type] ?? "bg-slate-100 text-slate-600"
  const typeLabel = TYPE_LABELS[invoice.type] ?? invoice.type
  const isDraft = invoice.status === INVOICE_STATUS.DRAFT
  const editable = isInvoiceEditable(invoice)
  const isPaidOrCanceled =
    invoice.status === INVOICE_STATUS.PAID || invoice.status === INVOICE_STATUS.CANCELED
  const dueInfo = invoice.dueInfo
  const isOverdue = invoice.status === INVOICE_STATUS.OVERDUE

  const contactName =
    invoice.type === "VENDOR"
      ? invoice.Provider?.name ?? "—"
      : invoice.Client?.name || invoice.Client?.email || "—"

  const handleRowClick = () => actions.onView()

  const iconButtonClass =
    "h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"

  const handleEdit = (e: React.MouseEvent) => { e.stopPropagation(); actions.onEdit(invoice) }
  const handleDuplicate = (e: React.MouseEvent) => { e.stopPropagation(); actions.onDuplicate(invoice) }
  const handlePdf = (e: React.MouseEvent) => { e.stopPropagation(); actions.onDownloadPdf(invoice.id) }
  const handleRegisterPayment = (e: React.MouseEvent) => { e.stopPropagation(); actions.onRegisterPayment(invoice) }
  const handleCancel = (e: React.MouseEvent) => { e.stopPropagation(); actions.onCancel(invoice) }
  const handleDelete = (e: React.MouseEvent) => { e.stopPropagation(); actions.onDelete(invoice.id) }
  const handlePreview = (e: React.MouseEvent) => { e.stopPropagation(); actions.onPreview(invoice.id) }

  return (
    <tr
      onClick={handleRowClick}
      className={cn(
        "border-b border-slate-100 transition-colors cursor-pointer",
        "hover:bg-slate-50/50",
        isSelected && "bg-slate-50",
        isOverdue && "bg-red-50/30"
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          actions.onView()
        }
      }}
      aria-label={`Ver factura ${invoice.number}`}
    >
      <td className="py-3.5 px-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
              typeStyle
            )}
          >
            {typeLabel}
          </span>
          {invoice.isRectification && (
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
              RECT.
            </span>
          )}
        </div>
      </td>
      <td className="py-3.5 px-4 font-mono text-[12px] text-slate-700 font-medium whitespace-nowrap">
        {isDraft ? invoiceStatusLabel("DRAFT") : invoice.number}
      </td>
      <td className="py-3.5 px-4 text-[13px] text-slate-900 max-w-[180px] truncate" title={contactName}>
        {contactName}
      </td>
      <td className="py-3.5 px-4 text-[12px] text-slate-500 whitespace-nowrap">
        {formatDate(invoice.issueDate)}
      </td>
      <td className="py-3.5 px-4 text-[12px] text-slate-500 whitespace-nowrap">
        {formatDate(invoice.dueDate)}
      </td>
      <td className="py-3.5 px-4 text-[13px] font-semibold tabular-nums text-right whitespace-nowrap text-slate-900">
        {formatCurrency(invoice.total, invoice.currency)}
      </td>
      <td className="py-3.5 px-4">
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              "inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
              statusStyle
            )}
          >
            {statusLabel}
          </span>
          {invoice.type === "CUSTOMER" && (
            <VerifactuBadge status={invoice.verifactuStatus} />
          )}
          {dueInfo && !isPaidOrCanceled && (
            <>
              {dueInfo.isOverdue && dueInfo.daysOverdue != null && (
                <span className="inline-flex w-fit rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700">
                  {dueInfo.daysOverdue}{" "}
                  {dueInfo.daysOverdue === 1 ? "día de retraso" : "días de retraso"}
                </span>
              )}
              {dueInfo.isDueToday && (
                <span className="inline-flex w-fit rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                  Vence hoy
                </span>
              )}
              {dueInfo.state === "upcoming" && dueInfo.daysRemaining > 0 && (
                <span className="text-[10px] text-slate-400">
                  En {dueInfo.daysRemaining}{" "}
                  {dueInfo.daysRemaining === 1 ? "día" : "días"}
                </span>
              )}
            </>
          )}
        </div>
      </td>
      <td className="py-3.5 px-4 text-right w-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className={iconButtonClass}
            title="Visualizar"
            onClick={handlePreview}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={iconButtonClass}
            title={editable ? "Editar" : "Factura emitida — edición limitada por normativa fiscal"}
            onClick={handleEdit}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={iconButtonClass}
            title="Duplicar"
            onClick={handleDuplicate}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={iconButtonClass}
            title="Descargar"
            onClick={handlePdf}
          >
            <ArrowDownToLine className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={iconButtonClass}
            title="Registrar pago"
            onClick={handleRegisterPayment}
          >
            <Banknote className="h-4 w-4" />
          </Button>
          {!isPaidOrCanceled && (
            <Button
              variant="ghost"
              size="sm"
              className={iconButtonClass}
              title="Cancelar"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {isDraft && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0"
              title="Eliminar"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}

export const InvoiceRow = memo(InvoiceRowComponent)
