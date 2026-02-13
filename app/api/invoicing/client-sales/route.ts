import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/invoicing/client-sales?clientId=XXX
 * Returns sales for the given client that are NOT already linked to an invoice.
 * Used by Create Invoice modal to populate the order selector.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get("clientId") ?? undefined
  if (!clientId) {
    return NextResponse.json({ sales: [] })
  }

  const userId = session.user.id

  // Sales for this user and client that have NO invoice linked (invoice.saleId would point to them)
  const byClientId = await prisma.sale.findMany({
    where: {
      userId,
      clientId,
      Invoice: { none: {} },
    },
    orderBy: { saleDate: "desc" },
    take: 200,
  })

  let sales = byClientId

  // Fallback: sales with clientId null but clientName matching (legacy data)
  if (sales.length === 0) {
    const client = await prisma.client.findUnique({
      where: { id: clientId, userId },
      select: { name: true },
    })
    const clientName = client?.name?.trim() ?? null
    if (clientName) {
      sales = await prisma.sale.findMany({
        where: {
          userId,
          clientId: null,
          clientName,
          Invoice: { none: {} },
        },
        orderBy: { saleDate: "desc" },
        take: 200,
      })
    }
  }

  const payload = sales.map((s) => ({
    id: s.id,
    number: s.id,
    reference: s.id,
    date: s.saleDate instanceof Date ? s.saleDate.toISOString() : s.saleDate,
    total: s.total,
    product: s.product,
    category: s.category ?? null,
    price: s.price,
    discount: s.discount,
    tax: s.tax,
    currency: s.currency ?? "EUR",
    items: [{ description: s.product, quantity: 1, unitPrice: s.price, tax: s.tax, total: s.total }],
  }))

  return NextResponse.json(payload)
}
