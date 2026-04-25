export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const patchSchema = z.object({
  status: z.enum(["PENDING", "RECEIVED", "PAID", "CANCELLED"]).optional(),
  notes: z.string().max(2000).optional().nullable(),
  invoiceDocUrl: z.string().url().optional().nullable(),
  deliveryDocUrl: z.string().url().optional().nullable(),
})

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    const result = await prisma.clientPurchase.updateMany({
      where: { id, userId: session.user.id },
      data: parsed.data,
    })

    if (result.count === 0) return NextResponse.json({ error: "Compra no encontrada" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[client-purchases PATCH]", err)
    return NextResponse.json({ error: "Error al actualizar compra" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  try {
    await prisma.clientPurchase.deleteMany({
      where: { id, userId: session.user.id },
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[client-purchases DELETE]", err)
    return NextResponse.json({ error: "Error al eliminar compra" }, { status: 500 })
  }
}
