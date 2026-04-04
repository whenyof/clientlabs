export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id: clientId } = await params

  const [quotes, orders, deliveries, invoices] = await Promise.all([
    prisma.quote.findMany({
      where: { clientId, userId: session.user.id, deletedAt: null },
      select: { id: true, number: true, status: true, issueDate: true, total: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.purchaseOrder.findMany({
      where: { clientId, userId: session.user.id, deletedAt: null },
      select: { id: true, number: true, status: true, issueDate: true, total: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.deliveryNote.findMany({
      where: { clientId, userId: session.user.id, deletedAt: null },
      select: { id: true, number: true, status: true, issueDate: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.invoice.findMany({
      where: { clientId, userId: session.user.id, type: "CUSTOMER" },
      select: { id: true, number: true, status: true, issueDate: true, total: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const documents = [
    ...quotes.map(q => ({ ...q, docType: "quote" as const, amount: q.total })),
    ...orders.map(o => ({ ...o, docType: "purchase_order" as const, amount: o.total })),
    ...deliveries.map(d => ({ ...d, docType: "delivery_note" as const, amount: 0 })),
    ...invoices.map(i => ({ ...i, docType: "invoice" as const, amount: Number(i.total) })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return NextResponse.json({ success: true, documents })
}
