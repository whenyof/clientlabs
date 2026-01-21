import { type InvoiceLine } from "../mock"

export interface InvoiceTotals {
  subtotal: number
  taxAmount: number
  total: number
}

/**
 * Calcula el total de una línea de factura
 */
export function calculateLineTotal(line: InvoiceLine): number {
  const subtotal = line.quantity * line.unitPrice
  const discount = line.discount ? (subtotal * line.discount) / 100 : 0
  const subtotalWithDiscount = subtotal - discount
  const taxAmount = (subtotalWithDiscount * line.taxRate) / 100
  return subtotalWithDiscount + taxAmount
}

/**
 * Calcula los totales de una factura a partir de sus líneas
 */
export function calculateInvoiceTotals(lines: InvoiceLine[]): InvoiceTotals {
  const subtotal = lines.reduce((sum, line) => {
    const lineSubtotal = line.quantity * line.unitPrice
    const discount = line.discount ? (lineSubtotal * line.discount) / 100 : 0
    return sum + (lineSubtotal - discount)
  }, 0)

  const taxAmount = lines.reduce((sum, line) => {
    const lineSubtotal = line.quantity * line.unitPrice
    const discount = line.discount ? (lineSubtotal * line.discount) / 100 : 0
    const subtotalWithDiscount = lineSubtotal - discount
    return sum + (subtotalWithDiscount * line.taxRate) / 100
  }, 0)

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round((subtotal + taxAmount) * 100) / 100
  }
}

/**
 * Calcula el IVA total de una factura
 */
export function calculateTaxAmount(subtotal: number, taxRate: number): number {
  return Math.round((subtotal * taxRate / 100) * 100) / 100
}

/**
 * Calcula el subtotal antes de impuestos
 */
export function calculateSubtotal(lines: InvoiceLine[]): number {
  return lines.reduce((sum, line) => {
    const lineTotal = line.quantity * line.unitPrice
    const discount = line.discount ? (lineTotal * line.discount) / 100 : 0
    return sum + (lineTotal - discount)
  }, 0)
}

/**
 * Formatea un número como moneda en euros
 */
export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Calcula la fecha de vencimiento basada en los términos de pago
 */
export function calculateDueDate(issueDate: Date, paymentTerms: string): Date {
  const dueDate = new Date(issueDate)

  switch (paymentTerms) {
    case 'Contado':
      return dueDate
    case '7 días':
      dueDate.setDate(dueDate.getDate() + 7)
      break
    case '15 días':
      dueDate.setDate(dueDate.getDate() + 15)
      break
    case '30 días':
      dueDate.setDate(dueDate.getDate() + 30)
      break
    case '60 días':
      dueDate.setDate(dueDate.getDate() + 60)
      break
    default:
      dueDate.setDate(dueDate.getDate() + 30) // Default to 30 days
  }

  return dueDate
}

/**
 * Genera un hash único para la factura (simulado)
 */
export function generateInvoiceHash(invoiceData: any): string {
  // En producción, esto debería usar un algoritmo criptográfico real
  const data = JSON.stringify(invoiceData)
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).toUpperCase()
}

/**
 * Calcula el porcentaje de IVA aplicado
 */
export function getTaxRate(subtotal: number, total: number): number {
  if (subtotal === 0) return 0
  const taxAmount = total - subtotal
  return Math.round((taxAmount / subtotal) * 100 * 100) / 100
}

/**
 * Valida que los cálculos de la factura sean correctos
 */
export function validateInvoiceCalculations(lines: InvoiceLine[], expectedTotal: number): boolean {
  const calculatedTotals = calculateInvoiceTotals(lines)
  return Math.abs(calculatedTotals.total - expectedTotal) < 0.01 // Tolerancia de 1 céntimo
}