export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id: clientId } = await params
  const userId = session.user.id

  const [pos, quotes, deliveries, invoices] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where: { clientId, userId, deletedAt: null },
      select: {
        id: true, number: true, status: true, issueDate: true, total: true, createdAt: true,
        quoteId: true, convertedToDeliveryNoteId: true, convertedToInvoiceId: true,
        quote: {
          select: {
            id: true, number: true, status: true, total: true, issueDate: true,
            convertedToInvoiceId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.quote.findMany({
      where: { clientId, userId, deletedAt: null },
      select: { id: true, number: true, status: true, total: true, issueDate: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.deliveryNote.findMany({
      where: { clientId, userId, deletedAt: null },
      select: { id: true, number: true, status: true, issueDate: true, createdAt: true, quoteId: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.invoice.findMany({
      where: { clientId, userId, type: "CUSTOMER" },
      select: { id: true, number: true, status: true, issueDate: true, total: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const invById = new Map(invoices.map(i => [i.id, i]))
  const dnByQuoteId = new Map(deliveries.filter(d => d.quoteId).map(d => [d.quoteId!, d]))
  const dnById = new Map(deliveries.map(d => [d.id, d]))

  const usedQuoteIds = new Set<string>()
  const usedDnIds = new Set<string>()
  const usedInvIds = new Set<string>()

  const groups = pos.map(po => {
    const quote = po.quote ?? null
    if (quote) usedQuoteIds.add(quote.id)

    // Delivery note: direct PO link first, then via quote's quoteId match
    let dn: typeof deliveries[number] | null = null
    if (po.convertedToDeliveryNoteId) {
      dn = dnById.get(po.convertedToDeliveryNoteId) ?? null
    } else if (quote?.id) {
      dn = dnByQuoteId.get(quote.id) ?? null
    }
    if (dn) usedDnIds.add(dn.id)

    // Invoice: direct PO link first, then via quote
    let inv: typeof invoices[number] | null = null
    if (po.convertedToInvoiceId) {
      inv = invById.get(po.convertedToInvoiceId) ?? null
    } else if (quote?.convertedToInvoiceId) {
      inv = invById.get(quote.convertedToInvoiceId) ?? null
    }
    if (inv) usedInvIds.add(inv.id)

    return {
      orderId: po.id,
      order: { id: po.id, number: po.number, status: po.status, issueDate: po.issueDate, total: po.total },
      quote: quote ? { id: quote.id, number: quote.number, status: quote.status, total: quote.total, issueDate: quote.issueDate } : null,
      deliveryNote: dn ? { id: dn.id, number: dn.number, status: dn.status, issueDate: dn.issueDate } : null,
      invoice: inv ? { id: inv.id, number: inv.number, status: inv.status, issueDate: inv.issueDate, total: Number(inv.total) } : null,
    }
  })

  const poQuoteIds = new Set(pos.map(p => p.quoteId).filter(Boolean))
  const looseQuotes = quotes.filter(q => !poQuoteIds.has(q.id))
  const looseDNs = deliveries.filter(d => !usedDnIds.has(d.id))
  const looseInvs = invoices.filter(i => !usedInvIds.has(i.id))

  return NextResponse.json({
    success: true,
    groups,
    standalone: { quotes: looseQuotes, deliveries: looseDNs, invoices: looseInvs },
    orders: pos.map(p => ({ id: p.id, number: p.number })),
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id: clientId } = await params
  const userId = session.user.id

  const { orderId, docType, docId } = await req.json()
  if (!orderId || !docType || !docId) return NextResponse.json({ error: "orderId, docType, docId requeridos" }, { status: 400 })

  const po = await prisma.purchaseOrder.findFirst({
    where: { id: orderId, userId, clientId },
    select: { id: true, quoteId: true },
  })
  if (!po) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })

  if (docType === "deliveryNote") {
    await prisma.purchaseOrder.update({ where: { id: orderId }, data: { convertedToDeliveryNoteId: docId } })
  } else if (docType === "invoice") {
    await prisma.purchaseOrder.update({ where: { id: orderId }, data: { convertedToInvoiceId: docId } })
  } else if (docType === "quote") {
    if (po.quoteId) return NextResponse.json({ error: "Este pedido ya tiene un presupuesto vinculado" }, { status: 409 })
    await prisma.purchaseOrder.update({ where: { id: orderId }, data: { quoteId: docId } })
  } else {
    return NextResponse.json({ error: "docType inválido" }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
