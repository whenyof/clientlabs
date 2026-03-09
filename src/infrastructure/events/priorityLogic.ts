/**
 * Priority Logic — Lead priority and score boundaries
 *
 * Score range: 0–200 (hard clamp)
 *
 * Priority tiers:
 *   1 (Low)      — score 0–24
 *   2 (Medium)   — score 25–59
 *   3 (High)     — score 60–99
 *   4 (Critical) — score 100+
 */

/* ── Constants ──────────────────────────────────────── */

/** Maximum allowed lead score */
export const SCORE_MAX = 200

/** Minimum allowed lead score */
export const SCORE_MIN = 0

/* ── Types ──────────────────────────────────────────── */

export type PriorityLevel = 1 | 2 | 3 | 4

/* ── Functions ──────────────────────────────────────── */

/**
 * Clamp a score to the valid range [0, 200].
 */
export function clampScore(score: number): number {
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, Math.round(score)))
}

/**
 * Recalculate lead priority based on cumulative score.
 *
 * @param score - The lead's total score (will be clamped internally)
 * @returns Priority level: 1, 2, 3, or 4
 */
export function recalculatePriority(score: number): PriorityLevel {
  const clamped = clampScore(score)
  if (clamped >= 100) return 4
  if (clamped >= 60) return 3
  if (clamped >= 25) return 2
  return 1
}

/**
 * Human-readable label for a priority level.
 */
export function priorityLabel(level: PriorityLevel): string {
  switch (level) {
    case 4:
      return "Crítica"
    case 3:
      return "Alta"
    case 2:
      return "Media"
    case 1:
      return "Baja"
  }
}

/**
 * CSS-friendly color for a priority level (for UI usage).
 */
export function priorityColor(level: PriorityLevel): string {
  switch (level) {
    case 4:
      return "#C95656" // critical red
    case 3:
      return "#D9A441" // warm amber
    case 2:
      return "#1FA97A" // accent green
    case 1:
      return "#5B7280" // neutral gray
  }
}

