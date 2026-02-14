/**
 * Invoicing — high-level service. Orchestrates engine + repository.
 *
 * Future integration points (do not implement yet):
 * - When an invoice becomes PAID: TODO create finance transaction (ledger)
 * - When an invoice becomes PAID: TODO update finance KPIs / revenue
 * - When an invoice becomes PAID: TODO trigger automation / AI risk analysis
 */

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import * as repo from "../repositories/invoice.repository"
import * as engine from "../engine/invoice.engine"
import type { CreateInvoiceInput, AddPaymentInput, InvoiceWithRelations, InvoiceStatus } from "../types"
import { INVOICE_STATUS } from "../types"

// --- Attach helpers: single source of truth for invoice ↔ sale / provider order / payment ---

/**
 * Link an existing invoice to a sale (and set clientId from the sale).
 * Use when creating invoice from billing with a selected sale, or when attaching document to a sale.
 */
export async function attachInvoiceToSale(
  invoiceId: string,
  saleId: string,
  userId: string
): Promise<boolean> {
  const inv = await repo.findById(invoiceId, userId)
  if (!inv) return false
  const sale = await prisma.sale.findFirst({
    where: { id: saleId, userId },
    select: { id: true, clientId: true },
  })
  if (!sale) return false
  return repo.updateLinkFields(invoiceId, userId, {
    saleId: sale.id,
    clientId: sale.clientId ?? inv.clientId ?? null,
  })
}

/**
 * Link an existing invoice to a provider order (and set providerId from the order).
 * Use when provider attaches invoice document to an order.
 */
export async function attachInvoiceToProviderOrder(
  invoiceId: string,
  providerOrderId: string,
  userId: string
): Promise<boolean> {
  const inv = await repo.findById(invoiceId, userId)
  if (!inv) return false
  const order = await prisma.providerOrder.findFirst({
    where: { id: providerOrderId, userId },
    select: { id: true, providerId: true },
  })
  if (!order) return false
  return repo.updateLinkFields(invoiceId, userId, {
    providerOrderId: order.id,
    providerId: order.providerId,
  })
}

/**
 * Link an existing invoice to an invoice payment (the payment that triggered/linked this invoice).
 * Copies clientId and saleId from the payment's parent invoice so the invoice appears in client/sale views.
 */
export async function attachInvoiceToPayment(
  invoiceId: string,
  invoicePaymentId: string,
  userId: string
): Promise<boolean> {
  const inv = await repo.findById(invoiceId, userId)
  if (!inv) return false
  const payment = await prisma.invoicePayment.findFirst({
    where: { id: invoicePaymentId },
    include: { Invoice: { select: { id: true, clientId: true, saleId: true, userId: true } } },
  })
  if (!payment || payment.Invoice.userId !== userId) return false
  return repo.updateLinkFields(invoiceId, userId, {
    linkedInvoicePaymentId: payment.id,
    clientId: payment.Invoice.clientId ?? inv.clientId ?? null,
    saleId: payment.Invoice.saleId ?? inv.saleId ?? null,
  })
}

/**
 * Create (or return existing) a vendor invoice linked to a provider order.
 * Used when the provider attaches an invoice document to an order (Flujo B).
 * Idempotent: if an invoice already exists for this providerOrderId, returns it.
 */
export async function createInvoiceForProviderOrder(
  providerOrderId: string,
  userId: string
): Promise<{ id: string; number: string } | null> {
  const existing = await repo.findByProviderOrderId(providerOrderId, userId)
  if (existing) return { id: existing.id, number: existing.number }

  const order = await prisma.providerOrder.findFirst({
    where: { id: providerOrderId, userId },
    select: { id: true, providerId: true, amount: true },
  })
  if (!order) return null

  const amount = Number(order.amount ?? 0)
  const computed = engine.calculateTotals([
    { description: "Factura proveedor", quantity: 1, unitPrice: amount, taxPercent: 0 },
  ])
  const { subtotal, taxAmount, total } = engine.aggregateLineTotals(computed)
  const issueDate = new Date()
  const dueDate = new Date(issueDate)
  dueDate.setDate(dueDate.getDate() + 30)

  const invoice = await repo.create({
    userId,
    number: engine.DRAFT_NUMBER_PLACEHOLDER,
    series: "PROV",
    type: "VENDOR",
    providerId: order.providerId,
    providerOrderId: order.id,
    issueDate,
    dueDate,
    serviceDate: null,
    currency: "EUR",
    subtotal,
    taxAmount,
    total,
    status: INVOICE_STATUS.DRAFT,
    notes: null,
    terms: null,
    lines: computed,
  })
  return { id: invoice.id, number: invoice.number }
}

