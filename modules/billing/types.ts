/**
 * Billing module — shared types.
 * No Prisma imports; plain types for service boundaries.
 */

export const BILLING_INVOICE_STATUS = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
  CANCELLED: "CANCELLED",
} as const

export type InvoiceStatus = (typeof BILLING_INVOICE_STATUS)[keyof typeof BILLING_INVOICE_STATUS]

export type BillingInvoiceItemShape = {
  id: string
  invoiceId: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  total: number
}

export type InvoiceWithItems = {
  id: string
  userId: string
  clientId: string
  saleId: string | null
  number: string
  status: InvoiceStatus
  currency: string
  subtotal: number
  tax: number
  total: number
  issuedAt: Date
  dueAt: Date
  paidAt: Date | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  items: BillingInvoiceItemShape[]
}

export type InvoiceListItem = {
  id: string
  userId: string
  clientId: string
  saleId: string | null
  number: string
  status: InvoiceStatus
  currency: string
  subtotal: number
  tax: number
  total: number
  issuedAt: Date
  dueAt: Date
  paidAt: Date | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export type BillingPaymentShape = {
  id: string
  invoiceId: string
  amount: number
  paidAt: Date
  method: string | null
  reference: string | null
}

/** Enrichment: computed status + aging + payment totals (not stored in DB). */
export type InvoiceEnrichment = {
  computedStatus: InvoiceStatus
  totalPaid: number
  remaining: number
  daysUntilDue: number
  daysOverdue: number
}
