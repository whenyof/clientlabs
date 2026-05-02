export const dynamic = "force-dynamic"
export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const saleSchema = z.object({
  concept: z.string().min(1).max(500),
  amount: z.number().positive(),
  tax: z.number().min(0).max(100).default(21),
  date: z.string().optional(),
  notes: z.string().max(2000).optional().nullable(),
  clientId: z.string().min(1),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get("clientId")

  const where: Record<string, string> = { userId: session.user.id }
  if (clientId) where.clientId = clientId

  try {
    const sales = await prisma.clientSale.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { client: { select: { id: true, name: true } } },
    })
    return NextResponse.json(sales)
  } catch (err) {
    console.error("[client-sales GET]", err)
    return NextResponse.json({ error: "Error al cargar ventas" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const parsed = saleSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { concept, amount, tax, date, notes, clientId } = parsed.data
  const total = parseFloat((amount * (1 + tax / 100)).toFixed(2))

  try {
    const sale = await prisma.clientSale.create({
      data: {
        concept,
        amount,
        tax,
        total,
        notes: notes ?? null,
        date: date ? new Date(date) : new Date(),
        clientId,
        userId: session.user.id,
      },
      include: { client: { select: { id: true, name: true } } },
    })

    return NextResponse.json({ sale, suggestInvoice: true }, { status: 201 })
  } catch (err) {
    console.error("[client-sales POST]", err)
    return NextResponse.json({ error: "Error al crear venta" }, { status: 500 })
  }
}
