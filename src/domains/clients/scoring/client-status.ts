/**
 * Derives display status from computed client score (no DB).
 * Used for UI badges only; does not replace workflow status.
 */
export function getClientStatus(score: number): "VIP" | "Activo" | "En riesgo" {
  if (score >= 80) return "VIP"
  if (score >= 40) return "Activo"
  return "En riesgo"
}
