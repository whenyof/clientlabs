import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/app/api/tasks/utils"
import { addDays, startOfDay, differenceInCalendarDays } from "date-fns"
import {
  buildWorkforceSuggestions,
  type TaskForWorkforce,
  type WorkforceSuggestion,
} from "@/modules/tasks/lib/workforceRedistribution"

const DEFAULT_WORKING_MINUTES_PER_DAY = 8 * 60
const DEFAULT_LOOKAHEAD_DAYS = 14
const FALLBACK_ESTIMATE_MINUTES = 30
const MAX_SUGGESTIONS = 20

/**
 * GET /api/tasks/redistribution-suggestions
 * Suggests reassigning tasks from overloaded users to users with capacity.
 * Lowest priority first. User must approve; never auto-assign.
 * Query: from, to (optional), capacityMinutes (optional).
 * Returns: { suggestions: [{ taskId, fromUser, toUser, benefit }] }
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
    const numDays =
      Math.max(0, differenceInCalendarDays(to, from)) + 1
    const capacityMinutesPerDay =
      capacityParam != null && capacityParam !== ""
        ? Math.max(0, Number(capacityParam))
        : DEFAULT_WORKING_MINUTES_PER_DAY
    const capacityPerUser = capacityMinutesPerDay * numDays

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
          id: true,
          assignedTo: true,
          priority: true,
          priorityScore: true,
          estimatedMinutes: true,
          type: true,
        },
      }),
    ])

    const avgMinutesByType = new Map<string, number>()
    const byType = new Map<string, number[]>()
    for (const t of completedForAvg) {
      const completedAt = t.completedAt
      if (!completedAt) continue
      const minutes =
        (completedAt.getTime() - t.createdAt.getTime()) / (60 * 1000)
      if (minutes < 0) continue
      const type = t.type
      if (!byType.has(type)) byType.set(type, [])
      byType.get(type)!.push(minutes)
    }
    for (const [type, arr] of byType) {
      avgMinutesByType.set(
        type,
        arr.reduce((a, b) => a + b, 0) / arr.length
      )
    }

    const tasks: TaskForWorkforce[] = tasksInRange.map((t) => ({
      id: t.id,
      assignedTo: t.assignedTo ?? null,
      priority: t.priority,
      priorityScore: t.priorityScore ?? null,
      estimatedMinutes: t.estimatedMinutes ?? null,
      type: t.type,
    }))

    function estMinutes(t: TaskForWorkforce): number {
      return (
        t.estimatedMinutes ??
        avgMinutesByType.get(t.type) ??
        FALLBACK_ESTIMATE_MINUTES
      )
    }

    const suggestions: WorkforceSuggestion[] = buildWorkforceSuggestions(
      tasks,
      estMinutes,
      capacityPerUser,
      MAX_SUGGESTIONS
    )

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("[GET /api/tasks/redistribution-suggestions]:", error)
    return NextResponse.json(
      { error: "Failed to compute redistribution suggestions" },
      { status: 500 }
    )
  }
}
