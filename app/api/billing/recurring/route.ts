export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const itemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().positive().max(99999),
  unitPrice: z.number().min(0).max(9999999),
  taxPercent: z.number().min(0).max(100).default(21),
  discountPercent: z.number().min(0).max(100).default(0),
})

const createSchema = z.object({
  clientId: z.string().min(1),
  frequency: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]).default("MONTHLY"),
  nextRunAt: z.string().min(1),
  notes: z.string().max(5000).optional().nullable(),
  terms: z.string().max(5000).optional().nullable(),
  currency: z.string().max(3).default("EUR"),
  irpfRate: z.number().min(0).max(100).default(0),
  items: z.array(itemSchema).min(1).max(50),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const recurring = await prisma.recurringInvoice.findMany({
    where: { userId: session.user.id },
    include: {
      items: true,
    },
    orderBy: { nextRunAt: "asc" },
  })

  return NextResponse.json({ success: true, recurring })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 })
    }
    const { clientId, frequency, nextRunAt, notes, terms, currency, irpfRate, items } = parsed.data

    const recurring = await prisma.recurringInvoice.create({
      data: {
        userId: session.user.id,
        clientId,
        frequency,
        nextRunAt: new Date(nextRunAt),
        notes: notes ?? null,
        terms: terms ?? null,
        currency,
        irpfRate,
        items: {
          create: items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            taxPercent: i.taxPercent,
            discountPercent: i.discountPercent,
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json({ success: true, recurring }, { status: 201 })
  } catch (e) {
    console.error("POST /api/billing/recurring", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
