const VERIFACTI_API_URL = process.env.VERIFACTI_API_URL || "https://api.verifacti.com"
const VERIFACTI_API_KEY = process.env.VERIFACTI_API_KEY

interface VerifactuInvoiceData {
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

interface VerifactuResponse {
  estado: "Pendiente" | "Aceptado" | "Rechazado"
  uuid: string
  url: string
  qr: string // base64 PNG
  huella: string
  error?: string
}

interface VerifactuStatusResponse {
  estado: "Pendiente" | "Aceptado" | "Rechazado" | "Error"
  mensaje_error?: string
  fecha_expedicion?: string
}

export async function createVerifactuInvoice(data: VerifactuInvoiceData): Promise<VerifactuResponse> {
  if (!VERIFACTI_API_KEY) {
    console.warn("[Verifactu] API key no configurada — modo simulación")
    return {
      estado: "Pendiente",
      uuid: `sim-${Date.now()}`,
      url: "",
      qr: "",
      huella: "",
    }
  }

  const res = await fetch(`${VERIFACTI_API_URL}/verifactu/create`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${VERIFACTI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const json = await res.json()

  if (json.error) {
    console.error("[Verifactu] Error:", json.error)
    throw new Error(json.error)
  }

  return json as VerifactuResponse
}

export async function getVerifactuStatus(uuid: string): Promise<VerifactuStatusResponse> {
  if (!VERIFACTI_API_KEY) {
    return { estado: "Pendiente" }
  }

  const res = await fetch(`${VERIFACTI_API_URL}/verifactu/status?uuid=${uuid}`, {
    headers: {
      "Authorization": `Bearer ${VERIFACTI_API_KEY}`,
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

export function isVerifactuTest(): boolean {
  return VERIFACTI_API_KEY?.startsWith("vf_test_") ?? true
}

export function isVerifactuEnabled(): boolean {
  return !!VERIFACTI_API_KEY
}


