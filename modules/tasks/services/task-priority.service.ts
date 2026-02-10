import { prisma } from "@/lib/prisma"

/** Minimal task shape needed to compute priority score. */
export type TaskForPriority = {
  dueDate: Date | null
  priority: string
  status: string
  slaMinutes: number | null
  isBlocking: boolean | null
}

const MS_24H = 24 * 60 * 60 * 1000
const MS_48H = 48 * 60 * 60 * 1000

function startOfWeek(d: Date): Date {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const start = new Date(d)
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  return start
}

function endOfWeek(d: Date): Date {
  const start = startOfWeek(d)
  const end = new Date(start)
  end.setDate(start.getDate() + 7)
  end.setMilliseconds(-1)
  return end
}

/**
 * Calculates a dynamic priority score for a task based on:
 * - Urgency (due in < 24h, < 48h, this week)
 * - Risk (priority HIGH / MEDIUM)
 * - Blocking others, SLA, pending status
 * Uses `now` as reference for due-date rules.
 */
export function calculateTaskPriority(
  task: TaskForPriority,
  now: Date = new Date()
): number {
  let score = 0

  if (task.dueDate) {
    const due = new Date(task.dueDate).getTime()
    const nowMs = now.getTime()
    const diffMs = due - nowMs

    if (diffMs <= MS_24H) score += 200
    else if (diffMs <= MS_48H) score += 120
    else {
      const weekStart = startOfWeek(now).getTime()
      const weekEnd = endOfWeek(now).getTime()
      if (due >= weekStart && due <= weekEnd) score += 60
    }
  }

  const p = String(task.priority).toUpperCase()
  if (p === "HIGH") score += 150
  else if (p === "MEDIUM") score += 80

  if (task.isBlocking === true) score += 180
  if (task.slaMinutes != null && task.slaMinutes > 0) score += 120
  if (task.status === "PENDING") score += 40

  return score
}

/**
 * Recalculates priority for one task and persists priorityScore + lastPriorityCalc.
 */
export async function calculateAndStorePriority(taskId: string): Promise<number | null> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      dueDate: true,
      priority: true,
      status: true,
      slaMinutes: true,
      isBlocking: true,
    },
  })
  if (!task) return null

  const score = calculateTaskPriority({
    dueDate: task.dueDate,
    priority: task.priority,
    status: task.status,
    slaMinutes: task.slaMinutes,
    isBlocking: task.isBlocking,
  })

  await prisma.task.update({
    where: { id: taskId },
    data: { priorityScore: score },
  })
  return score
}

/**
 * Recalculates and stores priority for all tasks of a user.
 */
export async function calculateUserTaskPriorities(userId: string): Promise<void> {
  const tasks = await prisma.task.findMany({
    where: { userId },
    select: {
      id: true,
      dueDate: true,
      priority: true,
      status: true,
      slaMinutes: true,
      isBlocking: true,
    },
  })

  const now = new Date()
  await prisma.$transaction(
    tasks.map((t) =>
      prisma.task.update({
        where: { id: t.id },
        data: {
          priorityScore: calculateTaskPriority({
            dueDate: t.dueDate,
            priority: t.priority,
            status: t.status,
            slaMinutes: t.slaMinutes,
            isBlocking: t.isBlocking,
          }),
        },
      })
    )
  )
}
