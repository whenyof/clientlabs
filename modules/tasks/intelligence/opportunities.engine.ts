import { prisma } from "@/lib/prisma"
import { detectIdleGaps } from "./gaps.engine"

/** Duración media por defecto (min) cuando no hay datos. */
const DEFAULT_AVG_DURATION_MINUTES = 30

export type InsertionOpportunity = {
  assignedTo: string
  possibleStart: string
  durationFit: number
  potentialValue: number
}

/**
 * Obtiene la duración media de tareas del usuario (estimatedMinutes).
 */
async function getAverageTaskDurationMinutes(userId: string): Promise<number> {
  const agg = await prisma.task.aggregate({
    where: {
      userId,
      estimatedMinutes: { not: null },
    },
    _avg: { estimatedMinutes: true },
    _count: { id: true },
  })
  if (agg._count.id === 0 || agg._avg.estimatedMinutes == null) {
    return DEFAULT_AVG_DURATION_MINUTES
  }
  return Math.round(agg._avg.estimatedMinutes)
}

/**
 * Si un hueco es >= duración media de tareas, sugiere inserción.
 * Usa el motor de gaps y filtra por duración media del usuario.
 *
 * @param userId - Propietario de las tareas (task.userId)
 * @param date - Día a analizar
 */
export async function detectOpportunities(
  userId: string,
  date: Date
): Promise<InsertionOpportunity[]> {
  const [gaps, avgDuration] = await Promise.all([
    detectIdleGaps(userId, date, 1),
    getAverageTaskDurationMinutes(userId),
  ])

  const opportunities: InsertionOpportunity[] = []
  for (const gap of gaps) {
    if (gap.freeMinutes < avgDuration) continue
    opportunities.push({
      assignedTo: gap.assignedTo,
      possibleStart: gap.start,
      durationFit: gap.freeMinutes,
      potentialValue: gap.freeMinutes,
    })
  }

  return opportunities.sort((a, b) => b.potentialValue - a.potentialValue)
}