async function resolveDefaultNotesAndTerms(userId: string): Promise<{ notes: string | null; terms: string | null }> {
  const { defaultNotesTemplate, defaultTermsTemplate } = await import("../config/defaultInvoiceTexts")
  try {
    const { getBrandingForUser } = await import("../pdf/branding")
    const branding = await getBrandingForUser(userId)
    const notes =
      typeof branding.defaultNotesTemplate === "string" && branding.defaultNotesTemplate.trim()
        ? branding.defaultNotesTemplate.trim()
        : defaultNotesTemplate
    const terms =
      typeof branding.defaultTermsTemplate === "string" && branding.defaultTermsTemplate.trim()
        ? branding.defaultTermsTemplate.trim()
        : defaultTermsTemplate
    return { notes, terms }
  } catch {
    return { notes: defaultNotesTemplate, terms: defaultTermsTemplate }
  }
}

export async function createInvoice(input: CreateInvoiceInput): Promise<{ id: string; number: string } | null> {
  const priceMode = input.priceMode ?? "base"
  const computed = engine.calculateTotals(input.lines, priceMode)
  const { subtotal, taxAmount, total } = engine.aggregateLineTotals(computed)
  const hasNotes = typeof input.notes === "string" && input.notes.trim().length > 0
  const hasTerms = typeof input.terms === "string" && input.terms.trim().length > 0
  const defaults = !hasNotes || !hasTerms ? await resolveDefaultNotesAndTerms(input.userId) : null
  const notes = hasNotes ? input.notes : (defaults?.notes ?? null)
  const terms = hasTerms ? input.terms : (defaults?.terms ?? null)
  const invoice = await repo.create({
    userId: input.userId,
    number: engine.DRAFT_NUMBER_PLACEHOLDER,
    series: input.series,
    type: "CUSTOMER",
    clientId: input.clientId,
    saleId: input.saleId ?? null,
    issueDate: input.issueDate,
    dueDate: input.dueDate,
    serviceDate: input.serviceDate ?? null,
    currency: input.currency ?? "EUR",
    invoiceLanguage: input.invoiceLanguage ?? null,
    subtotal,
    taxAmount,
    total,
    status: INVOICE_STATUS.DRAFT,
    notes,
    terms,
    paymentMethod: input.paymentMethod ?? null,
    iban: input.iban ?? null,
    bic: input.bic ?? null,
    paymentReference: input.paymentReference ?? null,
    issuedClientSnapshot: input.clientSnapshot ?? undefined,
    lines: computed,
  })
  await repo.addEvent(invoice.id, "CREATED", { at: new Date().toISOString() })
  return { id: invoice.id, number: invoice.number }
}

/** Whether the invoice has a definitive issued number (not draft placeholder). */
function hasIssuedNumber(number: string): boolean {
  return number !== engine.DRAFT_NUMBER_PLACEHOLDER && number.trim().length > 0
}

/**
 * Create a draft invoice from an existing sale (one line, sale totals).
 * Idempotent: if an invoice already exists for (userId, saleId), returns it without creating.
 * Does not modify the sale. Prevents duplicates; DB unique (userId, saleId) enforces.
 */
