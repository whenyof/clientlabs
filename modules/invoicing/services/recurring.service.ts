import "server-only"
/**
 * Facturas recurrentes — generación de BORRADORES.
 *
 * Fuente ÚNICA de la lógica de "Generar ahora": la usan el botón manual
 * (/api/billing/recurring/[id]/generate) y el cron (/api/cron/recurring-invoices),
 * para que nunca se desincronicen. NUNCA emite ni toca Verifactu/numeración fiscal:
 * solo crea una factura REAL en BORRADOR vía invoiceService.createInvoice.
 */
import { prisma } from "@/lib/prisma"
import * as invoiceService from "./invoice.service"
import { computeNextRunDate } from "../utils/recurringSchedule"

export type GenerateDraftResult =
  | { ok: true; invoiceId: string; number: string; total: number; clientName: string; nextRunDate: Date; ended: boolean }
  | { ok: false; reason: "not_found" | "not_active" | "no_items" | "create_failed" | "claimed" }

/**
 * Crea un borrador a partir de una plantilla recurrente y avanza la plantilla
 * de forma idempotente.
 *
 * - `opts.advanceAfter` (cron): salta `nextRunDate` hasta la primera ocurrencia
 *   estrictamente posterior a esa fecha → genera UN solo borrador sin volcar
 *   atrasos. Si se omite (botón manual), avanza exactamente un intervalo.
 * - Idempotencia: el avance es un updateMany con guarda condicional
 *   (status ACTIVE + nextRunDate == el valor leído). Si otra ejecución ya avanzó
 *   la ocurrencia, el borrador recién creado se revierte → nunca se duplica.
 * - NO comprueba datos fiscales F1: el borrador no los necesita; el bloqueo se
 *   aplica al EMITIR (igual que en el flujo manual). El botón manual añade, además,
 *   un aviso previo de F1 a nivel de ruta para la UX.
 */
export async function generateDraftFromRecurring(
  recurringId: string,
  userId: string,
  opts?: { advanceAfter?: Date },
): Promise<GenerateDraftResult> {
  const tpl = await prisma.recurringInvoice.findFirst({
    where: { id: recurringId, userId },
    include: { items: true },
  })
  if (!tpl) return { ok: false, reason: "not_found" }
  if (tpl.status !== "ACTIVE") return { ok: false, reason: "not_active" }
  if (tpl.items.length === 0) return { ok: false, reason: "no_items" }

  const client = await prisma.client.findFirst({
    where: { id: tpl.clientId, userId },
    select: { name: true, legalName: true, taxId: true, email: true, address: true, city: true, postalCode: true, country: true },
  })

  // Próxima fecha: un paso. Con advanceAfter, salta hasta la primera ocurrencia
  // posterior a esa fecha (cron caído → un solo borrador, sin atrasos).
  let next = computeNextRunDate(tpl.nextRunDate, tpl.frequency, tpl.intervalMonths, tpl.dayOfMonth)
  if (opts?.advanceAfter) {
    let guard = 0
    while (next <= opts.advanceAfter && guard < 600) {
      next = computeNextRunDate(next, tpl.frequency, tpl.intervalMonths, tpl.dayOfMonth)
      guard++
    }
  }
  const reachedEnd = tpl.endDate != null && next > tpl.endDate

  const issueDate = new Date()
  const dueDate = new Date(issueDate)
  dueDate.setDate(dueDate.getDate() + 30)

  // 1) Crear el BORRADOR (mismo flujo que el manual). Nunca emite.
  const created = await invoiceService.createInvoice({
    userId,
    clientId: tpl.clientId,
    series: "INV",
    issueDate,
    dueDate,
    currency: tpl.currency,
    notes: tpl.notes,
    invoiceDocType: tpl.type,
    clientSnapshot: client
      ? {
          name: client.name ?? null,
          legalName: client.legalName ?? null,
          taxId: client.taxId ?? null,
          email: client.email ?? null,
          address: client.address ?? null,
          city: client.city ?? null,
          postalCode: client.postalCode ?? null,
          country: client.country ?? null,
        }
      : null,
    lines: tpl.items.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      discountPercent: i.discountPercent || undefined,
      taxPercent: i.taxPercent,
    })),
  })
  if (!created) return { ok: false, reason: "create_failed" }

  // IRPF: se persiste sobre el borrador igual que la ruta de creación normal.
  if (tpl.irpfRate > 0) {
    const draft = await prisma.invoice.findFirst({ where: { id: created.id, userId }, select: { subtotal: true } })
    const subtotal = draft ? Number(draft.subtotal) : 0
    const irpfAmount = Math.round(subtotal * (tpl.irpfRate / 100) * 100) / 100
    await prisma.invoice.update({ where: { id: created.id }, data: { irpfRate: tpl.irpfRate, irpfAmount } })
  }

  // 2) Avance idempotente: solo si nextRunDate sigue siendo el leído (guarda condicional).
  const claim = await prisma.recurringInvoice.updateMany({
    where: { id: tpl.id, userId, status: "ACTIVE", nextRunDate: tpl.nextRunDate },
    data: {
      nextRunDate: next,
      generatedCount: { increment: 1 },
      lastGeneratedAt: issueDate,
      ...(reachedEnd && { status: "ENDED" }),
    },
  })
  if (claim.count === 0) {
    // Otra ejecución (reintento/solape) ya avanzó la ocurrencia → revertir el duplicado.
    await invoiceService.deleteDraftInvoice(created.id, userId).catch(() => {})
    return { ok: false, reason: "claimed" }
  }

  const totalRow = await prisma.invoice.findFirst({ where: { id: created.id }, select: { total: true } })
  return {
    ok: true,
    invoiceId: created.id,
    number: created.number,
    total: totalRow ? Number(totalRow.total) : 0,
    clientName: client?.name ?? client?.legalName ?? "Cliente",
    nextRunDate: next,
    ended: reachedEnd,
  }
}
