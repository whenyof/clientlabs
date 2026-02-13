/**
 * Invoice PDF generator — load invoice, render, save to storage, update DB, return URL.
 */

import { mkdir, writeFile, access, readFile } from "fs/promises"
import path from "path"
import { getBrandingForUser } from "./branding"
import { buildInvoiceDocument } from "./invoice-template"
import { renderInvoiceToBuffer } from "./invoice-renderer"
import type { InvoicePdfData } from "./types"
import * as invoiceRepo from "../repositories/invoice.repository"

const INVOICES_DIR = "public/uploads/invoices"

type InvoiceForPdf = Awaited<ReturnType<typeof invoiceRepo.findById>>

type IssuedSnapshots = {
  issuedCompanySnapshot?: unknown
  issuedClientSnapshot?: unknown
  issuedItemsSnapshot?: unknown
  issuedTotalsSnapshot?: unknown
}

function toPdfData(invoice: NonNullable<InvoiceForPdf>): InvoicePdfData {
  const recipient =
    invoice.type === "VENDOR"
      ? { name: invoice.Provider?.name ?? "—", taxId: undefined, address: undefined, email: undefined, phone: undefined }
      : {
          name: invoice.Client?.name ?? invoice.Client?.email ?? "—",
          taxId: undefined,
          address: undefined,
          email: invoice.Client?.email ?? undefined,
          phone: undefined,
        }

  const inv = invoice as {
    paymentMethod?: string | null
    iban?: string | null
    bic?: string | null
    paymentReference?: string | null
    isRectification?: boolean
    rectificationReason?: string | null
  }
  return {
    type: invoice.type as "CUSTOMER" | "VENDOR",
    number: invoice.number,
    series: invoice.series,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    serviceDate: invoice.serviceDate,
    currency: invoice.currency,
    status: invoice.status,
    notes: invoice.notes,
    terms: invoice.terms,
    paymentMethod: inv.paymentMethod ?? null,
    iban: inv.iban ?? null,
    bic: inv.bic ?? null,
    paymentReference: inv.paymentReference ?? null,
    subtotal: invoice.subtotal,
    taxAmount: invoice.taxAmount,
    total: invoice.total,
    lines: invoice.lines.map((l) => ({
      description: l.description,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      taxPercent: l.taxPercent,
      subtotal: l.subtotal,
      taxAmount: l.taxAmount,
      total: l.total,
    })),
    payments: invoice.payments.map((p) => ({ amount: p.amount, method: p.method })),
    recipient,
    branding: {} as InvoicePdfData["branding"],
    ...(inv.isRectification && {
      isRectification: true,
      rectificationReason: inv.rectificationReason ?? null,
    }),
  }
}

/** Build PDF data from immutable snapshots when invoice is already issued (legal-grade: no live reads). */
function toPdfDataFromSnapshots(
  invoice: NonNullable<InvoiceForPdf> & IssuedSnapshots,
  company: Record<string, unknown>,
  client: Record<string, unknown>,
  items: { description: string; quantity: number; unitPrice: number; taxPercent: number; subtotal: number; taxAmount: number; total: number }[],
  totals: { subtotal: number; taxAmount: number; total: number; currency: string }
): InvoicePdfData {
  const recipient = {
    name: (client.name as string) ?? "",
    taxId: client.taxId as string | undefined,
    address: client.address as string | undefined,
    email: client.email as string | undefined,
    phone: client.phone as string | undefined,
  }
  const inv = invoice as {
    paymentMethod?: string | null
    iban?: string | null
    bic?: string | null
    paymentReference?: string | null
    isRectification?: boolean
    rectificationReason?: string | null
  }
  return {
    type: invoice.type as "CUSTOMER" | "VENDOR",
    number: invoice.number,
    series: invoice.series,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    serviceDate: invoice.serviceDate,
    currency: totals.currency,
    status: invoice.status,
    notes: invoice.notes,
    terms: invoice.terms,
    paymentMethod: inv.paymentMethod ?? null,
    iban: inv.iban ?? null,
    bic: inv.bic ?? null,
    paymentReference: inv.paymentReference ?? null,
    subtotal: totals.subtotal,
    taxAmount: totals.taxAmount,
    total: totals.total,
    lines: items,
    payments: invoice.payments.map((p) => ({ amount: p.amount, method: p.method })),
    recipient,
    ...(inv.isRectification && {
      isRectification: true,
      rectificationReason: inv.rectificationReason ?? null,
    }),
    branding: {
      logoUrl: (company.logoUrl as string | null) ?? null,
      companyName: (company.companyName as string) ?? "",
      taxId: (company.taxId as string) ?? "",
      address: (company.address as string) ?? "",
      email: (company.email as string) ?? "",
      phone: (company.phone as string) ?? "",
      primaryColor: (company.primaryColor as string) ?? "#1e3a5f",
      legalFooter: (company.legalFooter as string) ?? "",
      paymentConditions: (company.paymentConditions as string) ?? "",
    },
  }
}

