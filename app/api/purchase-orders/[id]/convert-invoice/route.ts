export const maxDuration = 30
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function nextInvoiceNumber(userId: string): Promise<string> {
  const year = new Date().getFullYear()
  const last = await prisma.invoice.findFirst({
    where: { userId, number: { startsWith: `F-${year}-` } },
    orderBy: { createdAt: "desc" },
    select: { number: true },
  })
  const seq = last ? parseInt(last.number.split("-")[2] ?? "0") + 1 : 1
  return `F-${year}-${String(seq).padStart(3, "0")}`
}

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const order = await prisma.purchaseOrder.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: { items: true },
  })
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (order.convertedToInvoiceId) return NextResponse.json({ error: "Already converted" }, { status: 409 })

  try {
    const number = await nextInvoiceNumber(session.user.id)
    const now = new Date()
    const due = new Date(now); due.setDate(due.getDate() + 30)

    const invoice = await prisma.invoice.create({
      data: {
        userId: session.user.id,
        clientId: order.clientId,
        number,
        series: "F",
        issueDate: now,
        dueDate: due,
        subtotal: order.subtotal,
        taxAmount: order.taxTotal,
        taxTotal: order.taxTotal,
        total: order.total,
        notes: order.notes,
        type: "CUSTOMER",
        items: {
          create: order.items.map(i => ({
            product: i.description,
            quantity: Math.round(i.quantity),
            price: i.unitPrice,
            taxRate: Math.round(i.taxRate),
            lineTotal: i.subtotal * (1 + i.taxRate / 100),
          })),
        },
      },
    })
    await prisma.purchaseOrder.update({
      where: { id },
      data: { convertedToInvoiceId: invoice.id, status: "COMPLETED" },
    })
    return NextResponse.json({ success: true, invoice }, { status: 201 })
  } catch (e) {
    console.error("PO convert-invoice error:", e)
    return NextResponse.json({ error: "Failed to convert" }, { status: 500 })
  }
}
