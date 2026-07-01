import "server-only"
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
import { invalidateUserAggregates } from "@/lib/cache/aggregates"
import * as repo from "../repositories/invoice.repository"
import * as engine from "../engine/invoice.engine"
import type { CreateInvoiceInput, AddPaymentInput, InvoiceWithRelations, InvoiceStatus } from "../types"
import { INVOICE_STATUS } from "../types"
import { recargoRateForVat } from "../utils/vatRates"
// Verifactu is imported dynamically inside issueInvoice to avoid top-level server-only constraints

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
  // Recargo de equivalencia: se lee del cliente en BD (no del payload del navegador)
  let recargoEquivalencia = false
  if (input.clientId) {
    const client = await prisma.client.findFirst({
      where: { id: input.clientId, userId: input.userId },
      select: { recargoEquivalencia: true },
    })
    recargoEquivalencia = client?.recargoEquivalencia === true
  }
  const computed = engine.calculateTotals(input.lines, priceMode, { recargoEquivalencia })
  const { subtotal, taxAmount, total, recargoAmount } = engine.aggregateLineTotals(computed)
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
    invoiceDocType: input.invoiceDocType ?? "F1",
    recargoEquivalencia,
    recargoAmount: recargoEquivalencia ? recargoAmount : 0,
    lines: computed,
  })
  await repo.addEvent(invoice.id, "CREATED", { at: new Date().toISOString() })

  await invalidateUserAggregates(input.userId)
  return { id: invoice.id, number: invoice.number }
}

/**
 * Non-blocking fiscal check for the draft-creation moment. Mirrors the warning the
 * normal Facturas flow shows when creating an invoice, so the orders flow has parity.
 * Returns a human message when the emitter (Ajustes) — or, failing that, the selected
 * client — is missing the fiscal data required to later issue the invoice, or null
 * when everything is in order. Does NOT block creation; the hard gate stays in
 * checkIssueEligibility at issue time.
 */