export async function createInvoiceFromSale(saleId: string, userId: string): Promise<{ id: string; number: string } | null> {
  const existing = await prisma.invoice.findFirst({
    where: { saleId, userId },
    select: { id: true, number: true },
  })
  if (existing) return { id: existing.id, number: existing.number }

  const sale = await prisma.sale.findFirst({
    where: { id: saleId, userId },
    include: { Client: true },
  })
  if (!sale || !sale.clientId) return null

  const total = Number(sale.total)
  const tax = Number(sale.tax)
  const subtotalLine = Math.round((total - tax) * 100) / 100
  const taxPct = subtotalLine > 0 ? Math.round((tax / subtotalLine) * 10000) / 100 : 0
  const lines: CreateInvoiceInput["lines"] = [
    {
      description: sale.product,
      quantity: 1,
      unitPrice: subtotalLine,
      discountPercent: sale.discount ? Number(sale.discount) : 0,
      taxPercent: taxPct,
    },
  ]
  const issueDate = new Date()
  const dueDate = new Date(issueDate)
  dueDate.setDate(dueDate.getDate() + 30)
  const client = sale.Client
  const clientSnapshot =
    client != null
      ? {
        name: client.name ?? null,
        legalName: client.legalName ?? null,
        taxId: client.taxId ?? null,
        address: client.address ?? null,
        city: client.city ?? null,
        postalCode: client.postalCode ?? null,
        country: client.country ?? null,
        email: client.email ?? null,
      }
      : undefined
  const result = await createInvoice({
    userId,
    clientId: sale.clientId,
    saleId,
    series: "INV",
    issueDate,
    dueDate,
    serviceDate: sale.saleDate ? new Date(sale.saleDate) : null,
    currency: sale.currency ?? "EUR",
    clientSnapshot,
    lines,
  })
  return result
}

/**
 * Create draft invoices for sales that do not yet have an Invoice (invoicing list).
 * Used when loading invoicing dashboard and list is empty. Returns count created.
 * Idempotent: skips sales that already have an invoice; createInvoiceFromSale also checks before creating.
 */
export async function backfillInvoicesFromSales(userId: string): Promise<number> {
  const sales = await prisma.sale.findMany({
    where: { userId, clientId: { not: null } },
    select: { id: true },
  })
  const withInvoice = await prisma.invoice.findMany({
    where: { userId, saleId: { not: null } },
    select: { saleId: true },
  })
  const saleIdsWithInvoice = new Set((withInvoice.map((i) => i.saleId).filter(Boolean) as string[]))
  let created = 0
  for (const sale of sales) {
    if (saleIdsWithInvoice.has(sale.id)) continue
    try {
      const result = await createInvoiceFromSale(sale.id, userId)
      if (result) created++
    } catch (e) {
      console.error("Backfill invoice from sale failed", sale.id, e)
    }
  }
  return created
}

export type IssueInvoiceResult = { success: true } | { success: false; validationErrors: string[] }

/**
 * Mark invoice as SENT and assign definitive number. Number is assigned only on issue (not for drafts).
 * Idempotent: if already SENT or already has issued number, no-op.
 * Validates legal requirements (emitter + client) before issuing; returns validationErrors if invalid.
 */
