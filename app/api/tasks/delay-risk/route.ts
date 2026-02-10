import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/app/api/tasks/utils"
import { format, addDays, startOfDay } from "date-fns"

const DEFAULT_WORKING_MINUTES_PER_DAY = 8 * 60 // 480
const DEFAULT_LOOKAHEAD_DAYS = 14
const FALLBACK_ESTIMATE_MINUTES = 30

export type DelayRiskDay = {
  day: string
  probability: number
  reason: string
}

/**
 * GET /api/tasks/delay-risk
 * Predicts delay risk per day: total expected time vs capacity.
 * Query: from, to (optional; default next 14 days), capacityMinutes (optional).
 * Returns only days where total expected time > capacity.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")
    const capacityParam = searchParams.get("capacityMinutes")

    const now = startOfDay(new Date())
    const from = fromParam ? startOfDay(new Date(fromParam)) : now
    const to = toParam
      ? startOfDay(new Date(toParam))
      : addDays(now, DEFAULT_LOOKAHEAD_DAYS)
    const capacityMinutes =
      capacityParam != null && capacityParam !== ""
        ? Math.max(0, Number(capacityParam))
        : DEFAULT_WORKING_MINUTES_PER_DAY

    const [completedForAvg, tasksInRange] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          status: "DONE",
          completedAt: { not: null },
        },
        select: { type: true, createdAt: true, completedAt: true },
      }),
      prisma.task.findMany({
        where: {
          userId,
          status: "PENDING",
          dueDate: { gte: from, lte: to },
        },
        select: {
          dueDate: true,
          type: true,
          estimatedMinutes: true,
        },
      }),
    ])

    const avgMinutesByType = new Map<string, number>()
    const byType = new Map<string, number[]>()
    for (const t of completedForAvg) {
      const completedAt = t.completedAt
      if (!completedAt) continue
      const minutes = (completedAt.getTime() - t.createdAt.getTime()) / (60 * 1000)
      if (minutes < 0) continue
      const type = t.type
      if (!byType.has(type)) byType.set(type, [])
      byType.get(type)!.push(minutes)
    }
    for (const [type, arr] of byType) {
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length
      avgMinutesByType.set(type, avg)
    }

    const totalByDay = new Map<string, number>()
    for (const t of tasksInRange) {
      const due = t.dueDate
      if (!due) continue
      const dayKey = format(startOfDay(new Date(due)), "yyyy-MM-dd")
      const est =
        t.estimatedMinutes ??
        avgMinutesByType.get(t.type) ??
        FALLBACK_ESTIMATE_MINUTES
      totalByDay.set(dayKey, (totalByDay.get(dayKey) ?? 0) + est)
    }

    const result: DelayRiskDay[] = []
    for (const [dayKey, totalExpected] of totalByDay) {
      if (totalExpected <= capacityMinutes) continue
      const overflowRatio = totalExpected / capacityMinutes
      const probability = Math.min(
        1,
        0.5 + (overflowRatio - 1) * 0.5
      )
      const reason = `Expected ${Math.round(totalExpected)} min of work vs ${capacityMinutes} min capacity (${(overflowRatio * 100).toFixed(0)}% of day).`
      result.push({
        day: dayKey,
        probability: Math.round(probability * 100) / 100,
        reason,
      })
    }

    result.sort((a, b) => a.day.localeCompare(b.day))

    return NextResponse.json(result)
  } catch (error) {
    console.error("[GET /api/tasks/delay-risk]:", error)
    return NextResponse.json(
      { error: "Failed to compute delay risk" },
      { status: 500 }
    )
  }
}
