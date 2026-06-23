export const maxDuration = 10

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/app/api/tasks/utils"
import { aggKey, getCachedData, setCachedData, AGG_TTL } from "@/lib/cache/aggregates"
import type { TaskStatus } from "@prisma/client"

/**
 * GET /api/tasks/counters
 * Contadores de cabecera + datos del sidebar (hoy/semana) por COUNT SQL, en vez
 * de derivarlos del array completo en cliente. Cacheado bajo agg:<userId>: para
 * que la invalidación (parte c) lo cubra.
 *
 * Nota tz: se computa con fechas UTC del servidor; puede diferir en casos borde
 * de medianoche respecto al cálculo previo en hora local del navegador.
 */
export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const cacheKey = aggKey(userId, "task-counters")
  const cached = await getCachedData(cacheKey)
  if (cached) return NextResponse.json(cached)

  const now = new Date()
  const y = now.getUTCFullYear()
  const m = now.getUTCMonth()
  const d = now.getUTCDate()
  const todayStart = new Date(Date.UTC(y, m, d, 0, 0, 0, 0))
  const todayEnd = new Date(Date.UTC(y, m, d, 23, 59, 59, 999))
  const weekEnd7 = new Date(now); weekEnd7.setUTCDate(d + 7)
  const thirty = new Date(now); thirty.setUTCDate(d - 30)
  // Semana Lun–Dom (UTC), igual que el sidebar.
  const dow = now.getUTCDay() // 0=Dom
  const monOffset = (dow === 0 ? -6 : 1) - dow
  const weekStart = new Date(Date.UTC(y, m, d + monOffset, 0, 0, 0, 0))
  const weekEndSun = new Date(Date.UTC(y, m, d + monOffset + 6, 23, 59, 59, 999))

  const ACTIVE: { notIn: TaskStatus[] } = { notIn: ["DONE", "CANCELLED"] }

  try {
    const [open, overdue, today, dueThisWeek, done30, total30, weekTotal, weekDone, sinProyecto, todayTasks] =
      await Promise.all([
        prisma.task.count({ where: { userId, status: ACTIVE } }),
        prisma.task.count({ where: { userId, status: ACTIVE, dueDate: { lt: now } } }),
        prisma.task.count({ where: { userId, status: { not: "DONE" }, dueDate: { gte: todayStart, lte: todayEnd } } }),
        prisma.task.count({ where: { userId, dueDate: { gte: now, lte: weekEnd7 } } }),
        prisma.task.count({ where: { userId, status: "DONE", OR: [{ dueDate: null }, { dueDate: { gte: thirty } }] } }),
        prisma.task.count({ where: { userId, dueDate: { gte: thirty } } }),
        prisma.task.count({ where: { userId, dueDate: { gte: weekStart, lte: weekEndSun } } }),
        prisma.task.count({ where: { userId, status: "DONE", dueDate: { gte: weekStart, lte: weekEndSun } } }),
        // Tareas sueltas (sin proyecto) activas — para ProjectStrip (todas las vistas).
        prisma.task.count({ where: { userId, projectId: null, status: ACTIVE } }),
        prisma.task.findMany({
          where: { userId, dueDate: { gte: todayStart, lte: todayEnd } },
          orderBy: [{ startAt: { sort: "asc", nulls: "last" } }, { dueDate: "asc" }],
          take: 6,
          select: { id: true, title: true, status: true, startAt: true },
        }),
      ])

    const result = {
      header: { open, overdue, today, dueThisWeek, done30, total30, sinProyecto },
      sidebar: { todayTasks, weekTotal, weekDone },
    }
    await setCachedData(cacheKey, result, AGG_TTL)
    return NextResponse.json(result)
  } catch (e) {
    console.error("[GET /api/tasks/counters]:", e)
    return NextResponse.json({ error: "Failed to load counters" }, { status: 500 })
  }
}
