const VERIFACTI_API_URL = process.env.VERIFACTI_API_URL || "https://api.verifacti.com"
const VERIFACTI_ACCOUNT_KEY = process.env.VERIFACTI_API_KEY

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
    body: JSON.stringify({ nif, nombre }),
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json as CreateNifResponse
}

// ══════════════════════════════════════
// FACTURACIÓN (NIF key)
// ══════════════════════════════════════

export async function createVerifactuInvoice(nifApiKey: string, data: VerifactuCreateData): Promise<VerifactuResponse> {
  const res = await fetch(`${VERIFACTI_API_URL}/verifactu/create`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${nifApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json as VerifactuResponse
}

export async function getVerifactuStatus(nifApiKey: string, uuid: string): Promise<VerifactuStatusResponse> {
  const res = await fetch(`${VERIFACTI_API_URL}/verifactu/status?uuid=${uuid}`, {
    headers: { "Authorization": `Bearer ${nifApiKey}`, "Content-Type": "application/json" },
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