export async function getDraftFiscalWarning(
  userId: string,
  clientId: string | null,
): Promise<string | null> {
  const { getBrandingForUser } = await import("../pdf/branding")
  const { validateForIssue } = await import("@/lib/invoicing/legalValidator")
  const branding = await getBrandingForUser(userId)
  const address =
    typeof branding.address === "string" && branding.address.trim() ? branding.address : undefined
  // Dummy-valid client isolates the result to emitter completeness only.
  const emitter = validateForIssue(
    { companyName: branding.companyName, taxId: branding.taxId, address },
    { name: "Valid", isCompany: false },
  )
  if (!emitter.valid) {
    return emitter.errors[0] ?? "Completa tus datos fiscales en Ajustes antes de emitir"
  }
  if (clientId) {
    const { calculateFiscalCompleteness } = await import("@/lib/clients/calculateFiscalCompleteness")
    const client = await prisma.client.findFirst({
      where: { id: clientId, userId },
      select: { legalName: true, taxId: true, address: true, postalCode: true, city: true, country: true },
    })
    if (!calculateFiscalCompleteness(client)) {
      return "Faltan datos fiscales del cliente para emitir la factura. Complétalos en la ficha del cliente."
    }
  }
  return null
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
    include: { Client: true, items: { take: 1 } },
  })
  if (!sale || !sale.clientId) return null

  const total = Number(sale.total)
  const tax = Number((sale as any).taxTotal ?? 0)
  const subtotalLine = Math.round((total - tax) * 100) / 100
  const taxPct = subtotalLine > 0 ? Math.round((tax / subtotalLine) * 10000) / 100 : 0
  const firstItem = (sale.items?.[0] as { product?: string | null } | undefined)
  const lines: CreateInvoiceInput["lines"] = [
    {
      description: firstItem?.product ?? "Venta",
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
export interface VerifactuSendResult {
  sent: boolean
  skipped?: string
  error?: string
  /** "validation" = rechazo 400/422 (el usuario debe corregir); "transient" = red/5xx (reintentar) */
  errorType?: "validation" | "transient"
  uuid?: string
  estado?: string
}

/**
 * Envía una factura emitida a Verifactu y persiste uuid/estado/qr/huella.
 * Extraído tal cual del bloque inline de issueInvoice — mismo payload, mismo
 * orden, misma persistencia. Nunca lanza: los errores se devuelven en el
 * resultado (la emisión no debe fallar por Verifactu).
 * La cabecera Idempotency-Key (determinista por invoiceId) hace seguro el
 * reintento: replica la respuesta original en vez de duplicar el registro.
 */
export async function sendInvoiceToVerifactu(invoiceId: string, userId: string): Promise<VerifactuSendResult> {
  try {
    const inv = await repo.findById(invoiceId, userId)
    if (!inv) return { sent: false, error: "Factura no encontrada" }
    if (inv.type !== "CUSTOMER") return { sent: false, skipped: "type" }
    const existingUuid = (inv as { verifactuUuid?: string | null }).verifactuUuid
    if (existingUuid) return { sent: false, skipped: "already-sent", uuid: existingUuid }
    const number = inv.number
    const issuedAt = (inv as { issuedAt?: Date | null }).issuedAt ?? inv.issueDate
    const issuedClientSnapshot = (inv as { issuedClientSnapshot?: unknown }).issuedClientSnapshot

    const { resolveVerifactuApiKey, createVerifactuInvoice: sendToVerifactu, formatDateForVerifactu } = await import("@/lib/verifactu")
    const nifApiKey = await resolveVerifactuApiKey(userId)
    if (!nifApiKey) {
      console.log("[Verifactu] SKIP: no hay API key configurada (ni personal ni env VERIFACTI_ACCOUNT_KEY)")
      return { sent: false, skipped: "no-api-key" }
    }
    const bizProfile2 = await prisma.businessProfile.findUnique({
      where: { userId },
      select: { verifactuEnabled: true },
    })
    if (!bizProfile2?.verifactuEnabled) {
      console.log("[Verifactu] SKIP: verifactuEnabled=false en BusinessProfile del usuario", userId)
      return { sent: false, skipped: "disabled" }
    }
    const clientSnap = issuedClientSnapshot as Record<string, unknown>
    const clientTaxId = typeof clientSnap?.taxId === "string" ? clientSnap.taxId : undefined
    const clientName = typeof clientSnap?.name === "string" ? clientSnap.name : undefined
    const invoiceDocType = (inv as { invoiceDocType?: string | null }).invoiceDocType ?? "F1"
    const rectificationMethod = (inv as { rectificationMethod?: string | null }).rectificationMethod ?? "S"
    const isRectificative = ["R1", "R2", "R3", "R4", "R5"].includes(invoiceDocType)

    // Group lines by tax rate for accurate reporting
    // Recargo de equivalencia: clave_regimen "18" + tipo/cuota por línea (doc Verifacti).
    // La cuota se reconstruye igual que en el engine: round2 por línea, sumado por grupo.
    const hasRecargo = (inv as { recargoEquivalencia?: boolean }).recargoEquivalencia === true
    const round2 = (n: number) => Math.round(n * 100) / 100
    const taxGroups = new Map<number, { base: number; tax: number; recargo: number }>()
    for (const line of inv.lines) {
      const rate = line.taxPercent ?? 0
      const existing = taxGroups.get(rate) ?? { base: 0, tax: 0, recargo: 0 }
      existing.base += line.subtotal
      existing.tax += line.taxAmount
      if (hasRecargo) existing.recargo += round2(line.subtotal * (recargoRateForVat(rate) / 100))
      taxGroups.set(rate, existing)
    }
    const lineas = taxGroups.size > 0
      ? Array.from(taxGroups.entries()).map(([rate, { base, tax, recargo }]) => ({
          base_imponible: base.toFixed(2),
          tipo_impositivo: rate.toFixed(2),
          cuota_repercutida: tax.toFixed(2),
          ...(hasRecargo && {
            clave_regimen: "18",
            tipo_recargo_equivalencia: String(recargoRateForVat(rate)),
            cuota_recargo_equivalencia: round2(recargo).toFixed(2),
          }),
        }))
      : [{ base_imponible: inv.subtotal.toFixed(2), tipo_impositivo: "0.00", cuota_repercutida: "0.00" }]

    // Build description from lines or notes
    const firstLineDesc = inv.lines[0]?.description
    // Verifacti exige descripcion de 1-500 caracteres
    const descripcion = (firstLineDesc || inv.notes?.substring(0, 100) || `Factura ${inv.series}-${number}`).substring(0, 500)

    const data: import("@/lib/verifactu").VerifactuCreateData = {
      serie: inv.series || "CL",
      numero: number,
      fecha_expedicion: formatDateForVerifactu(issuedAt),
      tipo_factura: invoiceDocType as import("@/lib/verifactu").AllInvoiceTypes,
      descripcion,
      ...(clientTaxId && invoiceDocType !== "F2" && invoiceDocType !== "R5" && { nif: clientTaxId }),
      ...(clientName && invoiceDocType !== "F2" && invoiceDocType !== "R5" && { nombre: clientName }),
      lineas,
      importe_total: inv.total.toFixed(2),
    }

    // For rectifications, add mandatory fields
    if (isRectificative) {
      const method = rectificationMethod as import("@/lib/verifactu").RectificationMethod
      data.tipo_rectificativa = method
      const rectifiesId = (inv as { rectifiesInvoiceId?: string | null }).rectifiesInvoiceId
      if (rectifiesId) {
        const originalInv = await prisma.invoice.findUnique({
          where: { id: rectifiesId },
          select: { series: true, number: true, issueDate: true, total: true, subtotal: true, taxAmount: true },
        })
        if (originalInv) {
          data.factura_rectificada_serie = originalInv.series || "CL"
          data.factura_rectificada_numero = originalInv.number
          data.factura_rectificada_fecha = formatDateForVerifactu(originalInv.issueDate)
          // importe_rectificativa object required for "S" and "I"
          if (method === "S") {
            data.importe_rectificativa = {
              base_rectificada: Math.abs(originalInv.subtotal.toNumber()).toFixed(2),
              cuota_rectificada: Math.abs(originalInv.taxAmount.toNumber()).toFixed(2),
            }
          } else if (method === "I") {
            data.importe_rectificativa = {
              base_rectificada: Math.abs(Number(inv.subtotal)).toFixed(2),
              cuota_rectificada: Math.abs(Number(inv.taxAmount)).toFixed(2),
            }
          }
        }
      }
    }

    console.log("[Verifactu] Enviando factura:", JSON.stringify(data))
    const result = await sendToVerifactu(nifApiKey, data, `clientlabs-invoice-${inv.id}`)
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        verifactuUuid: result.uuid,
        verifactuStatus: result.estado,
        verifactuQr: result.qr || null,
        verifactuHuella: result.huella || null,
        verifactuUrl: result.url || null,
        verifactuSentAt: new Date(),
      },
    })
    console.log("[Verifactu] OK — UUID:", result.uuid, "Estado:", result.estado)
    return { sent: true, uuid: result.uuid, estado: result.estado }
  } catch (err) {
    console.error("[Verifactu] Error al enviar factura:", err instanceof Error ? err.message : err)
    const { isVerifactuValidationError } = await import("@/lib/verifactu")
    return {
      sent: false,
      error: err instanceof Error ? err.message : String(err),
      // Solo bloquea la certeza de datos inválidos; ante la duda → transitorio
      errorType: isVerifactuValidationError(err) ? "validation" : "transient",
    }
  }
}

