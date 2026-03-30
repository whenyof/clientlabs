import type { DashboardTask } from "./types"

export const CELL_H = 48
export const GRID_START_H = 7
export const GRID_START_MINS = GRID_START_H * 60

export function getTaskStartMins(task: DashboardTask): number {
  if (!task.startAt) return 0
  const s = new Date(task.startAt)
  return s.getHours() * 60 + s.getMinutes()
}

export function getTaskDurMins(task: DashboardTask, localEndAts: Record<string, string>): number {
  if (!task.startAt) return 60
  const startMs = new Date(task.startAt).getTime()
  const endIso = localEndAts[task.id] ?? task.endAt
  const endMs = endIso ? new Date(endIso).getTime() : startMs + 3_600_000
  return Math.max(30, (endMs - startMs) / 60_000)
}

export function getTaskTop(task: DashboardTask): number {
  return ((getTaskStartMins(task) - GRID_START_MINS) / 60) * CELL_H
}

export function getTaskHeight(task: DashboardTask, localEndAts: Record<string, string>): number {
  return (getTaskDurMins(task, localEndAts) / 60) * CELL_H
}

export interface TaskLayout { col: number; totalCols: number }

export function layoutTasks(
  dayTasks: DashboardTask[],
  localEndAts: Record<string, string> = {}
): Map<string, TaskLayout> {
  const result = new Map<string, TaskLayout>()
  if (dayTasks.length === 0) return result

  const sorted = [...dayTasks].sort((a, b) => getTaskStartMins(a) - getTaskStartMins(b))
  const taskCols = new Map<string, number>()

  for (const task of sorted) {
    const tStart = getTaskStartMins(task)
    const tEnd = tStart + getTaskDurMins(task, localEndAts)
    const usedCols = new Set<number>()
    for (const [otherId, otherCol] of taskCols) {
      const other = sorted.find(t => t.id === otherId)!
      const oStart = getTaskStartMins(other)
      const oEnd = oStart + getTaskDurMins(other, localEndAts)
      if (tStart < oEnd && oStart < tEnd) usedCols.add(otherCol)
    }
    let col = 0
    while (usedCols.has(col)) col++
    taskCols.set(task.id, col)
  }

  for (const task of sorted) {
    const tStart = getTaskStartMins(task)
    const tEnd = tStart + getTaskDurMins(task, localEndAts)
    let maxCol = taskCols.get(task.id) ?? 0
    for (const [otherId, otherCol] of taskCols) {
      const other = sorted.find(t => t.id === otherId)!
      const oStart = getTaskStartMins(other)
      const oEnd = oStart + getTaskDurMins(other, localEndAts)
      if (tStart < oEnd && oStart < tEnd) maxCol = Math.max(maxCol, otherCol)
    }
    result.set(task.id, { col: taskCols.get(task.id) ?? 0, totalCols: maxCol + 1 })
  }

  return result
}
