/**
 * Workforce redistribution: suggest moving tasks from overloaded users
 * to users with capacity. Lowest priority first. User approves; never auto-assign.
 */

export type WorkforceSuggestion = {
  taskId: string
  fromUser: string | null
  toUser: string | null
  benefit: number
}

export type TaskForWorkforce = {
  id: string
  assignedTo: string | null
  priority: string
  priorityScore: number | null
  estimatedMinutes: number | null
  type: string
}

const PRIORITY_ORDER: Record<string, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 }

function priorityRank(t: TaskForWorkforce): number {
  if (t.priorityScore != null && Number.isFinite(t.priorityScore)) {
    return t.priorityScore
  }
  return PRIORITY_ORDER[String(t.priority).toUpperCase()] ?? 1
}

/** Sort tasks by lowest priority first (for redistribution). */
export function sortByLowestPriority(tasks: TaskForWorkforce[]): TaskForWorkforce[] {
  return [...tasks].sort((a, b) => priorityRank(a) - priorityRank(b))
}

/** Compute load per assignee (sum of estimated minutes). */
export function loadPerUser(tasks: TaskForWorkforce[], estMinutes: (t: TaskForWorkforce) => number): Map<string | null, number> {
  const map = new Map<string | null, number>()
  for (const t of tasks) {
    const key = t.assignedTo ?? null
    map.set(key, (map.get(key) ?? 0) + estMinutes(t))
  }
  return map
}

/** Build suggestions: move lowest-priority tasks from overloaded to underloaded users. */
export function buildWorkforceSuggestions(
  tasks: TaskForWorkforce[],
  estMinutes: (t: TaskForWorkforce) => number,
  capacityPerUser: number,
  maxSuggestions: number = 20
): WorkforceSuggestion[] {
  const load = loadPerUser(tasks, estMinutes)
  const users = [...new Set([...load.keys(), null])]

  const overloaded = users.filter((u) => (load.get(u) ?? 0) > capacityPerUser)
  const underloaded = users.filter((u) => (load.get(u) ?? 0) < capacityPerUser)

  if (overloaded.length === 0 || underloaded.length === 0) return []

  const suggestions: WorkforceSuggestion[] = []
  const tasksByUser = new Map<string | null, TaskForWorkforce[]>()
  for (const t of tasks) {
    const u = t.assignedTo ?? null
    if (!tasksByUser.has(u)) tasksByUser.set(u, [])
    tasksByUser.get(u)!.push(t)
  }

  for (const u of overloaded) {
    const userTasks = sortByLowestPriority(tasksByUser.get(u) ?? [])
    const currentLoad = load.get(u) ?? 0
    let overflow = currentLoad - capacityPerUser
    if (overflow <= 0) continue

    for (const task of userTasks) {
      if (suggestions.length >= maxSuggestions) break
      const est = estMinutes(task)
      if (est <= 0) continue

      let bestTo: string | null = null
      let bestSpare = -1
      for (const to of underloaded) {
        if (to === u) continue
        const toLoad = load.get(to) ?? 0
        const spare = capacityPerUser - toLoad
        if (spare >= est && spare > bestSpare) {
          bestSpare = spare
          bestTo = to
        }
      }
      if (bestTo === null) continue

      suggestions.push({
        taskId: task.id,
        fromUser: u,
        toUser: bestTo,
        benefit: est,
      })
      overflow -= est
      const newToLoad = (load.get(bestTo) ?? 0) + est
      load.set(bestTo, newToLoad)
      if (newToLoad >= capacityPerUser) {
        underloaded.splice(underloaded.indexOf(bestTo), 1)
      }
      if (overflow <= 0) break
    }
  }

  return suggestions
}
