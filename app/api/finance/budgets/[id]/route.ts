export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { id } = await params
    const body = await request.json()
    const { category, limit, period } = body
    const existing = await prisma.budget.findFirst({ where: { id, userId: session.user.id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const data: Record<string, unknown> = {}
    if (category != null) data.category = String(category)
    if (limit != null) data.limit = Number(limit)
    if (period != null && ["MONTHLY", "QUARTERLY", "ANNUAL"].includes(period)) data.period = period
    const budget = await prisma.budget.update({ where: { id }, data })
    return NextResponse.json({ budget })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { id } = await params
    const existing = await prisma.budget.findFirst({ where: { id, userId: session.user.id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
    await prisma.budget.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
