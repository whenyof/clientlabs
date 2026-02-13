/**
 * Billing module — invoice service. CRUD + payment lifecycle enrichment.
 */

import { prisma } from "@/lib/prisma"
import type { InvoiceStatus, InvoiceEnrichment, BillingPaymentShape } from "../types"
import type { Decimal } from "@prisma/client/runtime/library"
import {
  computeInvoiceStatus,
  computeAging,
  getTotalPaid,
} from "./invoice-status.service"

function toNum(d: Decimal | number | null | undefined): number {
  if (d == null) return 0
  return typeof d === "number" ? d : Number(d)
}

function enrichInvoice(
  total: number,
  dueAt: Date,
  payments: Array<{ amount: number }>
): InvoiceEnrichment {
  const totalPaid = getTotalPaid(payments)
  const computedStatus = computeInvoiceStatus({ total, dueAt, payments })
  const { daysUntilDue, daysOverdue } = computeAging(dueAt)
  const remaining = Math.max(0, total - totalPaid)
  return {
    computedStatus,
    totalPaid,
    remaining,
    daysUntilDue,
    daysOverdue,
  }
}

export type CreateInvoiceData = {
  userId: string
  clientId: string
  saleId?: string | null
  number: string
  status?: InvoiceStatus
  currency: string
  subtotal: number
  tax: number
  total: number
  issuedAt: Date
  dueAt: Date
  notes?: string | null
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    taxRate: number
    total: number
  }>
}

export type ListInvoicesFilters = {
  status?: InvoiceStatus
  clientId?: string
  issuedAtFrom?: Date
  issuedAtTo?: Date
  limit?: number
  offset?: number
}

export async function createInvoice(data: CreateInvoiceData) {
  const { items, ...rest } = data
  const invoice = await prisma.billingInvoice.create({
    data: {
      ...rest,
      status: (rest.status ?? "DRAFT") as "DRAFT" | "SENT" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED",
      items: {
        create: items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          total: item.total,
        })),
      },
    },
    include: { items: true },
  })
  return {
    ...invoice,
    subtotal: toNum(invoice.subtotal),
    tax: toNum(invoice.tax),
    total: toNum(invoice.total),
    items: invoice.items.map((i) => ({
      ...i,
      quantity: toNum(i.quantity),
      unitPrice: toNum(i.unitPrice),
      taxRate: toNum(i.taxRate),
      total: toNum(i.total),
    })),
  }
}

export async function getInvoiceById(id: string, userId: string) {
  const invoice = await prisma.billingInvoice.findFirst({
    where: { id, userId },
    include: { items: true, payments: true },
  })
  if (!invoice) return null
  const total = toNum(invoice.total)
  const dueAt = invoice.dueAt
  const payments = invoice.payments.map((p) => ({ amount: toNum(p.amount) }))
  const enrichment = enrichInvoice(total, dueAt, payments)
  return {
    ...invoice,
    subtotal: toNum(invoice.subtotal),
    tax: toNum(invoice.tax),
    total,
    paidAt: invoice.paidAt,
    items: invoice.items.map((i) => ({
      ...i,
      quantity: toNum(i.quantity),
      unitPrice: toNum(i.unitPrice),
      taxRate: toNum(i.taxRate),
      total: toNum(i.total),
    })),
    payments: invoice.payments.map((p) => ({
      id: p.id,
      invoiceId: p.invoiceId,
      amount: toNum(p.amount),
      paidAt: p.paidAt,
      method: p.method,
      reference: p.reference,
    })) as BillingPaymentShape[],
    ...enrichment,
  }
}

export async function listInvoices(userId: string, filters: ListInvoicesFilters = {}) {
  const { status, clientId, issuedAtFrom, issuedAtTo, limit = 50, offset = 0 } = filters
  const where: { userId: string; status?: InvoiceStatus; clientId?: string; issuedAt?: { gte?: Date; lte?: Date } } = {
    userId,
  }
  if (status) where.status = status as "DRAFT" | "SENT" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED"
  if (clientId) where.clientId = clientId
  if (issuedAtFrom && issuedAtTo) where.issuedAt = { gte: issuedAtFrom, lte: issuedAtTo }
  else if (issuedAtFrom) where.issuedAt = { gte: issuedAtFrom }
  else if (issuedAtTo) where.issuedAt = { lte: issuedAtTo }

  const list = await prisma.billingInvoice.findMany({
    where,
    orderBy: { issuedAt: "desc" },
    take: limit,
    skip: offset,
    include: { payments: true },
  })
  return list.map((inv) => {
    const total = toNum(inv.total)
    const payments = inv.payments.map((p) => ({ amount: toNum(p.amount) }))
    const enrichment = enrichInvoice(total, inv.dueAt, payments)
    return {
      ...inv,
      subtotal: toNum(inv.subtotal),
      tax: toNum(inv.tax),
      total,
      paidAt: inv.paidAt,
      payments: inv.payments.map((p) => ({
        id: p.id,
        invoiceId: p.invoiceId,
        amount: toNum(p.amount),
        paidAt: p.paidAt,
        method: p.method,
        reference: p.reference,
      })) as BillingPaymentShape[],
      ...enrichment,
    }
  })
}

export async function updateInvoiceStatus(
  id: string,
  userId: string,
  status: InvoiceStatus
) {
  await prisma.billingInvoice.updateMany({
    where: { id, userId },
    data: {
      status: status as "DRAFT" | "SENT" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED",
      ...(status === "PAID" ? { paidAt: new Date() } : {}),
      updatedAt: new Date(),
    },
  })
}

export type RegisterPaymentData = {
  amount: number
  paidAt?: Date
  method?: string | null
  reference?: string | null
}

/**
 * Create a payment record and return the updated invoice with computed status.
 * When totalPaid >= total, also set BillingInvoice.paidAt for legacy compatibility.
 */
export async function registerPayment(
  invoiceId: string,
  userId: string,
  data: RegisterPaymentData
): Promise<Awaited<ReturnType<typeof getInvoiceById>> | null> {
  const invoice = await prisma.billingInvoice.findFirst({
    where: { id: invoiceId, userId },
    include: { payments: true },
  })
  if (!invoice) return null
  const paidAt = data.paidAt ?? new Date()
  await prisma.billingPayment.create({
    data: {
      invoiceId,
      amount: data.amount,
      paidAt,
      method: data.method ?? null,
      reference: data.reference ?? null,
    },
  })
  console.log("Payment registered", invoiceId, data.amount)
  const total = toNum(invoice.total)
  const existingSum = invoice.payments.reduce((s, p) => s + toNum(p.amount), 0)
  const newTotalPaid = existingSum + data.amount
  if (newTotalPaid >= total) {
    await prisma.billingInvoice.updateMany({
      where: { id: invoiceId, userId },
      data: { paidAt, status: "PAID", updatedAt: new Date() },
    })
  }
  return getInvoiceById(invoiceId, userId)
}
