/**
 * Atomic document numbering using InvoiceSeries as generic counter table.
 * Same $transaction pattern as consumeNextNumber() in invoice.repository.ts.
 * Eliminates race conditions in delivery notes, quotes, and purchase orders.
 */

import { prisma } from "@/lib/prisma"

export type DocumentType = "ALB" | "P" | "PED"

const DOCUMENT_CONFIG: Record<DocumentType, { prefix: string; seriesName: string }> = {
  ALB: { prefix: "A",   seriesName: "ALBARAN" },
  P:   { prefix: "P",   seriesName: "PRESUPUESTO" },
  PED: { prefix: "PED", seriesName: "PEDIDO" },
}

/**
 * Returns the next formatted document number atomically.
 * Format: <prefix>-<YYYY>-<NNN>
 * Resets to 1 on year change, same as invoice series.
 */
export async function getNextDocumentNumber(userId: string, type: DocumentType): Promise<string> {
  const { prefix, seriesName } = DOCUMENT_CONFIG[type]
  const year = new Date().getFullYear()

  const seq = await prisma.$transaction(async (tx) => {
    let series = await tx.invoiceSeries.findUnique({
      where: { userId_name: { userId, name: seriesName } },
    })

    if (!series) {
      series = await tx.invoiceSeries.create({
        data: { userId, name: seriesName, prefix, nextNumber: 1, year },
      })
    }

    const yearChanged = series.year !== year
    const numberToUse = yearChanged ? 1 : series.nextNumber

    await tx.invoiceSeries.update({
      where: { id: series.id },
      data: { nextNumber: numberToUse + 1, year },
    })

    return numberToUse
  })

  return `${prefix}-${year}-${String(seq).padStart(3, "0")}`
}
