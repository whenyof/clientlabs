/**
 * Finance invoice (prisma Invoice) — draft creation from sales for billing list.
 * Re-exports from invoicing implementation; billing is the single public API.
 */
export {
  createInvoiceFromSale,
  backfillInvoicesFromSales,
} from "@domains/invoicing"
