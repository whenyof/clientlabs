/**
 * Default notes and terms templates for new invoices.
 * Variables: {{invoiceNumber}}, {{dueDate}}, {{issueDate}}
 *
 * Future: can be replaced by loading from Business Settings (e.g. getDefaultInvoiceTexts()).
 */
export const defaultNotesTemplate = `
Gracias por su confianza.

Si tiene cualquier consulta sobre esta factura, por favor contacte con nuestro equipo indicando el número {{invoiceNumber}}.
`.trim()

export const defaultTermsTemplate = `
Condiciones de pago:
El vencimiento de esta factura es el {{dueDate}}.

El pago deberá realizarse mediante transferencia bancaria a la cuenta indicada.
En caso de impago se podrán aplicar intereses de demora conforme a la Ley 3/2004.

La aceptación de esta factura implica la conformidad con los servicios prestados.
`.trim()
