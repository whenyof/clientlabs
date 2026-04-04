export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function nextDNNumber(userId: string): Promise<string> {
  const year = new Date().getFullYear()
  const last = await prisma.deliveryNote.findFirst({
    where: { userId, number: { startsWith: `A-${year}-` } },
    orderBy: { createdAt: "desc" },
    select: { number: true },
  })
  const seq = last ? parseInt(last.number.split("-")[2] ?? "0") + 1 : 1
  return `A-${year}-${String(seq).padStart(3, "0")}`
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
  if (order.convertedToDeliveryNoteId) return NextResponse.json({ error: "Already converted" }, { status: 409 })

  try {
    const number = await nextDNNumber(session.user.id)
    const note = await prisma.deliveryNote.create({
      data: {
        userId: session.user.id,
        clientId: order.clientId,
        number,
        notes: order.notes,
        items: {
          create: order.items.map(i => ({
            productId: i.productId ?? null,
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            delivered: false,
          })),
        },
      },
    })
    await prisma.purchaseOrder.update({
      where: { id },
      data: { convertedToDeliveryNoteId: note.id, status: "COMPLETED" },
    })
    return NextResponse.json({ success: true, deliveryNote: note }, { status: 201 })
  } catch (e) {
    console.error("PO convert-delivery error:", e)
    return NextResponse.json({ error: "Failed to convert" }, { status: 500 })
  }
}
