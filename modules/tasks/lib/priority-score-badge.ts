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
 if (score > 400) return "bg-[var(--bg-card)] text-[var(--critical)] border border-[var(--critical)]"
 if (score > 250) return "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
 if (score > 120) return "bg-sky-500/30 text-sky-300 border border-sky-500/40"
 return "bg-zinc-500/30 text-zinc-400"
}

/** Au from engine: CRITICAL | IMPORTANT | NORMAL — border and badge for calendar. */
export type AutoPriority = "CRITICAL" | "IMPORTANT" | "NORMAL"

export function getAutoPriorityBorderClass(
 autoPriority: AutoPriority | null | undefined
): string {
 if (!autoPriority) return ""
 if (autoPriority === "CRITICAL") return "border-[var(--critical)] shadow-sm"
 if (autoPriority === "IMPORTANT") return "border-[var(--border-subtle)] shadow-sm"
 return "border-[var(--border-subtle)]"
}

export function getAutoPriorityBadgeClass(
 autoPriority: AutoPriority | null | undefined
): string {
 if (!autoPriority) return "bg-zinc-500/30 text-zinc-400"
 if (autoPriority === "CRITICAL") return "bg-[var(--bg-card)] text-[var(--critical)] border border-[var(--critical)]"
 if (autoPriority === "IMPORTANT") return "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
 return "bg-zinc-500/30 text-zinc-400"
}
