/**
 * Suggests better task distribution by moving low-priority tasks
 * from overloaded days to nearest days with lower load.
 * User chooses; system never auto-moves.
 */

import { format, parseISO, differenceInCalendarDays } from "date-fns"
import { enUS } from "date-fns/locale"
import type { OverloadedDay } from "./workloadSaturation"
import { DEFAULT_THRESHOLDS } from "./workloadSaturation"

export type TaskForRedistribution = {
  id: string
  title: string
  dueDate: string | null
  priority: string
}

export type RedistributionSuggestion = {
  taskId: string
  taskTitle: string
  from: string
  to: string
  reason: string
}

const PRIORITY_ORDER: Record<string, number> = { LOW: 0, MEDIUM: 1, HIGH: 2 }

function toDateKey(dueDate: string | null): string | null {
  if (!dueDate) return null
  const d = new Date(dueDate)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

function getDayLoads(tasks: TaskForRedistribution[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const t of tasks) {
    const key = toDateKey(t.dueDate)
    if (key) map.set(key, (map.get(key) ?? 0) + 1)
  }
  return map
}

function sortTasksByPriorityAsc(tasks: TaskForRedistribution[]): TaskForRedistribution[] {
  return [...tasks].sort((a, b) => {
    const pa = PRIORITY_ORDER[String(a.priority).toUpperCase()] ?? 1
    const pb = PRIORITY_ORDER[String(b.priority).toUpperCase()] ?? 1
    return pa - pb
  })
}

/** All dates that appear in tasks or in overloaded days, expanded by a window for candidate targets */
function getCandidateDates(
  tasks: TaskForRedistribution[],
  overloadedDays: OverloadedDay[],
  windowDays: number
): string[] {
  const set = new Set<string>()
  for (const t of tasks) {
    const k = toDateKey(t.dueDate)
    if (k) set.add(k)
  }
  for (const d of overloadedDays) set.add(d.date)

  const sorted = Array.from(set).sort()
  if (sorted.length === 0) return []

  const min = parseISO(sorted[0])
  const max = parseISO(sorted[sorted.length - 1])
  const expanded: string[] = []
  for (let i = -windowDays; i <= differenceInCalendarDays(max, min) + windowDays; i++) {
    const d = new Date(min)
    d.setDate(d.getDate() + i)
    expanded.push(format(d, "yyyy-MM-dd"))
  }
  return [...new Set(expanded)].sort()
}

/** Find nearest date (by calendar days) with strictly lower load than fromDate. Prefer not overloaded. */
function findNearestLowerLoadDay(
  fromDate: string,
  fromLoad: number,
  dayLoads: Map<string, number>,
  overloadedSet: Set<string>,
  overloadThreshold: number,
  candidateDates: string[]
): string | null {
  const from = parseISO(fromDate)
  let best: { date: string; load: number; daysAway: number } | null = null

  for (const dateKey of candidateDates) {
    if (dateKey === fromDate) continue
    const load = dayLoads.get(dateKey) ?? 0
    if (load >= fromLoad) continue
    const candidate = parseISO(dateKey)
    const daysAway = Math.abs(differenceInCalendarDays(candidate, from))
    const isOverloaded = overloadedSet.has(dateKey) || load >= overloadThreshold
    if (!best || daysAway < best.daysAway || (daysAway === best.daysAway && !isOverloaded && load < best.load)) {
      best = { date: dateKey, load, daysAway }
    }
  }
  return best?.date ?? null
}

function formatDayLabel(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "EEEE", { locale: enUS })
  } catch {
    return dateStr
  }
}

const MAX_SUGGESTIONS = 5

/**
 * Returns suggestions to move tasks from overloaded days to nearest lower-load days.
 * Low-priority tasks are recommended first.
 */
export function getRedistributionSuggestions(
  tasks: TaskForRedistribution[],
  overloadedDays: OverloadedDay[],
  options?: { maxSuggestions?: number; loadWindowDays?: number }
): RedistributionSuggestion[] {
  const maxSuggestions = options?.maxSuggestions ?? MAX_SUGGESTIONS
  const loadWindowDays = options?.loadWindowDays ?? 14

  if (overloadedDays.length === 0) return []

  const dayLoads = getDayLoads(tasks)
  const overloadedSet = new Set(overloadedDays.map((d) => d.date))
  const threshold = DEFAULT_THRESHOLDS.tasksPerDayOverload
  const candidateDates = getCandidateDates(tasks, overloadedDays, loadWindowDays)

  const suggestions: RedistributionSuggestion[] = []
  const suggestedTaskIds = new Set<string>()

  for (const od of overloadedDays) {
    const dayTasks = tasks.filter((t) => toDateKey(t.dueDate) === od.date)
    const sorted = sortTasksByPriorityAsc(dayTasks)
    const fromLoad = od.total

    for (const task of sorted) {
      if (suggestions.length >= maxSuggestions || suggestedTaskIds.has(task.id)) continue
      const toDate = findNearestLowerLoadDay(
        od.date,
        fromLoad,
        dayLoads,
        overloadedSet,
        threshold,
        candidateDates
      )
      if (!toDate) continue

      suggestedTaskIds.add(task.id)
      suggestions.push({
        taskId: task.id,
        taskTitle: task.title,
        from: od.date,
        to: toDate,
        reason: `Move to ${formatDayLabel(toDate)} to reduce overload on this day.`,
      })
    }
  }

  return suggestions
}
