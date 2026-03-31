/**
 * Quote PDF generator — uses the same jsPDF approach as invoice-renderer.
 * Saves to public/uploads/quotes/{id}.pdf and updates pdfUrl in DB.
 */
import { mkdir, writeFile, readFile } from "fs/promises"
import path from "path"
import { jsPDF } from "jspdf"
import { prisma } from "@/lib/prisma"
import { getBrandingForUser } from "@/modules/invoicing/pdf/branding"
import { PDF_LAYOUT, getPdfColors } from "@/modules/invoicing/pdf/styles"

const QUOTES_DIR = "public/uploads/quotes"

function fmt(n: number, currency = "EUR"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(n)
}

function fmtDate(d: Date | string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(d))
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace(/^#/, "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!m) return [0, 0, 0]
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
}

async function fetchLogoAsDataUrl(url: string): Promise<string | null> {
  if (url.startsWith("/")) {
    try {
      const buf = await readFile(path.join(process.cwd(), url.slice(1)))
      const ext = path.extname(url).toLowerCase()
      const type = ext === ".png" ? "image/png" : "image/jpeg"
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

  const M = PDF_LAYOUT.page.marginHorizontal
  const W = PDF_LAYOUT.page.width - 2 * M
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  let y = PDF_LAYOUT.page.marginTop

  // Logo + company
  if (logoDataUrl) {
    try { pdf.addImage(logoDataUrl, "PNG", M, y, 40, PDF_LAYOUT.header.logoHeight) } catch {}
  }
  const cx = M + (logoDataUrl ? 44 : 0)
  pdf.setFontSize(PDF_LAYOUT.header.companyNameSize)
  pdf.setTextColor(...hexToRgb(colors.primary))
  pdf.setFont("helvetica", "bold")
  pdf.text(branding.companyName, cx, y + 8)
  y += PDF_LAYOUT.header.companyNameSize + 2
  pdf.setFontSize(PDF_LAYOUT.header.companyMetaSize)
  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.setFont("helvetica", "normal")
  pdf.text(`CIF/NIF: ${branding.taxId}`, cx, y); y += PDF_LAYOUT.header.lineHeight
  pdf.text(branding.address, cx, y); y += PDF_LAYOUT.header.lineHeight
  if (branding.email) { pdf.text(branding.email, cx, y); y += PDF_LAYOUT.header.lineHeight }
  y += PDF_LAYOUT.block.blockGap

  // Client block
  pdf.setFontSize(PDF_LAYOUT.block.titleSize)
  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.setFont("helvetica", "bold")
  pdf.text("CLIENTE", M, y); y += PDF_LAYOUT.block.titleSize + PDF_LAYOUT.block.titleSpacing
  pdf.setFontSize(PDF_LAYOUT.block.contentSize)
  pdf.setTextColor(...hexToRgb(colors.text))
  pdf.setFont("helvetica", "normal")
  pdf.text(quote.client.name ?? "—", M, y); y += PDF_LAYOUT.block.lineHeight
  if (quote.client.email) { pdf.text(quote.client.email, M, y); y += PDF_LAYOUT.block.lineHeight }
  y += PDF_LAYOUT.block.blockGap

  // Doc info (right side)
  const infoX = M + W - 60
  let infoY = PDF_LAYOUT.page.marginTop + 4
  pdf.setFontSize(18)
  pdf.setTextColor(...hexToRgb(colors.primary))
  pdf.setFont("helvetica", "bold")
  pdf.text("PRESUPUESTO", infoX, infoY); infoY += 8
  pdf.setFontSize(10)
  pdf.setTextColor(...hexToRgb(colors.text))
  pdf.setFont("helvetica", "normal")
  pdf.text(`Nº: ${quote.number}`, infoX, infoY); infoY += 6
  pdf.text(`Fecha: ${fmtDate(quote.issueDate)}`, infoX, infoY); infoY += 6
  pdf.text(`Válido hasta: ${fmtDate(quote.validUntil)}`, infoX, infoY)

  // Divider
  pdf.setDrawColor(...hexToRgb(colors.border))
  pdf.line(M, y, M + W, y); y += 6

  // Table header
  const cols = { desc: 0, qty: 90, price: 115, tax: 145, total: 170 }
  pdf.setFontSize(PDF_LAYOUT.table.headerSize)
  pdf.setTextColor(...hexToRgb(colors.tableHeaderText))
  pdf.setFillColor(...hexToRgb(colors.tableHeaderBg))
  pdf.rect(M, y, W, PDF_LAYOUT.table.rowHeight + 2, "F")
  pdf.setFont("helvetica", "bold")
  const th = y + PDF_LAYOUT.table.rowHeight
  pdf.text("CONCEPTO", M + cols.desc + PDF_LAYOUT.table.paddingHorizontal, th)
  pdf.text("CANT.", M + cols.qty + PDF_LAYOUT.table.paddingHorizontal, th)
  pdf.text("P. UNIT.", M + cols.price + PDF_LAYOUT.table.paddingHorizontal, th)
  pdf.text("IVA", M + cols.tax + PDF_LAYOUT.table.paddingHorizontal, th)
  pdf.text("TOTAL", M + cols.total + PDF_LAYOUT.table.paddingHorizontal, th)
  y += PDF_LAYOUT.table.rowHeight + 4

  // Table rows
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(PDF_LAYOUT.table.cellSize)
  pdf.setTextColor(...hexToRgb(colors.text))
  for (const item of quote.items) {
    const total = item.subtotal * (1 + item.taxRate / 100)
    pdf.text(item.description.slice(0, 55), M + cols.desc + PDF_LAYOUT.table.paddingHorizontal, y)
    pdf.text(String(item.quantity), M + cols.qty + PDF_LAYOUT.table.paddingHorizontal, y)
    pdf.text(fmt(item.unitPrice), M + cols.price + PDF_LAYOUT.table.paddingHorizontal, y)
    pdf.text(`${item.taxRate}%`, M + cols.tax + PDF_LAYOUT.table.paddingHorizontal, y)
    pdf.text(fmt(total), M + cols.total + PDF_LAYOUT.table.paddingHorizontal, y)
    y += PDF_LAYOUT.table.rowHeight
    pdf.setDrawColor(...hexToRgb(colors.border))
    pdf.line(M, y, M + W, y)
    y += 2
  }
  y += 4

  // Totals
  const tx = M + W - 50
  pdf.setFontSize(PDF_LAYOUT.totals.labelSize)
  pdf.setFont("helvetica", "normal")
  pdf.text("Subtotal:", tx, y); pdf.text(fmt(quote.subtotal), tx + 30, y, { align: "right" }); y += PDF_LAYOUT.totals.lineHeight
  pdf.text(`IVA:`, tx, y); pdf.text(fmt(quote.taxTotal), tx + 30, y, { align: "right" }); y += PDF_LAYOUT.totals.lineHeight
  pdf.setFontSize(PDF_LAYOUT.totals.finalSize)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(...hexToRgb(colors.primary))
  pdf.text("TOTAL:", tx, y); pdf.text(fmt(quote.total), tx + 30, y, { align: "right" }); y += 10

  // Notes & terms
  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.setFontSize(PDF_LAYOUT.footer.size)
  pdf.setFont("helvetica", "normal")
  if (quote.notes) { pdf.text(`Notas: ${quote.notes}`, M, y); y += 6 }
  if (quote.terms) { pdf.text(`Condiciones: ${quote.terms}`, M, y); y += 6 }

  // Signature space
  y += 8
  pdf.setDrawColor(...hexToRgb(colors.border))
  pdf.line(M, y, M + 70, y)
  pdf.setFontSize(7)
  pdf.text("Firma y conformidad del cliente", M, y + 4)

  // Save
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
