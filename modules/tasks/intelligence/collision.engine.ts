import { prisma } from "@/lib/prisma"

export type CollisionSeverity = "HIGH" | "MEDIUM" | "LOW"

export type CollisionTaskRef = {
  id: string
  title: string
  startAt: string
  endAt: string
}

export type ScheduleCollision = {
  assignedTo: string
  taskA: CollisionTaskRef
  taskB: CollisionTaskRef
  overlapMinutes: number
  severity: CollisionSeverity
}

function startOfDay(d: Date): Date {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  return out
}

function endOfDay(d: Date): Date {
  const out = new Date(d)
  out.setHours(23, 59, 59, 999)
  return out
}

function toSeverity(overlapMinutes: number): CollisionSeverity {
  if (overlapMinutes > 30) return "HIGH"
  if (overlapMinutes >= 5) return "MEDIUM"
  return "LOW"
}

/**
 * Dos intervalos [aStart, aEnd] y [bStart, bEnd] se solapan si:
 * aStart < bEnd && bStart < aEnd
 */
function overlaps(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime()
}

function overlapMinutes(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): number {
  const start = Math.max(aStart.getTime(), bStart.getTime())
  const end = Math.min(aEnd.getTime(), bEnd.getTime())
  if (start >= end) return 0
  return (end - start) / (60 * 1000)
}

/**
 * Detecta tareas solapadas para un mismo responsable en un día.
 * Solo considera tareas activas (excluye DONE y CANCELLED) con startAt y endAt definidos.
 *
 * @param userId - Propietario de las tareas (task.userId)
 * @param date - Día a analizar
 */
export async function detectScheduleCollisions(
  userId: string,
  date: Date
): Promise<ScheduleCollision[]> {
  const start = startOfDay(date)
  const end = endOfDay(date)

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      status: { notIn: ["DONE", "CANCELLED"] },
      assignedTo: { not: null },
      startAt: { not: null, lt: end },
      endAt: { not: null, gt: start },
    },
    select: {
      id: true,
      title: true,
      assignedTo: true,
      startAt: true,
      endAt: true,
    },
  })

  const byAssignee = new Map<string, typeof tasks>()
  for (const t of tasks) {
    if (!t.assignedTo || !t.startAt || !t.endAt) continue
    const list = byAssignee.get(t.assignedTo) ?? []
    list.push(t)
    byAssignee.set(t.assignedTo, list)
  }

  const collisions: ScheduleCollision[] = []
  for (const [assignedTo, list] of byAssignee) {
    for (let i = 0; i < list.length; i++) {
      const a = list[i]
      const aStart = a.startAt!
      const aEnd = a.endAt!
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j]
        const bStart = b.startAt!
        const bEnd = b.endAt!
        if (!overlaps(aStart, aEnd, bStart, bEnd)) continue
        const mins = overlapMinutes(aStart, aEnd, bStart, bEnd)
        collisions.push({
          assignedTo,
          taskA: {
            id: a.id,
            title: a.title,
            startAt: aStart.toISOString(),
            endAt: aEnd.toISOString(),
          },
          taskB: {
            id: b.id,
            title: b.title,
            startAt: bStart.toISOString(),
            endAt: bEnd.toISOString(),
          },
          overlapMinutes: Math.round(mins * 100) / 100,
          severity: toSeverity(mins),
        })
      }
    }
  }

  return collisions.sort((a, b) => b.overlapMinutes - a.overlapMinutes)
}
