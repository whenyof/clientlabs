import { addMinutes } from "date-fns"
import { getUserAvailability } from "./availability.service"
import type { CalendarAvailabilityBlock, SmartSlot } from "../types/availability"

const STEP_MINUTES = 30
const MIN_GAP_MINUTES = 15
const NEAR_TASK_THRESHOLD_MS = 5 * 60 * 1000
const MAX_RESULTS = 10

function toTs(d: Date): number {
  return d.getTime()
}

/**
 * Genera candidatos de inicio dentro de un bloque FREE cada STEP_MINUTES,
 * respetando que inicio + duración <= fin del bloque.
 */
function candidatesFromFreeBlock(
  block: CalendarAvailabilityBlock,
  durationMinutes: number
): { start: Date; end: Date }[] {
  if (block.type !== "FREE") return []
  const list: { start: Date; end: Date }[] = []
  let start = new Date(block.start)
  const blockEndTs = toTs(block.end)
  const durationMs = durationMinutes * 60 * 1000

  while (toTs(start) + durationMs <= blockEndTs) {
    const end = addMinutes(start, durationMinutes)
    list.push({ start: new Date(start), end })
    start = addMinutes(start, STEP_MINUTES)
  }
  return list
}

/**
 * Puntuación 0–20: espacio suficiente (no justo al límite del bloque).
 */
function scoreSpaceSufficient(
  slotEnd: Date,
  blockEnd: Date,
  durationMinutes: number
): number {
  const remainingMs = toTs(blockEnd) - toTs(slotEnd)
  const remainingMin = remainingMs / (60 * 1000)
  if (remainingMin >= durationMinutes) return 20
  if (remainingMin >= MIN_GAP_MINUTES) return 15
  if (remainingMin > 0) return 5
  return 20
}

/**
 * Puntuación 0–20: no genera micro huecos (el tiempo que queda después del slot en el bloque).
 */
function scoreNoMicroGaps(slotEnd: Date, blockEnd: Date): number {
  const gapMs = toTs(blockEnd) - toTs(slotEnd)
  const gapMin = gapMs / (60 * 1000)
  if (gapMin === 0) return 20
  if (gapMin >= MIN_GAP_MINUTES) return 20
  return Math.max(0, 20 - (MIN_GAP_MINUTES - gapMin) * 2)
}

/**
 * Puntuación 0–20: equilibrio de carga (preferir el tramo del día con menos carga).
 */
function scoreLoadBalance(
  slotStart: Date,
  workStartTs: number,
  workEndTs: number,
  taskBlocks: { start: number; end: number }[]
): number {
  const midTs = (workStartTs + workEndTs) / 2
  const slotTs = toTs(slotStart)
  const firstHalfMinutes = taskBlocks
    .filter((t) => t.end <= midTs)
    .reduce((acc, t) => acc + (t.end - t.start) / (60 * 1000), 0)
  const secondHalfMinutes = taskBlocks
    .filter((t) => t.start >= midTs)
    .reduce((acc, t) => acc + (t.end - t.start) / (60 * 1000), 0)
  const slotInFirstHalf = slotTs < midTs
  if (slotInFirstHalf && firstHalfMinutes <= secondHalfMinutes) return 20
  if (!slotInFirstHalf && secondHalfMinutes <= firstHalfMinutes) return 20
  return 10
}

/**
 * Puntuación 0–20: cercano a otras tareas (back-to-back o casi).
 */
function scoreNearTasks(
  slotStart: Date,
  slotEnd: Date,
  taskBlocks: { start: number; end: number }[]
): number {
  const startTs = toTs(slotStart)
  const endTs = toTs(slotEnd)
  for (const t of taskBlocks) {
    const gapAfter = startTs - t.end
    const gapBefore = t.start - endTs
    if (gapAfter >= 0 && gapAfter <= NEAR_TASK_THRESHOLD_MS) return 20
    if (gapBefore >= 0 && gapBefore <= NEAR_TASK_THRESHOLD_MS) return 20
    if (gapAfter >= 0 && gapAfter <= 15 * 60 * 1000) return 15
    if (gapBefore >= 0 && gapBefore <= 15 * 60 * 1000) return 15
  }
  return 5
}

/**
 * Puntuación 0–20: prioridad alta = preferir primera mitad de la jornada.
 */
function scorePriorityHigh(
  slotStart: Date,
  workStartTs: number,
  workEndTs: number
): number {
  const midTs = (workStartTs + workEndTs) / 2
  if (toTs(slotStart) < midTs) return 20
  return 8
}

/**
 * Devuelve los mejores huecos para colocar una tarea de duración dada en el día,
 * ordenados por score (mejor primero). Máximo MAX_RESULTS.
 */
export async function getSmartSlots(params: {
  userId: string
  date: Date
  durationMinutes: number
}): Promise<SmartSlot[]> {
  const { userId, date, durationMinutes } = params
  if (durationMinutes <= 0) return []

  const blocks = await getUserAvailability({ userId, date })
  const freeBlocks = blocks.filter((b) => b.type === "FREE")
  const taskBlocks = blocks
    .filter((b) => b.type === "TASK")
    .map((b) => ({ start: toTs(b.start), end: toTs(b.end) }))

  const workStartTs = blocks.length
    ? Math.min(...blocks.map((b) => toTs(b.start)))
    : toTs(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0))
  const workEndTs = blocks.length
    ? Math.max(...blocks.map((b) => toTs(b.end)))
    : toTs(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 0))

  const candidates: { start: Date; end: Date; blockEnd: Date }[] = []
  for (const block of freeBlocks) {
    const list = candidatesFromFreeBlock(block, durationMinutes)
    for (const { start, end } of list) {
      candidates.push({ start, end, blockEnd: block.end })
    }
  }

  const scored: SmartSlot[] = candidates.map(({ start, end, blockEnd }) => {
    const s1 = scoreSpaceSufficient(end, blockEnd, durationMinutes)
    const s2 = scoreNoMicroGaps(end, blockEnd)
    const s3 = scoreLoadBalance(start, workStartTs, workEndTs, taskBlocks)
    const s4 = scoreNearTasks(start, end, taskBlocks)
    const s5 = scorePriorityHigh(start, workStartTs, workEndTs)
    const score = Math.min(100, Math.round(s1 + s2 + s3 + s4 + s5))
    return { start, end, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, MAX_RESULTS)
}
