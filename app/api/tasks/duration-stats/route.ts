import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/app/api/tasks/utils"

/**
 * GET /api/tasks/duration-stats
 * Expected duration per task type from completed tasks.
 * duration = completedAt - createdAt; grouped by task.type.
 * For: future planning, delay prediction, team balancing.
 */
export async function GET() {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const completed = await prisma.task.findMany({
      where: {
        userId,
        status: "DONE",
        completedAt: { not: null },
      },
      select: {
        type: true,
        createdAt: true,
        completedAt: true,
      },
    })

    const durationMinutesByType = new Map<string, number[]>()
    for (const t of completed) {
      const completedAt = t.completedAt
      if (!completedAt) continue
      const durationMs = completedAt.getTime() - t.createdAt.getTime()
      if (durationMs < 0) continue
      const minutes = durationMs / (60 * 1000)
      const type = t.type
      if (!durationMinutesByType.has(type)) {
        durationMinutesByType.set(type, [])
      }
      durationMinutesByType.get(type)!.push(minutes)
    }

    const result: { type: string; avgDuration: number; deviation: number }[] = []
    for (const [type, durations] of durationMinutesByType) {
      const n = durations.length
      if (n === 0) continue
      const avg = durations.reduce((a, b) => a + b, 0) / n
      const variance =
        n === 1
          ? 0
          : durations.reduce((acc, d) => acc + (d - avg) ** 2, 0) / n
      const deviation = Math.sqrt(variance)
      result.push({
        type,
        avgDuration: Math.round(avg * 100) / 100,
        deviation: Math.round(deviation * 100) / 100,
      })
    }

    result.sort((a, b) => a.type.localeCompare(b.type))

    return NextResponse.json(result)
  } catch (error) {
    console.error("[GET /api/tasks/duration-stats]:", error)
    return NextResponse.json(
      { error: "Failed to compute duration stats" },
      { status: 500 }
    )
  }
}
