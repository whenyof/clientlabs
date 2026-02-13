/**
 * Invoicing — repository layer. Database access only, no business logic.
 */

import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { InvoiceStatus } from "../types"
import type { Decimal } from "@prisma/client/runtime/library"

function toNum(d: Decimal | number | null | undefined): number {
  if (d == null) return 0
  return typeof d === "number" ? d : Number(d)
}

const clientSelect = {
  id: true,
  name: true,
  email: true,
  legalName: true,
  taxId: true,
  address: true,
  postalCode: true,
  city: true,
  country: true,
  legalType: true
} as const

const providerSelect = { name: true } as const

export async function findById(id: string, userId: string) {
  const inv = await prisma.invoice.findFirst({
    where: { id, userId },
    include: {
      Client: { select: clientSelect },
      Provider: { select: providerSelect },
      Sale: { select: { id: true, product: true, total: true } },
      ProviderOrder: { select: { id: true, status: true } },
      ProviderPayment: { select: { id: true, amount: true, paymentDate: true } },
      lines: true,
      payments: true,
      events: { orderBy: { createdAt: "desc" }, take: 100 },
    },
  })
  if (!inv) return null
  return {
    ...inv,
    subtotal: toNum(inv.subtotal),
    taxAmount: toNum(inv.taxAmount),
    total: toNum(inv.total),
    lines: inv.lines.map((l) => ({
      ...l,
      quantity: toNum(l.quantity),
      unitPrice: toNum(l.unitPrice),
      discountPercent: l.discountPercent != null ? toNum(l.discountPercent) : null,
      taxPercent: toNum(l.taxPercent),
      subtotal: toNum(l.subtotal),
      taxAmount: toNum(l.taxAmount),
      total: toNum(l.total),
    })),
    payments: inv.payments.map((p) => ({
      ...p,
      amount: toNum(p.amount),
    })),
    events: inv.events.map((e) => ({ ...e, metadata: e.metadata ?? null })),
  }
}

export type ListInvoicesOptions = {
  status?: InvoiceStatus
  limit?: number
  offset?: number
  issueDateFrom?: Date
  issueDateTo?: Date
  clientId?: string
  providerId?: string
  saleId?: string
  providerOrderId?: string
  minTotal?: number
  maxTotal?: number
  search?: string
}

export async function listByUser(userId: string, options?: ListInvoicesOptions) {
  const {
    status,
    limit = 50,
    offset = 0,
    issueDateFrom,
    issueDateTo,
    clientId,
    providerId,
    saleId,
    providerOrderId,
    minTotal,
    maxTotal,
    search,
  } = options ?? {}
  const where: Prisma.InvoiceWhereInput = { userId }
  if (status) where.status = status
  if (issueDateFrom && issueDateTo) where.issueDate = { gte: issueDateFrom, lte: issueDateTo }
  else if (issueDateFrom) where.issueDate = { gte: issueDateFrom }
  else if (issueDateTo) where.issueDate = { lte: issueDateTo }
  if (clientId) where.clientId = clientId
  if (providerId) where.providerId = providerId
  if (saleId) where.saleId = saleId
  if (providerOrderId) where.providerOrderId = providerOrderId
  if (minTotal != null || maxTotal != null) {
    where.total = {}
    if (minTotal != null) (where.total as Prisma.DecimalFilter).gte = minTotal
    if (maxTotal != null) (where.total as Prisma.DecimalFilter).lte = maxTotal
  }
  if (search?.trim()) {
    const term = search.trim()
    where.OR = [
      { number: { contains: term, mode: "insensitive" } },
      { Client: { name: { contains: term, mode: "insensitive" } } },
      { Provider: { name: { contains: term, mode: "insensitive" } } },
    ]
  }
  const list = await prisma.invoice.findMany({
    where,
    orderBy: { issueDate: "desc" },
    take: limit,
    skip: offset,
    include: {
      Client: { select: clientSelect },
      Provider: { select: providerSelect },
      lines: true,
      payments: true,
    },
  })
  return list.map((inv) => ({
    ...inv,
    subtotal: toNum(inv.subtotal),
    taxAmount: toNum(inv.taxAmount),
    total: toNum(inv.total),
    lines: inv.lines.map((l) => ({
      ...l,
      quantity: toNum(l.quantity),
      unitPrice: toNum(l.unitPrice),
      discountPercent: l.discountPercent != null ? toNum(l.discountPercent) : null,
      taxPercent: toNum(l.taxPercent),
      subtotal: toNum(l.subtotal),
      taxAmount: toNum(l.taxAmount),
      total: toNum(l.total),
    })),
    payments: inv.payments.map((p) => ({ ...p, amount: toNum(p.amount) })),
  }))
}

