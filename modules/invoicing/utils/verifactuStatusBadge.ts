export interface VerifactuBadgeConfig {
  bg: string
  text: string
  label: string
}

/**
 * Mapeo de estados Verifactu → badge. Cubre las dos nomenclaturas de la API
 * de Verifacti (la del registro: Correcto/Incorrecto/…, y la de la factura:
 * Correcta/AceptadaConErrores/…) más los estados propios de envío.
 */
const STATUS_CONFIG: Record<string, VerifactuBadgeConfig> = {
  // Pendiente de respuesta de la AEAT
  Pendiente: { bg: "bg-amber-50 border border-amber-200", text: "text-amber-700", label: "Pendiente AEAT" },

  // Registrada correctamente
  Correcto: { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-700", label: "Verificada AEAT" },
  Correcta: { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-700", label: "Verificada AEAT" },
  Aceptado: { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-700", label: "Verificada AEAT" },
  Aceptada: { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-700", label: "Verificada AEAT" },

  // Registrada pero con errores señalados por la AEAT
  AceptadoConErrores: { bg: "bg-orange-50 border border-orange-200", text: "text-orange-700", label: "Aceptada con errores" },
  AceptadaConErrores: { bg: "bg-orange-50 border border-orange-200", text: "text-orange-700", label: "Aceptada con errores" },

  // Rechazada / no registrada
  Incorrecto: { bg: "bg-red-50 border border-red-200", text: "text-red-700", label: "Rechazada AEAT" },
  Incorrecta: { bg: "bg-red-50 border border-red-200", text: "text-red-700", label: "Rechazada AEAT" },
  Rechazado: { bg: "bg-red-50 border border-red-200", text: "text-red-700", label: "Rechazada AEAT" },
  Rechazada: { bg: "bg-red-50 border border-red-200", text: "text-red-700", label: "Rechazada AEAT" },
  "No registrado": { bg: "bg-red-50 border border-red-200", text: "text-red-700", label: "Rechazada AEAT" },
  "No Registrado": { bg: "bg-red-50 border border-red-200", text: "text-red-700", label: "Rechazada AEAT" },

  // Duplicado
  Duplicado: { bg: "bg-red-50 border border-red-200", text: "text-red-700", label: "Duplicado" },
  Duplicada: { bg: "bg-red-50 border border-red-200", text: "text-red-700", label: "Duplicado" },

  // Anulada
  Anulado: { bg: "bg-slate-50 border border-slate-200", text: "text-slate-500", label: "Anulada" },
  Anulada: { bg: "bg-slate-50 border border-slate-200", text: "text-slate-500", label: "Anulada" },

  // Error transitorio del servidor de la AEAT — Verifacti reintenta
  Error: { bg: "bg-amber-50 border border-amber-200", text: "text-amber-700", label: "Reintentando" },
}

const FALLBACK: VerifactuBadgeConfig = {
  bg: "bg-slate-50 border border-slate-200",
  text: "text-slate-500",
  label: "",
}

export function getVerifactuBadgeConfig(status: string): VerifactuBadgeConfig {
  return STATUS_CONFIG[status] ?? { ...FALLBACK, label: status }
}

/** Estados terminales: la AEAT ya respondió, no tiene sentido seguir consultando. */
export function isVerifactuTerminalStatus(status: string | null | undefined): boolean {
  if (!status) return false
  return status !== "Pendiente" && status !== "Error"
}

/** Estados de error/rechazo: conviene mostrar el mensaje de error de la AEAT. */
export function isVerifactuErrorStatus(status: string | null | undefined): boolean {
  if (!status) return false
  const c = STATUS_CONFIG[status]
  return c != null && (c.label === "Rechazada AEAT" || c.label === "Duplicado" || c.label === "Aceptada con errores")
}
