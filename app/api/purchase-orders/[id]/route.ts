export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const order = await prisma.purchaseOrder.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: {
      client: true,
      quote: { select: { id: true, number: true } },
      items: { include: { product: true } },
    },
  })
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true, order })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const body = await req.json()
  const updated = await prisma.purchaseOrder.updateMany({
    where: { id, userId: session.user.id },
    data: {
      ...(body.status != null && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  })
  if (updated.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  await prisma.purchaseOrder.updateMany({
    where: { id, userId: session.user.id, status: "DRAFT" },
    data: { deletedAt: new Date() },
  })
  return NextResponse.json({ success: true })
}