export async function issueInvoice(invoiceId: string, userId: string): Promise<IssueInvoiceResult> {
  const inv = await repo.findById(invoiceId, userId)
  if (!inv) return { success: false, validationErrors: ["Factura no encontrada"] }
  if (inv.status !== INVOICE_STATUS.DRAFT) return { success: true }

  // 0. Enforce fiscal completeness (backend safety).
  // F2 (simplificada) no exige NIF/dirección del destinatario, así que solo se
  // aplica el bloqueo a facturas completas (F1). Ver calculateFiscalCompleteness.
  const issueDocType = (inv as { invoiceDocType?: string | null }).invoiceDocType
  if (inv.clientId && issueDocType !== "F2") {
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
  // F1 y rectificativas R1-R4 exigen NIF y nombre del destinatario (AEAT).
  // Se comprueba ANTES de consumir número para no generar huecos en la serie.
  if (inv.type === "CUSTOMER") {
    const docType = (inv as { invoiceDocType?: string | null }).invoiceDocType ?? "F1"
    if (["F1", "R1", "R2", "R3", "R4"].includes(docType)) {
      const snap = (inv as { issuedClientSnapshot?: unknown }).issuedClientSnapshot as Record<string, unknown> | null
      const snapTaxId = typeof snap?.taxId === "string" ? snap.taxId.trim() : ""
      const snapName = typeof snap?.name === "string" ? snap.name.trim() : ""
      const clientTaxId = snapTaxId || ((inv.Client as { taxId?: string | null } | undefined)?.taxId ?? "").trim()
      const clientName = snapName || (inv.Client?.name ?? (inv.Client as { legalName?: string | null } | undefined)?.legalName ?? "").trim()
      if (!clientTaxId || !clientName) {
        return {
          success: false,
          validationErrors: [
            "Una factura completa (F1) requiere NIF y nombre del cliente. Para facturar sin identificar al cliente, usa factura simplificada (F2).",
          ],
        }
      }
    }
  }
  const issuedAt = new Date()
  let number: string
  let sequenceUsed: number
  // Número reservado de un rechazo Verifacti anterior: se reutiliza (sin huecos)
  const reservedNumber = (inv as { verifactuReservedNumber?: string | null }).verifactuReservedNumber
  const reservedSeries = (inv as { verifactuReservedSeries?: string | null }).verifactuReservedSeries
  const usingReservedNumber = Boolean(reservedNumber && reservedSeries === inv.series)
  if (usingReservedNumber && reservedNumber) {
    number = reservedNumber
    sequenceUsed = Number(reservedNumber.split("-")[1] ?? 0)
  } else {
    try {
      const result = await engine.getNextIssuedInvoiceNumber(userId, inv.series, issuedAt)
      number = result.number
      sequenceUsed = result.sequenceUsed
    } catch (e) {
      console.error("Invoice number generation failed:", e)
      return { success: false, validationErrors: ["No se pudo asignar el número de factura. Intente de nuevo."] }
    }
  }
  const issuedCompanySnapshot = {
    companyName: branding.companyName,
    legalName: branding.legalName ?? null,
    taxId: branding.taxId,
    address: branding.address,
    province: branding.province ?? null,
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
          province: (inv.Client as { province?: string | null } | undefined)?.province ?? undefined,
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
    irpfRate: (inv as { irpfRate?: number | null }).irpfRate ?? null,
    irpfAmount: (inv as { irpfAmount?: number | null }).irpfAmount ?? null,
    recargoEquivalencia: (inv as { recargoEquivalencia?: boolean }).recargoEquivalencia ?? false,
    recargoAmount: (inv as { recargoAmount?: number | null }).recargoAmount ?? null,
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

  // Envío a Verifactu — el helper nunca lanza. Un rechazo de VALIDACIÓN
  // (400/422: datos inválidos) bloquea la emisión; lo transitorio no.
  const verifactu = await sendInvoiceToVerifactu(invoiceId, userId)

  if (verifactu.errorType === "validation") {
    // Revertir la emisión SIN dejar huecos de numeración:
    // 1) intentar devolver el número al contador (CAS — aplica si nadie consumió después)
    // 2) si no aplica, reservar el número en la factura para reutilizarlo al re-emitir
    let rolledBack = false
    if (!usingReservedNumber) {
      const seriesKey = `${inv.series}-${issuedAt.getFullYear()}`
      rolledBack = await repo.rollbackConsumedNumber(userId, seriesKey, sequenceUsed)
    }
    await repo.revertIssue(invoiceId, userId, {
      draftPlaceholder: engine.DRAFT_NUMBER_PLACEHOLDER,
      reservedNumber: rolledBack ? null : number,
      reservedSeries: rolledBack ? null : inv.series,
    })
    await repo.addEvent(invoiceId, "VERIFACTU_REJECTED", {
      at: issuedAt.toISOString(),
      message: verifactu.error ?? "Rechazo de validación",
    })
    return {
      success: false,
      validationErrors: [
        `Verifacti rechazó la factura: ${verifactu.error ?? "datos inválidos"}. Corrige los datos y vuelve a emitir.`,
      ],
    }
  }

  if (verifactu.errorType === "transient") {
    // Emitida pero sin registrar: estado "Error" → badge "Reintentando" + botón de reintento
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { verifactuStatus: "Error" },
    }).catch(() => {})
  }

  if (usingReservedNumber) {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { verifactuReservedNumber: null, verifactuReservedSeries: null },
    }).catch(() => {})
  }

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
  // PDF generation is done by the API route when the user requests the PDF
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
  await invalidateUserAggregates(userId)
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
  // Conservar el recargo de equivalencia con el que se creó el borrador
  const recargoEquivalencia = (inv as { recargoEquivalencia?: boolean }).recargoEquivalencia === true
  const computed = engine.calculateTotals(payload.lines, priceMode, { recargoEquivalencia })
  const { subtotal, taxAmount, total, recargoAmount } = engine.aggregateLineTotals(computed)
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
    recargoAmount: recargoEquivalencia ? recargoAmount : 0,
    lines: computed,
  })
  await repo.addEvent(invoiceId, "EDITED", { at: new Date().toISOString() })
  await invalidateUserAggregates(userId)
  return true
}

