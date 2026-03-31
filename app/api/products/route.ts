import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
    const body = await req.json()
    const { name, description, price, taxRate = 21, unit = "ud", category, isService = false } = body
    if (!name || price == null) return NextResponse.json({ error: "name and price required" }, { status: 400 })

    const product = await prisma.product.create({
      data: {
        userId: session.user.id,
        name: String(name),
        description: description ?? null,
        price: Number(price),
        taxRate: Number(taxRate),
        unit: String(unit),
        category: category ?? null,
        isService: Boolean(isService),
      },
    })
    return NextResponse.json({ success: true, product }, { status: 201 })
  } catch (e) {
    console.error("POST /api/products", e)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
