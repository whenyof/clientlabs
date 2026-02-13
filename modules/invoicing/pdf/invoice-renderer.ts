/**
 * Invoice PDF renderer — draws the document model with jsPDF.
 * Uses layout from styles.ts; no inline styles in template data.
 */

import { jsPDF } from "jspdf"
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

export type RenderOptions = {
  primaryColorHex?: string
  logoDataUrl?: string | null
}

/**
 * Renders the invoice document to a jsPDF instance and returns the PDF as Buffer.
 */
export function renderInvoiceToBuffer(
  doc: InvoiceDocumentModel,
  options: RenderOptions = {}
): Buffer {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const colors = getPdfColors(options.primaryColorHex ?? "#1e3a5f")
  let y = TOP

  // ----- Header -----
  const header = PDF_LAYOUT.header
  if (options.logoDataUrl) {
    try {
      pdf.addImage(options.logoDataUrl, "PNG", M, y, 40, header.logoHeight)
    } catch {
      // ignore invalid image
    }
  }
  pdf.setFontSize(header.companyNameSize)
  pdf.setTextColor(...hexToRgb(colors.primary))
  pdf.setFont("helvetica", "bold")
  pdf.text(doc.header.companyName, M + (options.logoDataUrl ? 44 : 0), y + 8)
  y += header.companyNameSize + 2

  pdf.setFontSize(header.companyMetaSize)
  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.setFont("helvetica", "normal")
  pdf.text(`CIF/NIF: ${doc.header.taxId}`, M + (options.logoDataUrl ? 44 : 0), y)
  y += header.lineHeight
  pdf.text(doc.header.address, M + (options.logoDataUrl ? 44 : 0), y)
  y += header.lineHeight
  if (doc.header.email) {
    pdf.text(doc.header.email, M + (options.logoDataUrl ? 44 : 0), y)
    y += header.lineHeight
  }
  if (doc.header.phone) {
    pdf.text(doc.header.phone, M + (options.logoDataUrl ? 44 : 0), y)
    y += header.lineHeight
  }
  y += PDF_LAYOUT.block.blockGap

  // ----- Recipient block -----
  const block = PDF_LAYOUT.block
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
  pdf.text(`NIF/CIF: ${doc.recipient.taxId}`, M, y)
  y += block.lineHeight
  pdf.text(doc.recipient.address, M, y)
  y += block.lineHeight
  if (doc.recipient.email && doc.recipient.email.trim()) {
    pdf.text(doc.recipient.email, M, y)
    y += block.lineHeight
  }
  if (doc.recipient.phone && doc.recipient.phone.trim()) {
    pdf.text(doc.recipient.phone, M, y)
    y += block.lineHeight
  }
  y += block.blockGap

  // ----- Invoice info (right-aligned) -----
  const infoX = M + W - 55
  let infoY = TOP

  // Rectificativa banner
  if (doc.rectification) {
    pdf.setFontSize(block.titleSize + 1)
    pdf.setTextColor(...hexToRgb(colors.primary))
    pdf.setFont("helvetica", "bold")
    pdf.text(doc.rectification.title, infoX, infoY)
    infoY += block.lineHeight + 2
    pdf.setFontSize(block.contentSize - 1)
    pdf.setTextColor(...hexToRgb(colors.textMuted))
    pdf.setFont("helvetica", "normal")
    pdf.text(`Rectifica factura Nº ${doc.rectification.originalNumber}`, infoX, infoY)
    infoY += block.lineHeight
    pdf.text(`Fecha factura original: ${doc.rectification.originalIssueDate}`, infoX, infoY)
    infoY += block.lineHeight
    pdf.text(`Motivo: ${doc.rectification.reason}`, infoX, infoY)
    infoY += block.lineHeight + 4
  }

  pdf.setFontSize(block.titleSize)
  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.setFont("helvetica", "bold")
  pdf.text(doc.invoiceInfo.numberLabel, infoX, infoY)
  infoY += block.lineHeight
  pdf.setFontSize(block.contentSize)
  pdf.setTextColor(...hexToRgb(colors.text))
  pdf.setFont("helvetica", "bold")
  pdf.text(doc.invoiceInfo.number, infoX, infoY)
  infoY += block.lineHeight + 2
  pdf.setFont("helvetica", "normal")
  pdf.text(`Fecha emisión: ${doc.invoiceInfo.issueDate}`, infoX, infoY)
  infoY += block.lineHeight
  pdf.text(`Vencimiento: ${doc.invoiceInfo.dueDate}`, infoX, infoY)
  if (doc.invoiceInfo.serviceDate) {
    infoY += block.lineHeight
    pdf.text(`Fecha servicio: ${doc.invoiceInfo.serviceDate}`, infoX, infoY)
  }
  y = Math.max(y, infoY) + block.blockGap

  // ----- Table -----
  const table = PDF_LAYOUT.table
  const colWidths = [W * 0.38, W * 0.12, W * 0.18, W * 0.12, W * 0.20]
  let xCol = M

  pdf.setFontSize(table.headerSize)
  pdf.setTextColor(...hexToRgb(colors.tableHeaderText))
  pdf.setFont("helvetica", "bold")
  pdf.setFillColor(...hexToRgb(colors.tableHeaderBg))
  pdf.rect(M, y, W, table.rowHeight + table.paddingVertical * 2, "F")
  doc.table.headers.forEach((h, i) => {
    pdf.text(h, xCol + table.paddingHorizontal, y + table.paddingVertical + 4)
    xCol += colWidths[i]
  })
  y += table.rowHeight + table.paddingVertical * 2 + 1

  pdf.setFontSize(table.cellSize)
  pdf.setTextColor(...hexToRgb(colors.text))
  pdf.setFont("helvetica", "normal")
  doc.table.rows.forEach((row) => {
    xCol = M
    const rowY = y + table.paddingVertical + 4
    pdf.text(row.description, xCol + table.paddingHorizontal, rowY)
    xCol += colWidths[0]
    pdf.text(row.quantity, xCol + table.paddingHorizontal, rowY)
    xCol += colWidths[1]
    pdf.text(row.unitPrice, xCol + table.paddingHorizontal, rowY)
    xCol += colWidths[2]
    pdf.text(row.tax, xCol + table.paddingHorizontal, rowY)
    xCol += colWidths[3]
    pdf.text(row.total, xCol + table.paddingHorizontal, rowY)
    y += table.rowHeight + table.paddingVertical * 2
  })
  y += 4

  // ----- Totals -----
  const totals = PDF_LAYOUT.totals
  const totalsX = M + W - 55
  pdf.setFontSize(totals.labelSize)
  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.text("Subtotal", totalsX, y)
  pdf.text(doc.totals.subtotal, M + W - 25, y)
  y += totals.lineHeight
  pdf.text("IVA", totalsX, y)
  pdf.text(doc.totals.taxAmount, M + W - 25, y)
  y += totals.lineHeight
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(totals.finalSize)
  pdf.setTextColor(...hexToRgb(colors.primary))
  pdf.text("Total", totalsX, y)
  pdf.text(doc.totals.total, M + W - 25, y)
  y += totals.lineHeight + 8

  // ----- Payment block (Forma de pago, IBAN, Referencia) -----
  const hasPaymentInfo =
    (doc.footer.paymentMethod && doc.footer.paymentMethod.trim()) ||
    (doc.footer.iban && doc.footer.iban.trim()) ||
    (doc.footer.paymentReference && doc.footer.paymentReference.trim())
  if (hasPaymentInfo) {
    y += 4
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
    y += block.blockGap
  }

  // ----- Footer -----
  const footer = PDF_LAYOUT.footer
  let footerCur = PDF_LAYOUT.page.height - PDF_LAYOUT.page.marginBottom - 25
  pdf.setFontSize(footer.size)
  pdf.setTextColor(...hexToRgb(colors.textMuted))
  pdf.setFont("helvetica", "normal")
  if (doc.footer.legal && doc.footer.legal.trim()) {
    const splitLegal = pdf.splitTextToSize(doc.footer.legal, W)
    splitLegal.forEach((line: string) => {
      pdf.text(line, M, footerCur)
      footerCur += footer.lineHeight
    })
    pdf.setDrawColor(...hexToRgb(colors.border))
    footerCur += 2
  }
  if (doc.footer.paymentConditions && doc.footer.paymentConditions.trim()) {
    const splitPay = pdf.splitTextToSize(doc.footer.paymentConditions, W)
    splitPay.forEach((line: string) => {
      pdf.text(line, M, footerCur)
      footerCur += footer.lineHeight
    })
  }
  if (doc.footer.notes && doc.footer.notes.trim()) {
    footerCur += 2
    pdf.text("Notas: " + doc.footer.notes.slice(0, 200), M, footerCur)
    footerCur += footer.lineHeight
  }
  if (doc.footer.terms && doc.footer.terms.trim()) {
    pdf.text("Condiciones: " + doc.footer.terms.slice(0, 150), M, footerCur)
  }

  const buf = Buffer.from(pdf.output("arraybuffer"))
  return buf
}