/**
 * Delete a draft invoice. Only DRAFT can be deleted.
 */
export async function deleteDraftInvoice(invoiceId: string, userId: string): Promise<boolean> {
  // Un borrador con número reservado (rechazo Verifacti pendiente de corregir)
  // no puede borrarse: dejaría un hueco permanente en la serie. Corregir y
  // re-emitir, o intentar liberar el número al contador si nadie consumió después.
  const inv = await repo.findById(invoiceId, userId)
  const reserved = (inv as { verifactuReservedNumber?: string | null } | null)?.verifactuReservedNumber
  const reservedSeries = (inv as { verifactuReservedSeries?: string | null } | null)?.verifactuReservedSeries
  if (inv && reserved && reservedSeries) {
    const seq = Number(reserved.split("-")[1] ?? 0)
    const year = Number(reserved.split("-")[0] ?? new Date().getFullYear())
    const released = await repo.rollbackConsumedNumber(userId, `${reservedSeries}-${year}`, seq)
    if (!released) return false // no se puede liberar el número → no se puede borrar
  }
  const deleted = await repo.deleteDraft(invoiceId, userId)
  if (deleted) await invalidateUserAggregates(userId)
  return deleted
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
  await invalidateUserAggregates(userId)
  return true
}

export type CreateRectificationResult =
  | { success: true; id: string }
  | { success: false; error: string }

