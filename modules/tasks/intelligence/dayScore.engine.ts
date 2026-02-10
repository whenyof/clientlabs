import {
  detectCapacityIssues,
  type CapacityIssue,
  type CapacitySeverity,
} from "./capacity.engine"
import {
  detectScheduleCollisions,
  type ScheduleCollision,
  type CollisionSeverity,
} from "./collision.engine"
import {
  detectBufferProblems,
  type BufferProblem,
  type BufferSeverity,
} from "./buffer.engine"
import { detectIdleGaps, type IdleGap } from "./gaps.engine"

export type DayHealthScore = {
  score: number
  capacityPenalty: number
  collisionPenalty: number
  bufferPenalty: number
  gapPenalty: number
  capacityIssues: CapacityIssue[]
  collisions: ScheduleCollision[]
  bufferProblems: BufferProblem[]
  idleGaps: IdleGap[]
}

const CAPACITY_PENALTY: Record<CapacitySeverity, number> = {
  HIGH: 20,
  MEDIUM: 12,
  LOW: 5,
}

const COLLISION_PENALTY: Record<CollisionSeverity, number> = {
  HIGH: 15,
  MEDIUM: 8,
  LOW: 3,
}

const BUFFER_PENALTY: Record<BufferSeverity, number> = {
  HIGH: 10,
  MEDIUM: 5,
  LOW: 2,
}

/** Máximo de puntos a descontar por huecos muertos (subutilización). */
const MAX_GAP_PENALTY = 15
/** Minutos de hueco por punto descontado. */
const GAP_MINUTES_PER_POINT = 30

/**
 * Evalúa la salud operativa del día combinando sobrecarga, colisiones,
 * buffers y huecos muertos. Score 0–100; 100 = día perfecto.
 *
 * @param userId - Propietario de las tareas (task.userId)
 * @param date - Día a evaluar
 */
export async function evaluateDayHealth(
  userId: string,
  date: Date
): Promise<DayHealthScore> {
  const [capacityIssues, collisions, bufferProblems, idleGaps] = await Promise.all([
    detectCapacityIssues(userId, date),
    detectScheduleCollisions(userId, date),
    detectBufferProblems(userId, date),
    detectIdleGaps(userId, date, 1),
  ])

  let capacityPenalty = 0
  for (const c of capacityIssues) {
    if (c.overloadedBy <= 0) continue
    capacityPenalty += CAPACITY_PENALTY[c.severity]
  }

  let collisionPenalty = 0
  for (const c of collisions) {
    collisionPenalty += COLLISION_PENALTY[c.severity]
  }

  let bufferPenalty = 0
  for (const b of bufferProblems) {
    bufferPenalty += BUFFER_PENALTY[b.severity]
  }

  const totalIdleMinutes = idleGaps.reduce((acc, g) => acc + g.freeMinutes, 0)
  const gapPenalty = Math.min(
    MAX_GAP_PENALTY,
    Math.floor(totalIdleMinutes / GAP_MINUTES_PER_POINT)
  )

  const totalPenalty =
    capacityPenalty + collisionPenalty + bufferPenalty + gapPenalty
  const score = Math.max(0, Math.min(100, 100 - totalPenalty))

  return {
    score: Math.round(score * 100) / 100,
    capacityPenalty,
    collisionPenalty,
    bufferPenalty,
    gapPenalty,
    capacityIssues,
    collisions,
    bufferProblems,
    idleGaps,
  }
}
