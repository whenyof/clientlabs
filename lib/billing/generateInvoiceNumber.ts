import { prisma } from "@/lib/prisma"

export type InvoiceSerie = "FAC" | "PRE" | "ALB" | "REC"

/**
 * Generates the next invoice number for a given series and user.
 * Format: {serie}-{year}-{padded sequence number}
 * Example: FAC-2026-001
 *
 * Uses the Invoice model (the main invoicing engine model).
 */
export async function generateInvoiceNumber(
  userId: string,
  serie: InvoiceSerie
): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `${serie}-${year}-`

  const count = await prisma.invoice.count({
    where: {
      userId,
      number: { startsWith: prefix },
    },
  })

  return `${prefix}${String(count + 1).padStart(3, "0")}`
}
