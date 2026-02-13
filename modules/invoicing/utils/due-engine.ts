/**
 * Central due-state logic for invoices. Single source of truth for API and UI.
 * Re-exports from engine so all consumers use the same computation.
 */

export {
  computeInvoiceDueInfo as computeDueState,
  enrichInvoicesWithDueInfo,
  type InvoiceDueInfo,
  type InvoiceDueState,
  type InvoiceForDue,
  type InvoiceWithDueInfo,
} from "../engine/due-engine"
