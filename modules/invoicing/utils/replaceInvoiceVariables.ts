/**
 * Replaces {{variable}} placeholders in invoice text templates.
 * Used for default notes/terms and future Business Settings templates.
 */
export type InvoiceTemplateVariables = {
  invoiceNumber?: string
  dueDate?: string
  issueDate?: string
  /** Add more as needed (e.g. clientName, total, currency) */
}

const VAR_PATTERN = /\{\{(\w+)\}\}/g

export function replaceInvoiceVariables(
  template: string,
  variables: InvoiceTemplateVariables
): string {
  return template.replace(VAR_PATTERN, (_, key: string) => {
    const value = variables[key as keyof InvoiceTemplateVariables]
    return value !== undefined && value !== null ? String(value) : `{{${key}}}`
  })
}

/**
 * Format a date string (YYYY-MM-DD) for display in legal text (e.g. "11 de febrero de 2025").
 * Pass-through if already formatted.
 */
export function formatDateForTemplate(isoDate: string): string {
  try {
    const d = new Date(isoDate + "T12:00:00")
    if (Number.isNaN(d.getTime())) return isoDate
    const day = d.getDate()
    const months = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ]
    const month = months[d.getMonth()]
    const year = d.getFullYear()
    return `${day} de ${month} de ${year}`
  } catch {
    return isoDate
  }
}
