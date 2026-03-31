"use client"

import { memo } from "react"
import { FileText } from "lucide-react"
import { InvoiceRow, type InvoiceRowActionCallbacks } from "./InvoiceRow"
import type { InvoiceListItem } from "./types"

export interface InvoiceTableProps {
  invoices: InvoiceListItem[]
  selectedId: string | null
  loading?: boolean
  onSelectInvoice: (id: string) => void
  onPreviewInvoice?: (invoiceId: string) => void
  onEditInvoice: (invoice: InvoiceListItem) => void
  onDuplicateInvoice?: (invoice: InvoiceListItem) => void
  onDownloadPdf: (invoiceId: string) => void
  onRegisterPayment?: (invoice: InvoiceListItem) => void
  onCancelInvoice?: (invoice: InvoiceListItem) => void
  onDeleteInvoice: (invoiceId: string) => void
  onCreateClick?: () => void
}

function InvoiceTableComponent({
  invoices,
  selectedId,
  onSelectInvoice,
  onPreviewInvoice,
  onEditInvoice,
  onDuplicateInvoice,
  onDownloadPdf,
  onRegisterPayment,
  onCancelInvoice,
  onDeleteInvoice,
  onCreateClick,
  loading,
}: InvoiceTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-8 text-center text-slate-400 text-sm animate-pulse">
          Cargando facturas…
        </div>
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
            <FileText className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-[14px] font-medium text-slate-700 mb-1">No hay facturas todavía</p>
          <p className="text-[12px] text-slate-400 mb-4">
            Crea tu primera factura profesional en menos de 30 segundos
          </p>
          {onCreateClick && (
            <button
              type="button"
              onClick={onCreateClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1FA97A] text-white rounded-lg text-[12px] font-medium hover:bg-[#178f68] transition-colors"
            >
              Nueva factura
            </button>
          )}
        </div>
      </div>
    )
  }

  const buildActions = (inv: InvoiceListItem): InvoiceRowActionCallbacks => ({
    onView: () => onSelectInvoice(inv.id),
    onPreview: (invoiceId) => (onPreviewInvoice ? onPreviewInvoice(invoiceId) : onSelectInvoice(inv.id)),
    onEdit: onEditInvoice,
    onDuplicate: (invoice) => {
      if (onDuplicateInvoice) onDuplicateInvoice(invoice)
    },
    onDownloadPdf,
    onRegisterPayment: (invoice) => {
      if (onRegisterPayment) onRegisterPayment(invoice)
      else onSelectInvoice(invoice.id)
    },
    onCancel: (invoice) => {
      if (onCancelInvoice) onCancelInvoice(invoice)
    },
    onDelete: onDeleteInvoice,
  })

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]" role="table" aria-label="Lista de facturas">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="py-3 px-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Tipo
              </th>
              <th className="py-3 px-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Número
              </th>
              <th className="py-3 px-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Contacto
              </th>
              <th className="py-3 px-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Fecha emisión
              </th>
              <th className="py-3 px-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Vencimiento
              </th>
              <th className="py-3 px-4 text-right text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Importe
              </th>
              <th className="py-3 px-4 text-left text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="py-3 px-4 text-right text-[10px] font-medium text-slate-400 uppercase tracking-wider w-0">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <InvoiceRow
                key={inv.id}
                invoice={inv}
                isSelected={selectedId === inv.id}
                actions={buildActions(inv)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const InvoiceTable = memo(InvoiceTableComponent)
