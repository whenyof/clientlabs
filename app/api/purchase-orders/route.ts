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

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const clientId = searchParams.get("clientId")
  const status = searchParams.get("status")
  const search = searchParams.get("search")

  const orders = await prisma.purchaseOrder.findMany({
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
  return NextResponse.json({ success: true, orders })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { clientId, notes, items = [] } = body
    if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 })

    type ItemInput = { productId?: string; description: string; quantity: number; unitPrice: number; taxRate?: number }
    const lineItems: ItemInput[] = items
    let subtotal = 0
    let taxTotal = 0
    const computed = lineItems.map((item) => {
      const taxRate = item.taxRate ?? 21
      const qty = Number(item.quantity) || 1
      const price = Number(item.unitPrice) || 0
      const lineSub = qty * price
      subtotal += lineSub
      taxTotal += lineSub * (taxRate / 100)
      return { ...item, quantity: qty, unitPrice: price, taxRate, subtotal: lineSub }
    })

    const number = await nextPONumber(session.user.id)
    const order = await prisma.purchaseOrder.create({
      data: {
        userId: session.user.id,
        clientId,
        number,
        subtotal,
        taxTotal,
        total: subtotal + taxTotal,
        notes: notes ?? null,
        items: {
          create: computed.map(i => ({
            productId: i.productId ?? null,
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            taxRate: i.taxRate,
            subtotal: i.subtotal,
          })),
        },
      },
      include: { client: { select: { id: true, name: true, email: true } }, items: true },
    })
    return NextResponse.json({ success: true, order }, { status: 201 })
  } catch (e) {
    console.error("POST /api/purchase-orders", e)
    return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 })
  }
}
