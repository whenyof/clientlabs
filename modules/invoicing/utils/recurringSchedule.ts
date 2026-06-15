/**
 * Cálculo de fechas para facturas recurrentes (plantillas).
 * Aislado para reutilizarlo en "Generar ahora" y, en el futuro, en el cron.
 */
import type { RecurringFrequency } from "@prisma/client"

/** Meses entre ejecuciones según la frecuencia (CUSTOM usa intervalMonths). */
export function intervalMonthsFor(
  frequency: RecurringFrequency,
  intervalMonths?: number | null,
): number {
  switch (frequency) {
    case "MONTHLY": return 1
    case "QUARTERLY": return 3
    case "ANNUAL": return 12
    case "CUSTOM": return Math.max(1, Math.round(intervalMonths ?? 1))
    default: return 1
  }
}

// Operamos en UTC: las fechas vienen de strings "YYYY-MM-DD" (medianoche UTC) y se
// guardan como DateTime UTC, así el día elegido es estable en cualquier zona horaria.
const lastDayOfMonthUTC = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()

/** Suma meses respetando fin de mes (31 ene + 1 mes → 28/29 feb). */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  const targetDay = d.getUTCDate()
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() + months)
  d.setUTCDate(Math.min(targetDay, lastDayOfMonthUTC(d)))
  return d
}

/** Día del mes válido para `date`, con clamp al último día (31 en feb → 28/29). */
export function clampDayOfMonth(date: Date, day: number): Date {
  const d = new Date(date)
  d.setUTCDate(Math.min(Math.max(1, Math.round(day)), lastDayOfMonthUTC(d)))
  return d
}

/**
 * Próxima fecha de generación avanzando un intervalo desde `from`.
 * Si se indica `dayOfMonth`, la generación cae ese día del mes (con clamp al
 * último día si el mes no lo tiene); si no, conserva el día de `from`.
 */
export function computeNextRunDate(
  from: Date,
  frequency: RecurringFrequency,
  intervalMonths?: number | null,
  dayOfMonth?: number | null,
): Date {
  const months = intervalMonthsFor(frequency, intervalMonths)
  if (dayOfMonth == null) return addMonths(from, months)
  // Avanza el mes (sin arrastrar el día de `from`) y fija el día solicitado.
  const d = new Date(from)
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() + months)
  return clampDayOfMonth(d, dayOfMonth)
}

export const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  MONTHLY: "Mensual",
  QUARTERLY: "Trimestral",
  ANNUAL: "Anual",
  CUSTOM: "Personalizada",
}
