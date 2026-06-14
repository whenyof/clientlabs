export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as invoiceService from "@/modules/invoicing/services/invoice.service"
import { getF1ClientFiscalBlock } from "@/lib/clients/calculateFiscalCompleteness"

/**
 * POST /api/delivery-notes/[id]/convert-invoice
 *
 * Creates a DRAFT invoice from a delivery note using the canonical invoicing
 * service (same path as quote→invoice and manual invoices):
 * - Number stays "BORRADOR"; the real number (series "INV") is assigned at issue.
 * - Verifactu signing happens ONLY at issue (invoiceService.issueInvoice).
 * - Per-line tax uses the delivery-note line taxRate (fallback 21).
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  let invoiceDocType: "F1" | "F2" = "F1"
  try {
    const body = await req.json()
    if (body?.invoiceDocType === "F2") invoiceDocType = "F2"
  } catch {}

  const note = await prisma.deliveryNote.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: { items: true },
  })
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (note.convertedToInvoiceId) return NextResponse.json({ error: "Already converted" }, { status: 400 })
  if (note.items.length === 0) return NextResponse.json({ error: "El albarán no tiene líneas" }, { status: 400 })

  // Client snapshot (required for F1 emission via Verifactu at issue time)
  const client = await prisma.client.findFirst({
    where: { id: note.clientId, userId: session.user.id },
    select: {
      name: true, legalName: true, taxId: true, email: true,
      address: true, city: true, postalCode: true, country: true,
    },
  })

  // F1 (completa) exige datos fiscales del cliente; F2 (simplificada) no. Se comprueba
  // ANTES de crear nada para no dejar la factura borrador huérfana ni un F1 inválido.
  if (invoiceDocType !== "F2") {
    const block = getF1ClientFiscalBlock(client)
    if (block) return NextResponse.json({ error: block, needsClientFiscalData: true, clientId: note.clientId }, { status: 400 })
  }

  const issueDate = new Date()
  const dueDate = new Date(issueDate)
  dueDate.setDate(dueDate.getDate() + 30)

  const created = await invoiceService.createInvoice({
    userId: session.user.id,
    clientId: note.clientId,
    series: "INV",
    issueDate,
    dueDate,
    currency: "EUR",
    notes: note.notes ?? null,
    invoiceDocType,
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
    lines: note.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxPercent: item.taxRate ?? 21,
    })),
  })

  if (!created) {
    return NextResponse.json({ error: "Error al crear la factura" }, { status: 500 })
  }

  await prisma.deliveryNote.update({
    where: { id: note.id },
    data: { status: "CONVERTED", convertedToInvoiceId: created.id },
  })

  return NextResponse.json({
    success: true,
    id: created.id,
    number: created.number,
    invoiceId: created.id,
    invoiceNumber: created.number,
  })
}
