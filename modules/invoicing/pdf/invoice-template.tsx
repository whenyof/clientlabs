/**
 * Invoice PDF template — document structure and content.
 * Defines sections (header, client, info, table, totals, footer) and builds content from invoice + branding.
 * No inline styles; layout and styles live in styles.ts and invoice-renderer.
 */

import type { InvoicePdfData, InvoiceLinePdf } from "./types"
import { DRAFT_NUMBER_PLACEHOLDER } from "@/modules/invoicing/engine/invoice.engine"
import { recargoRateForVat } from "@/modules/invoicing/utils/vatRates"

export type InvoiceDocumentModel = {
  header: {
    companyName: string
    legalName?: string | null
    taxId: string
    address: string
    email: string
    phone: string
    website: string | null
    logoUrl: string | null
  }
  recipient: {
    label: string
    name: string
    taxId: string
    address: string
    email: string
    phone: string
  }
  invoiceInfo: {
    number: string
    numberLabel: string
    issueDate: string
    dueDate: string
    serviceDate: string | null
    /** "FACTURA COMPLETA" | "FACTURA SIMPLIFICADA" | "FACTURA RECTIFICATIVA (R1)" etc. */
    invoiceTypeTitle: string
  }
  invoiceStatus: string
  invoiceDocType: string | null
  /** When present, PDF shows "FACTURA RECTIFICATIVA" and original ref */
  rectification?: {
    title: string
    originalNumber: string
    originalIssueDate: string
    reason: string
    method?: string | null
  }
  table: {
    headers: string[]
    rows: Array<{
      description: string
      quantity: string
      unitPrice: string
      tax: string
      total: string
    }>
  }
  totals: {
    subtotal: string
    taxAmount: string
    taxBreakdown: Array<{ rate: number; base: string; taxAmount: string }>
    irpfRate?: number | null
    irpfAmount?: string | null
    /** Recargo de equivalencia por tipo de IVA (incluido en total) */
    recargoBreakdown: Array<{ rate: number; amount: string }>
    total: string
    /** Total − retención IRPF (neto). Solo presente cuando hay retención. */
    totalAPagar?: string | null
    currency: string
  }
  footer: {
    legal: string
    paymentConditions: string
    paymentMethod: string
    iban: string
    bic: string
    paymentReference: string
    notes: string | null
    terms: string | null
    verifactuQr?: string | null
    verifactuUrl?: string | null
  }
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d)
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function buildInvoiceTypeTitle(data: InvoicePdfData): string {
  if (data.isRectification) {
    const dt = (data.invoiceDocType ?? "").toUpperCase()
    if (/^R[1-5]$/.test(dt)) return `FACTURA RECTIFICATIVA (${dt})`
    return "FACTURA RECTIFICATIVA"
  }
  const dt = (data.invoiceDocType ?? "F1").toUpperCase()
  if (dt === "F2") return "FACTURA SIMPLIFICADA"
  return "FACTURA COMPLETA"
}

/**
 * Builds the document model for the invoice PDF. Used by invoice-renderer.
 */
