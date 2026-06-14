export const maxDuration = 15

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as invoiceService from "@/modules/invoicing/services/invoice.service"
import { getF1ClientFiscalBlock } from "@/lib/clients/calculateFiscalCompleteness"
import { getNextDocumentNumber } from "@/lib/counters/document-counter"

function nextPONumber(userId: string): Promise<string> {
  return getNextDocumentNumber(userId, "PED")
}

function nextDNNumber(userId: string): Promise<string> {
  return getNextDocumentNumber(userId, "ALB")
}

type DocRef = { id: string; number: string } | null

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const {
    generateOrder = false,
    generateDeliveryNote = false,
    generateInvoice = false,
    invoiceDocType = "F1",
  } = body

  const quote = await prisma.quote.findFirst({
    where: { id, userId: session.user.id, status: "ACCEPTED", deletedAt: null },
    include: { items: true },
  })
  if (!quote) return NextResponse.json({ error: "Presupuesto no encontrado o no está aceptado" }, { status: 404 })

  // F1 (completa) exige datos fiscales del cliente; F2 no. Se comprueba ANTES de
  // crear nada para no dejar pedido/albarán huérfanos si la factura no puede generarse.
  if (generateInvoice && invoiceDocType !== "F2") {
    const fiscalClient = await prisma.client.findUnique({
      where: { id: quote.clientId },
      select: { legalName: true, taxId: true, address: true, postalCode: true, city: true, country: true },
    })
    const block = getF1ClientFiscalBlock(fiscalClient)
    if (block) return NextResponse.json({ error: block, needsClientFiscalData: true, clientId: quote.clientId }, { status: 400 })
  }

  const result: { order: DocRef; deliveryNote: DocRef; invoice: DocRef } = {
    order: null, deliveryNote: null, invoice: null,
  }

  // ── Hoja de pedido ──────────────────────────────────────────────────────────
  if (generateOrder) {
    const existing = await prisma.purchaseOrder.findUnique({
      where: { quoteId: id }, select: { id: true, number: true },
    })
    if (existing) {
      result.order = existing
    } else {
      const number = await nextPONumber(session.user.id)
      result.order = await prisma.purchaseOrder.create({
        data: {
          userId: session.user.id, clientId: quote.clientId, quoteId: quote.id,
          number, subtotal: quote.subtotal, taxTotal: quote.taxTotal, total: quote.total,
          notes: quote.notes,
          items: {
            create: quote.items.map(i => ({
              productId: i.productId ?? null, description: i.description,
              quantity: i.quantity, unitPrice: i.unitPrice, taxRate: i.taxRate, subtotal: i.subtotal,
            })),
          },
        },
        select: { id: true, number: true },
      })
    }
  }

  // ── Albarán ─────────────────────────────────────────────────────────────────
  if (generateDeliveryNote) {
    const existing = await prisma.deliveryNote.findFirst({
      where: { quoteId: id }, select: { id: true, number: true },
    })
    if (existing) {
      result.deliveryNote = existing
    } else {
      const number = await nextDNNumber(session.user.id)
      const dn = await prisma.deliveryNote.create({
        data: {
          userId: session.user.id, clientId: quote.clientId, quoteId: id, number,
          notes: quote.notes,
          items: {
            create: quote.items.map(i => ({
              productId: i.productId ?? null, description: i.description,
              quantity: i.quantity, unitPrice: i.unitPrice, taxRate: i.taxRate ?? 21, delivered: true,
            })),
          },
        },
        select: { id: true, number: true },
      })
      result.deliveryNote = dn
      await prisma.quote.update({ where: { id }, data: { convertedToDeliveryNoteId: dn.id } })
    }
  }

  // ── Factura (borrador — mismo flujo que factura normal) ──────────────────────
  if (generateInvoice) {
    if (quote.convertedToInvoiceId) {
      const existing = await prisma.invoice.findUnique({
        where: { id: quote.convertedToInvoiceId }, select: { id: true, number: true },
      })
      result.invoice = existing
    } else {
      // Fetch client data for snapshot (required for F1 emission via Verifactu)
      const client = await prisma.client.findUnique({
        where: { id: quote.clientId },
        select: {
          name: true, legalName: true, taxId: true, email: true,
          address: true, city: true, postalCode: true, country: true,
        },
      })

      const issueDate = new Date()
      const dueDate = new Date(issueDate)
      dueDate.setDate(dueDate.getDate() + 30)

      // Use the invoice service — same path as a manually created invoice
      // Number stays "BORRADOR" until the user emits it
      const created = await invoiceService.createInvoice({
        userId: session.user.id,
        clientId: quote.clientId,
        series: "INV",
        issueDate,
        dueDate,
        currency: "EUR",
        notes: quote.notes ?? null,
        terms: quote.terms ?? null,
        invoiceDocType: invoiceDocType === "F2" ? "F2" : "F1",
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
        lines: quote.items.map(i => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          taxPercent: i.taxRate,
        })),
      })

      if (!created) {
        return NextResponse.json({ error: "Error al crear la factura" }, { status: 500 })
      }

      // Patch IRPF if the quote had it
      if ((quote.irpfRate ?? 0) > 0) {
        await prisma.invoice.update({
          where: { id: created.id },
          data: { irpfRate: quote.irpfRate, irpfAmount: quote.irpfAmount },
        })
      }

      result.invoice = { id: created.id, number: created.number }
      await prisma.quote.update({ where: { id }, data: { convertedToInvoiceId: created.id } })
    }
  }

  return NextResponse.json({ success: true, documents: result })
}
