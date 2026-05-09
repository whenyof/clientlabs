/**
 * Quote PDF generator — professional layout matching invoice quality.
 * Saves to public/uploads/quotes/{userId}/{id}.pdf and updates pdfUrl in DB.
 */
import { mkdir, writeFile, readFile } from "fs/promises"
import path from "path"
import { prisma } from "@/lib/prisma"
import { getBrandingForUser } from "@/modules/invoicing/pdf/branding"
import { PDF_LAYOUT, getPdfColors } from "@/modules/invoicing/pdf/styles"

const QUOTES_DIR = "public/uploads/quotes"
const PAGE_H = 297
const LEGAL_FOOTER_Y = PAGE_H - 10  // fixed position for legal disclaimer

function fmt(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

function fmtDate(d: Date | string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(d))
}

function getImageDimensions(dataUrl: string): { width: number; height: number } {
  try {
    const raw = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl
    const buffer = Buffer.from(raw, "base64")
    // PNG: 0x89 0x50 = PNG magic, width at bytes 16-19, height at bytes 20-23
    if (buffer[0] === 0x89 && buffer[1] === 0x50) {
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
    }
  } catch { /* ignore */ }
  return { width: 200, height: 200 }
}

function calcLogoDimensions(dataUrl: string, maxW: number, maxH: number): { logoW: number; logoH: number } {
  const dims = getImageDimensions(dataUrl)
  const ratio = dims.width / dims.height
  let logoW: number, logoH: number
  if (ratio >= 1) {
    logoW = maxW; logoH = logoW / ratio
    if (logoH > maxH) { logoH = maxH; logoW = logoH * ratio }
  } else {
    logoH = maxH; logoW = logoH * ratio
    if (logoW > maxW) { logoW = maxW; logoH = logoW / ratio }
  }
  return { logoW, logoH }
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace(/^#/, "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!m) return [0, 0, 0]
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
}

/** Same logo-loading logic as invoice generator (supports local paths and external URLs). */
async function fetchLogoAsDataUrl(url: string): Promise<string | null> {
  if (url.startsWith("/")) {
    try {
      // Local path: files live under public/, so add "public" before the path
      const filePath = path.join(process.cwd(), "public", url.slice(1))
      const buf = await readFile(filePath)
      const ext = path.extname(url).toLowerCase()
      const type = ext === ".png" ? "image/png"
        : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg"
        : ext === ".gif" ? "image/gif"
        : "image/webp"
      return `data:${type};base64,${buf.toString("base64")}`
    } catch { return null }
  }
  if (!url.startsWith("http")) return null
  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return null
    const blob = await res.blob()
    const buf = Buffer.from(await blob.arrayBuffer())
    return `data:${blob.type || "image/png"};base64,${buf.toString("base64")}`
  } catch { return null }
}

/** Detect jsPDF image format from data URL. */
function imgFmt(dataUrl: string): "PNG" | "JPEG" | "WEBP" {
  if (/data:image\/jpe?g/i.test(dataUrl)) return "JPEG"
  if (/data:image\/webp/i.test(dataUrl)) return "WEBP"
  return "PNG"
}

