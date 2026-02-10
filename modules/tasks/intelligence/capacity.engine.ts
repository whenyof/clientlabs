import { prisma } from "@/lib/prisma"

/** Jornada laboral por defecto en minutos (8h). */
export const DEFAULT_CAPACITY_MINUTES = 8 * 60

export type CapacitySeverity = "HIGH" | "MEDIUM" | "LOW"

export type CapacityIssue = {
  assignedTo: string
  totalMinutes: number
  capacityMinutes: number
  overloadedBy: number
  utilizationPercent: number
  severity: CapacitySeverity
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

function toSeverity(utilizationPercent: number): CapacitySeverity {
  if (utilizationPercent > 110) return "HIGH"
  if (utilizationPercent >= 100) return "MEDIUM"
  return "LOW"
}

/**
 * Detecta sobrecarga de trabajo por responsable en un día.
 * Solo considera tareas activas (excluye DONE y CANCELLED).
 * Una tarea cuenta para el día si dueDate o startAt caen en ese día.
 *
 * @param userId - Propietario de las tareas (task.userId)
 * @param date - Día a analizar
 * @param capacityMinutes - Capacidad diaria por responsable (default 480)
 */
export async function detectCapacityIssues(
  userId: string,
  date: Date,
  capacityMinutes: number = DEFAULT_CAPACITY_MINUTES
): Promise<CapacityIssue[]> {
  const start = startOfDay(date)
  const end = endOfDay(date)

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      status: { notIn: ["DONE", "CANCELLED"] },
      OR: [
        { dueDate: { gte: start, lte: end } },
        { startAt: { gte: start, lte: end } },
      ],
    },
    select: {
      assignedTo: true,
      estimatedMinutes: true,
    },
  })

  const byAssignee = new Map<string, number>()
  for (const t of tasks) {
    const key = t.assignedTo ?? "__unassigned__"
    const min = t.estimatedMinutes ?? 0
    byAssignee.set(key, (byAssignee.get(key) ?? 0) + min)
  }

  const issues: CapacityIssue[] = []
  for (const [assignedTo, totalMinutes] of byAssignee.entries()) {
    const overloadedBy = Math.max(0, totalMinutes - capacityMinutes)
    const utilizationPercent =
      capacityMinutes > 0 ? (totalMinutes / capacityMinutes) * 100 : 0
    issues.push({
      assignedTo: assignedTo === "__unassigned__" ? "Unassigned" : assignedTo,
      totalMinutes,
      capacityMinutes,
      overloadedBy,
      utilizationPercent: Math.round(utilizationPercent * 100) / 100,
      severity: toSeverity(utilizationPercent),
    })
  }

  return issues.sort((a, b) => b.utilizationPercent - a.utilizationPercent)
}