export async function issueInvoice(invoiceId: string, userId: string): Promise<IssueInvoiceResult> {
  const inv = await repo.findById(invoiceId, userId)
  if (!inv) return { success: false, validationErrors: ["Factura no encontrada"] }
  if (inv.status !== INVOICE_STATUS.DRAFT) return { success: true }

  // 0. Enforce fiscal completeness (backend safety)
  if (inv.clientId) {
    const { calculateFiscalCompleteness } = await import("@/lib/clients/calculateFiscalCompleteness")
    if (!calculateFiscalCompleteness(inv.Client)) {
      return { success: false, validationErrors: ["Faltan datos fiscales del cliente (Nombre, NIF, Dirección, etc)."] }
    }
  }
  // Safety: if already issued (snapshots set), do nothing
  const alreadyIssued =
    (inv as { issuedAt?: Date | null }).issuedAt != null ||
    (inv as { issuedCompanySnapshot?: unknown }).issuedCompanySnapshot != null
  if (alreadyIssued) return { success: true }
  if (hasIssuedNumber(inv.number)) {
    await repo.updateStatus(invoiceId, userId, INVOICE_STATUS.SENT)
    await repo.addEvent(invoiceId, "SENT", { at: new Date().toISOString() })
    return { success: true }
  }
  // Legal validation before issue
  const { getBrandingForUser } = await import("../pdf/branding")
  const branding = await getBrandingForUser(userId)
  const { validateForIssue } = await import("@/lib/invoicing/legalValidator")
  const address =
    typeof branding.address === "string" && branding.address.trim()
      ? branding.address
      : undefined
  const validation = validateForIssue(
    {
      companyName: branding.companyName,
      taxId: branding.taxId,
      address,
    },
    {
      name: inv.type === "VENDOR" ? inv.Provider?.name : inv.Client?.name ?? inv.Client?.email,
      taxId: undefined,
      isCompany: false,
    }
  )
  if (!validation.valid) {
    return { success: false, validationErrors: validation.errors }
  }
  const issuedAt = new Date()
  let number: string
  let sequenceUsed: number
  try {
    const result = await engine.getNextIssuedInvoiceNumber(userId, inv.series, issuedAt)
    number = result.number
    sequenceUsed = result.sequenceUsed
  } catch (e) {
    console.error("Invoice number generation failed:", e)
    return { success: false, validationErrors: ["No se pudo asignar el número de factura. Intente de nuevo."] }
  }
  const issuedCompanySnapshot = {
    companyName: branding.companyName,
    taxId: branding.taxId,
    address: branding.address,
    email: branding.email,
    phone: branding.phone,
    legalFooter: branding.legalFooter,
    paymentConditions: branding.paymentConditions,
    logoUrl: branding.logoUrl,
    primaryColor: branding.primaryColor,
  }
  // 2. Client snapshot: use existing (from draft) or build from Client/Provider
  const existingClientSnap = (inv as { issuedClientSnapshot?: unknown }).issuedClientSnapshot
  const issuedClientSnapshot =
    existingClientSnap != null && typeof existingClientSnap === "object" && !Array.isArray(existingClientSnap)
      ? (existingClientSnap as Record<string, unknown>)
      : inv.type === "VENDOR"
        ? { name: inv.Provider?.name ?? "—", taxId: undefined, address: undefined, email: undefined, phone: undefined }
        : {
          name: inv.Client?.name ?? inv.Client?.email ?? "—",
          taxId: (inv.Client as { taxId?: string | null } | undefined)?.taxId ?? undefined,
          address: (inv.Client as { address?: string | null } | undefined)?.address ?? undefined,
          email: inv.Client?.email ?? undefined,
          phone: undefined,
          legalName: (inv.Client as { legalName?: string | null } | undefined)?.legalName ?? undefined,
          city: (inv.Client as { city?: string | null } | undefined)?.city ?? undefined,
          postalCode: (inv.Client as { postalCode?: string | null } | undefined)?.postalCode ?? undefined,
          country: (inv.Client as { country?: string | null } | undefined)?.country ?? undefined,
        }
  // 3. Load invoice items
  const issuedItemsSnapshot = inv.lines.map((l) => ({
    description: l.description,
    quantity: l.quantity,
    unitPrice: l.unitPrice,
    taxPercent: l.taxPercent,
    subtotal: l.subtotal,
    taxAmount: l.taxAmount,
    total: l.total,
  }))
  // 4. Calculate / store totals
  const issuedTotalsSnapshot = {
    subtotal: inv.subtotal,
    taxAmount: inv.taxAmount,
    total: inv.total,
    currency: inv.currency,
  }
  await repo.updateNumberStatusAndSnapshots(invoiceId, userId, {
    number,
    status: INVOICE_STATUS.SENT,
    issuedAt,
    issuedCompanySnapshot: issuedCompanySnapshot as Prisma.InputJsonValue,
    issuedClientSnapshot: issuedClientSnapshot as Prisma.InputJsonValue,
    issuedItemsSnapshot: issuedItemsSnapshot as Prisma.InputJsonValue,
    issuedTotalsSnapshot: issuedTotalsSnapshot as Prisma.InputJsonValue,
  })
  await repo.addEvent(invoiceId, "SENT", {
    at: issuedAt.toISOString(),
    number,
    userId,
    label: "Factura emitida oficialmente",
  })
  if (process.env.NODE_ENV === "development") {
    console.log("NUMBER ASSIGNED:", number)
    console.log("SEQUENCE USED:", sequenceUsed)
  }
  // Generate PDF when invoice is issued (stored for download / email)
  const { generateInvoicePDF } = await import("../pdf/generator")
  generateInvoicePDF(invoiceId, userId, { forceRegenerate: true }).catch((e) =>
    console.error("PDF generation after issue failed:", e)
  )
  const rectifiesId = (inv as { rectifiesInvoiceId?: string | null }).rectifiesInvoiceId
  if (rectifiesId) {
    await repo.addEvent(rectifiesId, "RECTIFICATION_ISSUED", {
      at: issuedAt.toISOString(),
      rectifyingNumber: number,
      rectifyingInvoiceId: invoiceId,
    })
  }
  if (inv.clientId) {
    const { recalculate } = await import("../behaviour/payment-behaviour.service")
    recalculate(inv.clientId).catch((e) => console.error("Payment profile recalc after issue:", e))
  }
  return { success: true }
}

