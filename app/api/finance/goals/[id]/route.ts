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
    const { title, description, target, current, deadline, priority, status } = body
    const existing = await prisma.financialGoal.findFirst({ where: { id, userId: session.user.id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const data: Record<string, unknown> = {}
    if (title != null) data.title = String(title)
    if (description != null) data.description = description ? String(description) : null
    if (target != null) data.target = Number(target)
    if (current != null) data.current = Number(current)
    if (deadline != null) data.deadline = new Date(deadline)
    if (priority != null && ["LOW", "MEDIUM", "HIGH"].includes(priority)) data.priority = priority
    if (status != null && ["ACTIVE", "COMPLETED", "CANCELLED"].includes(status)) data.status = status
    const goal = await prisma.financialGoal.update({ where: { id }, data })
    return NextResponse.json({ goal })
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
    const existing = await prisma.financialGoal.findFirst({ where: { id, userId: session.user.id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
    await prisma.financialGoal.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