type CreatePayload = {
  userId: string
  number: string
  series: string
  type?: "CUSTOMER" | "VENDOR"
  clientId?: string | null
  providerId?: string | null
  saleId?: string | null
  providerOrderId?: string | null
  providerPaymentId?: string | null
  linkedInvoicePaymentId?: string | null
  issueDate: Date
  dueDate: Date
  serviceDate?: Date | null
  currency: string
  invoiceLanguage?: string | null
  subtotal: number
  taxAmount: number
  total: number
  status: InvoiceStatus
  notes?: string | null
  terms?: string | null
  paymentMethod?: string | null
  iban?: string | null
  bic?: string | null
  paymentReference?: string | null
  /** Billing snapshot (stored on invoice; immutable). */
  issuedClientSnapshot?: Prisma.InputJsonValue | null
  isRectification?: boolean
  rectifiesInvoiceId?: string | null
  rectificationReason?: string | null
  lines: Array<{
    description: string
    quantity: number
    unitPrice: number
    discountPercent?: number | null
    taxPercent: number
    subtotal: number
    taxAmount: number
    total: number
  }>
}

export async function create(payload: CreatePayload) {
  const { lines, ...rest } = payload
  const invoice = await prisma.invoice.create({
    data: {
      ...rest,
      type: rest.type ?? "CUSTOMER",
      clientId: rest.clientId ?? null,
      providerId: rest.providerId ?? null,
      providerOrderId: rest.providerOrderId ?? null,
      providerPaymentId: rest.providerPaymentId ?? null,
      linkedInvoicePaymentId: rest.linkedInvoicePaymentId ?? null,
      issuedClientSnapshot: rest.issuedClientSnapshot ?? undefined,
      isRectification: rest.isRectification ?? false,
      rectifiesInvoiceId: rest.rectifiesInvoiceId ?? null,
      rectificationReason: rest.rectificationReason ?? null,
      lines: {
        create: lines.map((l) => ({
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          discountPercent: l.discountPercent ?? null,
          taxPercent: l.taxPercent,
          subtotal: l.subtotal,
          taxAmount: l.taxAmount,
          total: l.total,
        })),
      },
    },
    include: { lines: true, payments: true },
  })
  return {
    ...invoice,
    subtotal: toNum(invoice.subtotal),
    taxAmount: toNum(invoice.taxAmount),
    total: toNum(invoice.total),
    lines: invoice.lines.map((l) => ({
      ...l,
      quantity: toNum(l.quantity),
      unitPrice: toNum(l.unitPrice),
      discountPercent: l.discountPercent != null ? toNum(l.discountPercent) : null,
      taxPercent: toNum(l.taxPercent),
      subtotal: toNum(l.subtotal),
      taxAmount: toNum(l.taxAmount),
      total: toNum(l.total),
    })),
    payments: invoice.payments.map((p) => ({ ...p, amount: toNum(p.amount) })),
  }
}

type UpdateDraftPayload = {
  issueDate: Date
  dueDate: Date
  serviceDate?: Date | null
  notes?: string | null
  terms?: string | null
  currency: string
  paymentMethod?: string | null
  iban?: string | null
  bic?: string | null
  paymentReference?: string | null
  /** Billing snapshot (stored on invoice; immutable). */
  issuedClientSnapshot?: Prisma.InputJsonValue | null
  subtotal: number
  taxAmount: number
  total: number
  lines: Array<{
    description: string
    quantity: number
    unitPrice: number
    discountPercent?: number | null
    taxPercent: number
    subtotal: number
    taxAmount: number
    total: number
  }>
}

export async function updateDraft(id: string, userId: string, payload: UpdateDraftPayload) {
  const { lines, ...rest } = payload
  const updateData: Prisma.InvoiceUncheckedUpdateManyInput = {
    ...rest,
    pdfUrl: null,
    pdfGeneratedAt: null,
    updatedAt: new Date(),
  }
  if (payload.issuedClientSnapshot !== undefined) {
    updateData.issuedClientSnapshot = payload.issuedClientSnapshot
  }
  await prisma.$transaction(async (tx) => {
    await tx.invoiceLine.deleteMany({ where: { invoiceId: id } })
    await tx.invoice.updateMany({
      where: { id, userId, status: "DRAFT" },
      data: updateData,
    })
    if (lines.length) {
      await tx.invoiceLine.createMany({
        data: lines.map((l) => ({
          invoiceId: id,
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          discountPercent: l.discountPercent ?? null,
          taxPercent: l.taxPercent,
          subtotal: l.subtotal,
          taxAmount: l.taxAmount,
          total: l.total,
        })),
      })
    }
  })
  return findById(id, userId)
}

export async function deleteDraft(id: string, userId: string): Promise<boolean> {
  const deleted = await prisma.invoice.deleteMany({
    where: { id, userId, status: "DRAFT" },
  })
  return deleted.count > 0
}

export async function updateStatus(
  id: string,
  userId: string,
  status: InvoiceStatus,
  paidAt?: Date | null
) {
  await prisma.invoice.updateMany({
    where: { id, userId },
    data: { status, paidAt: paidAt ?? undefined, updatedAt: new Date() },
  })
}

/** Update invoice number and status (e.g. when issuing: assign number and set SENT). */
export async function updateNumberAndStatus(
  id: string,
  userId: string,
  number: string,
  status: InvoiceStatus
) {
  await prisma.invoice.updateMany({
    where: { id, userId },
    data: { number, status, updatedAt: new Date() },
  })
}

