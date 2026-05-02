export const dynamic = "force-dynamic"
export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const purchaseSchema = z.object({
  concept: z.string().min(1).max(500),
  amount: z.number().positive(),
  tax: z.number().min(0).max(100).default(21),
  date: z.string().optional(),
  notes: z.string().max(2000).optional().nullable(),
  providerId: z.string().min(1),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const providerId = searchParams.get("providerId")

  const where: Record<string, string> = { userId: session.user.id }
  if (providerId) where.providerId = providerId

  try {
    const purchases = await prisma.clientPurchase.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { provider: { select: { id: true, name: true } } },
    })
    return NextResponse.json(purchases)
  } catch (err) {
    console.error("[client-purchases GET]", err)
    return NextResponse.json({ error: "Error al cargar compras" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = purchaseSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { concept, amount, tax, date, notes, providerId } = parsed.data
  const total = parseFloat((amount * (1 + tax / 100)).toFixed(2))

  try {
    const purchase = await prisma.clientPurchase.create({
      data: {
        concept,
        amount,
        tax,
        total,
        notes: notes ?? null,
        date: date ? new Date(date) : new Date(),
        providerId,
        userId: session.user.id,
      },
      include: { provider: { select: { id: true, name: true } } },
    })

    return NextResponse.json({ purchase }, { status: 201 })
  } catch (err) {
    console.error("[client-purchases POST]", err)
    return NextResponse.json({ error: "Error al crear compra" }, { status: 500 })
  }
}
