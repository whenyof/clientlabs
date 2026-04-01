/**
 * Purchase Order PDF generator — "HOJA DE PEDIDO"
 * Saves to public/uploads/purchase-orders/{userId}/{id}.pdf
 */
import { mkdir, writeFile, readFile } from "fs/promises"
import path from "path"
import { prisma } from "@/lib/prisma"
import { getBrandingForUser } from "@/modules/invoicing/pdf/branding"
import { PDF_LAYOUT, getPdfColors } from "@/modules/invoicing/pdf/styles"

const PO_DIR = "public/uploads/purchase-orders"

function fmt(n: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n)
}

function fmtDate(d: Date | string): string {
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d))
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
      return `data:${ext === ".png" ? "image/png" : "image/jpeg"};base64,${buf.toString("base64")}`
    } catch { return null }
  }
  if (!url.startsWith("http")) return null
  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return null
    const blob = await res.blob()
    return `data:${blob.type || "image/png"};base64,${Buffer.from(await blob.arrayBuffer()).toString("base64")}`
  } catch { return null }
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "BORRADOR",
  CONFIRMED: "CONFIRMADO",
  IN_PROGRESS: "EN PREPARACIÓN",
  COMPLETED: "COMPLETADO",
  CANCELLED: "CANCELADO",
}

export async function generatePurchaseOrderPDF(
  orderId: string,
  userId: string,
  options: { forceRegenerate?: boolean } = {}
): Promise<{ url: string } | null> {
  const order = await prisma.purchaseOrder.findFirst({
    where: { id: orderId, userId },
    include: { client: true, items: true, quote: { select: { number: true } } },
  })
  if (!order) return null

  if (!options.forceRegenerate && order.pdfUrl) {
    const abs = path.join(process.cwd(), order.pdfUrl.startsWith("/") ? order.pdfUrl.slice(1) : order.pdfUrl)
    try { await readFile(abs); return { url: order.pdfUrl.startsWith("/") ? order.pdfUrl : `/${order.pdfUrl}` } } catch {}
  }

  const branding = await getBrandingForUser(userId)
  const logoDataUrl = branding.logoUrl ? await fetchLogoAsDataUrl(branding.logoUrl).catch(() => null) : null
  const colors = getPdfColors(branding.primaryColor ?? "#1e3a5f")

  const { jsPDF } = await import("jspdf")
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
  pdf.text(order.client.name ?? "—", M, y); y += PDF_LAYOUT.block.lineHeight
  if (order.client.email) { pdf.text(order.client.email, M, y); y += PDF_LAYOUT.block.lineHeight }
  y += PDF_LAYOUT.block.blockGap

  // Doc info (right side)
  const infoX = M + W - 70
  let infoY = PDF_LAYOUT.page.marginTop + 4
  pdf.setFontSize(16)
  pdf.setTextColor(...hexToRgb(colors.primary))
  pdf.setFont("helvetica", "bold")
  pdf.text("HOJA DE PEDIDO", infoX, infoY); infoY += 8
  pdf.setFontSize(10)
  pdf.setTextColor(...hexToRgb(colors.text))
  pdf.setFont("helvetica", "normal")
  pdf.text(`Nº: ${order.number}`, infoX, infoY); infoY += 6
  pdf.text(`Fecha: ${fmtDate(order.issueDate)}`, infoX, infoY); infoY += 6
  pdf.text(`Estado: ${STATUS_LABELS[order.status] ?? order.status}`, infoX, infoY); infoY += 6
  if (order.quote?.number) { pdf.text(`Ref. presupuesto: ${order.quote.number}`, infoX, infoY) }

  // Divider
  pdf.setDrawColor(...hexToRgb(colors.border))
  pdf.line(M, y, M + W, y); y += 6

  // Table header
  const cols = { desc: 0, qty: 95, price: 120, tax: 150, total: 172 }
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

  // Rows
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(PDF_LAYOUT.table.cellSize)
  pdf.setTextColor(...hexToRgb(colors.text))
  for (const item of order.items) {
    const total = item.subtotal * (1 + item.taxRate / 100)
    pdf.text(item.description.slice(0, 58), M + cols.desc + PDF_LAYOUT.table.paddingHorizontal, y)
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
  pdf.setTextColor(...hexToRgb(colors.text))
  pdf.text("Subtotal:", tx, y); pdf.text(fmt(order.subtotal), tx + 30, y, { align: "right" }); y += PDF_LAYOUT.totals.lineHeight
  pdf.text("IVA:", tx, y); pdf.text(fmt(order.taxTotal), tx + 30, y, { align: "right" }); y += PDF_LAYOUT.totals.lineHeight
  pdf.setFontSize(PDF_LAYOUT.totals.finalSize)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(...hexToRgb(colors.primary))
  pdf.text("TOTAL:", tx, y); pdf.text(fmt(order.total), tx + 30, y, { align: "right" }); y += 10

  // Notes
  if (order.notes) {
    pdf.setTextColor(...hexToRgb(colors.textMuted))
    pdf.setFontSize(PDF_LAYOUT.footer.size)
    pdf.setFont("helvetica", "normal")
    pdf.text(`Notas internas: ${order.notes}`, M, y); y += 6
  }

  // Signature space
  y += 8
  pdf.setDrawColor(...hexToRgb(colors.border))
  pdf.line(M, y, M + 70, y)
  pdf.setFontSize(7)
  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.text("Firma y conformidad", M, y + 4)

  // Save
  const dir = path.join(process.cwd(), PO_DIR, userId)
  await mkdir(dir, { recursive: true })
  const buffer = Buffer.from(pdf.output("arraybuffer"))
  const filename = `${orderId}.pdf`
  const relativePath = path.join(PO_DIR, userId, filename)
  await writeFile(path.join(process.cwd(), relativePath), buffer)
  const url = "/" + relativePath.split(path.sep).join("/")

  await prisma.purchaseOrder.update({ where: { id: orderId }, data: { pdfUrl: url } })
  return { url }
}
