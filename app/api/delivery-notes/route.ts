export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function nextNumber(userId: string): Promise<string> {
  const year = new Date().getFullYear()
  const last = await prisma.deliveryNote.findFirst({
    where: { userId, number: { startsWith: `A-${year}-` } },
    orderBy: { createdAt: "desc" },
    select: { number: true },
  })
  const seq = last ? parseInt(last.number.split("-")[2] ?? "0") + 1 : 1
  return `A-${year}-${String(seq).padStart(3, "0")}`
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const clientId = searchParams.get("clientId")
  const status = searchParams.get("status")
  const search = searchParams.get("search")

  const notes = await prisma.deliveryNote.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null,
      ...(clientId && { clientId }),
      ...(status && { status: status as never }),
      ...(search && {
        OR: [
          { number: { contains: search, mode: "insensitive" } },
          { client: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
    },
    include: {
      client: { select: { id: true, name: true, email: true } },
      quote: { select: { id: true, number: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ success: true, notes })
}

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: "Creación deshabilitada hasta implementación Verifactu", code: "VERIFACTU_PENDING" },
    { status: 503 }
  )
}

async function _POST_disabled(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { clientId, quoteId, deliveryDate, notes, items = [] } = body
    if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 })

    type NoteItem = { productId?: string; description: string; quantity: number; unitPrice?: number }
    const number = await nextNumber(session.user.id)

    const note = await prisma.deliveryNote.create({
      data: {
        userId: session.user.id,
        clientId,
        quoteId: quoteId ?? null,
        number,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        notes: notes ?? null,
        items: {
          create: (items as NoteItem[]).map((i) => ({
            productId: i.productId ?? null,
            description: i.description,
            quantity: Number(i.quantity) || 1,
            unitPrice: Number(i.unitPrice) || 0,
            delivered: true,
          })),
        },
      },
      include: { client: { select: { id: true, name: true } }, items: true },
    })
    return NextResponse.json({ success: true, note }, { status: 201 })
  } catch (e) {
    console.error("POST /api/delivery-notes", e)
    return NextResponse.json({ error: "Failed to create delivery note" }, { status: 500 })
  }
}
