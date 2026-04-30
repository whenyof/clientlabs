const VERIFACTI_API_URL = process.env.VERIFACTI_API_URL || "https://api.verifacti.com"
const VERIFACTI_ACCOUNT_KEY = process.env.VERIFACTI_API_KEY // API Key de cuenta para gestionar NIFs

interface CreateNifResponse {
  api_key: string
  [key: string]: unknown
}

export interface VerifactuInvoiceData {
  serie: string
  numero: string
  fecha_expedicion: string // DD-MM-YYYY
  tipo_factura: "F1" | "F2" | "R1" | "R2" | "R3" | "R4" | "R5"
  descripcion: string
  nif?: string
  nombre?: string
  lineas: {
    base_imponible: string
    tipo_impositivo: string
    cuota_repercutida: string
  }[]
  importe_total: string
}

export interface VerifactuResponse {
  estado: "Pendiente" | "Aceptado" | "Rechazado"
  uuid: string
  url: string
  qr: string // base64 PNG
  huella: string
  error?: string
}

export interface VerifactuStatusResponse {
  estado: "Pendiente" | "Aceptado" | "Rechazado" | "Error"
  mensaje_error?: string
  fecha_expedicion?: string
}

// ══════════════════════════════════════
// GESTIÓN DE NIFs (usa API Key de CUENTA)
// ══════════════════════════════════════

export async function createVerifactuNif(nif: string, nombre: string): Promise<CreateNifResponse> {
  if (!VERIFACTI_ACCOUNT_KEY) {
    throw new Error("Verifacti no configurado en el servidor")
  }

  const res = await fetch(`${VERIFACTI_API_URL}/nifs`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${VERIFACTI_ACCOUNT_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nif, nombre }),
  })

  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json as CreateNifResponse
}

// ══════════════════════════════════════
// FACTURACIÓN (usa API Key del NIF específico)
// ══════════════════════════════════════

export async function createVerifactuInvoice(nifApiKey: string, data: VerifactuInvoiceData): Promise<VerifactuResponse> {
  const res = await fetch(`${VERIFACTI_API_URL}/verifactu/create`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${nifApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json as VerifactuResponse
}

export async function getVerifactuStatus(nifApiKey: string, uuid: string): Promise<VerifactuStatusResponse> {
  const res = await fetch(`${VERIFACTI_API_URL}/verifactu/status?uuid=${uuid}`, {
    headers: {
      "Authorization": `Bearer ${nifApiKey}`,
      "Content-Type": "application/json",
    },
  })
  return await res.json()
}

export function formatDateForVerifactu(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0")
  const m = (date.getMonth() + 1).toString().padStart(2, "0")
  const y = date.getFullYear()
  return `${d}-${m}-${y}`
}

export function isVerifactuConfigured(): boolean {
  return !!VERIFACTI_ACCOUNT_KEY
}

// Kept for backwards compat with old single-key mode
export function isVerifactuEnabled(): boolean {
  return !!VERIFACTI_ACCOUNT_KEY
}
