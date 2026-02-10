import { format } from "date-fns"
import type { CalendarEvent } from "../calendar-event-types"

export type SuggestionType =
  | "FILL_GAP"
  | "BALANCE_LOAD"
  | "GROUP_TASKS"
  | "REORDER"
  | "BETTER_SCHEDULE"

export type SuggestionDifficulty = "low" | "medium" | "high"

export type OptimizationSuggestion = {
  id: string
  type: SuggestionType
  title: string
  description: string
  affectedTaskIds: string[]
  timeSavedMinutes: number
  difficulty: SuggestionDifficulty
  confidence: number
}

export type OptimizerConfig = {
  minGapMinutes: number
  workingHoursStart: number
  workingHoursEnd: number
  loadImbalanceThresholdMinutes: number
}

const DEFAULT_CONFIG: OptimizerConfig = {
  minGapMinutes: 15,
  workingHoursStart: 9,
  workingHoursEnd: 18,
  loadImbalanceThresholdMinutes: 120,
}

function toDayKey(d: Date): string {
  return format(d, "yyyy-MM-dd")
}

function durationMinutes(e: CalendarEvent): number {
  return (e.end.getTime() - e.start.getTime()) / (60 * 1000)
}

function startMinutesFromMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes()
}

function groupByAssigneeAndDay(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>()
  for (const e of events) {
    const key = `${e.assignedTo ?? "unassigned"}|${toDayKey(e.start)}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(e)
  }
  return map
}

let idCounter = 0
function nextId(): string {
  return `opt-${++idCounter}-${Date.now()}`
}

/**
 * Pure logic: detect opportunities and return suggestions, prioritized by impact.
 * No AI. No side effects. Fast.
 */
export function computeSuggestions(
  events: CalendarEvent[],
  config: Partial<OptimizerConfig> = {}
): OptimizationSuggestion[] {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const suggestions: OptimizationSuggestion[] = []
  const groups = groupByAssigneeAndDay(events)
  const workStartMin = cfg.workingHoursStart * 60
  const workEndMin = cfg.workingHoursEnd * 60

  for (const [, group] of groups) {
    const sorted = [...group].sort((a, b) => a.start.getTime() - b.start.getTime())

    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i]
      const b = sorted[i + 1]
      const gapMin = (b.start.getTime() - a.end.getTime()) / (60 * 1000)
      if (gapMin < cfg.minGapMinutes) continue

      suggestions.push({
        id: nextId(),
        type: "FILL_GAP",
        title: "Hueco muerto",
        description: `Espacio libre de ${Math.round(gapMin)} min entre "${a.title}" y "${b.title}" que podría aprovecharse.`,
        affectedTaskIds: [a.id, b.id],
        timeSavedMinutes: Math.round(gapMin),
        difficulty: "low",
        confidence: 1,
      })

      const durationB = durationMinutes(b)
      if (durationB <= gapMin && gapMin >= cfg.minGapMinutes) {
        suggestions.push({
          id: nextId(),
          type: "REORDER",
          title: "Reordenar para reducir espera",
          description: `Mover "${b.title}" al hueco anterior podría ahorrar hasta ${Math.round(gapMin)} min de espera.`,
          affectedTaskIds: [a.id, b.id],
          timeSavedMinutes: Math.round(gapMin),
          difficulty: "medium",
          confidence: 0.9,
        })
      }
    }
  }

  const byDay = new Map<string, Map<string, number>>()
  for (const e of events) {
    const day = toDayKey(e.start)
    if (!byDay.has(day)) byDay.set(day, new Map())
    const assignee = e.assignedTo ?? "unassigned"
    const map = byDay.get(day)!
    map.set(assignee, (map.get(assignee) ?? 0) + durationMinutes(e))
  }
  for (const [day, loadMap] of byDay) {
    const totals = Array.from(loadMap.entries()).map(([a, m]) => ({ assignee: a, minutes: m }))
    if (totals.length < 2) continue
    const max = Math.max(...totals.map((t) => t.minutes))
    const min = Math.min(...totals.map((t) => t.minutes))
    if (max - min < cfg.loadImbalanceThresholdMinutes) continue
    const overloaded = totals.find((t) => t.minutes === max)!
    const underloaded = totals.find((t) => t.minutes === min)!
    const dayEvents = events.filter((e) => toDayKey(e.start) === day)
    const affectedIds = dayEvents.map((e) => e.id)
    suggestions.push({
      id: nextId(),
      type: "BALANCE_LOAD",
      title: "Desequilibrio de carga",
      description: `${overloaded.assignee === "unassigned" ? "Sin asignar" : overloaded.assignee}: ${(overloaded.minutes / 60).toFixed(1)}h · ${underloaded.assignee === "unassigned" ? "Sin asignar" : underloaded.assignee}: ${(underloaded.minutes / 60).toFixed(1)}h. Redistribuir podría equilibrar el día.`,
      affectedTaskIds: affectedIds,
      timeSavedMinutes: Math.round((max - min) / 2),
      difficulty: "high",
      confidence: 0.85,
    })
  }

  const byClientAndDay = new Map<string, CalendarEvent[]>()
  for (const e of events) {
    const client = e.clientName ?? e.leadName ?? "_sin_cliente_"
    const day = toDayKey(e.start)
    const key = `${day}|${client}`
    if (!byClientAndDay.has(key)) byClientAndDay.set(key, [])
    byClientAndDay.get(key)!.push(e)
  }
  for (const [, clientEvents] of byClientAndDay) {
    if (clientEvents.length < 2) continue
    const sorted = [...clientEvents].sort((a, b) => a.start.getTime() - b.start.getTime())
    const first = sorted[0]
    const clientLabel = first.clientName ?? first.leadName ?? "mismo contexto"
    suggestions.push({
      id: nextId(),
      type: "GROUP_TASKS",
      title: "Agrupación por cliente",
      description: `${sorted.length} tareas de "${clientLabel}" en el mismo día. Agruparlas en bloques consecutivos puede reducir transiciones.`,
      affectedTaskIds: sorted.map((e) => e.id),
      timeSavedMinutes: 15 * (sorted.length - 1),
      difficulty: "medium",
      confidence: 0.8,
    })
  }

  for (const e of events) {
    const startMin = startMinutesFromMidnight(e.start)
    const endMin = startMin + durationMinutes(e)
    if (startMin < workStartMin || endMin > workEndMin) {
      suggestions.push({
        id: nextId(),
        type: "BETTER_SCHEDULE",
        title: "Mejor uso del horario",
        description: `"${e.title}" está fuera del horario laboral (${cfg.workingHoursStart}:00–${cfg.workingHoursEnd}:00). Moverla dentro puede mejorar la planificación.`,
        affectedTaskIds: [e.id],
        timeSavedMinutes: 0,
        difficulty: "low",
        confidence: 0.9,
      })
    }
  }

  return suggestions.sort((a, b) => {
    if (b.timeSavedMinutes !== a.timeSavedMinutes) return b.timeSavedMinutes - a.timeSavedMinutes
    return b.confidence - a.confidence
  })
}
