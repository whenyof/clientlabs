const VERIFACTI_API_URL = process.env.VERIFACTI_API_URL || "https://api.verifacti.com"
const VERIFACTI_ACCOUNT_KEY = process.env.VERIFACTI_API_KEY
/** Timeout de TODAS las llamadas a Verifacti: nunca colgar la emisión hasta el maxDuration */
const VERIFACTI_TIMEOUT_MS = 15_000

// ══════════════════════════════════════
// TYPES
// ══════════════════════════════════════

export type InvoiceDocType = "F1" | "F2" | "F3"
export type RectificationType = "R1" | "R2" | "R3" | "R4" | "R5"
export type AllInvoiceTypes = InvoiceDocType | RectificationType
export type RectificationMethod = "S" | "I"

export interface VerifactuLine {
  base_imponible: string
  tipo_impositivo: string
  cuota_repercutida: string
  /** Recargo de equivalencia (clave_regimen "18") — solo en facturas a minoristas en ese régimen */
  clave_regimen?: string
  tipo_recargo_equivalencia?: string
  cuota_recargo_equivalencia?: string
}

export interface VerifactuCreateData {
  serie: string
  numero: string
  fecha_expedicion: string // DD-MM-YYYY
  tipo_factura: AllInvoiceTypes
  descripcion: string
  nif?: string
  nombre?: string
  lineas: VerifactuLine[]
  importe_total: string
  tipo_rectificativa?: RectificationMethod
  factura_rectificada_serie?: string
  factura_rectificada_numero?: string
  factura_rectificada_fecha?: string
  importe_rectificativa?: {
    base_rectificada: string
    cuota_rectificada: string
  }
  facturas_sustituidas?: { serie: string; numero: string; fecha: string }[]
}

export interface VerifactuResponse {
  estado: string
  uuid: string
  url: string
  qr: string
  huella: string
  error?: string
}

export interface VerifactuStatusResponse {
  estado: "Pendiente" | "Aceptado" | "Rechazado" | "Error"
  mensaje_error?: string
}

// ══════════════════════════════════════
// GESTIÓN DE NIFs (account key)
// ══════════════════════════════════════

interface CreateNifResponse {
  api_key: string
  [key: string]: unknown
}

export async function createVerifactuNif(nif: string, nombre: string): Promise<CreateNifResponse> {
  if (!VERIFACTI_ACCOUNT_KEY) throw new Error("Verifacti no configurado en el servidor")
  const res = await fetch(`${VERIFACTI_API_URL}/nifs`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${VERIFACTI_ACCOUNT_KEY}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(VERIFACTI_TIMEOUT_MS),
    body: JSON.stringify({ nif, nombre }),
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json as CreateNifResponse
}

// ══════════════════════════════════════
// FACTURACIÓN (NIF key)
// ══════════════════════════════════════

/**
 * Error de la API de Verifacti con el HTTP status, para distinguir rechazos
 * de VALIDACIÓN (400/422: datos inválidos, NIF no censado — el usuario debe
 * corregir) de errores TRANSITORIOS (red, 5xx, Verifacti caído — reintentar).
 */
export class VerifactuApiError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "VerifactuApiError"
    this.status = status
  }
  get isValidation(): boolean {
    return this.status === 400 || this.status === 422
  }
}

/** True solo si el error es un rechazo de validación confirmado (400/422). Ante la duda → transitorio. */
export function isVerifactuValidationError(err: unknown): boolean {
  return err instanceof VerifactuApiError && err.isValidation
}

