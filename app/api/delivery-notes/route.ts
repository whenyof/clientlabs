export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const itemSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(1).max(500),
  quantity: z.number().positive().max(99999),
  unitPrice: z.number().min(0).max(9999999).optional(),
  productRef: z.string().max(100).optional().nullable(),
  lotNumber: z.string().max(100).optional().nullable(),
  expiryDate: z.string().optional().nullable(),
})

const createDeliveryNoteSchema = z.object({
  clientId: z.string().min(1),
  quoteId: z.string().optional(),
  deliveryDate: z.string().optional(),
  notes: z.string().max(5000).optional().nullable(),
  items: z.array(itemSchema).max(200).default([]),
})

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

  const invoiceIds = notes.map(n => n.convertedToInvoiceId).filter(Boolean) as string[]
  const linkedInvoices = invoiceIds.length > 0
    ? await prisma.invoice.findMany({
        where: { id: { in: invoiceIds }, userId: session.user.id },
        select: { id: true, number: true, status: true },
      })
    : []
  const invoiceMap = Object.fromEntries(linkedInvoices.map(i => [i.id, i]))

  const notesWithLinks = notes.map(n => ({
    ...n,
    linkedInvoice: n.convertedToInvoiceId ? (invoiceMap[n.convertedToInvoiceId] ?? null) : null,
  }))

  return NextResponse.json({ success: true, notes: notesWithLinks })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = createDeliveryNoteSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
    const { clientId, quoteId, deliveryDate, notes, items } = parsed.data

    type NoteItem = { productId?: string; description: string; quantity: number; unitPrice?: number; productRef?: string | null; lotNumber?: string | null; expiryDate?: string | null }
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
            productRef: i.productRef ?? null,
            lotNumber: i.lotNumber ?? null,
            expiryDate: i.expiryDate ? new Date(i.expiryDate) : null,
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
