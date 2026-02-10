/**
 * Workload saturation detection.
 * Computes overloaded days and overloaded assignees from task list.
 * Informational only — does not block anything.
 */

export type TaskForWorkload = {
  dueDate: string | null
  priority: string
  assignedTo?: string | null
}

export type WorkloadThresholds = {
  /** Day is overloaded when total tasks >= this */
  tasksPerDayOverload: number
  /** Day is critical when high-priority tasks >= this */
  highPriorityPerDayCritical: number
  /** Assignee is overloaded when total tasks >= this */
  tasksPerUserOverload: number
}

export const DEFAULT_THRESHOLDS: WorkloadThresholds = {
  tasksPerDayOverload: 8,
  highPriorityPerDayCritical: 4,
  tasksPerUserOverload: 12,
}

export type OverloadedDay = {
  date: string
  total: number
  highPriority: number
  isOverloaded: boolean
  isCritical: boolean
  reason: string
}

export type OverloadedUser = {
  assigneeId: string
  total: number
  isOverloaded: boolean
  reason: string
}

export type WorkloadFlags = {
  overloadedDays: OverloadedDay[]
  overloadedUsers: OverloadedUser[]
}

function toDateKey(dueDate: string | null): string | null {
  if (!dueDate) return null
  const d = new Date(dueDate)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

function isHighPriority(priority: string): boolean {
  return String(priority).toUpperCase() === "HIGH"
}

/**
 * Compute workload flags from tasks.
 * Only considers tasks with a due date for day stats.
 * Assignee is taken from task.assignedTo (id or label); unassigned are skipped for user stats.
 */
export function getWorkloadFlags(
  tasks: TaskForWorkload[],
  thresholds: WorkloadThresholds = DEFAULT_THRESHOLDS
): WorkloadFlags {
  const dayCounts = new Map<string, { total: number; highPriority: number }>()
  const userCounts = new Map<string, number>()

  for (const task of tasks) {
    const dateKey = toDateKey(task.dueDate)
    if (dateKey) {
      const cur = dayCounts.get(dateKey) ?? { total: 0, highPriority: 0 }
      cur.total += 1
      if (isHighPriority(task.priority)) cur.highPriority += 1
      dayCounts.set(dateKey, cur)
    }

    const assigneeId = task.assignedTo != null && task.assignedTo !== "" ? String(task.assignedTo) : null
    if (assigneeId) {
      userCounts.set(assigneeId, (userCounts.get(assigneeId) ?? 0) + 1)
    }
  }

  const overloadedDays: OverloadedDay[] = []
  for (const [date, counts] of dayCounts) {
    const isOverloaded = counts.total >= thresholds.tasksPerDayOverload
    const isCritical = counts.highPriority >= thresholds.highPriorityPerDayCritical
    if (!isOverloaded && !isCritical) continue

    const reasons: string[] = []
    if (isOverloaded) reasons.push(`${counts.total} tasks (over limit ${thresholds.tasksPerDayOverload})`)
    if (isCritical) reasons.push(`${counts.highPriority} high-priority (critical limit ${thresholds.highPriorityPerDayCritical})`)

    overloadedDays.push({
      date,
      total: counts.total,
      highPriority: counts.highPriority,
      isOverloaded,
      isCritical,
      reason: reasons.join("; "),
    })
  }

  overloadedDays.sort((a, b) => a.date.localeCompare(b.date))

  const overloadedUsers: OverloadedUser[] = []
  for (const [assigneeId, total] of userCounts) {
    if (total < thresholds.tasksPerUserOverload) continue
    overloadedUsers.push({
      assigneeId,
      total,
      isOverloaded: true,
      reason: `${total} tasks (over limit ${thresholds.tasksPerUserOverload})`,
    })
  }

  overloadedUsers.sort((a, b) => b.total - a.total)

  return { overloadedDays, overloadedUsers }
}
