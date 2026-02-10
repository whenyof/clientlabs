import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/app/api/tasks/utils"

/**
 * GET /api/tasks/priorities
 * Returns the current user's tasks ordered by priorityScore descending.
 * Does not recalculate scores; use task-priority.service for that.
 */
export async function GET() {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: [{ priorityScore: { sort: "desc", nulls: "last" } }, { dueDate: { sort: "asc", nulls: "last" } }],
      include: {
        Client: { select: { id: true, name: true } },
        Lead: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("[GET /api/tasks/priorities]:", error)
    return NextResponse.json(
      { error: "Failed to list tasks by priority" },
      { status: 500 }
    )
  }
}
