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

// Step 5 — Status badge: draft → gray, sent → blue, paid → green, overdue → red, cancelled → dark
const STATUS_STYLES: Record<string, string> = {
 DRAFT: "bg-gray-500/20 text-[var(--text-secondary)] border-gray-500/30",
 SENT: "bg-[var(--bg-card)] text-[var(--accent)] border-blue-500/30",
 VIEWED: "bg-sky-500/20 text-sky-400 border-sky-500/30",
 PARTIAL: "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
 PAID: "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]",
 OVERDUE: "bg-[var(--bg-card)] text-[var(--critical)] border-[var(--critical)]",
 CANCELED: "bg-zinc-700/80 text-zinc-400 border-zinc-600/50",
}

// Step 4 — Type badge: customer → blue Cliente, vendor → purple Proveedor
const TYPE_STYLES: Record<string, string> = {
 CUSTOMER: "bg-[var(--bg-card)] text-[var(--accent)] border-blue-500/30",
 VENDOR: "bg-violet-500/20 text-violet-400 border-violet-500/30",
}

const TYPE_LABELS: Record<string, string> = {
 CUSTOMER: "Cliente",
 VENDOR: "Proveedor",
}

export interface InvoiceRowActionCallbacks {
 /** Row click: open drawer */
 onView: () => void
 /** View (eye) button: open document preview page */
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
 const paid = invoice.payments.reduce((s, p) => s + p.amount, 0)
 const remaining = Math.max(0, invoice.total - paid)
 const statusStyle = STATUS_STYLES[invoice.status] ?? "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]"
 const statusLabel = invoiceStatusLabel(invoice.status)
 const typeStyle = TYPE_STYLES[invoice.type] ?? "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]"
 const typeLabel = TYPE_LABELS[invoice.type] ?? invoice.type
 const isDraft = invoice.status === INVOICE_STATUS.DRAFT
 const editable = isInvoiceEditable(invoice)
 const isPaidOrCanceled =
 invoice.status === INVOICE_STATUS.PAID || invoice.status === INVOICE_STATUS.CANCELED
 const dueInfo = invoice.dueInfo

 // Step 8 — Contact: customer → client.name, vendor → provider.name
 const contactName =
 invoice.type === "VENDOR"
 ? invoice.Provider?.name ?? "—"
 : invoice.Client?.name || invoice.Client?.email || "—"

 const handleRowClick = () => actions.onView()

 const iconButtonClass =
 "h-8 w-8 p-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] shrink-0"

 const handleEdit = (e: React.MouseEvent) => {
 e.stopPropagation()
 actions.onEdit(invoice)
 }
 const handleDuplicate = (e: React.MouseEvent) => {
 e.stopPropagation()
 actions.onDuplicate(invoice)
 }
 const handlePdf = (e: React.MouseEvent) => {
 e.stopPropagation()
 actions.onDownloadPdf(invoice.id)
 }
 const handleRegisterPayment = (e: React.MouseEvent) => {
 e.stopPropagation()
 actions.onRegisterPayment(invoice)
 }
 const handleCancel = (e: React.MouseEvent) => {
 e.stopPropagation()
 actions.onCancel(invoice)
 }
 const handleDelete = (e: React.MouseEvent) => {
 e.stopPropagation()
 actions.onDelete(invoice.id)
 }
 const handlePreview = (e: React.MouseEvent) => {
 e.stopPropagation()
 actions.onPreview(invoice.id)
 }

 return (
 <tr
 onClick={handleRowClick}
 className={cn(
 "border-b border-[var(--border-subtle)] transition-colors cursor-pointer",
 "hover:bg-[var(--bg-card)]/[0.04]",
 isSelected && "bg-[var(--bg-card)]/[0.06]"
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
 "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
 typeStyle
 )}
 >
 {typeLabel}
 </span>
 {invoice.isRectification && (
 <span className="inline-flex items-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
 RECTIFICATIVA
 </span>
 )}
 </div>
 </td>
 <td className="py-3.5 px-4 text-sm font-medium text-[var(--text-secondary)] whitespace-nowrap">
 {isDraft ? invoiceStatusLabel("DRAFT") : invoice.number}
 </td>
 <td
 className="py-3.5 px-4 text-sm text-[var(--text-secondary)] max-w-[180px] truncate"
 title={contactName}
 >
 {contactName}
 </td>
 <td className="py-3.5 px-4 text-sm text-[var(--text-secondary)] whitespace-nowrap">
 {formatDate(invoice.issueDate)}
 </td>
 <td className="py-3.5 px-4 text-sm text-[var(--text-secondary)] whitespace-nowrap">
 {formatDate(invoice.dueDate)}
 </td>
 <td className="py-3.5 px-4 text-sm font-medium tabular-nums text-right whitespace-nowrap text-[var(--text-secondary)]">
 {formatCurrency(invoice.total, invoice.currency)}
 </td>
 <td className="py-3.5 px-4">
 <div className="flex flex-col gap-1">
 <span
 className={cn(
 "inline-flex w-fit items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
 statusStyle
 )}
 >
 {statusLabel}
 </span>
 {dueInfo && !isPaidOrCanceled && (
 <>
 {dueInfo.isOverdue && dueInfo.daysOverdue != null && (
 <span className="inline-flex w-fit rounded-md border border-[var(--critical)] bg-[var(--bg-card)] px-2 py-0.5 text-xs font-medium text-[var(--critical)]">
 {dueInfo.daysOverdue}{" "}
 {dueInfo.daysOverdue === 1 ? "día de retraso" : "días de retraso"}
 </span>
 )}
 {dueInfo.isDueToday && (
 <span className="inline-flex w-fit rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
 Vence hoy
 </span>
 )}
 {dueInfo.state === "upcoming" && dueInfo.daysRemaining > 0 && (
 <span className="text-xs text-[var(--text-secondary)]">
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
 className={iconButtonClass}
 title="Eliminar"
 onClick={handleDelete}
 >
 <Trash2 className="h-4 w-4 text-[var(--critical)] hover:text-[var(--critical)]" />
 </Button>
 )}
 </div>
 </td>
 </tr>
 )
}

export const InvoiceRow = memo(InvoiceRowComponent)
