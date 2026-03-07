/**
 * Centralized invoice status → human-readable label (Spanish).
 * Single source of truth for invoicing UI. Ready for i18n: later accept locale and return from translations.
 */

/** Professional ERP status labels (Spanish, no emojis). */
const LABELS_ES: Record<string, string> = {
  DRAFT: "Borrador",
  SENT: "Emitida",
  VIEWED: "Enviada",
  PARTIAL: "Parcial",
  PAID: "Pagada",
  OVERDUE: "Vencida",
  CANCELED: "Cancelada",
  draft: "Borrador",
  issued: "Emitida",
  sent: "Enviada",
  paid: "Pagada",
  overdue: "Vencida",
  cancelled: "Cancelada",
}

export function invoiceStatusLabel(status: string): string {
  if (!status) return status
  const normalized = status.trim()
  return LABELS_ES[normalized] ?? LABELS_ES[normalized.toUpperCase()] ?? status
}