export async function generateQuotePDF(
  quoteId: string,
  userId: string,
  options: { forceRegenerate?: boolean } = {}
): Promise<{ url: string } | null> {
  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, userId },
    include: { client: true, items: true },
  })
  if (!quote) return null

  if (!options.forceRegenerate && quote.pdfUrl) {
    const abs = path.join(process.cwd(), quote.pdfUrl.startsWith("/") ? quote.pdfUrl.slice(1) : quote.pdfUrl)
    try { await readFile(abs); return { url: quote.pdfUrl.startsWith("/") ? quote.pdfUrl : `/${quote.pdfUrl}` } } catch {}
  }

  const branding = await getBrandingForUser(userId)
  const logoDataUrl = branding.logoUrl ? await fetchLogoAsDataUrl(branding.logoUrl).catch(() => null) : null
  const colors = getPdfColors(branding.primaryColor ?? "#1e3a5f")

  const { jsPDF } = await import("jspdf")
  const M: number = PDF_LAYOUT.page.marginHorizontal
  const W: number = PDF_LAYOUT.page.width - 2 * M  // 174mm
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

  let y: number = PDF_LAYOUT.page.marginTop

  // ── HEADER: two-column layout ──────────────────────────────────────────────
  if (logoDataUrl) {
    try {
      const { logoW, logoH } = calcLogoDimensions(logoDataUrl, 40, 20)
      pdf.addImage(logoDataUrl, imgFmt(logoDataUrl), M, y, logoW, logoH)
      y += logoH + 4
    } catch { /* ignore bad logo */ }
  }

  // Company name
  pdf.setFontSize(PDF_LAYOUT.header.companyNameSize)
  pdf.setTextColor(...hexToRgb(colors.primary))
  pdf.setFont("helvetica", "bold")
  pdf.text(branding.companyName, M, y)
  y += 5

  // Company meta
  pdf.setFontSize(PDF_LAYOUT.header.companyMetaSize)
  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.setFont("helvetica", "normal")
  if (branding.taxId)  { pdf.text(`NIF/CIF: ${branding.taxId}`, M, y); y += PDF_LAYOUT.header.lineHeight }
  if (branding.address) {
    const addrLines = pdf.splitTextToSize(branding.address, 90) as string[]
    for (const l of addrLines) { pdf.text(l, M, y); y += PDF_LAYOUT.header.lineHeight }
  }
  if (branding.email) { pdf.text(branding.email, M, y); y += PDF_LAYOUT.header.lineHeight }
  if (branding.phone) { pdf.text(branding.phone, M, y); y += PDF_LAYOUT.header.lineHeight }

  const leftColBottom = y

  // Right column — doc info (positioned from top, right-aligned)
  const infoX = M + W
  let infoY: number = PDF_LAYOUT.page.marginTop + (logoDataUrl ? 0 : 2)

  const docTypeLabel = (quote as { quoteType?: string }).quoteType === "proforma" ? "FACTURA PROFORMA" : "PRESUPUESTO"
  pdf.setFontSize(20)
  pdf.setTextColor(...hexToRgb(colors.primary))
  pdf.setFont("helvetica", "bold")
  pdf.text(docTypeLabel, infoX, infoY, { align: "right" })
  infoY += 9

  pdf.setFontSize(9)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(...hexToRgb(colors.text))
  pdf.text(`Nº: ${quote.number}`, infoX, infoY, { align: "right" }); infoY += 5
  pdf.text(`Fecha: ${fmtDate(quote.issueDate)}`, infoX, infoY, { align: "right" }); infoY += 5

  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(...hexToRgb(colors.primary))
  pdf.text(`Válido hasta: ${fmtDate(quote.validUntil)}`, infoX, infoY, { align: "right" })

  y = Math.max(leftColBottom, infoY) + 6

  // ── DIVIDER ────────────────────────────────────────────────────────────────
  pdf.setDrawColor(...hexToRgb(colors.border))
  pdf.setLineWidth(0.3)
  pdf.line(M, y, M + W, y)
  y += 6

  // ── "DIRIGIDO A:" CLIENT BLOCK ─────────────────────────────────────────────
  pdf.setFontSize(8)
  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.setFont("helvetica", "bold")
  pdf.text("DIRIGIDO A:", M, y)
  y += 5

  pdf.setFontSize(10)
  pdf.setTextColor(...hexToRgb(colors.text))
  pdf.setFont("helvetica", "bold")
  pdf.text(quote.client.name ?? "—", M, y)
  y += 5

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(9)
  if (quote.client.taxId) { pdf.text(`NIF/CIF: ${quote.client.taxId}`, M, y); y += 4.5 }
  if (quote.client.address) {
    const ls = pdf.splitTextToSize(quote.client.address, 100) as string[]
    for (const l of ls) { pdf.text(l, M, y); y += 4.5 }
  }
  if (quote.client.email) { pdf.text(quote.client.email, M, y); y += 4.5 }
  if (quote.client.phone) { pdf.text(quote.client.phone, M, y); y += 4.5 }
  y += 5

  // ── TABLE ─────────────────────────────────────────────────────────────────
  // Column widths — desc wider, total wide enough for "10.890,00 €"
  const C = {
    desc:  Math.round(W * 0.38),
    qty:   Math.round(W * 0.09),
    price: Math.round(W * 0.19),
    tax:   Math.round(W * 0.10),
    total: W - Math.round(W * 0.38) - Math.round(W * 0.09) - Math.round(W * 0.19) - Math.round(W * 0.10),
  }
  const CX = {
    desc:  0,
    qty:   C.desc,
    price: C.desc + C.qty,
    tax:   C.desc + C.qty + C.price,
    total: C.desc + C.qty + C.price + C.tax,
  }
  const ROW_H: number = PDF_LAYOUT.table.rowHeight + 1
  const PAD: number = PDF_LAYOUT.table.paddingHorizontal

  // Header row
  pdf.setFillColor(...hexToRgb(colors.tableHeaderBg))
  pdf.rect(M, y, W, ROW_H + 2, "F")
  pdf.setFontSize(PDF_LAYOUT.table.headerSize)
  pdf.setTextColor(...hexToRgb(colors.tableHeaderText))
  pdf.setFont("helvetica", "bold")
  const THY = y + ROW_H
  pdf.text("CONCEPTO",  M + CX.desc  + PAD, THY)
  pdf.text("CANT.",     M + CX.qty   + PAD, THY)
  pdf.text("P. UNIT.",  M + CX.price + PAD, THY)
  pdf.text("IVA",       M + CX.tax   + PAD, THY)
  pdf.text("TOTAL",     M + CX.total + C.total - PAD, THY, { align: "right" })
  y += ROW_H + 4

  // Data rows
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(PDF_LAYOUT.table.cellSize)
  pdf.setTextColor(...hexToRgb(colors.text))

  for (let i = 0; i < quote.items.length; i++) {
    const item = quote.items[i]
    const lineTotal = item.subtotal * (1 + item.taxRate / 100)
    const descLines = pdf.splitTextToSize(item.description, C.desc - PAD * 2) as string[]
    const rowH: number = Math.max(ROW_H, descLines.length * 4.5 + 2)

    if (i % 2 === 1) {
      pdf.setFillColor(249, 250, 251)
      pdf.rect(M, y - 1, W, rowH + 1, "F")
    }

    const cellY = y + 4
    for (let li = 0; li < descLines.length; li++) {
      pdf.text(descLines[li], M + CX.desc + PAD, cellY + li * 4.5)
    }
    pdf.text(String(item.quantity),  M + CX.qty   + PAD, cellY)
    pdf.text(fmt(item.unitPrice),    M + CX.price + C.price - PAD, cellY, { align: "right" })
    pdf.text(`${item.taxRate}%`,     M + CX.tax   + PAD, cellY)
    pdf.text(fmt(lineTotal),         M + CX.total + C.total - PAD, cellY, { align: "right" })

    y += rowH
    pdf.setDrawColor(...hexToRgb(colors.border))
    pdf.setLineWidth(0.2)
    pdf.line(M, y, M + W, y)
    y += 2
  }

  y += 6

  // ── TOTALS ────────────────────────────────────────────────────────────────
  const totalsLabelX = M + W - 72
  const totalsValueX = M + W

  pdf.setFontSize(PDF_LAYOUT.totals.labelSize)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(...hexToRgb(colors.textMuted))

  // Subtotal
  pdf.text("Subtotal:", totalsLabelX, y)
  pdf.setTextColor(...hexToRgb(colors.text))
  pdf.text(fmt(quote.subtotal), totalsValueX, y, { align: "right" })
  y += PDF_LAYOUT.totals.lineHeight

  // IVA breakdown by rate
  const taxByRate: Record<number, number> = {}
  for (const item of quote.items) {
    const tax = item.subtotal * (item.taxRate / 100)
    taxByRate[item.taxRate] = (taxByRate[item.taxRate] ?? 0) + tax
  }
  for (const [rate, amount] of Object.entries(taxByRate)) {
    pdf.setTextColor(...hexToRgb(colors.textMuted))
    pdf.text(`IVA ${rate}%:`, totalsLabelX, y)
    pdf.setTextColor(...hexToRgb(colors.text))
    pdf.text(fmt(amount), totalsValueX, y, { align: "right" })
    y += PDF_LAYOUT.totals.lineHeight
  }

  // IRPF (if applicable)
  const irpfRate = quote.irpfRate ?? 0
  const irpfAmount = quote.irpfAmount ?? 0
  if (irpfRate > 0 && irpfAmount > 0) {
    pdf.setTextColor(...hexToRgb(colors.textMuted))
    pdf.text(`Retención IRPF (${irpfRate}%):`, totalsLabelX, y)
    pdf.setTextColor("#dc2626")
    pdf.text(`-${fmt(irpfAmount)}`, totalsValueX, y, { align: "right" })
    y += PDF_LAYOUT.totals.lineHeight
  }

  // Separator + TOTAL
  pdf.setDrawColor(...hexToRgb(colors.border))
  pdf.setLineWidth(0.4)
  pdf.line(totalsLabelX, y, M + W, y)
  y += 5

  pdf.setFontSize(PDF_LAYOUT.totals.finalSize)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(...hexToRgb(colors.primary))
  pdf.text("TOTAL:", totalsLabelX, y)
  pdf.text(fmt(quote.total), totalsValueX, y, { align: "right" })

  const contentEndY = y + 10

  // ── BOTTOM SECTION (notes, terms) — pushed toward page bottom ──
  const noteLines  = quote.notes  ? (pdf.splitTextToSize(quote.notes,  W) as string[]) : []
  const termLines  = quote.terms  ? (pdf.splitTextToSize(quote.terms,  W) as string[]) : []

  let bottomBlockH = 0
  if (noteLines.length)  bottomBlockH += 5 + noteLines.length * 4.5 + 5
  if (termLines.length)  bottomBlockH += 5 + termLines.length * 4.5 + 5
  // Place block so its bottom lands at LEGAL_FOOTER_Y - 6 (just above the legal line)
  const bottomLimit = LEGAL_FOOTER_Y - 6

  let fY: number = Math.max(contentEndY + 12, bottomLimit - bottomBlockH)

  if (fY < contentEndY + 6) {
    pdf.addPage()
    fY = PDF_LAYOUT.page.marginTop
  }

  // Notes
  if (noteLines.length > 0) {
    pdf.setFontSize(8)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(...hexToRgb(colors.textMuted))
    pdf.text("NOTAS", M, fY)
    fY += 4.5

    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(...hexToRgb(colors.text))
    for (const l of noteLines) { pdf.text(l, M, fY); fY += 4.5 }
    fY += 4
  }

  // Terms / conditions
  if (termLines.length > 0) {
    pdf.setFontSize(8)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(...hexToRgb(colors.textMuted))
    pdf.text("CONDICIONES", M, fY)
    fY += 4.5

    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(...hexToRgb(colors.text))
    for (const l of termLines) { pdf.text(l, M, fY); fY += 4.5 }
  }

  // ── LEGAL FOOTER (fixed at bottom) ────────────────────────────────────────
  pdf.setDrawColor(...hexToRgb(colors.border))
  pdf.setLineWidth(0.2)
  pdf.line(M, LEGAL_FOOTER_Y - 3, M + W, LEGAL_FOOTER_Y - 3)

  pdf.setFontSize(PDF_LAYOUT.footer.size)
  pdf.setFont("helvetica", "italic")
  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.text("Este presupuesto no tiene validez fiscal.", M, LEGAL_FOOTER_Y)

  // ── SAVE ──────────────────────────────────────────────────────────────────
  const dir = path.join(process.cwd(), QUOTES_DIR, userId)
  await mkdir(dir, { recursive: true })
  const buffer = Buffer.from(pdf.output("arraybuffer"))
  const filename = `${quoteId}.pdf`
  const relativePath = path.join(QUOTES_DIR, userId, filename)
  await writeFile(path.join(process.cwd(), relativePath), buffer)
  const url = "/" + relativePath.split(path.sep).join("/")

  await prisma.quote.update({ where: { id: quoteId }, data: { pdfUrl: url } })
  return { url }
}
