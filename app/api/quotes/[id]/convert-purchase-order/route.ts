import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function nextPONumber(userId: string): Promise<string> {
  const year = new Date().getFullYear()
  const last = await prisma.purchaseOrder.findFirst({
    where: { userId, number: { startsWith: `HP-${year}-` } },
    orderBy: { createdAt: "desc" },
    select: { number: true },
  })
  const seq = last ? parseInt(last.number.split("-")[2] ?? "0") + 1 : 1
  return `HP-${year}-${String(seq).padStart(3, "0")}`
}

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const quote = await prisma.quote.findFirst({
    where: { id, userId: session.user.id, status: "ACCEPTED", deletedAt: null },
    include: { items: true },
  })
  if (!quote) return NextResponse.json({ error: "Quote not found or not accepted" }, { status: 404 })

  const existingPO = await prisma.purchaseOrder.findUnique({ where: { quoteId: id } })
  if (existingPO) return NextResponse.json({ error: "Already converted to purchase order" }, { status: 409 })

  try {
    const number = await nextPONumber(session.user.id)
    const po = await prisma.purchaseOrder.create({
      data: {
        userId: session.user.id,
        clientId: quote.clientId,
        quoteId: quote.id,
        number,
        subtotal: quote.subtotal,
        taxTotal: quote.taxTotal,
        total: quote.total,
        notes: quote.notes,
        items: {
          create: quote.items.map(i => ({
            productId: i.productId ?? null,
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            taxRate: i.taxRate,
            subtotal: i.subtotal,
          })),
        },
      },
    })
    return NextResponse.json({ success: true, purchaseOrder: po }, { status: 201 })
  } catch (e) {
    console.error("convert-purchase-order error:", e)
    return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 })
  }
}
