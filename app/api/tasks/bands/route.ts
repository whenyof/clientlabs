export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/app/api/tasks/utils"
import type { Prisma, TaskPriority } from "@prisma/client"

/**
 * GET /api/tasks/bands?search=&cap=50
 * Vista Lista (bandas de prioridad): por cada banda devuelve las tareas ACTIVAS
 * (no DONE/CANCELLED) y las COMPLETADAS, acotadas a `cap`, más el total real de
 * cada grupo (para mostrar "+N más"). La búsqueda se aplica en BD sobre TODO el
 * conjunto, no solo sobre lo ya cargado.
 */
const BANDS: TaskPriority[] = ["URGENT", "HIGH", "MEDIUM", "LOW"]
const CAP_DEFAULT = 50
const CAP_MAX = 100

const INCLUDE = {
  Client: { select: { id: true, name: true } },
  Lead: { select: { id: true, name: true } },
  project: { select: { id: true, name: true, color: true } },
  assignees: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
} satisfies Prisma.TaskInclude

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const sp = request.nextUrl.searchParams
  const search = sp.get("search")?.trim() ?? ""
  const projectId = sp.get("projectId")?.trim() || null
  const cap = Math.min(Math.max(Number(sp.get("cap") ?? CAP_DEFAULT), 1), CAP_MAX)

  const searchWhere: Prisma.TaskWhereInput = {
    ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
    ...(projectId ? { projectId } : {}),
  }
  const activeStatus: Prisma.TaskWhereInput = { status: { notIn: ["DONE", "CANCELLED"] } }
  const doneStatus: Prisma.TaskWhereInput = { status: "DONE" }

  try {
    // Totales por banda en 2 groupBy (1 activas, 1 completadas), respetando búsqueda.
    const [activeTotals, doneTotals] = await Promise.all([
      prisma.task.groupBy({ by: ["priority"], where: { userId, ...activeStatus, ...searchWhere }, _count: { _all: true } }),
      prisma.task.groupBy({ by: ["priority"], where: { userId, ...doneStatus, ...searchWhere }, _count: { _all: true } }),
    ])
    const activeTotalBy = new Map(activeTotals.map((r) => [r.priority, r._count._all]))
    const doneTotalBy = new Map(doneTotals.map((r) => [r.priority, r._count._all]))

    // Tareas (cap) por banda: 4 activas + 4 completadas en paralelo.
    const perBand = await Promise.all(
      BANDS.map(async (priority) => {
        const [active, done] = await Promise.all([
          prisma.task.findMany({
            where: { userId, priority, ...activeStatus, ...searchWhere },
            orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
            take: cap,
            include: INCLUDE,
          }),
          prisma.task.findMany({
            where: { userId, priority, ...doneStatus, ...searchWhere },
            orderBy: [{ updatedAt: "desc" }],
            take: cap,
            include: INCLUDE,
          }),
        ])
        return [
          priority,
          {
            active,
            activeTotal: activeTotalBy.get(priority) ?? 0,
            done,
            doneTotal: doneTotalBy.get(priority) ?? 0,
          },
        ] as const
      }),
    )

    return NextResponse.json({ success: true, bands: Object.fromEntries(perBand) })
  } catch (e) {
    console.error("[GET /api/tasks/bands]:", e)
    return NextResponse.json({ error: "Failed to load task bands" }, { status: 500 })
  }
}
