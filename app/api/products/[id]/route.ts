export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  try {
    const body = await req.json()
    const product = await prisma.product.updateMany({
      where: { id, userId: session.user.id, deletedAt: null },
      data: {
        ...(body.name != null && { name: String(body.name) }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.price != null && { price: Number(body.price) }),
        ...(body.taxRate != null && { taxRate: Number(body.taxRate) }),
        ...(body.unit != null && { unit: String(body.unit) }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.isService != null && { isService: Boolean(body.isService) }),
        ...(body.active != null && { active: Boolean(body.active) }),
      },
    })
    if (product.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("PATCH /api/products/[id]", e)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  await prisma.product.updateMany({
    where: { id, userId: session.user.id },
    data: { deletedAt: new Date() },
  })
  return NextResponse.json({ success: true })
}
