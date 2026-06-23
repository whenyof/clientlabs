export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/app/api/tasks/utils"
import type { Prisma } from "@prisma/client"

/**
 * GET /api/tasks/board?groupBy=status|priority&cap=10
 * Tablero kanban acotado: por columna devuelve top-`cap` tareas + total real
 * (para "+N más"). No carga el conjunto entero.
 *
 * - groupBy=status: Pendiente(futuro) · Hoy · En curso · Revisión(atrasadas) ·
 *   Hecho (incluye CANCELLED → las canceladas siguen localizables aquí).
 * - groupBy=priority: URGENT/HIGH/MEDIUM/LOW con todos los estados (las
 *   canceladas aparecen en su columna de prioridad).
 */
const CAP_DEFAULT = 10
const CAP_MAX = 50

const INCLUDE = {
  Client: { select: { id: true, name: true } },
  Lead: { select: { id: true, name: true } },
  project: { select: { id: true, name: true, color: true } },
  assignees: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
} satisfies Prisma.TaskInclude

const ACTIVE_ORDER: Prisma.TaskOrderByWithRelationInput[] = [
  { dueDate: { sort: "asc", nulls: "last" } },
  { createdAt: "desc" },
]

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const sp = request.nextUrl.searchParams
  const groupBy = sp.get("groupBy") === "priority" ? "priority" : "status"
  const cap = Math.min(Math.max(Number(sp.get("cap") ?? CAP_DEFAULT), 1), CAP_MAX)

  const now = new Date()
  const ts = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
  const te = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999))

  const cols: { id: string; where: Prisma.TaskWhereInput; order?: Prisma.TaskOrderByWithRelationInput[] }[] =
    groupBy === "priority"
      ? (["URGENT", "HIGH", "MEDIUM", "LOW"] as const).map((p) => ({ id: p, where: { priority: p } }))
      : [
          { id: "PENDING_FUTURE", where: { status: "PENDING", OR: [{ dueDate: { gt: te } }, { dueDate: null }] } },
          { id: "PENDING_TODAY", where: { status: "PENDING", dueDate: { gte: ts, lte: te } } },
          { id: "IN_PROGRESS", where: { status: "IN_PROGRESS" } },
          { id: "PENDING_LATE", where: { status: "PENDING", dueDate: { lt: ts } } },
          { id: "DONE", where: { status: { in: ["DONE", "CANCELLED"] } }, order: [{ updatedAt: "desc" }] },
        ]

  try {
    const entries = await Promise.all(
      cols.map(async (col) => {
        const where: Prisma.TaskWhereInput = { userId, ...col.where }
        const [tasks, total] = await Promise.all([
          prisma.task.findMany({ where, orderBy: col.order ?? ACTIVE_ORDER, take: cap, include: INCLUDE }),
          prisma.task.count({ where }),
        ])
        return [col.id, { tasks, total }] as const
      }),
    )
    return NextResponse.json({ success: true, groupBy, columns: Object.fromEntries(entries) })
  } catch (e) {
    console.error("[GET /api/tasks/board]:", e)
    return NextResponse.json({ error: "Failed to load board" }, { status: 500 })
  }
}
