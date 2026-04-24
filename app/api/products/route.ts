export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const createProductSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(200).trim(),
  description: z.string().max(2000).trim().optional(),
  price: z.number({ error: "Precio requerido" }).min(0).max(999999),
  taxRate: z.number().min(0).max(100).optional().default(21),
  unit: z.string().max(50).optional().default("ud"),
  category: z.string().max(100).optional(),
  isService: z.boolean().optional().default(false),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const products = await prisma.product.findMany({
    where: { userId: session.user.id, deletedAt: null },
    orderBy: { name: "asc" },
  })
  return NextResponse.json({ success: true, products })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const raw = await req.json()
    const parsed = createProductSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Datos no válidos" },
        { status: 400 }
      )
    }
    const { name, description, price, taxRate, unit, category, isService } = parsed.data

    const product = await prisma.product.create({
      data: {
        userId: session.user.id,
        name,
        description: description ?? null,
        price,
        taxRate,
        unit,
        category: category ?? null,
        isService,
      },
    })
    return NextResponse.json({ success: true, product }, { status: 201 })
  } catch (e) {
    console.error("POST /api/products", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
