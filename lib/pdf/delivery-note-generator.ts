/**
 * Delivery note PDF generator — professional layout matching invoice quality.
 * Renders the PDF in memory and returns the raw bytes. Does NOT write to disk
 * (Vercel's filesystem is read-only); the API route streams the buffer inline.
 */
import { readFile } from "fs/promises"
import path from "path"
import { prisma } from "@/lib/prisma"
import { getBrandingForUser } from "@/modules/invoicing/pdf/branding"
import { PDF_LAYOUT, getPdfColors } from "@/modules/invoicing/pdf/styles"

const PAGE_H = 297
const PAGE_BOTTOM_MARGIN = 20

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
): Promise<{ buffer: Buffer } | null> {
  void options // always regenerated fresh in memory
  const note = await prisma.deliveryNote.findFirst({
    where: { id: noteId, userId },
    include: { client: true, items: true, quote: { select: { number: true } } },
  })
  if (!note) return null

  const branding = await getBrandingForUser(userId)
  const logoDataUrl = branding.logoUrl ? await fetchLogoAsDataUrl(branding.logoUrl).catch(() => null) : null
  const colors = getPdfColors(branding.primaryColor ?? "#1e3a5f")

  const { jsPDF } = await import("jspdf")
  const M: number = PDF_LAYOUT.page.marginHorizontal
  const W: number = PDF_LAYOUT.page.width - 2 * M  // 174mm
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

  function addPage() {
    pdf.addPage()
    return PDF_LAYOUT.page.marginTop
  }

  function ensureSpace(y: number, needed: number): number {
    if (y + needed > PAGE_H - PAGE_BOTTOM_MARGIN) return addPage()
    return y
  }

  let y: number = PDF_LAYOUT.page.marginTop

  // ── HEADER ────────────────────────────────────────────────────────────────
  const LOGO_W = 32
  const LOGO_H = PDF_LAYOUT.header.logoHeight
  let companyX = M

  if (logoDataUrl) {
    try {
      pdf.addImage(logoDataUrl, "PNG", M, y, LOGO_W, LOGO_H)
      companyX = M + LOGO_W + 4
    } catch { /* skip logo on error */ }
  }

  pdf.setFontSize(PDF_LAYOUT.header.companyNameSize)
  pdf.setTextColor(...hexToRgb(colors.primary))
  pdf.setFont("helvetica", "bold")
  pdf.text(branding.companyName, companyX, y + 7)

  pdf.setFontSize(PDF_LAYOUT.header.companyMetaSize)
  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.setFont("helvetica", "normal")
  let metaY = y + 12
  if (branding.taxId) { pdf.text(`NIF/CIF: ${branding.taxId}`, companyX, metaY); metaY += PDF_LAYOUT.header.lineHeight }
  if (branding.address) {
    const addrLines = pdf.splitTextToSize(branding.address, 80) as string[]
    for (const line of addrLines) { pdf.text(line, companyX, metaY); metaY += PDF_LAYOUT.header.lineHeight }
  }
  if (branding.email) { pdf.text(branding.email, companyX, metaY); metaY += PDF_LAYOUT.header.lineHeight }
  if (branding.phone) { pdf.text(branding.phone, companyX, metaY) }

  // Doc info — right column
  const infoX = M + W
  let infoY = PDF_LAYOUT.page.marginTop + 2

  pdf.setFontSize(20)
  pdf.setTextColor(...hexToRgb(colors.primary))
  pdf.setFont("helvetica", "bold")
  pdf.text("ALBARÁN DE ENTREGA", infoX, infoY, { align: "right" })
  infoY += 9

  pdf.setFontSize(9)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(...hexToRgb(colors.text))
  pdf.text(`Nº: ${note.number}`, infoX, infoY, { align: "right" }); infoY += 5
  pdf.text(`Fecha: ${fmtDate(note.issueDate)}`, infoX, infoY, { align: "right" }); infoY += 5
  if (note.deliveryDate) {
    pdf.text(`Entrega: ${fmtDate(note.deliveryDate)}`, infoX, infoY, { align: "right" }); infoY += 5
  }
  if (note.quote?.number) {
    pdf.setTextColor(...hexToRgb(colors.textMuted))
    pdf.text(`Presupuesto: ${note.quote.number}`, infoX, infoY, { align: "right" })
  }

  y = Math.max(metaY, infoY) + 8

  // ── DIVIDER ────────────────────────────────────────────────────────────────
  pdf.setDrawColor(...hexToRgb(colors.border))
  pdf.setLineWidth(0.3)
  pdf.line(M, y, M + W, y)
  y += 7

  // ── CLIENT BLOCK ──────────────────────────────────────────────────────────
  pdf.setFontSize(PDF_LAYOUT.block.titleSize)
  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.setFont("helvetica", "bold")
  pdf.text("DESTINATARIO", M, y)
  y += PDF_LAYOUT.block.titleSize + 2

  pdf.setFontSize(10)
  pdf.setTextColor(...hexToRgb(colors.text))
  pdf.setFont("helvetica", "bold")
  pdf.text(note.client.name ?? "—", M, y)
  y += 5
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(9)
  if (note.client.taxId) { pdf.text(`NIF/CIF: ${note.client.taxId}`, M, y); y += 4.5 }
  if (note.client.address) {
    const lines = pdf.splitTextToSize(note.client.address, 90) as string[]
    for (const l of lines) { pdf.text(l, M, y); y += 4.5 }
  }
  if (note.client.email) { pdf.text(note.client.email, M, y); y += 4.5 }
  y += 6

  // ── TABLE ─────────────────────────────────────────────────────────────────
  // Columns: description, quantity, delivered
  const C = {
    desc: Math.round(W * 0.66),  // 115mm
    qty:  Math.round(W * 0.20),  // 35mm
    del:  Math.round(W * 0.14),  // 24mm
  }
  const CX = {
    desc: 0,
    qty:  C.desc,
    del:  C.desc + C.qty,
  }

  const ROW_H = PDF_LAYOUT.table.rowHeight + 1
  const PAD = PDF_LAYOUT.table.paddingHorizontal

  y = ensureSpace(y, ROW_H + 4)
  pdf.setFillColor(...hexToRgb(colors.tableHeaderBg))
  pdf.rect(M, y, W, ROW_H + 2, "F")
  pdf.setFontSize(PDF_LAYOUT.table.headerSize)
  pdf.setTextColor(...hexToRgb(colors.tableHeaderText))
  pdf.setFont("helvetica", "bold")
  const THY = y + ROW_H
  pdf.text("DESCRIPCIÓN", M + CX.desc + PAD, THY)
  pdf.text("CANTIDAD",    M + CX.qty  + PAD, THY)
  pdf.text("ENTREGADO",   M + CX.del  + PAD, THY)
  y += ROW_H + 4

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(PDF_LAYOUT.table.cellSize)
  pdf.setTextColor(...hexToRgb(colors.text))

  for (let i = 0; i < note.items.length; i++) {
    const item = note.items[i]
    const descLines = pdf.splitTextToSize(item.description, C.desc - PAD * 2) as string[]
    const rowH = Math.max(ROW_H, descLines.length * 4.5 + 2)

    y = ensureSpace(y, rowH + 2)

    if (i % 2 === 1) {
      pdf.setFillColor(249, 250, 251)
      pdf.rect(M, y - 1, W, rowH + 1, "F")
    }

    const cellY = y + 4
    for (let li = 0; li < descLines.length; li++) {
      pdf.text(descLines[li], M + CX.desc + PAD, cellY + li * 4.5)
    }
    pdf.text(String(item.quantity), M + CX.qty + PAD, cellY)
    pdf.text(item.delivered ? "Sí" : "No", M + CX.del + PAD, cellY)

    y += rowH
    pdf.setDrawColor(...hexToRgb(colors.border))
    pdf.setLineWidth(0.2)
    pdf.line(M, y, M + W, y)
    y += 2
  }

  y += 8

  // ── NOTES ─────────────────────────────────────────────────────────────────
  if (note.notes) {
    y = ensureSpace(y, 16)
    pdf.setFontSize(8)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(...hexToRgb(colors.textMuted))
    pdf.text("NOTAS", M, y)
    y += 4

    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(8)
    pdf.setTextColor(...hexToRgb(colors.text))
    const noteLines = pdf.splitTextToSize(note.notes, W) as string[]
    for (const line of noteLines) {
      y = ensureSpace(y, 5)
      pdf.text(line, M, y)
      y += 4.5
    }
    y += 4
  }

  // ── SIGNATURE SPACE ───────────────────────────────────────────────────────
  y = ensureSpace(y, 30)
  y += 6

  pdf.setDrawColor(...hexToRgb(colors.border))
  pdf.setLineWidth(0.4)
  pdf.line(M, y, M + 75, y)
  pdf.setFontSize(7)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.text("Firma del receptor", M, y + 4)

  // Date line on the right
  pdf.line(M + W - 50, y, M + W, y)
  pdf.text("Fecha", M + W - 50, y + 4)

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const footerY = PAGE_H - 12
  pdf.setDrawColor(...hexToRgb(colors.border))
  pdf.setLineWidth(0.2)
  pdf.line(M, footerY - 3, M + W, footerY - 3)

  pdf.setFontSize(PDF_LAYOUT.footer.size)
  pdf.setFont("helvetica", "italic")
  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.text("Este documento no tiene validez fiscal.", M, footerY)

  const contactParts = [branding.companyName, branding.email, branding.phone].filter(Boolean)
  pdf.setFont("helvetica", "normal")
  pdf.text(contactParts.join("  ·  "), M + W, footerY, { align: "right" })

  // ── OUTPUT (in memory) ──────────────────────────────────────────────────────
  return { buffer: Buffer.from(pdf.output("arraybuffer")) }
}
