export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function nextQuoteNumber(userId: string): Promise<string> {
  const year = new Date().getFullYear()
  const last = await prisma.quote.findFirst({
    where: { userId, number: { startsWith: `P-${year}-` } },
    orderBy: { createdAt: "desc" },
    select: { number: true },
  })
  const seq = last ? parseInt(last.number.split("-")[2] ?? "0") + 1 : 1
  return `P-${year}-${String(seq).padStart(3, "0")}`
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const clientId = searchParams.get("clientId")
  const status = searchParams.get("status")
  const search = searchParams.get("search")

  const quotes = await prisma.quote.findMany({
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
    include: { client: { select: { id: true, name: true, email: true } }, items: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ success: true, quotes })
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
    const { clientId, validUntil, notes, terms, items = [] } = body
    if (!clientId || !validUntil) return NextResponse.json({ error: "clientId and validUntil required" }, { status: 400 })

    type ItemInput = { productId?: string; description: string; quantity: number; unitPrice: number; taxRate?: number }
    const lineItems: ItemInput[] = items
    let subtotal = 0
    let taxTotal = 0
    const computedItems = lineItems.map((item: ItemInput) => {
      const taxRate = item.taxRate ?? 21
      const qty = Number(item.quantity) || 1
      const price = Number(item.unitPrice) || 0
      const lineSub = qty * price
      const lineTax = lineSub * (taxRate / 100)
      subtotal += lineSub
      taxTotal += lineTax
      return { ...item, quantity: qty, unitPrice: price, taxRate, subtotal: lineSub }
    })

    const number = await nextQuoteNumber(session.user.id)

    const quote = await prisma.quote.create({
      data: {
        userId: session.user.id,
        clientId,
        number,
        validUntil: new Date(validUntil),
        notes: notes ?? null,
        terms: terms ?? null,
        subtotal,
        taxTotal,
        total: subtotal + taxTotal,
        items: {
          create: computedItems.map((i) => ({
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
    return NextResponse.json({ success: true, quote }, { status: 201 })
  } catch (e) {
    console.error("POST /api/quotes", e)
    return NextResponse.json({ error: "Failed to create quote" }, { status: 500 })
  }
}
