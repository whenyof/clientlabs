"use client"

import { memo } from "react"
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
      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="px-4 py-8 text-center text-white/50 text-sm">
          Cargando facturas…
        </div>
      </div>
    )
  }

  // Step 9 — Empty state: "Sin facturas todavía" + CTA "Crear factura"
  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="px-4 py-12 text-center text-white/50">
          <p className="text-sm font-medium text-white/70">Sin facturas todavía</p>
          <p className="text-xs mt-1 mb-4">Crea tu primera factura para empezar.</p>
          {onCreateClick && (
            <button
              type="button"
              onClick={onCreateClick}
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 transition-colors"
            >
              Crear factura
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
      else if (process.env.NODE_ENV === "development") console.log("Duplicate not implemented", invoice.id)
    },
    onDownloadPdf,
    onRegisterPayment: (invoice) => {
      if (onRegisterPayment) onRegisterPayment(invoice)
      else {
        onSelectInvoice(invoice.id)
        if (process.env.NODE_ENV === "development") console.log("Register payment: open drawer", invoice.id)
      }
    },
    onCancel: (invoice) => {
      if (onCancelInvoice) onCancelInvoice(invoice)
      else if (process.env.NODE_ENV === "development") console.log("Cancel not wired", invoice.id)
    },
    onDelete: onDeleteInvoice,
  })

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]" role="table" aria-label="Lista de facturas">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              <th className="py-3 px-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                Tipo
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                Número
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                Contacto
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                Fecha emisión
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                Vencimiento
              </th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-white/60 uppercase tracking-wider">
                Importe
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                Estado
              </th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-white/60 uppercase tracking-wider w-0">
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
