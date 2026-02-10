import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/app/api/tasks/utils"

export type PerformanceRow = {
  userId: string | null
  name: string
  assigned: number
  completed: number
  overdue: number
  withinSLA: number
  avgResolutionMinutes: number
  currentLoad: number
}

function minutesBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (60 * 1000)
}

const UNASSIGNED_KEY = "__unassigned__"

/**
 * GET /api/tasks/performance
 * Rendimiento por responsable: tareas del día actual agrupadas por assignedTo.
 * Filtro: userId = session (tareas del usuario), dueDate en [inicio, fin] del día.
 */
export async function GET() {
  try {
    const ownerId = await getSessionUserId()
    if (!ownerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    const tasks = await prisma.task.findMany({
      where: {
        userId: ownerId,
        dueDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        assignedTo: true,
        status: true,
        dueDate: true,
        createdAt: true,
        completedAt: true,
        slaMinutes: true,
      },
    })

    type Group = {
      assigned: number
      completed: number
      overdue: number
      withinSLA: number
      resolutionMinutes: number[]
      currentLoad: number
    }

    const byAssignee = new Map<string, Group>()

    function getGroup(key: string): Group {
      let g = byAssignee.get(key)
      if (!g) {
        g = {
          assigned: 0,
          completed: 0,
          overdue: 0,
          withinSLA: 0,
          resolutionMinutes: [],
          currentLoad: 0,
        }
        byAssignee.set(key, g)
      }
      return g
    }

    for (const t of tasks) {
      const key = t.assignedTo != null && t.assignedTo.trim() !== "" ? t.assignedTo : UNASSIGNED_KEY
      const g = getGroup(key)

      g.assigned += 1

      if (t.status === "DONE") {
        g.completed += 1
        if (t.completedAt) {
          const resolutionMin = minutesBetween(t.createdAt, t.completedAt)
          g.resolutionMinutes.push(resolutionMin)
          if (t.slaMinutes != null && resolutionMin <= t.slaMinutes) g.withinSLA += 1
        }
      } else if (t.status === "PENDING") {
        g.currentLoad += 1
        if (t.dueDate != null && t.dueDate < now) g.overdue += 1
      }
    }

    const assigneeIds = [...byAssignee.keys()].filter((id) => id !== UNASSIGNED_KEY)
    const userMap = new Map<string, string>()
    if (assigneeIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: assigneeIds } },
        select: { id: true, name: true },
      })
      for (const u of users) {
        userMap.set(u.id, u.name?.trim() || u.id)
      }
    }

    const result: PerformanceRow[] = []

    for (const [userId, g] of byAssignee.entries()) {
      const name =
        userId === UNASSIGNED_KEY
          ? "Sin asignar"
          : userMap.get(userId) ?? userId

      const avgResolutionMinutes =
        g.resolutionMinutes.length > 0
          ? Math.round(
              g.resolutionMinutes.reduce((a, b) => a + b, 0) / g.resolutionMinutes.length
            )
          : 0

      result.push({
        userId: userId === UNASSIGNED_KEY ? null : userId,
        name,
        assigned: g.assigned,
        completed: g.completed,
        overdue: g.overdue,
        withinSLA: g.withinSLA,
        avgResolutionMinutes,
        currentLoad: g.currentLoad,
      })
    }

    result.sort((a, b) => {
      const loadDiff = b.currentLoad - a.currentLoad
      if (loadDiff !== 0) return loadDiff
      const slaA = a.assigned > 0 ? (a.withinSLA / a.assigned) * 100 : 100
      const slaB = b.assigned > 0 ? (b.withinSLA / b.assigned) * 100 : 100
      return slaA - slaB
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[GET /api/tasks/performance]:", error)
    return NextResponse.json(
      { error: "Failed to load performance" },
      { status: 500 }
    )
  }
}
