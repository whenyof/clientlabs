/**
 * Invoicing — business logic. Totals, numbering, status, payments.
 */

import * as repo from "../repositories/invoice.repository"
import type { InvoiceLineInput, InvoiceLineComputed, InvoiceWithRelations, AddPaymentInput, InvoiceStatus, PriceMode } from "../types"
import { INVOICE_STATUS } from "../types"

/** Placeholder stored in DB for draft invoices. Number is assigned only when status becomes SENT (issued). */
export const DRAFT_NUMBER_PLACEHOLDER = "BORRADOR"

const round2 = (n: number) => Math.round(n * 100) / 100

/**
 * Compute base, vatAmount, total per line. Never trust frontend — backend recalculates.
 * priceMode "base": unitPrice is base → vatAmount = base * vatRate, total = base + vatAmount.
 * priceMode "total": lineTotal is final → base = total / (1 + vatRate), vatAmount = total - base.
 */
export function calculateTotals(
  lines: InvoiceLineInput[],
  invoicePriceMode: PriceMode = "base"
): InvoiceLineComputed[] {
  return lines.map((line) => {
    const mode: PriceMode = line.priceMode ?? invoicePriceMode
    const taxPct = line.taxPercent
    const vatRate = taxPct / 100
    const qty = Math.max(0, line.quantity)
    const discountPct = line.discountPercent ?? 0

    let subtotal: number
    let taxAmount: number
    let total: number
    let unitPrice: number

    if (mode === "total" && line.lineTotal != null && line.lineTotal >= 0) {
      total = round2(line.lineTotal)
      subtotal = round2(total / (1 + vatRate))
      taxAmount = round2(total - subtotal)
      unitPrice = qty > 0 ? round2(subtotal / qty) : 0
    } else {
      const unit = line.unitPrice
      subtotal = round2(qty * unit * (1 - discountPct / 100))
      taxAmount = round2(subtotal * vatRate)
      total = round2(subtotal + taxAmount)
      unitPrice = unit
    }

    return {
      description: line.description,
      quantity: qty,
      unitPrice,
      discountPercent: line.discountPercent,
      taxPercent: taxPct,
      priceMode: line.priceMode,
      subtotal,
      taxAmount,
      total,
    }
  })
}

export function aggregateLineTotals(computed: InvoiceLineComputed[]): { subtotal: number; taxAmount: number; total: number } {
  let subtotal = 0
  let taxAmount = 0
  let total = 0
  for (const line of computed) {
    subtotal += line.subtotal
    taxAmount += line.taxAmount
    total += line.total
  }
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  }
}

const ISSUED_NUMBER_PAD_LENGTH = 4

/**
 * Format issued invoice number: YYYY-XXXX (e.g. 2026-0001).
 * YYYY = year of issue, XXXX = incremental per user per year. No duplicates, no reuse, no gaps.
 */
export function formatIssuedInvoiceNumber(_series: string, year: number, sequence: number): string {
  return `${year}-${String(sequence).padStart(ISSUED_NUMBER_PAD_LENGTH, "0")}`
}

/**
 * Atomically consume next sequence for (userId, series, year) and return formatted number.
 * Use only when issuing an invoice (not for drafts). Concurrency-safe.
 */
export async function getNextIssuedInvoiceNumber(
  userId: string,
  series: string,
  issuedAt: Date
): Promise<{ number: string; sequenceUsed: number }> {
  const year = issuedAt.getFullYear()
  const seriesKey = `${series}-${year}`
  const { number: sequenceUsed, prefix } = await repo.consumeNextNumber(userId, seriesKey)
  const number = formatIssuedInvoiceNumber(series, year, sequenceUsed)
  return { number, sequenceUsed }
}

export function recomputeStatus(invoice: InvoiceWithRelations): { status: InvoiceStatus; paidAt: Date | null } {
  const total = invoice.total
  const paid = invoice.payments.reduce((sum, p) => sum + p.amount, 0)
  const now = new Date()
  const duePassed = new Date(invoice.dueDate) < now

  if (invoice.status === INVOICE_STATUS.CANCELED) {
    return { status: INVOICE_STATUS.CANCELED, paidAt: invoice.paidAt }
  }
  if (paid >= total && total > 0) {
    const lastPayment = invoice.payments.length > 0
      ? invoice.payments.reduce((latest, p) => (p.paidAt > latest ? p.paidAt : latest), invoice.payments[0].paidAt)
      : now
    return { status: INVOICE_STATUS.PAID, paidAt: lastPayment }
  }
  if (paid > 0) {
    return { status: INVOICE_STATUS.PARTIAL, paidAt: null }
  }
  if (duePassed) {
    return { status: INVOICE_STATUS.OVERDUE, paidAt: null }
  }
  return { status: invoice.status as InvoiceStatus, paidAt: null }
}

/**
 * Register a payment: create payment row, recompute status, update invoice, emit event.
 */
export async function registerPayment(
  invoiceId: string,
  userId: string,
  payment: AddPaymentInput
): Promise<{ ok: boolean; newStatus?: InvoiceStatus }> {
  const invoice = await repo.findById(invoiceId, userId)
  if (!invoice) return { ok: false }
  if (invoice.status === INVOICE_STATUS.CANCELED) return { ok: false }

  const paidAt = payment.paidAt ?? new Date()
  await repo.addPayment(invoiceId, userId, {
    amount: payment.amount,
    method: payment.method,
    reference: payment.reference ?? null,
    notes: payment.notes ?? null,
    paidAt,
  })

  const updated = await repo.findById(invoiceId, userId)
  if (!updated) return { ok: true }

  const { status, paidAt: newPaidAt } = recomputeStatus(updated as InvoiceWithRelations)
  await repo.updateStatus(invoiceId, userId, status, newPaidAt)

  if (status === INVOICE_STATUS.PAID) {
    await repo.addEvent(invoiceId, "PAID", {
      amount: payment.amount,
      method: payment.method,
      paidAt: paidAt.toISOString(),
    })
  }

  return { ok: true, newStatus: status }
}