/**
 * Update a draft invoice (dates, notes, terms, lines). Only DRAFT can be updated.
 */
export async function updateDraftInvoice(
  invoiceId: string,
  userId: string,
  payload: {
    issueDate: Date
    dueDate: Date
    serviceDate?: Date | null
    notes?: string | null
    terms?: string | null
    currency?: string
    priceMode?: import("../types").PriceMode
    paymentMethod?: string | null
    iban?: string | null
    bic?: string | null
    paymentReference?: string | null
    clientSnapshot?: import("../types").ClientSnapshotInput | null
    lines: CreateInvoiceInput["lines"]
  }
): Promise<boolean> {
  const inv = await repo.findById(invoiceId, userId)
  if (!inv || inv.status !== INVOICE_STATUS.DRAFT) return false
  const priceMode = payload.priceMode ?? "base"
  const computed = engine.calculateTotals(payload.lines, priceMode)
  const { subtotal, taxAmount, total } = engine.aggregateLineTotals(computed)
  await repo.updateDraft(invoiceId, userId, {
    issueDate: payload.issueDate,
    dueDate: payload.dueDate,
    serviceDate: payload.serviceDate ?? null,
    notes: payload.notes ?? null,
    terms: payload.terms ?? null,
    currency: payload.currency ?? inv.currency,
    paymentMethod: payload.paymentMethod ?? null,
    iban: payload.iban ?? null,
    bic: payload.bic ?? null,
    paymentReference: payload.paymentReference ?? null,
    issuedClientSnapshot: payload.clientSnapshot ?? undefined,
    subtotal,
    taxAmount,
    total,
    lines: computed,
  })
  await repo.addEvent(invoiceId, "EDITED", { at: new Date().toISOString() })
  return true
}

/**
 * Delete a draft invoice. Only DRAFT can be deleted.
 */
export async function deleteDraftInvoice(invoiceId: string, userId: string): Promise<boolean> {
  return repo.deleteDraft(invoiceId, userId)
}

/**
 * Cancel an invoice. Only DRAFT or SENT can be canceled.
 */
export async function cancelInvoice(invoiceId: string, userId: string): Promise<boolean> {
  const inv = await repo.findById(invoiceId, userId)
  if (!inv) return false
  const allowed: InvoiceStatus[] = [INVOICE_STATUS.DRAFT, INVOICE_STATUS.SENT]
  if (!allowed.includes(inv.status as InvoiceStatus)) return false
  await repo.updateStatus(invoiceId, userId, INVOICE_STATUS.CANCELED)
  await repo.addEvent(invoiceId, "CANCELED", { at: new Date().toISOString() })
  return true
}

export type CreateRectificationResult =
  | { success: true; id: string }
  | { success: false; error: string }

/**
 * Create a rectifying invoice (credit/rectificativa). Only from issued invoices.
 * TOTAL = clone with negative amounts. PARTIAL = draft with one zero line for user to edit.
 */
