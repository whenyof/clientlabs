import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function nextDeliveryNoteNumber(userId: string): Promise<string> {
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

  const quote = await prisma.quote.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: { items: true },
  })
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const existingNote = await prisma.deliveryNote.findFirst({ where: { quoteId: id } })
  if (existingNote) return NextResponse.json({ error: "Delivery note already exists for this quote" }, { status: 400 })

  const number = await nextDeliveryNoteNumber(session.user.id)

  const note = await prisma.deliveryNote.create({
    data: {
      userId: session.user.id,
      clientId: quote.clientId,
      quoteId: id,
      number,
      notes: quote.notes,
      items: {
        create: quote.items.map((item) => ({
          productId: item.productId ?? null,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          delivered: true,
        })),
      },
    },
  })

  await prisma.quote.update({
    where: { id },
    data: { convertedToDeliveryNoteId: note.id },
  })

  return NextResponse.json({ success: true, deliveryNoteId: note.id, number })
}
