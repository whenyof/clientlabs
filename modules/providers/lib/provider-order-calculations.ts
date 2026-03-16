/**
 * Helpers for provider order calculations and formatting.
 */

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount)
}

export function orderTotalFromItems(
  items: { quantity: number; unitPrice: number }[]
): number {
  return items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
}