export async function createRectification(
  originalInvoiceId: string,
  userId: string,
  params: { reason: string; type: "TOTAL" | "PARTIAL" }
): Promise<CreateRectificationResult> {
  const original = await repo.findById(originalInvoiceId, userId)
  if (!original) return { success: false, error: "Factura no encontrada" }
  if (original.status === INVOICE_STATUS.DRAFT) {
    return { success: false, error: "Solo se puede crear rectificativa de facturas emitidas." }
  }
  const orig = original as { rectifiesInvoiceId?: string | null }
  if (orig.rectifiesInvoiceId != null) {
    return { success: false, error: "No se puede crear rectificativa de una factura rectificativa." }
  }
  const reason = params.reason?.trim()
  if (!reason) return { success: false, error: "El motivo es obligatorio." }

  const now = new Date()
  const due = new Date(now)
  due.setDate(due.getDate() + 30)
  const clientSnap = (original as { issuedClientSnapshot?: unknown }).issuedClientSnapshot ?? undefined

  if (params.type === "TOTAL") {
    const neg = (n: number) => Math.round(-n * 100) / 100
    const lines = original.lines.map((l) => ({
      description: l.description,
      quantity: l.quantity,
      unitPrice: neg(l.unitPrice),
      discountPercent: l.discountPercent ?? null,
      taxPercent: l.taxPercent,
      subtotal: neg(l.subtotal),
      taxAmount: neg(l.taxAmount),
      total: neg(l.total),
    }))
    const subtotal = neg(original.subtotal)
    const taxAmount = neg(original.taxAmount)
    const total = neg(original.total)
    const created = await repo.create({
      userId,
      number: engine.DRAFT_NUMBER_PLACEHOLDER,
      series: original.series,
      type: "CUSTOMER",
      clientId: original.clientId,
      issueDate: now,
      dueDate: due,
      serviceDate: original.serviceDate,
      currency: original.currency,
      invoiceLanguage: original.invoiceLanguage ?? null,
      subtotal,
      taxAmount,
      total,
      status: INVOICE_STATUS.DRAFT,
      notes: `Rectificativa total. Motivo: ${reason}`,
      terms: original.terms,
      paymentMethod: original.paymentMethod ?? null,
      iban: original.iban ?? null,
      bic: original.bic ?? null,
      paymentReference: original.paymentReference ?? null,
      issuedClientSnapshot: clientSnap as Prisma.InputJsonValue,
      isRectification: true,
      rectifiesInvoiceId: originalInvoiceId,
      rectificationReason: reason,
      lines,
    })
    await repo.addEvent(created.id, "RECTIFIES", {
      originalNumber: original.number,
      at: now.toISOString(),
    })
    return { success: true, id: created.id }
  }

  const lines = [
    {
      description: "Rectificación parcial — editar líneas e importes",
      quantity: 1,
      unitPrice: 0,
      discountPercent: null as number | null,
      taxPercent: 0,
      subtotal: 0,
      taxAmount: 0,
      total: 0,
    },
  ]
  const created = await repo.create({
    userId,
    number: engine.DRAFT_NUMBER_PLACEHOLDER,
    series: original.series,
    type: "CUSTOMER",
    clientId: original.clientId,
    issueDate: now,
    dueDate: due,
    serviceDate: null,
    currency: original.currency,
    invoiceLanguage: original.invoiceLanguage ?? null,
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    status: INVOICE_STATUS.DRAFT,
    notes: `Rectificativa parcial. Motivo: ${reason}`,
    terms: null,
    paymentMethod: original.paymentMethod ?? null,
    iban: original.iban ?? null,
    bic: original.bic ?? null,
    paymentReference: original.paymentReference ?? null,
    issuedClientSnapshot: clientSnap as Prisma.InputJsonValue,
    isRectification: true,
    rectifiesInvoiceId: originalInvoiceId,
    rectificationReason: reason,
    lines,
  })
  await repo.addEvent(created.id, "RECTIFIES", {
    originalNumber: original.number,
    at: now.toISOString(),
  })
  return { success: true, id: created.id }
}

/**
 * Register a payment and recompute status.
 */
export async function registerPayment(
  invoiceId: string,
  userId: string,
  payment: AddPaymentInput
): Promise<{ ok: boolean; newStatus?: string }> {
  const inv = await repo.findById(invoiceId, userId)
  const result = await engine.registerPayment(invoiceId, userId, payment)
  if (result.ok && inv?.clientId) {
    const { recalculate } = await import("../behaviour/payment-behaviour.service")
    recalculate(inv.clientId).catch((e) => console.error("Payment profile recalc after payment:", e))
  }
  return { ok: result.ok, newStatus: result.newStatus }
}

export async function getInvoice(invoiceId: string, userId: string): Promise<InvoiceWithRelations | null> {
  const inv = await repo.findById(invoiceId, userId)
  return inv as InvoiceWithRelations | null
}

export type IssueEligibility = { canIssue: boolean; validationErrors: string[] }

