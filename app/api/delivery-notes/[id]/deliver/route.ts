export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const note = await prisma.deliveryNote.findFirst({ where: { id, userId: session.user.id } })
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const newStatus = note.status === "DRAFT" ? "DELIVERED" : note.status === "DELIVERED" ? "SIGNED" : note.status
  // Al pasar a entregado, fijar la fecha de entrega si aún no la tenía (columna ENTREGA).
  const setDeliveryDate = newStatus === "DELIVERED" && !note.deliveryDate
  const updated = await prisma.deliveryNote.update({
    where: { id },
    data: { status: newStatus, ...(setDeliveryDate ? { deliveryDate: new Date() } : {}) },
  })
  return NextResponse.json({ success: true, note: updated })
}