/**
 * Generates the invoice PDF, saves it to storage, updates invoice.pdfUrl and pdfGeneratedAt, returns the public URL.
 * If forceRegenerate is false and invoice already has a valid pdfUrl (file exists), returns that URL without regenerating.
 */
export async function generateInvoicePDF(
  invoiceId: string,
  userId: string,
  options: { forceRegenerate?: boolean } = {}
): Promise<{ url: string; regenerated: boolean } | null> {
  const invoice = await invoiceRepo.findById(invoiceId, userId)
  if (!invoice) return null

  const pdfUrl = invoice.pdfUrl as string | null | undefined
  if (!options.forceRegenerate && pdfUrl) {
    const filePath = path.join(process.cwd(), pdfUrl.startsWith("/") ? pdfUrl.slice(1) : pdfUrl)
    try {
      await access(filePath)
      return { url: pdfUrl.startsWith("/") ? pdfUrl : `/${pdfUrl}`, regenerated: false }
    } catch {
      // file missing, regenerate
    }
  }

  const snap = invoice as NonNullable<InvoiceForPdf> & IssuedSnapshots
  const useSnapshots =
    snap.issuedAt != null &&
    snap.issuedCompanySnapshot != null &&
    snap.issuedClientSnapshot != null &&
    snap.issuedItemsSnapshot != null &&
    snap.issuedTotalsSnapshot != null &&
    typeof snap.issuedCompanySnapshot === "object" &&
    typeof snap.issuedClientSnapshot === "object" &&
    Array.isArray(snap.issuedItemsSnapshot) &&
    typeof snap.issuedTotalsSnapshot === "object"

  let data: InvoicePdfData
  let branding: InvoicePdfData["branding"]
  if (useSnapshots) {
    const company = snap.issuedCompanySnapshot as Record<string, unknown>
    const client = snap.issuedClientSnapshot as Record<string, unknown>
    const items = snap.issuedItemsSnapshot as { description: string; quantity: number; unitPrice: number; taxPercent: number; subtotal: number; taxAmount: number; total: number }[]
    const totals = snap.issuedTotalsSnapshot as { subtotal: number; taxAmount: number; total: number; currency: string }
    data = toPdfDataFromSnapshots(snap, company, client, items, totals)
    branding = data.branding
  } else {
    branding = await getBrandingForUser(userId)
    data = toPdfData(invoice)
    data.branding = branding
  }

  const invWithRect = invoice as { rectifiesInvoiceId?: string | null; issuedAt?: Date }
  if (data.isRectification && invWithRect.rectifiesInvoiceId) {
    const original = await invoiceRepo.findById(invWithRect.rectifiesInvoiceId, userId)
    if (original) {
      data.originalInvoiceNumber = original.number
      data.originalIssueDate =
        (original as { issuedAt?: Date }).issuedAt ?? original.issueDate
    }
  }

  const doc = buildInvoiceDocument(data)
  const primaryColor = branding.primaryColor
  const logoDataUrl = branding.logoUrl
    ? await fetchLogoAsDataUrl(branding.logoUrl).catch(() => null)
    : null
  const buffer = renderInvoiceToBuffer(doc, {
    primaryColorHex: primaryColor,
    logoDataUrl,
  })

  const dir = path.join(process.cwd(), INVOICES_DIR, userId)
  await mkdir(dir, { recursive: true })
  const filename = `${invoiceId}.pdf`
  const relativePath = path.join(INVOICES_DIR, userId, filename)
  const absolutePath = path.join(process.cwd(), relativePath)
  await writeFile(absolutePath, buffer)

  const url = "/" + relativePath.split(path.sep).join("/")
  const now = new Date()
  await invoiceRepo.updateInvoicePdf(invoiceId, userId, url, now)

  return { url, regenerated: true }
}

async function fetchLogoAsDataUrl(url: string): Promise<string | null> {
  if (url.startsWith("/")) {
    try {
      const filePath = path.join(process.cwd(), url.slice(1))
      const buf = await readFile(filePath)
      const base64 = buf.toString("base64")
      const ext = path.extname(url).toLowerCase()
      const type = ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : ext === ".gif" ? "image/gif" : "image/webp"
      return `data:${type};base64,${base64}`
    } catch {
      return null
    }
  }
  if (!url.startsWith("http")) return null
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) return null
  const blob = await res.blob()
  const buf = Buffer.from(await blob.arrayBuffer())
  const base64 = buf.toString("base64")
  const type = blob.type || "image/png"
  return `data:${type};base64,${base64}`
}
