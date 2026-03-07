/**
 * Billing module — generate BillingInvoice from Sale.
 * Non-blocking; do not throw into sales flow.
 */

import { prisma } from "@/lib/prisma"
import { createInvoice } from "./invoice.service"

/** Status values that represent a confirmed / closed / completed sale. */
const COMPLETED_SALE_STATUSES = ["PAGADO", "PAID", "COMPLETED", "WON", "CONFIRMED"]

function isEligibleForInvoice(sale: { userId: string; clientId: string | null; total: number; status: string }): boolean {
  const hasClient = !!sale.clientId
  const hasAmount = typeof sale.total === "number" && sale.total > 0
  const statusUpper = (sale.status || "").toUpperCase()
  const isCompleted = COMPLETED_SALE_STATUSES.some((s) => s === statusUpper)
  return hasClient && hasAmount && isCompleted
}

/**
 * Generate a BillingInvoice from a sale if eligible.
 * If an invoice already exists for this saleId, returns it without creating.
 * Does not block; catch errors in caller.
 */
export async function generateInvoiceFromSale(saleId: string): Promise<{ invoiceId: string } | null> {
  const sale = await prisma.sale.findFirst({
    where: { id: saleId },
    include: { Client: true },
  })
  if (!sale) return null
  if (!isEligibleForInvoice(sale)) return null

  const existing = await prisma.billingInvoice.findFirst({
    where: { saleId },
  })
  if (existing) return { invoiceId: existing.id }

  const now = new Date()
  const dueAt = new Date(now)
  dueAt.setDate(dueAt.getDate() + 15)
  const total = Number(sale.total)
  const tax = Number(sale.tax) || 0
  const subtotal = Math.round((total - tax) * 100) / 100
  const number = `INV-${Date.now()}`
  const currency = (sale.currency || "EUR").trim() || "EUR"
  const description = (sale.product || "Service").trim() || "Service"
  const unitPrice = total
  const taxRate = total > 0 && tax > 0 ? Math.round((tax / (total - tax)) * 10000) / 100 : 0

  const invoice = await createInvoice({
    userId: sale.userId,
    clientId: sale.clientId as string,
    saleId,
    number,
    status: "SENT",
    currency,
    subtotal,
    tax,
    total,
    issuedAt: now,
    dueAt,
    notes: sale.notes ?? null,
    items: [
      {
        description,
        quantity: 1,
        unitPrice,
        taxRate,
        total,
      },
    ],
  })

  console.log("Invoice generated from sale", saleId, invoice.id)
  return { invoiceId: invoice.id }
}

/**
 * For every eligible sale without a BillingInvoice, generate one.
 */
export async function backfillInvoicesForUser(userId: string): Promise<{ generated: number; errors: number }> {
  const sales = await prisma.sale.findMany({
    where: { userId },
    include: { Client: true },
  })
  const withInvoice = await prisma.billingInvoice.findMany({
    where: { userId, saleId: { not: null } },
    select: { saleId: true },
  })
  const saleIdsWithInvoice = new Set((withInvoice.map((i) => i.saleId).filter(Boolean) as string[]))
  let generated = 0
  let errors = 0
  for (const sale of sales) {
    if (!isEligibleForInvoice(sale) || saleIdsWithInvoice.has(sale.id)) continue
    try {
      const result = await generateInvoiceFromSale(sale.id)
      if (result) generated++
    } catch (e) {
      console.error("Backfill invoice from sale failed", sale.id, e)
      errors++
    }
  }
  return { generated, errors }
}