/**
 * Create a rectifying invoice (credit/rectificativa). Only from issued invoices.
 * TOTAL = clone with negative amounts. PARTIAL = draft with one zero line for user to edit.
 */
type CustomLine = {
  description: string; quantity: number; unitPrice: number
  taxPercent: number; subtotal: number; taxAmount: number; total: number
}

export async function createRectification(
  originalInvoiceId: string,
  userId: string,
  params: { reason: string; type: "TOTAL" | "PARTIAL"; invoiceDocType?: string; rectificationMethod?: string; lines?: CustomLine[] }
): Promise<CreateRectificationResult> {
  const original = await repo.findById(originalInvoiceId, userId)
  if (!original) return { success: false, error: "Factura no encontrada" }
  if (original.status === INVOICE_STATUS.DRAFT) {
    return { success: false, error: "Solo se puede crear rectificativa de facturas emitidas." }
  }
  const orig = original as { rectifiesInvoiceId?: string | null; invoiceDocType?: string | null }
  if (orig.rectifiesInvoiceId != null) {
    return { success: false, error: "No se puede crear rectificativa de una factura rectificativa." }
  }
  const reason = params.reason?.trim()
  if (!reason) return { success: false, error: "El motivo es obligatorio." }

  // Determine correct Verifactu type: if original was F2 → always R5, else use provided or default R1
  const originalDocType = orig.invoiceDocType ?? "F1"
  const rectDocType = originalDocType === "F2" ? "R5" : (params.invoiceDocType ?? "R1")
  // Las rectificativas van en serie propia (correlativa e independiente de la original)
  const rectSeries = `${original.series || "INV"}-R`
  // Heredar el recargo de equivalencia de la original (sus líneas/totales lo incluyen)
  const origHasRecargo = (original as { recargoEquivalencia?: boolean }).recargoEquivalencia === true
  const rectMethod = params.rectificationMethod ?? "S"

  const now = new Date()
  const due = new Date(now)
  due.setDate(due.getDate() + 30)
  const clientSnap = (original as { issuedClientSnapshot?: unknown }).issuedClientSnapshot ?? undefined

  // Helper: compute totals and map from custom lines
  const buildFromCustomLines = (customLines: CustomLine[]) => {
    const r2 = (n: number) => Math.round(n * 100) / 100
    let recargoSum = 0
    const linesOut = customLines.map((l) => {
      // El modal manda totales base+IVA; si la original llevaba recargo, se recalcula aquí
      const recargo = origHasRecargo ? r2(l.subtotal * (recargoRateForVat(l.taxPercent) / 100)) : 0
      recargoSum += recargo
      return {
        description: l.description, quantity: l.quantity, unitPrice: l.unitPrice,
        discountPercent: null as number | null, taxPercent: l.taxPercent,
        subtotal: l.subtotal, taxAmount: l.taxAmount,
        total: origHasRecargo ? r2(l.subtotal + l.taxAmount + recargo) : l.total,
      }
    })
    const subtotal = customLines.reduce((s, l) => s + l.subtotal, 0)
    const taxAmount = customLines.reduce((s, l) => s + l.taxAmount, 0)
    const total = linesOut.reduce((s, l) => s + l.total, 0)
    return { linesOut, subtotal, taxAmount, total, recargoAmount: r2(recargoSum) }
  }

  if (params.type === "TOTAL") {
    const neg = (n: number) => Math.round(-n * 100) / 100
    const { linesOut, subtotal, taxAmount, total, recargoAmount } = params.lines && params.lines.length > 0
      ? buildFromCustomLines(params.lines)
      : (() => {
          const linesOut = original.lines.map((l) => ({
            description: l.description, quantity: l.quantity, unitPrice: neg(l.unitPrice),
            discountPercent: l.discountPercent ?? null, taxPercent: l.taxPercent,
            subtotal: neg(l.subtotal), taxAmount: neg(l.taxAmount), total: neg(l.total),
          }))
          return {
            linesOut, subtotal: neg(original.subtotal), taxAmount: neg(original.taxAmount), total: neg(original.total),
            recargoAmount: neg((original as { recargoAmount?: number | null }).recargoAmount ?? 0),
          }
        })()
    const created = await repo.create({
      userId, number: engine.DRAFT_NUMBER_PLACEHOLDER, series: rectSeries,
      type: "CUSTOMER", clientId: original.clientId, issueDate: now, dueDate: due,
      serviceDate: original.serviceDate, currency: original.currency,
      invoiceLanguage: original.invoiceLanguage ?? null,
      subtotal, taxAmount, total, status: INVOICE_STATUS.DRAFT,
      recargoEquivalencia: origHasRecargo, recargoAmount: origHasRecargo ? recargoAmount : 0,
      notes: `Rectificativa total. Motivo: ${reason}`, terms: original.terms,
      paymentMethod: original.paymentMethod ?? null, iban: original.iban ?? null,
      bic: original.bic ?? null, paymentReference: original.paymentReference ?? null,
      issuedClientSnapshot: clientSnap as Prisma.InputJsonValue,
      isRectification: true, rectifiesInvoiceId: originalInvoiceId,
      rectificationReason: reason, invoiceDocType: rectDocType, rectificationMethod: rectMethod,
      lines: linesOut,
    })
    await repo.addEvent(created.id, "RECTIFIES", { originalNumber: original.number, at: now.toISOString() })
    await invalidateUserAggregates(userId)
    return { success: true, id: created.id }
  }

  const { linesOut: partialLines, subtotal: partialSub, taxAmount: partialTax, total: partialTotal, recargoAmount: partialRecargo } =
    params.lines && params.lines.length > 0
      ? buildFromCustomLines(params.lines)
      : {
          linesOut: [{ description: "Rectificación parcial — editar líneas e importes", quantity: 1, unitPrice: 0, discountPercent: null as number | null, taxPercent: 0, subtotal: 0, taxAmount: 0, total: 0 }],
          subtotal: 0, taxAmount: 0, total: 0, recargoAmount: 0,
        }
  const created = await repo.create({
    userId, number: engine.DRAFT_NUMBER_PLACEHOLDER, series: rectSeries,
    type: "CUSTOMER", clientId: original.clientId, issueDate: now, dueDate: due,
    serviceDate: null, currency: original.currency, invoiceLanguage: original.invoiceLanguage ?? null,
    subtotal: partialSub, taxAmount: partialTax, total: partialTotal,
    recargoEquivalencia: origHasRecargo, recargoAmount: origHasRecargo ? partialRecargo : 0,
    status: INVOICE_STATUS.DRAFT,
    notes: `Rectificativa parcial. Motivo: ${reason}`, terms: null,
    paymentMethod: original.paymentMethod ?? null, iban: original.iban ?? null,
    bic: original.bic ?? null, paymentReference: original.paymentReference ?? null,
    issuedClientSnapshot: clientSnap as Prisma.InputJsonValue,
    isRectification: true, rectifiesInvoiceId: originalInvoiceId,
    rectificationReason: reason, invoiceDocType: rectDocType, rectificationMethod: rectMethod,
    lines: partialLines,
  })
  await repo.addEvent(created.id, "RECTIFIES", { originalNumber: original.number, at: now.toISOString() })
  await invalidateUserAggregates(userId)
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
  // Notificación "factura cobrada" al dueño cuando el pago la deja PAGADA.
  // Best-effort: su fallo NUNCA rompe el registro del pago.
  if (result.ok && result.newStatus === "PAID" && inv) {
    const notify = (async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      })
      if (!user?.email) return
      const { sendInvoicePaidEmail } = await import("@/lib/email-service")
      await sendInvoicePaidEmail(
        user.email,
        user.name ?? "Usuario",
        inv.number,
        inv.Client?.name ?? inv.Client?.email ?? "Cliente",
        inv.total
      )
    })().catch((e) => console.error("Invoice paid email error:", e))
    try {
      const { waitUntil } = await import("@vercel/functions")
      waitUntil(notify)
    } catch {
      // fuera del runtime de Vercel (tests/worker): la promesa flotante basta
    }
  }
  if (result.ok) await invalidateUserAggregates(userId)
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

type InvoiceKPIs = {
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
