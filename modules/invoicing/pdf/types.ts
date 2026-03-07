/**
 * Types for invoice PDF generation — data passed from invoice + branding to template/renderer.
 */

import type { InvoiceBranding } from "./branding"

export type InvoiceLinePdf = {
  description: string
  quantity: number
  unitPrice: number
  taxPercent: number
  subtotal: number
  taxAmount: number
  total: number
}

export type InvoicePdfData = {
  type: "CUSTOMER" | "VENDOR"
  number: string
  series: string
  issueDate: Date
  dueDate: Date
  serviceDate: Date | null
  currency: string
  status: string
  notes: string | null
  terms: string | null
  paymentMethod: string | null
  iban: string | null
  bic: string | null
  paymentReference: string | null
  subtotal: number
  taxAmount: number
  total: number
  lines: InvoiceLinePdf[]
  payments: { amount: number; method: string }[]
  /** Customer: name, taxId?, address?; Vendor: name */
  recipient: {
    name: string
    taxId?: string
    address?: string
    email?: string
    phone?: string
  }
  branding: InvoiceBranding
  /** Rectificativa: show title and original invoice ref */
  isRectification?: boolean
  rectificationReason?: string | null
  originalInvoiceNumber?: string
  originalIssueDate?: Date
}
