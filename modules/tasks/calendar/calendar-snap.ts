/** Snap minutes from midnight to nearest 15 (0, 15, 30, 45). */
export function snapMinutes(minutes: number): number {
  const m = Math.max(0, Math.min(24 * 60 - 15, minutes))
  return Math.round(m / 15) * 15
}

export function minutesToDate(minutes: number, baseDate: Date): Date {
  const d = new Date(baseDate)
  d.setHours(0, 0, 0, 0)
  d.setMinutes(minutes % 60, 0, 0)
  d.setHours(Math.floor(minutes / 60), d.getMinutes(), 0, 0)
  return d
}

export const SNAP_INTERVAL_MINUTES = 15
export const ROW_HEIGHT = 48
export const MINUTES_PER_HOUR = 60
