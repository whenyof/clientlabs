export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as invoiceService from "@/modules/invoicing/services/invoice.service"
import { getF1ClientFiscalBlock } from "@/lib/clients/calculateFiscalCompleteness"
import { computeNextRunDate } from "@/modules/invoicing/utils/recurringSchedule"

/**
 * POST /api/billing/recurring/[id]/generate — "Generar ahora".
 *
 * Crea una factura REAL en BORRADOR a partir de la plantilla, usando EXACTAMENTE
 * el flujo de creación existente (invoiceService.createInvoice → numeración atómica
 * en emisión, número "BORRADOR" hasta emitir). NO emite ni la registra en Verifactu:
 * el usuario la revisa y la emite con el flujo normal. Tras generar, avanza la
 * plantilla (nextRunDate, generatedCount, lastGeneratedAt).
 */
export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id
  const { id } = await params

  try {
    const tpl = await prisma.recurringInvoice.findFirst({
      where: { id, userId },
      include: { items: true },
    })
    if (!tpl) return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 })
    if (tpl.status !== "ACTIVE") {
      return NextResponse.json({ error: "La plantilla no está activa. Reanúdala para generar facturas." }, { status: 400 })
    }
    if (tpl.items.length === 0) {
      return NextResponse.json({ error: "La plantilla no tiene líneas." }, { status: 400 })
    }

    const client = await prisma.client.findFirst({
      where: { id: tpl.clientId, userId },
      select: {
        name: true, legalName: true, taxId: true, email: true,
        address: true, city: true, postalCode: true, country: true,
      },
    })

    // Misma lógica de datos fiscales/F1 que el resto del módulo: F1 exige datos
    // fiscales del cliente; F2 no. Devuelve needsClientFiscalData para abrir el modal.
    if (tpl.type !== "F2") {
      const block = getF1ClientFiscalBlock(client)
      if (block) return NextResponse.json({ error: block, needsClientFiscalData: true, clientId: tpl.clientId }, { status: 400 })
    }

    const issueDate = new Date()
    const dueDate = new Date(issueDate)
    dueDate.setDate(dueDate.getDate() + 30)

    // Reutiliza el flujo de creación canónico → crea SOLO un borrador (status DRAFT,
    // número "BORRADOR"). La emisión Verifactu es un paso aparte que hace el usuario.
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
    if (!created) return NextResponse.json({ error: "No se pudo generar la factura" }, { status: 500 })

    // IRPF: se persiste sobre el borrador igual que la ruta de creación normal.
    if (tpl.irpfRate > 0) {
      const draft = await prisma.invoice.findFirst({ where: { id: created.id, userId }, select: { subtotal: true } })
      const subtotal = draft ? Number(draft.subtotal) : 0
      const irpfAmount = Math.round(subtotal * (tpl.irpfRate / 100) * 100) / 100
      await prisma.invoice.update({ where: { id: created.id }, data: { irpfRate: tpl.irpfRate, irpfAmount } })
    }

    // Avanzar la plantilla (preparado para el cron futuro).
    const next = computeNextRunDate(tpl.nextRunDate, tpl.frequency, tpl.intervalMonths, tpl.dayOfMonth)
    const reachedEnd = tpl.endDate != null && next > tpl.endDate
    await prisma.recurringInvoice.update({
      where: { id: tpl.id },
      data: {
        nextRunDate: next,
        generatedCount: { increment: 1 },
        lastGeneratedAt: issueDate,
        ...(reachedEnd && { status: "ENDED" }),
      },
    })

    return NextResponse.json({
      success: true,
      draft: true,
      invoiceId: created.id,
      number: created.number,
      nextRunDate: next.toISOString(),
      ended: reachedEnd,
    })
  } catch (e) {
    console.error("POST /api/billing/recurring/[id]/generate", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
