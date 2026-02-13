/**
 * Legal locking: only draft invoices are editable.
 * Once issued (sent, paid, overdue, cancelled) the invoice is immutable (use rectificativa for changes).
 * Standard accounting rule — single source of truth for the whole app.
 */

export const INVOICE_STATUS_DRAFT = "DRAFT"

function isDraftStatus(status: string | null | undefined): boolean {
  if (status == null || typeof status !== "string") return false
  return status.toUpperCase() === INVOICE_STATUS_DRAFT
}

/** Accepts either an invoice-like object or a status string. */
export function isInvoiceEditable(
  invoiceOrStatus: { status?: string } | string | null | undefined
): boolean {
  if (invoiceOrStatus == null) return false
  const status =
    typeof invoiceOrStatus === "string"
      ? invoiceOrStatus
      : (invoiceOrStatus as { status?: string }).status
  return isDraftStatus(status)
}
