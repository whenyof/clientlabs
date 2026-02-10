import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/app/api/tasks/utils"

type RouteParams = { params: Promise<{ id: string }> }

/**
 * POST /api/tasks/[id]/reschedule
 * Body: { dueDate: string }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = (await request.json()) as { dueDate?: string }

    const existing = await prisma.task.findFirst({
      where: { id, userId },
      select: { id: true },
    })
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const dueDate = body.dueDate != null && body.dueDate !== "" ? new Date(body.dueDate) : null

    const task = await prisma.task.update({
      where: { id },
      data: { dueDate, updatedAt: new Date() },
      include: {
        Client: { select: { id: true, name: true } },
        Lead: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("[POST /api/tasks/[id]/reschedule]:", error)
    return NextResponse.json(
      { error: "Failed to reschedule task" },
      { status: 500 }
    )
  }
}
