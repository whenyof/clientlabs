import { prisma } from "@/lib/prisma"

/** Buffer mínimo deseado entre tareas (minutos). */
export const DEFAULT_REQUIRED_BUFFER_MINUTES = 15

export type BufferSeverity = "HIGH" | "MEDIUM" | "LOW"

export type BufferTaskRef = {
  id: string
  title: string
  startAt: string
  endAt: string
}

export type BufferProblem = {
  assignedTo: string
  fromTask: BufferTaskRef
  toTask: BufferTaskRef
  availableBuffer: number
  requiredBuffer: number
  severity: BufferSeverity
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

function toSeverity(availableBuffer: number): BufferSeverity {
  if (availableBuffer < 0) return "HIGH"
  if (availableBuffer < 10) return "MEDIUM"
  return "LOW"
}

/**
 * Detecta cuando el tiempo entre tareas consecutivas es menor al buffer requerido.
 * Solo considera tareas activas (excluye DONE y CANCELLED) con startAt y endAt definidos.
 * Por cada responsable, se ordenan por startAt y se revisan pares consecutivos.
 *
 * @param userId - Propietario de las tareas (task.userId)
 * @param date - Día a analizar
 * @param requiredBufferMinutes - Buffer mínimo deseado (default 15)
 */
export async function detectBufferProblems(
  userId: string,
  date: Date,
  requiredBufferMinutes: number = DEFAULT_REQUIRED_BUFFER_MINUTES
): Promise<BufferProblem[]> {
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

  const problems: BufferProblem[] = []
  for (const [assignedTo, list] of byAssignee) {
    const sorted = [...list].sort(
      (a, b) => a.startAt!.getTime() - b.startAt!.getTime()
    )
    for (let i = 0; i < sorted.length - 1; i++) {
      const from = sorted[i]
      const to = sorted[i + 1]
      const fromEnd = from.endAt!.getTime()
      const toStart = to.startAt!.getTime()
      const availableBuffer = (toStart - fromEnd) / (60 * 1000)
      if (availableBuffer >= requiredBufferMinutes) continue
      problems.push({
        assignedTo,
        fromTask: {
          id: from.id,
          title: from.title,
          startAt: from.startAt!.toISOString(),
          endAt: from.endAt!.toISOString(),
        },
        toTask: {
          id: to.id,
          title: to.title,
          startAt: to.startAt!.toISOString(),
          endAt: to.endAt!.toISOString(),
        },
        availableBuffer: Math.round(availableBuffer * 100) / 100,
        requiredBuffer: requiredBufferMinutes,
        severity: toSeverity(availableBuffer),
      })
    }
  }

  return problems.sort((a, b) => a.availableBuffer - b.availableBuffer)
}
