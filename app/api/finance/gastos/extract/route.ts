export const maxDuration = 30

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { UploadApiResponse } from "cloudinary"
import cloudinary from "@/lib/cloudinary"
import Anthropic from "@anthropic-ai/sdk"
import { checkGastosExtractLimit } from "@/lib/rate-limit"
import { gateFeature } from "@/lib/api-gate"

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type ExtractedExpense = {
  proveedor: string | null
  nif: string | null
  fecha: string | null
  baseImponible: number | null
  ivaPorcentaje: number | null
  total: number | null
  concepto: string | null
}

const EXTRACT_PROMPT = `Eres un asistente que extrae datos de facturas de gasto espanolas.
Devuelve UNICAMENTE un objeto JSON valido (sin texto antes ni despues, sin markdown) con estas claves exactas:
- "proveedor": nombre del emisor/proveedor (string) o null
- "nif": NIF/CIF del proveedor (string) o null
- "fecha": fecha de la factura en formato YYYY-MM-DD (string) o null
- "baseImponible": base imponible sin IVA, numero con punto decimal y sin simbolos (number) o null
- "ivaPorcentaje": porcentaje de IVA aplicado, p. ej. 21 (number) o null
- "total": importe total con IVA, numero con punto decimal (number) o null
- "concepto": descripcion breve del gasto (string) o null
Si un dato no aparece, usa null. No inventes valores.`

function toNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^0-9.,-]/g, "").replace(",", "."))
    return Number.isFinite(n) ? n : null
  }
  return null
}

function toStr(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null
}

function uploadToCloudinary(buffer: Buffer, filename: string): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "gastos",
        resource_type: "auto",
        public_id: `${Date.now()}-${filename.replace(/[^a-z0-9]/gi, "_")}`,
      },
      (error, result) => {
        if (error) return reject(error)
        if (!result) return reject(new Error("No result from Cloudinary"))
        resolve(result)
      }
    )
    stream.end(buffer)
  })
}

/**
 * POST /api/finance/gastos/extract
 * Recibe un PDF (solo PDF), lo persiste en Cloudinary y extrae los datos de la
 * factura con Claude (PDF nativo: capa de texto + vision para escaneados).
 * Nunca guarda el gasto: solo devuelve datos para pre-rellenar el formulario.
 */
export async function POST(req: NextRequest) {
  const __planGate = await gateFeature("ai")
  if (!__planGate.allowed) return __planGate.error!
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  // Rate limit por usuario: cada extraccion cuesta tokens de Claude
  const limit = await checkGastosExtractLimit(session.user.id)
  if (!limit.success) {
    const retryAfter = Math.max(1, Math.ceil((limit.reset - Date.now()) / 1000))
    return NextResponse.json(
      {
        error:
          "Has alcanzado el limite de importaciones de PDF. Intentalo mas tarde o rellena el gasto a mano.",
      },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    )
  }

  // Dos origenes, mismo nucleo de extraccion:
  //  - Importar: multipart con un PDF -> se persiste en Cloudinary.
  //  - Escanear: JSON { fileUrl } con el PDF que el flujo de escaneo ya subio a Cloudinary.
  let buffer: Buffer | null = null
  let filename = "documento.pdf"
  let url: string | null = null

  const contentType = req.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    let body: { fileUrl?: string }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "JSON invalido" }, { status: 400 })
    }
    const fileUrl = body.fileUrl
    // SSRF: solo aceptamos URLs de Cloudinary (donde sube el flujo de escaneo)
    if (!fileUrl || !fileUrl.startsWith("https://res.cloudinary.com/")) {
      return NextResponse.json({ error: "fileUrl invalido" }, { status: 400 })
    }
    try {
      const resp = await fetch(fileUrl)
      if (!resp.ok) throw new Error(`fetch ${resp.status}`)
      const ab = await resp.arrayBuffer()
      if (ab.byteLength > MAX_SIZE) {
        return NextResponse.json(
          { error: "Archivo demasiado grande (max 10MB)" },
          { status: 400 }
        )
      }
      buffer = Buffer.from(ab)
      filename = "escaneo.pdf"
      url = fileUrl // ya persistido por el flujo de escaneo, no re-subimos
    } catch (err) {
      console.error("Gastos extract fetch scan error:", err)
      return NextResponse.json(
        { error: "No se pudo descargar el PDF escaneado" },
        { status: 400 }
      )
    }
  } else {
    try {
      const formData = await req.formData()
      const file = formData.get("file") as File | null

      if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: "No se recibio archivo" }, { status: 400 })
      }

      // Solo PDF: rechaza imagenes y cualquier otro formato
      const isPdf =
        file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
      if (!isPdf) {
        return NextResponse.json(
          { error: "Solo se admiten archivos PDF" },
          { status: 415 }
        )
      }

      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: "Archivo demasiado grande (max 10MB)" },
          { status: 400 }
        )
      }

      buffer = Buffer.from(await file.arrayBuffer())
      filename = file.name
    } catch {
      return NextResponse.json({ error: "Archivo invalido" }, { status: 400 })
    }

    // Persistir el PDF importado (el adjunto se guarda aunque la extraccion falle)
    try {
      const result = await uploadToCloudinary(buffer, filename)
      url = result.secure_url
    } catch (err) {
      console.error("Gastos extract upload error:", err)
    }
  }

  if (!buffer) {
    return NextResponse.json({ error: "No se pudo leer el PDF" }, { status: 400 })
  }

  // 2) Extraer datos con Claude. Si falla o no devuelve JSON, no se revienta:
  //    el formulario se rellena a mano y el PDF ya queda adjunto.
  let data: ExtractedExpense | null = null
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: buffer.toString("base64"),
              },
            },
            { type: "text", text: EXTRACT_PROMPT },
          ],
        },
      ],
    })

    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text"
    )
    const text = textBlock?.text ?? ""
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      const parsed = JSON.parse(match[0]) as Record<string, unknown>
      data = {
        proveedor: toStr(parsed.proveedor),
        nif: toStr(parsed.nif),
        fecha: toStr(parsed.fecha),
        baseImponible: toNum(parsed.baseImponible),
        ivaPorcentaje: toNum(parsed.ivaPorcentaje),
        total: toNum(parsed.total),
        concepto: toStr(parsed.concepto),
      }
    }
  } catch (err) {
    console.error("Gastos extract AI error:", err)
  }

  return NextResponse.json({ url, name: filename, data })
}
