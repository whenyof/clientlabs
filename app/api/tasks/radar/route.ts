import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/app/api/tasks/utils"

export type RadarResponse = {
  pending: number
  done: number
  overdue: number
  total: number
  completionRate: number
}

/**
 * GET /api/tasks/radar
 * Métricas del día actual para el Radar Diario ejecutivo.
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
      select: { status: true, dueDate: true },
    })

    const total = tasks.length
    const pending = tasks.filter((t) => t.status === "PENDING").length
    const done = tasks.filter((t) => t.status === "DONE").length
    const overdue = tasks.filter(
      (t) => t.status === "PENDING" && t.dueDate !== null && t.dueDate < now
    ).length

    const completionRate =
      total > 0 ? Math.round((done / total) * 100) : 0

    const body: RadarResponse = {
      pending,
      done,
      overdue,
      total,
      completionRate,
    }

    return NextResponse.json(body)
  } catch (error) {
    console.error("[GET /api/tasks/radar]:", error)
    return NextResponse.json(
      { error: "Failed to load radar" },
      { status: 500 }
    )
  }
}