/** Update invoice with issued number, status, issuedAt and immutable fiscal snapshots (legal-grade). */
export async function updateNumberStatusAndSnapshots(
  id: string,
  userId: string,
  data: {
    number: string
    status: InvoiceStatus
    issuedAt: Date
    issuedCompanySnapshot: Prisma.InputJsonValue
    issuedClientSnapshot: Prisma.InputJsonValue
    issuedItemsSnapshot: Prisma.InputJsonValue
    issuedTotalsSnapshot: Prisma.InputJsonValue
  }
): Promise<boolean> {
  const r = await prisma.invoice.updateMany({
    where: { id, userId },
    data: {
      number: data.number,
      status: data.status,
      issuedAt: data.issuedAt,
      issuedCompanySnapshot: data.issuedCompanySnapshot,
      issuedClientSnapshot: data.issuedClientSnapshot,
      issuedItemsSnapshot: data.issuedItemsSnapshot,
      issuedTotalsSnapshot: data.issuedTotalsSnapshot,
      updatedAt: new Date(),
    },
  })
  return r.count > 0
}

/** Set stored PDF URL and generation time (after generating PDF). */
export async function updateInvoicePdf(
  id: string,
  userId: string,
  pdfUrl: string,
  pdfGeneratedAt: Date
): Promise<boolean> {
  const r = await prisma.invoice.updateMany({
    where: { id, userId },
    data: { pdfUrl, pdfGeneratedAt, updatedAt: new Date() },
  })
  return r.count > 0
}

/** Clear stored PDF when invoice content changes (invalidate cache). */
export async function clearInvoicePdf(id: string, userId: string): Promise<boolean> {
  const r = await prisma.invoice.updateMany({
    where: { id, userId },
    data: { pdfUrl: null, pdfGeneratedAt: null, updatedAt: new Date() },
  })
  return r.count > 0
}

export async function addPayment(
  invoiceId: string,
  userId: string,
  data: { amount: number; method: string; reference?: string | null; notes?: string | null; paidAt?: Date }
) {
  const payment = await prisma.invoicePayment.create({
    data: {
      invoiceId,
      amount: data.amount,
      method: data.method,
      reference: data.reference ?? null,
      notes: data.notes ?? null,
      paidAt: data.paidAt ?? new Date(),
    },
  })
  return { ...payment, amount: toNum(payment.amount) }
}

export async function addEvent(
  invoiceId: string,
  type: string,
  metadata?: Record<string, unknown> | null
) {
  return prisma.invoiceEvent.create({
    data: { invoiceId, type, metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined },
  })
}

/** Atomically consume the next number for a series and return it (then increment). */
export async function consumeNextNumber(userId: string, seriesName: string): Promise<{ number: number; prefix: string }> {
  return prisma.$transaction(async (tx) => {
    let series = await tx.invoiceSeries.findUnique({
      where: { userId_name: { userId, name: seriesName } },
    })
    if (!series) {
      series = await tx.invoiceSeries.create({
        data: { userId, name: seriesName, prefix: seriesName, nextNumber: 1 },
      })
    }
    const numberToUse = series.nextNumber
    await tx.invoiceSeries.update({
      where: { id: series.id },
      data: { nextNumber: series.nextNumber + 1 },
    })
    return { number: numberToUse, prefix: series.prefix }
  })
}

export type UpdateLinkFieldsPayload = {
  clientId?: string | null
  saleId?: string | null
  providerId?: string | null
  providerOrderId?: string | null
  providerPaymentId?: string | null
  linkedInvoicePaymentId?: string | null
}

/** Update only relation fields (for attach helpers). Does not change status or lines. */
export async function updateLinkFields(
  id: string,
  userId: string,
  payload: UpdateLinkFieldsPayload
): Promise<boolean> {
  const updated = await prisma.invoice.updateMany({
    where: { id, userId },
    data: {
      ...(payload.clientId !== undefined && { clientId: payload.clientId }),
      ...(payload.saleId !== undefined && { saleId: payload.saleId }),
      ...(payload.providerId !== undefined && { providerId: payload.providerId }),
      ...(payload.providerOrderId !== undefined && { providerOrderId: payload.providerOrderId }),
      ...(payload.providerPaymentId !== undefined && { providerPaymentId: payload.providerPaymentId }),
      ...(payload.linkedInvoicePaymentId !== undefined && { linkedInvoicePaymentId: payload.linkedInvoicePaymentId }),
      updatedAt: new Date(),
    },
  })
  return updated.count > 0
}

/** Find invoice by provider order (one-to-one). */
export async function findByProviderOrderId(providerOrderId: string, userId: string) {
  const row = await prisma.invoice.findFirst({
    where: { providerOrderId, userId },
    select: { id: true },
  })
  return row ? findById(row.id, userId) : null
}

/** Find invoice by provider payment (one-to-one). */
export async function findByProviderPaymentId(providerPaymentId: string, userId: string) {
  const row = await prisma.invoice.findFirst({
    where: { providerPaymentId, userId },
    select: { id: true },
  })
  return row ? findById(row.id, userId) : null
}
