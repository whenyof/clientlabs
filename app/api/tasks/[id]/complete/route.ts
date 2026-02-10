import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/app/api/tasks/utils"
import { recalculateClientStatus } from "@/modules/clients/actions"

type RouteParams = { params: Promise<{ id: string }> }

/**
 * POST /api/tasks/[id]/complete
 * Set status = DONE and completedAt = now.
 */
export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.task.findFirst({
      where: { id, userId },
      select: { id: true, clientId: true },
    })
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        status: "DONE",
        completedAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        Client: { select: { id: true, name: true } },
        Lead: { select: { id: true, name: true } },
      },
    })

    if (task.clientId) {
      await recalculateClientStatus(task.clientId)
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("[POST /api/tasks/[id]/complete]:", error)
    return NextResponse.json(
      { error: "Failed to complete task" },
      { status: 500 }
    )
  }
}
