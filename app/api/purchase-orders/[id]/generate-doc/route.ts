export const maxDuration = 15

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as invoiceService from "@/modules/invoicing/services/invoice.service"
import { getF1ClientFiscalBlock } from "@/lib/clients/calculateFiscalCompleteness"
import { getNextDocumentNumber } from "@/lib/counters/document-counter"

function nextQuoteNumber(userId: string): Promise<string> {
  return getNextDocumentNumber(userId, "P")
}

function nextDNNumber(userId: string): Promise<string> {
  return getNextDocumentNumber(userId, "ALB")
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { docType, invoiceDocType = "F1" } = await req.json()

  const po = await prisma.purchaseOrder.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: {
      items: { select: { productId: true, description: true, quantity: true, unitPrice: true, taxRate: true, subtotal: true } },
      client: { select: { id: true, name: true, legalName: true, taxId: true, email: true, address: true, city: true, postalCode: true, country: true } },
      quote: { select: { id: true, convertedToInvoiceId: true, convertedToDeliveryNoteId: true } },
    },
  })
  if (!po) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })

  // ── Presupuesto ───────────────────────────────────────────────────────────
  if (docType === "quote") {
    if (po.quoteId) return NextResponse.json({ error: "Este pedido ya tiene un presupuesto vinculado" }, { status: 409 })
    const number = await nextQuoteNumber(session.user.id)
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 30)
    const q = await prisma.quote.create({
      data: {
        userId: session.user.id, clientId: po.clientId, number,
        validUntil, subtotal: po.subtotal, taxTotal: po.taxTotal, total: po.total,
        notes: po.notes,
        items: {
          create: po.items.map(i => ({
            productId: i.productId ?? null, description: i.description,
            quantity: i.quantity, unitPrice: i.unitPrice, taxRate: i.taxRate, subtotal: i.subtotal,
          })),
        },
      },
      select: { id: true, number: true },
    })
    await prisma.purchaseOrder.update({ where: { id }, data: { quoteId: q.id } })
    return NextResponse.json({ success: true, number: q.number })
  }

  // ── Albarán ───────────────────────────────────────────────────────────────
  if (docType === "deliveryNote") {
    const alreadyLinked = po.convertedToDeliveryNoteId || po.quote?.convertedToDeliveryNoteId
    if (alreadyLinked) return NextResponse.json({ error: "Ya existe un albarán para este pedido" }, { status: 409 })
    const number = await nextDNNumber(session.user.id)
    const dn = await prisma.deliveryNote.create({
      data: {
        userId: session.user.id, clientId: po.clientId, number,
        notes: po.notes,
        ...(po.quoteId ? { quoteId: po.quoteId } : {}),
        items: {
          create: po.items.map(i => ({
            productId: i.productId ?? null, description: i.description,
            quantity: i.quantity, unitPrice: i.unitPrice, taxRate: i.taxRate ?? 21, delivered: true,
          })),
        },
      },
      select: { id: true, number: true },
    })
    await prisma.purchaseOrder.update({ where: { id }, data: { convertedToDeliveryNoteId: dn.id } })
    if (po.quoteId) {
      await prisma.quote.update({ where: { id: po.quoteId }, data: { convertedToDeliveryNoteId: dn.id } })
    }
    return NextResponse.json({ success: true, number: dn.number })
  }

  // ── Factura ───────────────────────────────────────────────────────────────
  if (docType === "invoice") {
    const alreadyLinked = po.convertedToInvoiceId || po.quote?.convertedToInvoiceId
    if (alreadyLinked) return NextResponse.json({ error: "Ya existe una factura para este pedido" }, { status: 409 })
    // F1 (completa) exige datos fiscales del cliente; F2 (simplificada) no.
    if (invoiceDocType !== "F2") {
      const block = getF1ClientFiscalBlock(po.client)
      if (block) return NextResponse.json({ error: block, needsClientFiscalData: true, clientId: po.clientId }, { status: 400 })
    }
    const issueDate = new Date()
    const dueDate = new Date(issueDate)
    dueDate.setDate(dueDate.getDate() + 30)
    const created = await invoiceService.createInvoice({
      userId: session.user.id, clientId: po.clientId, series: "INV",
      issueDate, dueDate, currency: "EUR", notes: po.notes ?? null,
      invoiceDocType: invoiceDocType === "F2" ? "F2" : "F1",
      clientSnapshot: po.client ? {
        name: po.client.name ?? null, legalName: po.client.legalName ?? null,
        taxId: po.client.taxId ?? null, email: po.client.email ?? null,
        address: po.client.address ?? null, city: po.client.city ?? null,
        postalCode: po.client.postalCode ?? null, country: po.client.country ?? null,
      } : null,
      lines: po.items.map(i => ({
        description: i.description, quantity: i.quantity,
        unitPrice: i.unitPrice, taxPercent: i.taxRate,
      })),
    })
    if (!created) return NextResponse.json({ error: "Error al crear la factura" }, { status: 500 })
    await prisma.purchaseOrder.update({ where: { id }, data: { convertedToInvoiceId: created.id } })
    if (po.quoteId) {
      await prisma.quote.update({ where: { id: po.quoteId }, data: { convertedToInvoiceId: created.id } })
    }
    const fiscalWarning = await invoiceService.getDraftFiscalWarning(session.user.id, po.clientId)
    return NextResponse.json({ success: true, number: created.number, fiscalWarning })
  }

  return NextResponse.json({ error: "docType inválido" }, { status: 400 })
}
