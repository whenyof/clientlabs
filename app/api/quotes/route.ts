export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getNextDocumentNumber } from "@/lib/counters/document-counter"

const lineItemSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(1).max(500),
  quantity: z.number().positive().max(99999),
  unitPrice: z.number().min(0).max(9999999),
  taxRate: z.number().min(0).max(100).optional(),
})

const createQuoteSchema = z.object({
  clientId: z.string().min(1),
  validUntil: z.string().min(1),
  notes: z.string().max(5000).optional().nullable(),
  terms: z.string().max(5000).optional().nullable(),
  irpfRate: z.number().min(0).max(100).optional(),
  items: z.array(lineItemSchema).max(200).default([]),
  quoteType: z.enum(["quote", "proforma"]).optional().default("quote"),
})

function nextQuoteNumber(userId: string): Promise<string> {
  return getNextDocumentNumber(userId, "P")
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
    include: {
      client: { select: { id: true, name: true, email: true } },
      items: true,
      purchaseOrder: { select: { id: true, number: true, status: true } },
      deliveryNote: { select: { id: true, number: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  // Batch-fetch linked invoices
  const invoiceIds = quotes.map(q => q.convertedToInvoiceId).filter(Boolean) as string[]
  const invoiceMap: Record<string, { id: string; number: string; status: string }> = {}
  if (invoiceIds.length > 0) {
    const invoices = await prisma.invoice.findMany({
      where: { id: { in: invoiceIds } },
      select: { id: true, number: true, status: true },
    })
    for (const inv of invoices) invoiceMap[inv.id] = inv
  }

  const enriched = quotes.map(q => ({
    ...q,
    invoice: q.convertedToInvoiceId ? (invoiceMap[q.convertedToInvoiceId] ?? null) : null,
  }))

  return NextResponse.json({ success: true, quotes: enriched })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = createQuoteSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
    const { clientId, validUntil, notes, terms, irpfRate: rawIrpf, items, quoteType } = parsed.data

    const irpfRate = Math.max(0, Math.min(100, Number(rawIrpf) || 0))

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

    const irpfAmount = subtotal * (irpfRate / 100)
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
        irpfRate: irpfRate > 0 ? irpfRate : null,
        irpfAmount: irpfAmount > 0 ? irpfAmount : null,
        total: subtotal + taxTotal - irpfAmount,
        quoteType: quoteType ?? "quote",
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
