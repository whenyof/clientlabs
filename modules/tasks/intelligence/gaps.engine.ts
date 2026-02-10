import { prisma } from "@/lib/prisma"

/** Mínimo de minutos para considerar un hueco como "tiempo muerto" reportable. */
export const MIN_GAP_MINUTES = 30

/** Hora de inicio de jornada (0-23). */
const WORK_START_HOUR = 9
/** Hora de fin de jornada (0-23). */
const WORK_END_HOUR = 18

export type IdleGap = {
  assignedTo: string
  start: string
  end: string
  freeMinutes: number
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

function workStart(d: Date): Date {
  const out = new Date(d)
  out.setHours(WORK_START_HOUR, 0, 0, 0)
  return out
}

function workEnd(d: Date): Date {
  const out = new Date(d)
  out.setHours(WORK_END_HOUR, 0, 0, 0)
  return out
}

function clampToWorkDay(
  start: Date,
  end: Date,
  dayStart: Date,
  dayEnd: Date
): { start: Date; end: Date } | null {
  const s = Math.max(start.getTime(), dayStart.getTime())
  const e = Math.min(end.getTime(), dayEnd.getTime())
  if (s >= e) return null
  return { start: new Date(s), end: new Date(e) }
}

/**
 * Fusiona intervalos solapados o adyacentes, ordenados por start.
 */
function mergeIntervals(intervals: { start: Date; end: Date }[]): { start: Date; end: Date }[] {
  if (intervals.length === 0) return []
  const sorted = [...intervals].sort((a, b) => a.start.getTime() - b.start.getTime())
  const out: { start: Date; end: Date }[] = [sorted[0]]
  for (let i = 1; i < sorted.length; i++) {
    const prev = out[out.length - 1]
    const curr = sorted[i]
    if (curr.start.getTime() <= prev.end.getTime()) {
      prev.end = new Date(Math.max(prev.end.getTime(), curr.end.getTime()))
    } else {
      out.push(curr)
    }
  }
  return out
}

/**
 * Encuentra espacios libres mayores a minGapMinutes dentro de la jornada.
 * Solo considera tareas activas (excluye DONE y CANCELLED) con startAt y endAt.
 *
 * @param userId - Propietario de las tareas (task.userId)
 * @param date - Día a analizar
 * @param minGapMinutes - Mínimo de minutos para reportar un hueco (default 30)
 */
export async function detectIdleGaps(
  userId: string,
  date: Date,
  minGapMinutes: number = MIN_GAP_MINUTES
): Promise<IdleGap[]> {
  const dayStart = startOfDay(date)
  const wStart = workStart(date)
  const wEnd = workEnd(date)
  const dayEnd = endOfDay(date)

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      status: { notIn: ["DONE", "CANCELLED"] },
      assignedTo: { not: null },
      startAt: { not: null, lt: dayEnd },
      endAt: { not: null, gt: dayStart },
    },
    select: {
      assignedTo: true,
      startAt: true,
      endAt: true,
    },
  })

  const byAssignee = new Map<string, { start: Date; end: Date }[]>()
  for (const t of tasks) {
    if (!t.assignedTo || !t.startAt || !t.endAt) continue
    const clamped = clampToWorkDay(t.startAt, t.endAt, wStart, wEnd)
    if (!clamped) continue
    const list = byAssignee.get(t.assignedTo) ?? []
    list.push(clamped)
    byAssignee.set(t.assignedTo, list)
  }

  const gaps: IdleGap[] = []
  for (const [assignedTo, intervals] of byAssignee) {
    const merged = mergeIntervals(intervals)
    // Hueco entre inicio de jornada y primera tarea
    if (merged.length > 0) {
      const firstStart = merged[0].start.getTime()
      if (firstStart > wStart.getTime()) {
        const freeMs = firstStart - wStart.getTime()
        const freeMin = freeMs / (60 * 1000)
        if (freeMin > minGapMinutes) {
          gaps.push({
            assignedTo,
            start: wStart.toISOString(),
            end: merged[0].start.toISOString(),
            freeMinutes: Math.round(freeMin * 100) / 100,
          })
        }
      }
    } else {
      const freeMin = (wEnd.getTime() - wStart.getTime()) / (60 * 1000)
      if (freeMin > minGapMinutes) {
        gaps.push({
          assignedTo,
          start: wStart.toISOString(),
          end: wEnd.toISOString(),
          freeMinutes: Math.round(freeMin * 100) / 100,
        })
      }
    }
    // Huecos entre tareas consecutivas
    for (let i = 0; i < merged.length - 1; i++) {
      const gapStart = merged[i].end.getTime()
      const gapEnd = merged[i + 1].start.getTime()
      const freeMin = (gapEnd - gapStart) / (60 * 1000)
      if (freeMin > minGapMinutes) {
        gaps.push({
          assignedTo,
          start: new Date(gapStart).toISOString(),
          end: new Date(gapEnd).toISOString(),
          freeMinutes: Math.round(freeMin * 100) / 100,
        })
      }
    }
    // Hueco entre última tarea y fin de jornada
    if (merged.length > 0) {
      const lastEnd = merged[merged.length - 1].end.getTime()
      if (lastEnd < wEnd.getTime()) {
        const freeMs = wEnd.getTime() - lastEnd
        const freeMin = freeMs / (60 * 1000)
        if (freeMin > minGapMinutes) {
          gaps.push({
            assignedTo,
            start: new Date(lastEnd).toISOString(),
            end: wEnd.toISOString(),
            freeMinutes: Math.round(freeMin * 100) / 100,
          })
        }
      }
    }
  }

  return gaps.sort((a, b) => b.freeMinutes - a.freeMinutes)
}
