export const maxDuration = 15

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as invoiceService from "@/modules/invoicing/services/invoice.service"

async function nextPONumber(userId: string): Promise<string> {
  const year = new Date().getFullYear()
  const last = await prisma.purchaseOrder.findFirst({
    where: { userId, number: { startsWith: `PED-${year}-` } },
    orderBy: { createdAt: "desc" },
    select: { number: true },
  })
  const seq = last ? parseInt(last.number.split("-")[2] ?? "0") + 1 : 1
  return `PED-${year}-${String(seq).padStart(3, "0")}`
}

async function nextDNNumber(userId: string): Promise<string> {
  const year = new Date().getFullYear()
  const last = await prisma.deliveryNote.findFirst({
    where: { userId, number: { startsWith: `ALB-${year}-` } },
    orderBy: { createdAt: "desc" },
    select: { number: true },
  })
  const seq = last ? parseInt(last.number.split("-")[2] ?? "0") + 1 : 1
  return `ALB-${year}-${String(seq).padStart(3, "0")}`
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
