/**
 * Invoice PDF module — public API.
 */

export { generateInvoicePDF } from "./generator"
export { buildInvoiceDocument } from "./invoice-template"
export type { InvoiceDocumentModel } from "./invoice-template"
export { renderInvoiceToBuffer } from "./invoice-renderer"
export type { RenderOptions } from "./invoice-renderer"
export { getBrandingForUser } from "./branding"
export type { InvoiceBranding } from "./branding"
export type { InvoicePdfData, InvoiceLinePdf } from "./types"
export { PDF_LAYOUT, getPdfColors } from "./styles"
export type { PdfColors } from "./styles"
