/* ── Source label ── */

export function formatSource(source?: string | null): string {
  if (!source) return "—"
  const key = source.toLowerCase()
  const map: Record<string, string> = {
    sdk: "SDK directo",
    web: "Formulario web",
    api: "API",
    manual: "Manual",
  }
  return map[key] ?? source
}

/* ── Initials (2 letters) ── */

export function getInitials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }
  if (email?.trim()) {
    return email.slice(0, 2).toUpperCase()
  }
  return "??"
}

/* ── Status / Temperature labels ── */

export const STATUS_LABELS: Record<string, string> = {
  NEW: "Nuevo",
  CONTACTED: "Contactado",
  INTERESTED: "Interesado",
  QUALIFIED: "Calificado",
  STALLED: "Estancado",
  CONVERTED: "Cliente",
  LOST: "Perdido",
}

export const TEMP_LABELS: Record<string, string> = {
  HOT: "Caliente",
  WARM: "Tibio",
  COLD: "Frío",
}

/* ── Time ago (relative) ── */

export function formatTimeAgo(createdAt: string): string {
  const date = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return "Hace un momento"
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays === 1) return "Ayer"
  if (diffDays < 7) return `Hace ${diffDays} días`
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
}

/* ── Score bar colors ── */

export function getScoreColors(score: number): { barColor: string; numColor: string } {
  if (score >= 60) return { barColor: "#1FA97A", numColor: "#0F6E56" }
  if (score >= 30) return { barColor: "#EF9F27", numColor: "#854F0B" }
  return { barColor: "#B4B2A9", numColor: "var(--text-secondary)" }
}
