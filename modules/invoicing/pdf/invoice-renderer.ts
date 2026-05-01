/**
 * Invoice PDF renderer — draws the document model with jsPDF.
 * Uses layout from styles.ts; no inline styles in template data.
 */

import type { InvoiceDocumentModel } from "./invoice-template"
import { PDF_LAYOUT, getPdfColors } from "./styles"

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace(/^#/, "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!m) return [0, 0, 0]
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
}

const M = PDF_LAYOUT.page.marginHorizontal
const W = PDF_LAYOUT.page.width - 2 * M
const TOP = PDF_LAYOUT.page.marginTop
const PAGE_MAX = PDF_LAYOUT.page.height - PDF_LAYOUT.page.marginBottom - 4

// Right column: 72mm wide, left-aligned to right side
const RIGHT_COL_W = 72
const RIGHT_COL_X = M + W - RIGHT_COL_W

export type RenderOptions = {
  primaryColorHex?: string
  logoDataUrl?: string | null
}

/**
 * Renders the invoice document to a jsPDF instance and returns the PDF as Buffer.
 */
export async function renderInvoiceToBuffer(
  doc: InvoiceDocumentModel,
  options: RenderOptions = {}
): Promise<Buffer> {
  const { jsPDF } = await import("jspdf")
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const colors = getPdfColors(options.primaryColorHex ?? "#1e3a5f")
  const block = PDF_LAYOUT.block
  const table = PDF_LAYOUT.table
  const totals = PDF_LAYOUT.totals
  const footer = PDF_LAYOUT.footer

  // =========================================================
  // RIGHT COLUMN — invoice type title, number, dates, QR
  // =========================================================
  let infoY = TOP

  // Invoice type title (large, primary color)
  pdf.setFontSize(13)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(...hexToRgb(colors.primary))
  pdf.text(doc.invoiceInfo.invoiceTypeTitle, RIGHT_COL_X, infoY + 8)
  infoY += 13

  // Number label + number
  pdf.setFontSize(7)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.text("Nº de factura", RIGHT_COL_X, infoY)
  infoY += 4
  pdf.setFontSize(10)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(...hexToRgb(colors.text))
  pdf.text(doc.invoiceInfo.number, RIGHT_COL_X, infoY)
  infoY += 7

  // Dates
  pdf.setFontSize(8)
  pdf.setFont("helvetica", "normal")

  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.text("Fecha emisión:", RIGHT_COL_X, infoY)
  pdf.setTextColor(...hexToRgb(colors.text))
  pdf.text(doc.invoiceInfo.issueDate, RIGHT_COL_X + 24, infoY)
  infoY += 5

  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.text("Vencimiento:", RIGHT_COL_X, infoY)
  pdf.setTextColor(...hexToRgb(colors.text))
  pdf.text(doc.invoiceInfo.dueDate, RIGHT_COL_X + 20, infoY)
  infoY += 5

  if (doc.invoiceInfo.serviceDate) {
    pdf.setTextColor(...hexToRgb(colors.textMuted))
    pdf.text("Fecha servicio:", RIGHT_COL_X, infoY)
    pdf.setTextColor(...hexToRgb(colors.text))
    pdf.text(doc.invoiceInfo.serviceDate, RIGHT_COL_X + 24, infoY)
    infoY += 5
  }

  // Rectification reference block
  if (doc.rectification) {
    infoY += 3
    pdf.setFontSize(7)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(...hexToRgb(colors.textMuted))

    const rectRef = `Rectifica: ${doc.rectification.originalNumber} del ${doc.rectification.originalIssueDate}`
    const rectLines = pdf.splitTextToSize(rectRef, RIGHT_COL_W) as string[]
    rectLines.forEach((line: string) => {
      pdf.text(line, RIGHT_COL_X, infoY)
      infoY += 3.5
    })

    if (doc.rectification.reason && doc.rectification.reason !== "—") {
      const reasonLines = pdf.splitTextToSize(`Motivo: ${doc.rectification.reason}`, RIGHT_COL_W) as string[]
      reasonLines.forEach((line: string) => {
        pdf.text(line, RIGHT_COL_X, infoY)
        infoY += 3.5
      })
    }

    if (doc.rectification.method) {
      const methodLabel = doc.rectification.method === "I" ? "Por diferencias" : "Por sustitución"
      pdf.text(`Método: ${methodLabel}`, RIGHT_COL_X, infoY)
      infoY += 3.5
    }
  }

  // QR Verifactu in right column
  infoY += 4
  if (doc.footer.verifactuQr) {
    const QR_SIZE = 20
    const qrStartY = infoY
    try {
      pdf.addImage(`data:image/png;base64,${doc.footer.verifactuQr}`, "PNG", RIGHT_COL_X, qrStartY, QR_SIZE, QR_SIZE)
    } catch {
      // ignore invalid QR
    }
    const txtX = RIGHT_COL_X + QR_SIZE + 3
    const txtW = RIGHT_COL_W - QR_SIZE - 5
    pdf.setFontSize(7)
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(60, 60, 60)
    pdf.text("VERI*FACTU", txtX, qrStartY + 6)
    if (doc.footer.verifactuUrl) {
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(5.5)
      pdf.setTextColor(100, 100, 100)
      const urlLines = pdf.splitTextToSize(doc.footer.verifactuUrl, txtW) as string[]
      urlLines.slice(0, 5).forEach((line: string, i: number) => {
        pdf.text(line, txtX, qrStartY + 11 + i * 3)
      })
    }
    infoY = qrStartY + QR_SIZE + 3
  } else {
    pdf.setFontSize(6.5)
    pdf.setTextColor(160, 160, 160)
    pdf.setFont("helvetica", "italic")
    pdf.text("Pendiente certificación Verifactu", RIGHT_COL_X, infoY)
    infoY += 5
  }

  // =========================================================
  // LEFT COLUMN — logo + company info
  // =========================================================
  let y = TOP
  const LOGO_W = 34
  const LOGO_H = 22
  const HAS_LOGO = !!options.logoDataUrl

  if (HAS_LOGO) {
    try {
      const imgFmt = /data:image\/jpe?g/i.test(options.logoDataUrl!) ? "JPEG"
        : /data:image\/webp/i.test(options.logoDataUrl!) ? "WEBP"
        : "PNG"
      pdf.addImage(options.logoDataUrl!, imgFmt, M, y, LOGO_W, LOGO_H)
    } catch {
      // ignore invalid logo
    }
  }

  const textX = HAS_LOGO ? M + LOGO_W + 4 : M
  const textAreaW = RIGHT_COL_X - textX - 4

  pdf.setFontSize(14)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(...hexToRgb(colors.primary))
  pdf.text(doc.header.companyName, textX, y + 7)
  y += 11

  pdf.setFontSize(8.5)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(...hexToRgb(colors.textMuted))

  pdf.text(`NIF/CIF: ${doc.header.taxId}`, textX, y)
  y += 5

  const addrLines = pdf.splitTextToSize(doc.header.address, textAreaW) as string[]
  addrLines.forEach((line: string) => {
    pdf.text(line, textX, y)
    y += 4.5
  })

  if (doc.header.email) {
    pdf.text(doc.header.email, textX, y)
    y += 4.5
  }
  if (doc.header.phone) {
    pdf.text(doc.header.phone, textX, y)
    y += 4.5
  }
  if (doc.header.website) {
    pdf.text(doc.header.website, textX, y)
    y += 4.5
  }

  // Sync y with right column bottom
  y = Math.max(y, infoY) + 6

  // =========================================================
  // SEPARATOR LINE
  // =========================================================
  pdf.setDrawColor(...hexToRgb(colors.border))
  pdf.setLineWidth(0.4)
  pdf.line(M, y, M + W, y)
  y += 6

  // =========================================================
  // RECIPIENT BLOCK
  // =========================================================
  pdf.setFontSize(block.titleSize)
  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.setFont("helvetica", "bold")
  pdf.text(doc.recipient.label.toUpperCase(), M, y)
  y += block.titleSize + block.titleSpacing

  pdf.setFontSize(block.contentSize)
  pdf.setTextColor(...hexToRgb(colors.text))
  pdf.setFont("helvetica", "normal")
  pdf.text(doc.recipient.name, M, y)
  y += block.lineHeight
  if (doc.recipient.taxId) {
    pdf.text(`NIF/CIF: ${doc.recipient.taxId}`, M, y)
    y += block.lineHeight
  }
  if (doc.recipient.address) {
    pdf.text(doc.recipient.address, M, y)
    y += block.lineHeight
  }
  if (doc.recipient.email && doc.recipient.email.trim()) {
    pdf.text(doc.recipient.email, M, y)
    y += block.lineHeight
  }
  if (doc.recipient.phone && doc.recipient.phone.trim()) {
    pdf.text(doc.recipient.phone, M, y)
    y += block.lineHeight
  }
  y += block.blockGap

  // =========================================================
  // TABLE
  // =========================================================
  const colWidths = [W * 0.38, W * 0.12, W * 0.18, W * 0.12, W * 0.20]
  const ROW_H = table.rowHeight + table.paddingVertical * 2
  const CELL_PAD_X = table.paddingHorizontal
  const CELL_PAD_Y = table.paddingVertical

  // Table top border
  pdf.setDrawColor(209, 213, 219)
  pdf.setLineWidth(0.3)
  pdf.line(M, y, M + W, y)

  // Header row — primary color background, white text
  pdf.setFillColor(...hexToRgb(colors.primary))
  pdf.rect(M, y, W, ROW_H, "F")
  pdf.setFontSize(table.headerSize)
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(255, 255, 255)
  let xCol = M
  doc.table.headers.forEach((h, i) => {
    pdf.text(h, xCol + CELL_PAD_X, y + CELL_PAD_Y + 4.5)
    xCol += colWidths[i]
  })
  y += ROW_H

  // Data rows — alternating background, subtle bottom border
  pdf.setFontSize(table.cellSize)
  doc.table.rows.forEach((row, rowIdx) => {
    if (y + ROW_H > PAGE_MAX) {
      pdf.addPage()
      y = TOP
    }

    // Row background
    if (rowIdx % 2 === 0) {
      pdf.setFillColor(255, 255, 255)
    } else {
      pdf.setFillColor(249, 250, 251)
    }
    pdf.rect(M, y, W, ROW_H, "F")

    // Row text
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(...hexToRgb(colors.text))
    xCol = M
    const rowY = y + CELL_PAD_Y + 4.5
    pdf.text(row.description, xCol + CELL_PAD_X, rowY)
    xCol += colWidths[0]
    pdf.text(row.quantity, xCol + CELL_PAD_X, rowY)
    xCol += colWidths[1]
    pdf.text(row.unitPrice, xCol + CELL_PAD_X, rowY)
    xCol += colWidths[2]
    pdf.text(row.tax, xCol + CELL_PAD_X, rowY)
    xCol += colWidths[3]
    pdf.text(row.total, xCol + CELL_PAD_X, rowY)

    // Bottom border
    pdf.setDrawColor(229, 231, 235)
    pdf.setLineWidth(0.2)
    pdf.line(M, y + ROW_H, M + W, y + ROW_H)

    y += ROW_H
  })
  y += 4

  // =========================================================
  // TOTALS
  // =========================================================
  const totalsX = M + W - 55
  pdf.setFontSize(totals.labelSize)
  pdf.setFont("helvetica", "normal")
  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.text("Subtotal", totalsX, y)
  pdf.text(doc.totals.subtotal, M + W - 25, y)
  y += totals.lineHeight
  pdf.text("IVA", totalsX, y)
  pdf.text(doc.totals.taxAmount, M + W - 25, y)
  y += totals.lineHeight
  if (doc.totals.irpfAmount && doc.totals.irpfRate) {
    pdf.setTextColor(220, 38, 38)
    pdf.text(`Retención IRPF (${doc.totals.irpfRate}%)`, totalsX, y)
    pdf.text(`-${doc.totals.irpfAmount}`, M + W - 25, y)
    pdf.setTextColor(...hexToRgb(colors.textMuted))
    y += totals.lineHeight
  }
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(totals.finalSize)
  pdf.setTextColor(...hexToRgb(colors.primary))
  pdf.text("Total", totalsX, y)
  pdf.text(doc.totals.total, M + W - 25, y)
  y += totals.lineHeight + 6

  // =========================================================
  // PAYMENT BLOCK
  // =========================================================
  const hasPaymentInfo =
    (doc.footer.paymentMethod && doc.footer.paymentMethod.trim()) ||
    (doc.footer.iban && doc.footer.iban.trim()) ||
    (doc.footer.paymentReference && doc.footer.paymentReference.trim())
  if (hasPaymentInfo) {
    if (y + 12 > PAGE_MAX) { pdf.addPage(); y = TOP }
    pdf.setFontSize(block.titleSize)
    pdf.setTextColor(...hexToRgb(colors.textMuted))
    pdf.setFont("helvetica", "bold")
    pdf.text("FORMA DE PAGO", M, y)
    y += block.titleSize + block.titleSpacing
    pdf.setFontSize(block.contentSize)
    pdf.setTextColor(...hexToRgb(colors.text))
    pdf.setFont("helvetica", "normal")
    if (doc.footer.paymentMethod && doc.footer.paymentMethod.trim()) {
      pdf.text("Forma de pago: " + doc.footer.paymentMethod.trim(), M, y)
      y += block.lineHeight
    }
    if (doc.footer.iban && doc.footer.iban.trim()) {
      pdf.text("IBAN: " + doc.footer.iban.trim(), M, y)
      y += block.lineHeight
    }
    if (doc.footer.bic && doc.footer.bic.trim()) {
      pdf.text("BIC: " + doc.footer.bic.trim(), M, y)
      y += block.lineHeight
    }
    if (doc.footer.paymentReference && doc.footer.paymentReference.trim()) {
      pdf.text("Referencia: " + doc.footer.paymentReference.trim(), M, y)
      y += block.lineHeight
    }
    y += 6
  }

  // =========================================================
  // FOOTER — legal, conditions, notes, terms
  // =========================================================
  pdf.setFontSize(footer.size)
  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.setFont("helvetica", "normal")

  if (doc.footer.legal && doc.footer.legal.trim()) {
    if (y > PAGE_MAX) { pdf.addPage(); y = TOP }
    const splitLegal = pdf.splitTextToSize(doc.footer.legal, W)
    for (const line of splitLegal) {
      if (y > PAGE_MAX) { pdf.addPage(); y = TOP }
      pdf.text(line, M, y)
      y += footer.lineHeight
    }
    y += 2
  }

  if (doc.footer.paymentConditions && doc.footer.paymentConditions.trim()) {
    if (y > PAGE_MAX) { pdf.addPage(); y = TOP }
    const splitPay = pdf.splitTextToSize(doc.footer.paymentConditions, W)
    for (const line of splitPay) {
      if (y > PAGE_MAX) { pdf.addPage(); y = TOP }
      pdf.text(line, M, y)
      y += footer.lineHeight
    }
    y += 2
  }

  if (doc.footer.notes && doc.footer.notes.trim()) {
    if (y > PAGE_MAX) { pdf.addPage(); y = TOP }
    const splitNotes = pdf.splitTextToSize("Notas: " + doc.footer.notes, W)
    for (const line of splitNotes) {
      if (y > PAGE_MAX) { pdf.addPage(); y = TOP }
      pdf.text(line, M, y)
      y += footer.lineHeight
    }
    y += 2
  }

  if (doc.footer.terms && doc.footer.terms.trim()) {
    if (y > PAGE_MAX) { pdf.addPage(); y = TOP }
    const splitTerms = pdf.splitTextToSize("Condiciones: " + doc.footer.terms, W)
    for (const line of splitTerms) {
      if (y > PAGE_MAX) { pdf.addPage(); y = TOP }
      pdf.text(line, M, y)
      y += footer.lineHeight
    }
    y += 2
  }

  // =========================================================
  // RGPD TEXT — tiny legal disclaimer
  // =========================================================
  if (doc.header.companyName && doc.header.email) {
    if (y + 6 > PAGE_MAX) { pdf.addPage(); y = TOP }
    y += 4
    pdf.setFontSize(5.5)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(180, 180, 180)
    const rgpdResponsible = doc.header.legalName || doc.header.companyName
    const rgpdText = `${rgpdResponsible} es responsable del tratamiento de sus datos personales conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD). Sus datos serán tratados para el mantenimiento de la relación comercial. Puede ejercer sus derechos de acceso, rectificación, supresión y portabilidad dirigiéndose a ${doc.header.email}.`
    const rgpdLines = pdf.splitTextToSize(rgpdText, W) as string[]
    rgpdLines.forEach((line: string) => {
      if (y > PAGE_MAX) return
      pdf.text(line, M, y)
      y += 3
    })
  }

  // =========================================================
  // STATUS WATERMARK — drawn last, on top of all content
  // BORRADOR → gray | PAGADA → green | ANULADA → red
  // =========================================================
  const status = doc.invoiceStatus
  const isDraft = status === "DRAFT"
  const isPaid = status === "PAID"
  const isCanceled = status === "CANCELED" || status === "CANCELLED"

  type WatermarkColor = [number, number, number]
  type WatermarkConfig = { label: string; color: WatermarkColor }
  const watermark: WatermarkConfig | null =
    isDraft   ? { label: "BORRADOR", color: [150, 150, 150] } :
    isPaid    ? { label: "PAGADA",   color: [30,  160, 100]  } :
    isCanceled? { label: "ANULADA",  color: [220, 50,  50]   } :
    null

  if (watermark) {
    try {
      pdf.setPage(1)
      pdf.saveGraphicsState()
      const gState = new (pdf as unknown as { GState: new (opts: { opacity: number }) => unknown }).GState({ opacity: 0.13 })
      pdf.setGState(gState as Parameters<typeof pdf.setGState>[0])
      pdf.setFontSize(68)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(...watermark.color)
      pdf.text(
        watermark.label,
        PDF_LAYOUT.page.width / 2,
        PDF_LAYOUT.page.height / 2,
        { align: "center", angle: 30 }
      )
      pdf.restoreGraphicsState()
    } catch {
      // GState not supported — skip watermark
    }
  }

  const buf = Buffer.from(pdf.output("arraybuffer"))
  return buf
}