/** Returns whether a draft invoice can be issued (legal validation). Use to disable issue button. */
export async function getIssueEligibility(invoiceId: string, userId: string): Promise<IssueEligibility | null> {
  const inv = await repo.findById(invoiceId, userId)
  if (!inv || inv.status !== INVOICE_STATUS.DRAFT) {
    return { canIssue: false, validationErrors: [] }
  }

  // Debug logs for issue eligibility
  if (process.env.NODE_ENV === "development") {
    console.log("ISSUE ELIGIBILITY CHECK FOR INVOICE:", invoiceId)
    if (inv.Client) {
      console.log("CLIENT DATA USED:", {
        id: inv.Client.id,
        legalName: inv.Client.legalName,
        taxId: inv.Client.taxId,
        address: inv.Client.address,
        postalCode: inv.Client.postalCode,
        city: inv.Client.city,
        country: inv.Client.country,

      })
    }
  }

  // 1. Check client fiscal completeness (strict)
  const { calculateFiscalCompleteness } = await import("@/lib/clients/calculateFiscalCompleteness")

  // Re-calculate completeness on fresh data (DB) to be safe
  const clientComplete = calculateFiscalCompleteness(inv.Client)
  if (process.env.NODE_ENV === "development") {
    console.log("CALCULATED COMPLETENESS:", clientComplete)
  }

  const validationErrors: string[] = []
  if (!clientComplete) {
    validationErrors.push("Faltan datos fiscales del cliente (comprobar Nombre, NIF, Dirección, Ciudad, CP, País)")
  }

  // 2. Check emitter (branding) completeness
  const { getBrandingForUser } = await import("../pdf/branding")
  const branding = await getBrandingForUser(userId)
  const { validateForIssue } = await import("@/lib/invoicing/legalValidator")
  const address =
    typeof branding.address === "string" && branding.address.trim() ? branding.address : undefined

  // Validate emitter only. Pass a dummy valid client to ignore client errors from this specific validator.
  const emitterValidation = validateForIssue(
    { companyName: branding.companyName, taxId: branding.taxId, address },
    { name: "Valid", isCompany: false }
  )
  if (!emitterValidation.valid) {
    // Filter to only include emitter related errors if any
    const emitterErrors = emitterValidation.errors.filter(e => e.includes("emisora") || e.includes("empresa"))
    validationErrors.push(...emitterErrors)
  }

  return {
    canIssue: validationErrors.length === 0,
    validationErrors,
  }
}

export type ListInvoicesOptions = import("../repositories/invoice.repository").ListInvoicesOptions

export async function listInvoices(userId: string, options?: ListInvoicesOptions) {
  return repo.listByUser(userId, options)
}

export type InvoiceKPIs = {
  outstanding: number
  paidThisMonth: number
  overdueCount: number
  averagePaymentDays: number | null
}

/** KPI aggregates for the invoicing dashboard. */
export async function getInvoiceKPIs(userId: string, _period: "month" | "quarter" | "year" = "month"): Promise<InvoiceKPIs> {
  const now = new Date()
  const list = await repo.listByUser(userId, { limit: 2000 })
  let outstanding = 0
  let paidThisMonth = 0
  let overdueCount = 0
  const paidDurations: number[] = []
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  for (const inv of list) {
    const total = inv.total
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0)
    if (inv.status !== INVOICE_STATUS.PAID && inv.status !== INVOICE_STATUS.CANCELED) {
      outstanding += total - paid
      if (inv.status === INVOICE_STATUS.OVERDUE) overdueCount += 1
    }
    if (inv.status === INVOICE_STATUS.PAID && inv.paidAt) {
      const paidAt = new Date(inv.paidAt)
      if (paidAt >= monthStart && paidAt <= monthEnd) paidThisMonth += total
      paidDurations.push(
        Math.round((paidAt.getTime() - new Date(inv.issueDate).getTime()) / (1000 * 60 * 60 * 24))
      )
    }
  }
  const averagePaymentDays =
    paidDurations.length > 0
      ? paidDurations.reduce((a, b) => a + b, 0) / paidDurations.length
      : null
  return { outstanding, paidThisMonth, overdueCount, averagePaymentDays }
}
