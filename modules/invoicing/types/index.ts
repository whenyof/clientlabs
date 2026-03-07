/**
 * Invoicing module — shared domain types.
 * No Prisma imports; use plain types for engine/repository boundaries.
 */

export const INVOICE_STATUS = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  VIEWED: "VIEWED",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
  CANCELED: "CANCELED",
} as const

export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS]

/** "base" = user enters amounts without VAT; "total" = user enters final price with VAT. Default "base". */
export type PriceMode = "base" | "total"

export type InvoiceLineInput = {
  description: string
  quantity: number
  /** Base price per unit (excl. VAT). Used when priceMode is "base". */
  unitPrice: number
  discountPercent?: number
  taxPercent: number
  /** Line total including VAT. Used when priceMode is "total" (backend recalculates base/vat/total). */
  lineTotal?: number
  /** Per-line override; if not set, invoice-level priceMode is used. */
  priceMode?: PriceMode
}

export type InvoiceLineComputed = Omit<InvoiceLineInput, "lineTotal"> & {
  subtotal: number
  taxAmount: number
  total: number
}

/** Client billing snapshot for invoice (stored on invoice, not live reference). */
export type ClientSnapshotInput = {
  name?: string | null
  legalName?: string | null
  taxId?: string | null
  address?: string | null
  city?: string | null
  postalCode?: string | null
  country?: string | null
  email?: string | null
}

export type CreateInvoiceInput = {
  userId: string
  clientId: string
  saleId?: string | null
  series: string
  issueDate: Date
  dueDate: Date
  serviceDate?: Date | null
  currency?: string
  invoiceLanguage?: string | null
  /** Default "base". Backend always recalculates; never trust frontend. */
  priceMode?: PriceMode
  lines: InvoiceLineInput[]
  notes?: string | null
  terms?: string | null
  paymentMethod?: string | null
  iban?: string | null
  bic?: string | null
  paymentReference?: string | null
  /** Billing snapshot (stored on invoice; immutable). */
  clientSnapshot?: ClientSnapshotInput | null
}

export type AddPaymentInput = {
  amount: number
  method: string
  reference?: string | null
  notes?: string | null
  paidAt?: Date
}

/** Invoice with lines, payments, and events loaded (for engine/service use). */
export type InvoiceWithRelations = {
  id: string
  userId: string
  type: "CUSTOMER" | "VENDOR"
  number: string
  series: string
  clientId: string | null
  providerId: string | null
  saleId: string | null
  issueDate: Date
  dueDate: Date
  serviceDate: Date | null
  currency: string
  subtotal: number
  taxAmount: number
  total: number
  status: InvoiceStatus
  notes: string | null
  terms: string | null
  paidAt: Date | null
  createdAt: Date
  updatedAt: Date
  Client?: { name: string | null; email: string | null } | null
  Provider?: { name: string } | null
  lines: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    discountPercent: number | null
    taxPercent: number
    subtotal: number
    taxAmount: number
    total: number
  }>
  payments: Array<{
    id: string
    amount: number
    method: string
    reference: string | null
    notes: string | null
    paidAt: Date
  }>
  events: Array<{
    id: string
    type: string
    metadata: unknown
    createdAt: Date
  }>
}
