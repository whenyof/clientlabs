/**
 * Tipos para el motor de disponibilidad del calendario.
 * Reutilizables por huecos, riesgo y autoplanificador.
 */

export type AvailabilityBlockType = "FREE" | "TASK" | "BLOCK" | "TIME_OFF"

export type CalendarAvailabilityBlock = {
  start: Date
  end: Date
  type: AvailabilityBlockType
  /** Present when type === "TASK" */
  taskId?: string
  /** Present when type === "BLOCK" or "TIME_OFF" */
  reason?: string | null
}

export type AvailabilityResponse = {
  userId: string
  date: string
  blocks: CalendarAvailabilityBlock[]
}

/** Resultado de un hueco inteligente: momento sugerido para colocar una tarea. */
export type SmartSlot = {
  start: Date
  end: Date
  score: number
}
