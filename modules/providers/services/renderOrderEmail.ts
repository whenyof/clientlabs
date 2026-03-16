/**
 * Render provider order email from template and variables.
 * English: {provider_name}, {order_date}, {order_number}, {products_table}, {total_amount}, {notes}
 * Spanish: {nombre_proveedor}, {fecha_pedido}, {numero_pedido}, {lineas_pedido}, {importe_total}, {notas_pedido}
 */

export type OrderEmailVars = {
  providerName: string
  orderDate: string
  orderNumber: string
  productsTable: string
  totalAmount: string
  notes: string
}

export function renderOrderEmail(
  subjectTemplate: string,
  bodyTemplate: string,
  vars: OrderEmailVars
): { subject: string; body: string } {
  const replace = (text: string) => {
    return text
      .replace(/\{provider_name\}/gi, vars.providerName)
      .replace(/\{nombre_proveedor\}/gi, vars.providerName)
      .replace(/\{order_date\}/gi, vars.orderDate)
      .replace(/\{fecha_pedido\}/gi, vars.orderDate)
      .replace(/\{order_number\}/gi, vars.orderNumber)
      .replace(/\{numero_pedido\}/gi, vars.orderNumber)
      .replace(/\{products_table\}/gi, vars.productsTable)
      .replace(/\{lineas_pedido\}/gi, vars.productsTable)
      .replace(/\{total_amount\}/gi, vars.totalAmount)
      .replace(/\{importe_total\}/gi, vars.totalAmount)
      .replace(/\{notes\}/gi, vars.notes)
      .replace(/\{notas_pedido\}/gi, vars.notes)
  }
  return {
    subject: replace(subjectTemplate),
    body: replace(bodyTemplate),
  }
}

/** Format order lines as plain text for {products_table} */
export function formatProductsTable(lines: { code: string; name: string; unit: string | null; quantity: number; unitPrice: number; subtotal: number }[], formatCurrency: (n: number) => string): string {
  if (lines.length === 0) return "—"
  return lines
    .map(
      (l) =>
        `- ${l.code} | ${l.name} | ${l.quantity} ${l.unit || "uds"} | ${formatCurrency(l.unitPrice)} | ${formatCurrency(l.subtotal)}`
    )
    .join("\n")
}

/** Format order lines for email body: one compact line per product (code · name — qty × price = subtotal) */
export function formatProductsTableSpanish(lines: { code: string; name: string; unit: string | null; quantity: number; unitPrice: number; subtotal: number }[], formatCurrency: (n: number) => string): string {
  if (lines.length === 0) return "—"
  return lines
    .map(
      (l) =>
        `${l.code} · ${l.name} — ${l.quantity} × ${formatCurrency(l.unitPrice)} = ${formatCurrency(l.subtotal)}`
    )
    .join("\n")
}
