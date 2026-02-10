/**
 * Priority score badge: label and style from calculated score.
 * > 400 → Crítica, > 250 → Alta, > 120 → Media, resto → Baja
 */
export function getPriorityScoreLabel(score: number | null | undefined): string | null {
  if (score == null || !Number.isFinite(score)) return null
  if (score > 400) return "Crítica"
  if (score > 250) return "Alta"
  if (score > 120) return "Media"
  return "Baja"
}

export function getPriorityScoreBadgeClass(score: number | null | undefined): string {
  if (score == null || !Number.isFinite(score)) return "bg-zinc-500/30 text-zinc-400"
  if (score > 400) return "bg-rose-500/30 text-rose-300 border border-rose-500/40"
  if (score > 250) return "bg-amber-500/30 text-amber-300 border border-amber-500/40"
  if (score > 120) return "bg-sky-500/30 text-sky-300 border border-sky-500/40"
  return "bg-zinc-500/30 text-zinc-400"
}

/** Auto-priority from engine: CRITICAL | IMPORTANT | NORMAL — border and badge for calendar. */
export type AutoPriority = "CRITICAL" | "IMPORTANT" | "NORMAL"

export function getAutoPriorityBorderClass(
  autoPriority: AutoPriority | null | undefined
): string {
  if (!autoPriority) return ""
  if (autoPriority === "CRITICAL") return "border-rose-500/60 shadow-[0_0_0_1px_rgba(244,63,94,0.3)]"
  if (autoPriority === "IMPORTANT") return "border-amber-500/50 shadow-[0_0_0_1px_rgba(245,158,11,0.25)]"
  return "border-white/15"
}

export function getAutoPriorityBadgeClass(
  autoPriority: AutoPriority | null | undefined
): string {
  if (!autoPriority) return "bg-zinc-500/30 text-zinc-400"
  if (autoPriority === "CRITICAL") return "bg-rose-500/25 text-rose-300 border border-rose-500/40"
  if (autoPriority === "IMPORTANT") return "bg-amber-500/25 text-amber-300 border border-amber-500/40"
  return "bg-zinc-500/30 text-zinc-400"
}