export function buildInvoiceDocument(data: InvoicePdfData): InvoiceDocumentModel {
  const { branding, recipient, lines, currency } = data
  const issueDate = new Date(data.issueDate)
  const dueDate = new Date(data.dueDate)
  const serviceDate = data.serviceDate ? new Date(data.serviceDate) : null

  return {
    header: {
      companyName: branding.companyName,
      legalName: branding.legalName ?? null,
      taxId: branding.taxId,
      address: branding.address,
      email: branding.email,
      phone: branding.phone,
      website: branding.website ?? null,
      logoUrl: branding.logoUrl,
    },
    recipient: {
      label: data.type === "VENDOR" ? "Proveedor" : "Cliente",
      name: recipient.name ?? "",
      taxId: recipient.taxId ?? "",
      address: recipient.address ?? "",
      email: recipient.email ?? "",
      phone: recipient.phone ?? "",
    },
    invoiceInfo: {
      // El número visible debe ser exactamente serie+número registrados en la AEAT
      number:
        data.number && data.number !== DRAFT_NUMBER_PLACEHOLDER && data.series
          ? `${data.series}-${data.number}`
          : data.number,
      numberLabel: "Nº factura",
      issueDate: formatDate(issueDate),
      dueDate: formatDate(dueDate),
      serviceDate: serviceDate ? formatDate(serviceDate) : null,
      invoiceTypeTitle: buildInvoiceTypeTitle(data),
    },
    invoiceStatus: data.status,
    invoiceDocType: data.invoiceDocType ?? null,
    ...(data.isRectification && (data.originalInvoiceNumber != null || data.rectificationReason)
      ? {
          rectification: {
            title: buildInvoiceTypeTitle(data),
            originalNumber: data.originalInvoiceNumber ?? "—",
            originalIssueDate: data.originalIssueDate
              ? formatDate(new Date(data.originalIssueDate))
              : "—",
            reason: data.rectificationReason ?? "—",
            method: data.rectificationMethod ?? null,
          },
        }
      : {}),
    table: {
      headers: ["Concepto", "Cant.", "P. unit.", "Impuestos", "Total"],
      rows: lines.map((line: InvoiceLinePdf) => ({
        description: line.description.slice(0, 60),
        quantity: String(Number(line.quantity)),
        unitPrice: formatMoney(line.unitPrice, currency),
        tax: `${Number(line.taxPercent).toFixed(1)} %`,
        total: formatMoney(line.total, currency),
      })),
    },
    totals: {
      subtotal: formatMoney(data.subtotal, currency),
      taxAmount: formatMoney(data.taxAmount, currency),
      taxBreakdown: (() => {
        const byRate = new Map<number, { base: number; tax: number }>()
        for (const line of lines) {
          const r = line.taxPercent
          const cur = byRate.get(r) ?? { base: 0, tax: 0 }
          byRate.set(r, { base: cur.base + line.subtotal, tax: cur.tax + line.taxAmount })
        }
        return Array.from(byRate.entries())
          .sort((a, b) => b[0] - a[0])
          .map(([rate, { base, tax }]) => ({
            rate,
            base: formatMoney(base, currency),
            taxAmount: formatMoney(tax, currency),
          }))
      })(),
      irpfRate: data.irpfRate ?? null,
      irpfAmount: data.irpfAmount && data.irpfAmount > 0 ? formatMoney(data.irpfAmount, currency) : null,
      recargoBreakdown: data.recargoEquivalencia
        ? (() => {
            // Recargo por tipo de IVA, reconstruido como en el engine (round2 por línea)
            const round2 = (n: number) => Math.round(n * 100) / 100
            const byRate = new Map<number, number>()
            for (const line of lines) {
              const rec = round2(line.subtotal * (recargoRateForVat(line.taxPercent) / 100))
              if (rec !== 0) byRate.set(line.taxPercent, round2((byRate.get(line.taxPercent) ?? 0) + rec))
            }
            return Array.from(byRate.entries())
              .sort((a, b) => b[0] - a[0])
              .map(([vatRate, amount]) => ({
                rate: recargoRateForVat(vatRate),
                amount: formatMoney(amount, currency),
              }))
          })()
        : [],
      total: formatMoney(data.total, currency),
      totalAPagar:
        data.irpfAmount && data.irpfAmount > 0
          ? formatMoney(data.total - data.irpfAmount, currency)
          : null,
      currency,
    },
    footer: {
      legal: branding.legalFooter ?? "",
      paymentConditions: branding.paymentConditions ?? "",
      paymentMethod: data.paymentMethod ?? "",
      iban: data.iban ?? "",
      bic: data.bic ?? "",
      paymentReference: data.paymentReference ?? "",
      notes: data.notes,
      terms: data.terms,
      verifactuQr: data.verifactuQr ?? null,
      verifactuUrl: data.verifactuUrl ?? null,
    },
  }
}
