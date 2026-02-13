/**
 * PDF layout and typography — single place for dimensions and colors.
 * Used by invoice-renderer; primaryColor can come from branding.
 */

export const PDF_LAYOUT = {
  page: {
    width: 210,
    height: 297,
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 18,
  },
  header: {
    logoHeight: 22,
    companyNameSize: 16,
    companyMetaSize: 9,
    lineHeight: 5,
  },
  block: {
    titleSize: 8,
    titleSpacing: 1,
    contentSize: 10,
    lineHeight: 5,
    blockGap: 10,
  },
  table: {
    headerSize: 8,
    cellSize: 9,
    rowHeight: 7,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  totals: {
    labelSize: 9,
    valueSize: 10,
    finalSize: 12,
    lineHeight: 6,
  },
  footer: {
    size: 7,
    lineHeight: 3.5,
  },
} as const

export type PdfColors = {
  primary: string
  text: string
  textMuted: string
  border: string
  tableHeaderBg: string
  tableHeaderText: string
}

export function getPdfColors(primaryHex: string): PdfColors {
  return {
    primary: primaryHex,
    text: "#1a1a1a",
    textMuted: "#4b5563",
    border: "#d1d5db",
    tableHeaderBg: "#f3f4f6",
    tableHeaderText: "#374151",
  }
}