export async function createVerifactuInvoice(
  nifApiKey: string,
  data: VerifactuCreateData,
  idempotencyKey?: string
): Promise<VerifactuResponse> {
  let res: Response
  try {
    res = await fetch(`${VERIFACTI_API_URL}/verifactu/create`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${nifApiKey}`,
        "Content-Type": "application/json",
        ...(idempotencyKey && { "Idempotency-Key": idempotencyKey }),
      },
      signal: AbortSignal.timeout(VERIFACTI_TIMEOUT_MS),
      body: JSON.stringify(data),
    })
  } catch (err) {
    // Timeout/red: SIEMPRE transitorio (status 503 ≠ 400/422), nunca validación
    if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
      throw new VerifactuApiError(`Verifacti no responde (timeout de ${VERIFACTI_TIMEOUT_MS / 1000}s)`, 503)
    }
    throw new VerifactuApiError(
      `No se pudo conectar con Verifacti: ${err instanceof Error ? err.message : String(err)}`,
      503
    )
  }
  const json = (await res.json().catch(() => null)) as (VerifactuResponse & { error?: string }) | null
  if (!res.ok || json?.error) {
    throw new VerifactuApiError(json?.error ?? `Verifacti HTTP ${res.status}`, res.status)
  }
  if (!json) throw new VerifactuApiError("Respuesta vacía de Verifacti", res.status)
  return json
}

export interface VerifactuStatusByNumberResponse {
  estado?: string
  uuid?: string
  url?: string
  qr?: string
  huella?: string
  error?: string
  mensaje_error?: string
}

/** Consulta el estado de una factura en Verifacti por serie/número/fecha (sin uuid). */
export async function getVerifactuStatusByNumber(
  nifApiKey: string,
  serie: string,
  numero: string,
  fechaExpedicion: string // DD-MM-YYYY
): Promise<VerifactuStatusByNumberResponse> {
  const res = await fetch(`${VERIFACTI_API_URL}/verifactu/status`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${nifApiKey}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(VERIFACTI_TIMEOUT_MS),
    body: JSON.stringify({ serie, numero, fecha_expedicion: fechaExpedicion }),
  })
  return (await res.json()) as VerifactuStatusByNumberResponse
}

export async function getVerifactuStatus(nifApiKey: string, uuid: string): Promise<VerifactuStatusResponse> {
  const res = await fetch(`${VERIFACTI_API_URL}/verifactu/status?uuid=${uuid}`, {
    headers: { "Authorization": `Bearer ${nifApiKey}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(VERIFACTI_TIMEOUT_MS),
  })
  return await res.json()
}

export async function cancelVerifactuInvoice(
  nifApiKey: string,
  serie: string,
  numero: string,
  fecha: string
): Promise<unknown> {
  const res = await fetch(`${VERIFACTI_API_URL}/verifactu/cancel`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${nifApiKey}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(VERIFACTI_TIMEOUT_MS),
    body: JSON.stringify({ serie, numero, fecha_expedicion: fecha }),
  })
  return await res.json()
}

// ══════════════════════════════════════
// HELPERS
// ══════════════════════════════════════

export function formatDateForVerifactu(date: Date | string): string {
  const d = new Date(date)
  return `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getFullYear()}`
}

/** Returns the API key for a user: BusinessProfile key OR env fallback */
export async function resolveVerifactuApiKey(userId: string): Promise<string | null> {
  const { prisma } = await import("@/lib/prisma")
  const profile = await prisma.businessProfile.findUnique({
    where: { userId },
    select: { verifactuApiKey: true, verifactuEnabled: true },
  })
  if (profile?.verifactuEnabled && profile.verifactuApiKey) return profile.verifactuApiKey
  return VERIFACTI_ACCOUNT_KEY ?? null
}

export function isVerifactuConfigured(): boolean {
  return !!VERIFACTI_ACCOUNT_KEY
}

export function isVerifactuEnabled(): boolean {
  return !!VERIFACTI_ACCOUNT_KEY
}

export function isVerifactuTest(): boolean {
  return VERIFACTI_ACCOUNT_KEY?.startsWith("vf_test_") ?? true
}

// ══════════════════════════════════════
// LABELS
// ══════════════════════════════════════

export const INVOICE_TYPE_LABELS: Record<AllInvoiceTypes, string> = {
  F1: "Factura completa",
  F2: "Factura simplificada",
  F3: "Sustitución de simplificada",
  R1: "Rectificativa — Error legal/fiscal",
  R2: "Rectificativa — Concurso acreedores",
  R3: "Rectificativa — Crédito incobrable",
  R4: "Rectificativa — Otras causas",
  R5: "Rectificativa — De factura simplificada",
}

export const INVOICE_TYPE_DESCRIPTIONS: Record<AllInvoiceTypes, string> = {
  F1: "Factura estándar con NIF del destinatario. La más habitual para B2B.",
  F2: "Factura sin NIF del destinatario. Para ventas al público. Máx. 3.000€.",
  F3: "Convierte una factura simplificada (F2) en completa (F1).",
  R1: "Corrige errores de IVA, devoluciones de mercancías, descuentos posteriores.",
  R2: "Se usa cuando el cliente ha sido declarado en concurso de acreedores.",
  R3: "Para deudas oficialmente incobrables (Art. 80.Cuatro LIVA).",
  R4: "Errores genéricos: nombre incorrecto, error aritmético, etc.",
  R5: "Rectificativa de una factura simplificada (F2). Siempre R5 si la original era F2.",
}

export const RECTIFICATION_METHOD_LABELS: Record<RectificationMethod, string> = {
  S: "Por sustitución — Nueva factura con datos correctos completos",
  I: "Por diferencias — Solo el ajuste/diferencia",
}
