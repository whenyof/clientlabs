export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const order = await prisma.purchaseOrder.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
  })
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const nextStatus =
    order.status === "DRAFT" ? "CONFIRMED" :
    order.status === "CONFIRMED" ? "IN_PROGRESS" :
    order.status === "IN_PROGRESS" ? "COMPLETED" : null

  if (!nextStatus) return NextResponse.json({ error: "Cannot advance from current status" }, { status: 400 })

  await prisma.purchaseOrder.update({ where: { id }, data: { status: nextStatus } })
  return NextResponse.json({ success: true, status: nextStatus })
}
