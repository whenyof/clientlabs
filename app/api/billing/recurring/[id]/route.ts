export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  try {
    const body = await req.json()
    const updated = await prisma.recurringInvoice.updateMany({
      where: { id, userId: session.user.id },
      data: {
        ...(body.active !== undefined && { active: Boolean(body.active) }),
        ...(body.frequency && { frequency: body.frequency }),
        ...(body.nextRunAt && { nextRunAt: new Date(body.nextRunAt) }),
        ...(body.notes !== undefined && { notes: body.notes ?? null }),
        updatedAt: new Date(),
      },
    })
    if (updated.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("PATCH /api/billing/recurring/[id]", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  await prisma.recurringInvoice.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ success: true })
}
