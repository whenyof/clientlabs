/**
 * UI/API response types for invoicing. All data from service layer.
 */

import type { InvoiceStatus } from "../types"
import type { InvoiceDueInfo } from "../utils/due-engine"

export type InvoiceType = "CUSTOMER" | "VENDOR"

export type InvoiceListItem = {
  id: string
  userId: string
  type: InvoiceType
  number: string
  series: string
  clientId: string | null
  providerId: string | null
  saleId: string | null
  issueDate: string
  dueDate: string
  serviceDate: string | null
  currency: string
  subtotal: number
  taxAmount: number
  total: number
  status: InvoiceStatus
  notes: string | null
  terms: string | null
  paymentMethod?: string | null
  iban?: string | null
  bic?: string | null
  paymentReference?: string | null
  paidAt: string | null
  pdfUrl?: string | null
  pdfGeneratedAt?: string | null
  createdAt: string
  updatedAt: string
  Client: { id: string; name: string | null; email: string | null; isFiscalComplete?: boolean | null } | null
  Provider: { name: string } | null
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
    paidAt: string
  }>
  /** Attached by list API from due-engine. */
  dueInfo?: InvoiceDueInfo
  /** Billing snapshot (for draft edit pre-fill). */
  issuedClientSnapshot?: ClientSnapshot | null
  /** Rectifying (credit) invoice. */
  isRectification?: boolean
  rectifiesInvoiceId?: string | null
  rectificationReason?: string | null
}

export type InvoiceDetail = InvoiceListItem & {
  events: Array<{
    id: string
    type: string
    metadata: unknown
    createdAt: string
  }>
}

export type InvoiceKPIsResponse = {
  outstanding: number
  paidThisMonth: number
  overdueCount: number
  averagePaymentDays: number | null
}

export type ClientOption = {
  id: string
  name: string | null
  email: string | null
  isFiscalComplete?: boolean | null
  legalName?: string | null
  taxId?: string | null
  address?: string | null
  city?: string | null
  postalCode?: string | null
  country?: string | null
}

/** Billing snapshot stored on invoice (immutable copy from client or manual). */
export type ClientSnapshot = {
  name?: string | null
  legalName?: string | null
  taxId?: string | null
  address?: string | null
  city?: string | null
  postalCode?: string | null
  country?: string | null
  email?: string | null
}
