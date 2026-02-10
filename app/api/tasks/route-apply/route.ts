import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/app/api/tasks/utils"
import { startOfDay, endOfDay } from "date-fns"

/**
 * POST /api/tasks/route-apply
 * Body: { date: string (YYYY-MM-DD), orderedTaskIds: string[] }
 * Sets routeOrder to index for each task that belongs to user and is due on that day.
 * User accepts optimized order; no auto-apply.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as {
      date?: string
      orderedTaskIds?: string[]
    }
    const dateStr = body.date
    const orderedTaskIds = body.orderedTaskIds
    if (!dateStr || !Array.isArray(orderedTaskIds)) {
      return NextResponse.json(
        { error: "date (YYYY-MM-DD) and orderedTaskIds are required" },
        { status: 400 }
      )
    }

    const day = startOfDay(new Date(dateStr))
    const dayEnd = endOfDay(day)

    const tasksOnDay = await prisma.task.findMany({
      where: {
        userId,
        dueDate: { gte: day, lte: dayEnd },
        id: { in: orderedTaskIds },
      },
      select: { id: true },
    })
    const idSet = new Set(tasksOnDay.map((t) => t.id))

    const updates = orderedTaskIds
      .filter((id) => idSet.has(id))
      .map((id, index) =>
        prisma.task.updateMany({
          where: { id, userId },
          data: { routeOrder: index, updatedAt: new Date() },
        })
      )

    await prisma.$transaction(updates)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[POST /api/tasks/route-apply]:", error)
    return NextResponse.json(
      { error: "Failed to apply route order" },
      { status: 500 }
    )
  }
}
