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

  const quote = await prisma.quote.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
    include: { client: true, items: { include: { product: true } } },
  })
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true, quote })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  try {
    const body = await req.json()
    const existing = await prisma.quote.findFirst({ where: { id, userId: session.user.id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const updated = await prisma.quote.update({
      where: { id },
      data: {
        ...(body.status != null && { status: body.status }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.terms !== undefined && { terms: body.terms }),
        ...(body.validUntil != null && { validUntil: new Date(body.validUntil) }),
      },
    })
    return NextResponse.json({ success: true, quote: updated })
  } catch (e) {
    console.error("PATCH /api/quotes/[id]", e)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  await prisma.quote.updateMany({
    where: { id, userId: session.user.id, status: "DRAFT" },
    data: { deletedAt: new Date() },
  })
  return NextResponse.json({ success: true })
}
