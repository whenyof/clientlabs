/**
 * Delivery note PDF generator — simple document without prices.
 */
import { mkdir, writeFile, readFile } from "fs/promises"
import path from "path"
import { jsPDF } from "jspdf"
import { prisma } from "@/lib/prisma"
import { getBrandingForUser } from "@/modules/invoicing/pdf/branding"
import { PDF_LAYOUT, getPdfColors } from "@/modules/invoicing/pdf/styles"

const DN_DIR = "public/uploads/delivery-notes"

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

export async function generateDeliveryNotePDF(
  noteId: string,
  userId: string,
  options: { forceRegenerate?: boolean } = {}
): Promise<{ url: string } | null> {
  const note = await prisma.deliveryNote.findFirst({
    where: { id: noteId, userId },
    include: { client: true, items: true, quote: { select: { number: true } } },
  })
  if (!note) return null

  if (!options.forceRegenerate && note.pdfUrl) {
    const abs = path.join(process.cwd(), note.pdfUrl.startsWith("/") ? note.pdfUrl.slice(1) : note.pdfUrl)
    try { await readFile(abs); return { url: note.pdfUrl.startsWith("/") ? note.pdfUrl : `/${note.pdfUrl}` } } catch {}
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
  y += PDF_LAYOUT.block.blockGap

  // Client
  pdf.setFontSize(PDF_LAYOUT.block.titleSize)
  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.setFont("helvetica", "bold")
  pdf.text("DESTINATARIO", M, y); y += PDF_LAYOUT.block.titleSize + PDF_LAYOUT.block.titleSpacing
  pdf.setFontSize(PDF_LAYOUT.block.contentSize)
  pdf.setTextColor(...hexToRgb(colors.text))
  pdf.setFont("helvetica", "normal")
  pdf.text(note.client.name ?? "—", M, y); y += PDF_LAYOUT.block.lineHeight
  if (note.client.email) { pdf.text(note.client.email, M, y); y += PDF_LAYOUT.block.lineHeight }
  y += PDF_LAYOUT.block.blockGap

  // Doc info
  const infoX = M + W - 60
  let infoY = PDF_LAYOUT.page.marginTop + 4
  pdf.setFontSize(18)
  pdf.setTextColor(...hexToRgb(colors.primary))
  pdf.setFont("helvetica", "bold")
  pdf.text("ALBARÁN DE ENTREGA", infoX, infoY); infoY += 8
  pdf.setFontSize(10)
  pdf.setTextColor(...hexToRgb(colors.text))
  pdf.setFont("helvetica", "normal")
  pdf.text(`Nº: ${note.number}`, infoX, infoY); infoY += 6
  pdf.text(`Fecha: ${fmtDate(note.issueDate)}`, infoX, infoY); infoY += 6
  if (note.deliveryDate) { pdf.text(`Entrega: ${fmtDate(note.deliveryDate)}`, infoX, infoY); infoY += 6 }
  if (note.quote?.number) { pdf.text(`Presupuesto: ${note.quote.number}`, infoX, infoY) }

  // Divider
  pdf.setDrawColor(...hexToRgb(colors.border))
  pdf.line(M, y, M + W, y); y += 6

  // Table header
  pdf.setFontSize(PDF_LAYOUT.table.headerSize)
  pdf.setTextColor(...hexToRgb(colors.tableHeaderText))
  pdf.setFillColor(...hexToRgb(colors.tableHeaderBg))
  pdf.rect(M, y, W, PDF_LAYOUT.table.rowHeight + 2, "F")
  pdf.setFont("helvetica", "bold")
  const th = y + PDF_LAYOUT.table.rowHeight
  pdf.text("DESCRIPCIÓN", M + PDF_LAYOUT.table.paddingHorizontal, th)
  pdf.text("CANTIDAD", M + 120 + PDF_LAYOUT.table.paddingHorizontal, th)
  pdf.text("ENTREGADO", M + 155 + PDF_LAYOUT.table.paddingHorizontal, th)
  y += PDF_LAYOUT.table.rowHeight + 4

  // Rows
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(PDF_LAYOUT.table.cellSize)
  pdf.setTextColor(...hexToRgb(colors.text))
  for (const item of note.items) {
    pdf.text(item.description.slice(0, 65), M + PDF_LAYOUT.table.paddingHorizontal, y)
    pdf.text(String(item.quantity), M + 120 + PDF_LAYOUT.table.paddingHorizontal, y)
    pdf.text(item.delivered ? "Sí" : "No", M + 155 + PDF_LAYOUT.table.paddingHorizontal, y)
    y += PDF_LAYOUT.table.rowHeight
    pdf.setDrawColor(...hexToRgb(colors.border))
    pdf.line(M, y, M + W, y)
    y += 2
  }
  y += 8

  // Notes
  if (note.notes) {
    pdf.setFontSize(PDF_LAYOUT.footer.size)
    pdf.setTextColor(...hexToRgb(colors.textMuted))
    pdf.text(`Notas: ${note.notes}`, M, y); y += 6
  }

  // Signature
  y += 6
  pdf.setDrawColor(...hexToRgb(colors.border))
  pdf.line(M, y, M + 70, y)
  pdf.setFontSize(7)
  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.text("Firma del receptor", M, y + 4)

  // Save
  const dir = path.join(process.cwd(), DN_DIR, userId)
  await mkdir(dir, { recursive: true })
  const buffer = Buffer.from(pdf.output("arraybuffer"))
  const filename = `${noteId}.pdf`
  const relativePath = path.join(DN_DIR, userId, filename)
  await writeFile(path.join(process.cwd(), relativePath), buffer)
  const url = "/" + relativePath.split(path.sep).join("/")

  await prisma.deliveryNote.update({ where: { id: noteId }, data: { pdfUrl: url } })
  return { url }
}
