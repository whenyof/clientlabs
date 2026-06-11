/**
 * Tipos de IVA aceptados por la API de Verifacti (y únicos válidos en España).
 * Orden de presentación en UI: habituales primero (21, 10, 4, 0),
 * superreducidos/temporales después (5, 2, 7.5).
 */
export const ALLOWED_VAT_RATES = [21, 10, 4, 0, 5, 2, 7.5] as const

export type AllowedVatRate = (typeof ALLOWED_VAT_RATES)[number]

export function isAllowedVatRate(rate: number): boolean {
  return (ALLOWED_VAT_RATES as readonly number[]).includes(rate)
}

/** Redondea un tipo arbitrario (p. ej. 20.99 derivado de importes) al permitido más cercano. */
export function nearestAllowedVatRate(rate: number): AllowedVatRate {
  let nearest: AllowedVatRate = 21
  let bestDiff = Infinity
  for (const r of ALLOWED_VAT_RATES) {
    const diff = Math.abs(r - rate)
    if (diff < bestDiff) {
      bestDiff = diff
      nearest = r
    }
  }
  return nearest
}

/**
 * Recargo de equivalencia derivado del tipo de IVA (no editable a mano).
 * 21%→5,2 · 10%→1,4 · 4%→0,5 · 0%→0. El 1,75% (tabaco) NO está soportado.
 * Tipos sin entrada (2, 5, 7.5) no tienen recargo definido → 0.
 */
export const RECARGO_EQUIVALENCIA_BY_VAT: Record<number, number> = {
  21: 5.2,
  10: 1.4,
  4: 0.5,
  0: 0,
}

export function recargoRateForVat(vatRate: number): number {
  return RECARGO_EQUIVALENCIA_BY_VAT[vatRate] ?? 0
}
