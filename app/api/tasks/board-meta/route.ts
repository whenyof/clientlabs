export const maxDuration = 10

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/app/api/tasks/utils"
import { aggKey, getCachedData, setCachedData, AGG_TTL } from "@/lib/cache/aggregates"

/**
 * GET /api/tasks/board-meta
 * Agregados SQL para los widgets del tablero (ProjectStrip, MiniCalendar,
 * TodayAgenda, WorkloadChart), en vez de derivarlos del array completo.
 * Cacheado bajo agg:<userId>: → la invalidación en escrituras de tarea lo cubre.
 *
 * Nota tz: fechas UTC del servidor (igual que /api/tasks/counters).
 */
export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const cacheKey = aggKey(userId, "task-board-meta")
  const cached = await getCachedData(cacheKey)
  if (cached) return NextResponse.json(cached)

  const now = new Date()
  const y = now.getUTCFullYear()
  const m = now.getUTCMonth()
  const d = now.getUTCDate()
  const todayStart = new Date(Date.UTC(y, m, d, 0, 0, 0, 0))
  const todayEnd = new Date(Date.UTC(y, m, d, 23, 59, 59, 999))
  const monthStart = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0))
  const monthEnd = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999))

  try {
    const [total, done, doing, todayRows, monthRows] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: "DONE" } }),
      prisma.task.count({ where: { userId, status: "IN_PROGRESS" } }),
      // Agenda de hoy: activas con dueDate hoy, top 5 por hora.
      prisma.task.findMany({
        where: { userId, status: { not: "DONE" }, dueDate: { gte: todayStart, lte: todayEnd } },
        orderBy: [{ endAt: { sort: "asc", nulls: "last" } }, { dueDate: "asc" }],
        take: 5,
        select: {
          id: true, title: true, priority: true, endAt: true,
          Client: { select: { name: true } },
          assignees: { take: 1, include: { user: { select: { name: true } } } },
        },
      }),
      // Días del mes con tareas (con dueDate), para los puntos del mini-calendario.
      prisma.task.findMany({
        where: { userId, dueDate: { gte: monthStart, lte: monthEnd } },
        select: { dueDate: true, status: true },
      }),
    ])

    // MiniCalendar: por día, hasta 3 categorías (done | overdue | upcoming).
    const monthTaskDays: Record<number, ("done" | "overdue" | "upcoming")[]> = {}
    for (const t of monthRows) {
      if (!t.dueDate) continue
      const day = new Date(t.dueDate).getUTCDate()
      const cat: "done" | "overdue" | "upcoming" =
        t.status === "DONE" ? "done" : new Date(t.dueDate) < now ? "overdue" : "upcoming"
      const arr = (monthTaskDays[day] ??= [])
      if (arr.length < 3) arr.push(cat)
    }

    const todayAgenda = todayRows.map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority as string,
      endAt: t.endAt ? new Date(t.endAt).toISOString() : null,
      clientName: t.Client?.name ?? null,
      assigneeInitials: t.assignees[0]?.user?.name?.slice(0, 2).toUpperCase() ?? null,
    }))

    const result = {
      workload: { done, doing, todo: Math.max(0, total - done - doing) },
      todayAgenda,
      monthTaskDays,
    }
    await setCachedData(cacheKey, result, AGG_TTL)
    return NextResponse.json(result)
  } catch (e) {
    console.error("[GET /api/tasks/board-meta]:", e)
    return NextResponse.json({ error: "Failed to load board meta" }, { status: 500 })
  }
}
