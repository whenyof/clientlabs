import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/app/api/tasks/utils"

/**
 * GET /api/tasks/stats
 * Returns: today, overdue, upcoming7d, completed30d, completionRate
 * All scoped to the logged-in user.
 */
export async function GET() {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    const endOf7d = new Date(now)
    endOf7d.setDate(endOf7d.getDate() + 7)
    endOf7d.setHours(23, 59, 59, 999)
    const startOf30d = new Date(now)
    startOf30d.setDate(startOf30d.getDate() - 30)

    const baseWhere = { userId }

    const [today, overdue, upcoming7d, completed30d, pendingDueIn30d] = await Promise.all([
      prisma.task.count({
        where: {
          ...baseWhere,
          status: { not: "DONE" },
          dueDate: { gte: startOfToday, lte: endOfToday },
        },
      }),
      prisma.task.count({
        where: {
          ...baseWhere,
          status: { not: "DONE" },
          dueDate: { lt: startOfToday },
        },
      }),
      prisma.task.count({
        where: {
          ...baseWhere,
          status: "PENDING",
          dueDate: { gt: endOfToday, lte: endOf7d },
        },
      }),
      prisma.task.count({
        where: {
          ...baseWhere,
          status: "DONE",
          OR: [
            { completedAt: { gte: startOf30d } },
            { completedAt: null, updatedAt: { gte: startOf30d } },
          ],
        },
      }),
      prisma.task.count({
        where: {
          ...baseWhere,
          status: "PENDING",
          dueDate: { gte: startOf30d, lte: now },
        },
      }),
    ])

    const denominator = completed30d + pendingDueIn30d
    const completionRate = denominator > 0 ? completed30d / denominator : 0

    return NextResponse.json({
      today,
      overdue,
      upcoming7d,
      completed30d,
      completionRate: Math.round(completionRate * 100) / 100,
    })
  } catch (error) {
    console.error("[GET /api/tasks/stats]:", error)
    return NextResponse.json(
      { error: "Failed to load task stats" },
      { status: 500 }
    )
  }
}
