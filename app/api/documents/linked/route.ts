export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/documents/linked?quoteId=&orderId=&invoiceId=&deliveryNoteId=
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const uid = session.user.id

  const { searchParams } = req.nextUrl
  const quoteId = searchParams.get("quoteId") || null
  const orderId = searchParams.get("orderId") || null
  const invoiceId = searchParams.get("invoiceId") || null
  const deliveryNoteId = searchParams.get("deliveryNoteId") || null

  const select = { id: true, number: true, status: true } as const

  const [quote, order, invoice, deliveryNote] = await Promise.all([
    quoteId
      ? prisma.quote.findFirst({ where: { id: quoteId, userId: uid, deletedAt: null }, select })
      : resolveQuoteFromLinks(uid, { orderId, invoiceId, deliveryNoteId }),
    orderId
      ? prisma.purchaseOrder.findFirst({ where: { id: orderId, userId: uid, deletedAt: null }, select })
      : resolveOrderFromLinks(uid, { quoteId, invoiceId, deliveryNoteId }),
    invoiceId
      ? prisma.invoice.findFirst({ where: { id: invoiceId, userId: uid }, select })
      : resolveInvoiceFromLinks(uid, { quoteId, orderId, deliveryNoteId }),
    deliveryNoteId
      ? prisma.deliveryNote.findFirst({ where: { id: deliveryNoteId, userId: uid, deletedAt: null }, select })
      : resolveDeliveryNoteFromLinks(uid, { quoteId, orderId, invoiceId }),
  ])

  return NextResponse.json({ quote, order, invoice, deliveryNote })
}

async function resolveQuoteFromLinks(
  uid: string,
  { orderId, invoiceId, deliveryNoteId }: { orderId: string | null; invoiceId: string | null; deliveryNoteId: string | null }
) {
  if (orderId) {
    const po = await prisma.purchaseOrder.findFirst({ where: { id: orderId, userId: uid }, select: { quoteId: true } })
    if (po?.quoteId) return prisma.quote.findFirst({ where: { id: po.quoteId, userId: uid }, select: { id: true, number: true, status: true } })
  }
  if (invoiceId) {
    const q = await prisma.quote.findFirst({ where: { convertedToInvoiceId: invoiceId, userId: uid, deletedAt: null }, select: { id: true, number: true, status: true } })
    if (q) return q
  }
  if (deliveryNoteId) {
    const dn = await prisma.deliveryNote.findFirst({ where: { id: deliveryNoteId, userId: uid }, select: { quoteId: true } })
    if (dn?.quoteId) return prisma.quote.findFirst({ where: { id: dn.quoteId, userId: uid }, select: { id: true, number: true, status: true } })
  }
  return null
}

async function resolveOrderFromLinks(
  uid: string,
  { quoteId, invoiceId, deliveryNoteId }: { quoteId: string | null; invoiceId: string | null; deliveryNoteId: string | null }
) {
  if (quoteId) return prisma.purchaseOrder.findFirst({ where: { quoteId, userId: uid, deletedAt: null }, select: { id: true, number: true, status: true } })
  if (invoiceId) return prisma.purchaseOrder.findFirst({ where: { convertedToInvoiceId: invoiceId, userId: uid, deletedAt: null }, select: { id: true, number: true, status: true } })
  if (deliveryNoteId) {
    const po = await prisma.purchaseOrder.findFirst({ where: { convertedToDeliveryNoteId: deliveryNoteId, userId: uid, deletedAt: null }, select: { id: true, number: true, status: true } })
    if (po) return po
    const dn = await prisma.deliveryNote.findFirst({ where: { id: deliveryNoteId, userId: uid }, select: { quoteId: true } })
    if (dn?.quoteId) return prisma.purchaseOrder.findFirst({ where: { quoteId: dn.quoteId, userId: uid, deletedAt: null }, select: { id: true, number: true, status: true } })
  }
  return null
}

async function resolveInvoiceFromLinks(
  uid: string,
  { quoteId, orderId, deliveryNoteId }: { quoteId: string | null; orderId: string | null; deliveryNoteId: string | null }
) {
  if (quoteId) {
    const q = await prisma.quote.findFirst({ where: { id: quoteId, userId: uid }, select: { convertedToInvoiceId: true } })
    if (q?.convertedToInvoiceId) return prisma.invoice.findFirst({ where: { id: q.convertedToInvoiceId, userId: uid }, select: { id: true, number: true, status: true } })
  }
  if (orderId) {
    const po = await prisma.purchaseOrder.findFirst({ where: { id: orderId, userId: uid }, select: { convertedToInvoiceId: true } })
    if (po?.convertedToInvoiceId) return prisma.invoice.findFirst({ where: { id: po.convertedToInvoiceId, userId: uid }, select: { id: true, number: true, status: true } })
  }
  if (deliveryNoteId) {
    const dn = await prisma.deliveryNote.findFirst({ where: { id: deliveryNoteId, userId: uid }, select: { convertedToInvoiceId: true } })
    if (dn?.convertedToInvoiceId) return prisma.invoice.findFirst({ where: { id: dn.convertedToInvoiceId, userId: uid }, select: { id: true, number: true, status: true } })
  }
  return null
}

async function resolveDeliveryNoteFromLinks(
  uid: string,
  { quoteId, orderId, invoiceId }: { quoteId: string | null; orderId: string | null; invoiceId: string | null }
) {
  if (quoteId) {
    const q = await prisma.quote.findFirst({ where: { id: quoteId, userId: uid }, select: { convertedToDeliveryNoteId: true } })
    if (q?.convertedToDeliveryNoteId) return prisma.deliveryNote.findFirst({ where: { id: q.convertedToDeliveryNoteId, userId: uid }, select: { id: true, number: true, status: true } })
  }
  if (orderId) {
    const po = await prisma.purchaseOrder.findFirst({ where: { id: orderId, userId: uid }, select: { convertedToDeliveryNoteId: true } })
    if (po?.convertedToDeliveryNoteId) return prisma.deliveryNote.findFirst({ where: { id: po.convertedToDeliveryNoteId, userId: uid }, select: { id: true, number: true, status: true } })
  }
  if (invoiceId) {
    return prisma.deliveryNote.findFirst({ where: { convertedToInvoiceId: invoiceId, userId: uid, deletedAt: null }, select: { id: true, number: true, status: true } })
  }
  return null
}
