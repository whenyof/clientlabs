import { format } from "date-fns"
import type { CalendarEvent } from "../calendar-event-types"

export type ViolationType =
  | "OVERLAP"
  | "DAILY_OVERLOAD"
  | "IMPOSSIBLE_TIMING"
  | "OUTSIDE_HOURS"
  | "BROKEN_DEPENDENCY"

export type Severity = "error" | "warning"

export type Violation = {
  type: ViolationType
  severity: Severity
  taskId: string
  message: string
}

export type RulesConfig = {
  /** Max assignable hours per person per day (default 8) */
  dailyHoursLimit: number
  /** Working day start hour (0-23, default 9) */
  workingHoursStart: number
  /** Working day end hour (0-24, default 18) */
  workingHoursEnd: number
  /** Min minutes between end of A and start of B (default 0) */
  minGapMinutes: number
}

const DEFAULT_CONFIG: RulesConfig = {
  dailyHoursLimit: 8,
  workingHoursStart: 9,
  workingHoursEnd: 18,
  minGapMinutes: 0,
}

function toDayKey(d: Date): string {
  return format(d, "yyyy-MM-dd")
}

function toMinutesFromMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes()
}

function durationMinutes(e: CalendarEvent): number {
  return (e.end.getTime() - e.start.getTime()) / (60 * 1000)
}

/** Group events by (assignedTo, dayKey) for efficient per-responsible, per-day evaluation. */
function groupByAssigneeAndDay(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>()
  for (const e of events) {
    const key = `${e.assignedTo ?? "unassigned"}|${toDayKey(e.start)}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(e)
  }
  return map
}

function addViolation(
  out: Violation[],
  taskId: string,
  type: ViolationType,
  severity: Severity,
  message: string
): void {
  out.push({ type, severity, taskId, message })
}

/**
 * Evaluates all conflict rules over the current events.
 * Fast, non-blocking; groups by assignee and day for O(n) per group.
 */
export function evaluateConflictRules(
  events: CalendarEvent[],
  config: Partial<RulesConfig> = {}
): Violation[] {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const violations: Violation[] = []
  const groups = groupByAssigneeAndDay(events)

  for (const [, group] of groups) {
    if (group.length === 0) continue
    const sorted = [...group].sort((a, b) => a.start.getTime() - b.start.getTime())

    // 1) Overlap + 2) Impossible timing (back-to-back)
    for (let i = 0; i < sorted.length; i++) {
      const a = sorted[i]
      const aStart = a.start.getTime()
      const aEnd = a.end.getTime()
      const aStartMin = toMinutesFromMidnight(a.start)
      const aEndMin = toMinutesFromMidnight(a.end)

      // 4) Outside working hours (per event)
      const workStartMin = cfg.workingHoursStart * 60
      const workEndMin = cfg.workingHoursEnd * 60
      if (aStartMin < workStartMin) {
        addViolation(
          violations,
          a.id,
          "OUTSIDE_HOURS",
          "warning",
          `Inicio antes del horario laboral (${cfg.workingHoursStart}:00)`
        )
      }
      if (aEndMin > workEndMin) {
        addViolation(
          violations,
          a.id,
          "OUTSIDE_HOURS",
          "warning",
          `Fin después del horario laboral (${cfg.workingHoursEnd}:00)`
        )
      }

      for (let j = i + 1; j < sorted.length; j++) {
        const b = sorted[j]
        const bStart = b.start.getTime()
        const bEnd = b.end.getTime()
        if (aEnd <= bStart) {
          const gapMin = (bStart - aEnd) / (60 * 1000)
          if (gapMin < cfg.minGapMinutes) {
            addViolation(
              violations,
              a.id,
              "IMPOSSIBLE_TIMING",
              "error",
              `Sin margen antes de la siguiente tarea (mín. ${cfg.minGapMinutes} min)`
            )
            addViolation(
              violations,
              b.id,
              "IMPOSSIBLE_TIMING",
              "error",
              `Sin margen después de la tarea anterior (mín. ${cfg.minGapMinutes} min)`
            )
          }
          break
        }
        if (bStart < aEnd) {
          addViolation(
            violations,
            a.id,
            "OVERLAP",
            "error",
            "Solapamiento con otra tarea del mismo responsable"
          )
          addViolation(
            violations,
            b.id,
            "OVERLAP",
            "error",
            "Solapamiento con otra tarea del mismo responsable"
          )
        }
      }
    }

    // 2) Daily overload
    const totalMinutes = sorted.reduce((acc, e) => acc + durationMinutes(e), 0)
    const limitMinutes = cfg.dailyHoursLimit * 60
    if (totalMinutes > limitMinutes) {
      const excess = (totalMinutes - limitMinutes) / 60
      for (const e of sorted) {
        addViolation(
          violations,
          e.id,
          "DAILY_OVERLOAD",
          "warning",
          `Sobrecarga diaria: ${(totalMinutes / 60).toFixed(1)}h asignadas (límite ${cfg.dailyHoursLimit}h, +${excess.toFixed(1)}h)`
        )
      }
    }
  }

  return violations
}

/** Build a map taskId -> violations for quick lookup in UI. */
export function violationsByTaskId(violations: Violation[]): Map<string, Violation[]> {
  const map = new Map<string, Violation[]>()
  for (const v of violations) {
    if (!map.has(v.taskId)) map.set(v.taskId, [])
    map.get(v.taskId)!.push(v)
  }
  return map
}
