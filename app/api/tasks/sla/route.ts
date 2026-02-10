import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/app/api/tasks/utils"

export type SLAResponse = {
  withinSLA: number
  breachedSLA: number
  pendingRisk: number
  avgResolutionTime: number
}

function minutesBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (60 * 1000)
}

/**
 * GET /api/tasks/sla
 * Métricas SLA y cumplimiento del día actual.
 * Filtro: dueDate en [inicio del día, fin del día], userId = session.
 */
export async function GET() {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        dueDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        status: true,
        createdAt: true,
        completedAt: true,
        slaMinutes: true,
      },
    })

    let withinSLA = 0
    let breachedSLA = 0
    let pendingRisk = 0
    const resolutionMinutes: number[] = []

    const slaThresholdPct = 0.8

    for (const t of tasks) {
      if (t.status === "DONE" && t.completedAt) {
        const resolutionMin = minutesBetween(t.createdAt, t.completedAt)
        resolutionMinutes.push(resolutionMin)
        if (t.slaMinutes != null) {
          if (resolutionMin <= t.slaMinutes) withinSLA += 1
          else breachedSLA += 1
        }
      } else if (t.status === "PENDING" && t.slaMinutes != null) {
        const elapsedMin = minutesBetween(t.createdAt, now)
        if (elapsedMin > t.slaMinutes * slaThresholdPct) pendingRisk += 1
      }
    }

    const avgResolutionTime =
      resolutionMinutes.length > 0
        ? Math.round(
            resolutionMinutes.reduce((a, b) => a + b, 0) / resolutionMinutes.length
          )
        : 0

    const body: SLAResponse = {
      withinSLA,
      breachedSLA,
      pendingRisk,
      avgResolutionTime,
    }

    return NextResponse.json(body)
  } catch (error) {
    console.error("[GET /api/tasks/sla]:", error)
    return NextResponse.json(
      { error: "Failed to load SLA metrics" },
      { status: 500 }
    )
  }
}
