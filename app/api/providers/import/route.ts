export const maxDuration = 30
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { ProviderDependency } from "@prisma/client"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_ROWS = 5_000

const DEP_MAP: Record<string, ProviderDependency> = {
  bajo: "LOW",
  medio: "MEDIUM",
  alto: "HIGH",
  crítico: "CRITICAL",
  critico: "CRITICAL",
}

const importRowSchema = z.object({
  nombre: z.string().min(1, "nombre es obligatorio").max(200).trim(),
  tipo: z.string().max(100).trim().optional().default(""),
  email_contacto: z.string().max(200).trim().optional().default(""),
  telefono_contacto: z.string().max(50).trim().optional().default(""),
  web: z.string().max(300).trim().optional().default(""),
  notas: z.string().max(2000).trim().optional().default(""),
  coste_mensual: z.preprocess(
    (v) => {
      const n = parseFloat(String(v ?? "0").replace(",", "."))
      return isNaN(n) ? 0 : n
    },
    z.number().min(0).max(999999)
  ),
  nivel_dependencia: z.string().max(50).trim().optional().default("bajo"),
})

const KNOWN_KEYS = ["nombre", "tipo", "email_contacto", "telefono_contacto", "web", "notas", "coste_mensual", "nivel_dependencia"] as const

function sanitizeRow(raw: unknown): Record<string, string> {
  const r = raw as Record<string, unknown>
  const clean = Object.create(null) as Record<string, string>
  for (const key of KNOWN_KEYS) {
    clean[key] = String(r[key] ?? "").slice(0, 4000).trim()
  }
  return clean
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 })
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "Archivo demasiado grande (máx. 5 MB)" }, { status: 400 })

    const fileName = file.name.toLowerCase()
    const buffer = Buffer.from(await file.arrayBuffer())
    let rawRows: unknown[] = []

    if (fileName.endsWith(".csv")) {
      const { parse } = await import("papaparse")
      const text = buffer.toString("utf-8")
      const result = parse<unknown>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h: string) => h.trim(),
        transform: (v: string) => v.trim(),
      })
      rawRows = result.data
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      const XLSX = await import("@e965/xlsx")
      const workbook = XLSX.read(buffer, { type: "buffer" })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      rawRows = XLSX.utils.sheet_to_json<unknown>(sheet, { defval: "" })
    } else {
      return NextResponse.json({ error: "Formato no soportado. Usa .csv o .xlsx" }, { status: 400 })
    }

    if (rawRows.length > MAX_ROWS) {
      return NextResponse.json({ error: `Demasiadas filas (máx. ${MAX_ROWS})` }, { status: 400 })
    }

    type ValidRow = z.infer<typeof importRowSchema>
    const validRows: { idx: number; data: ValidRow }[] = []
    const errors: { row: number; message: string }[] = []

    for (let i = 0; i < rawRows.length; i++) {
      const clean = sanitizeRow(rawRows[i])
      const parsed = importRowSchema.safeParse(clean)
      if (!parsed.success) {
        errors.push({ row: i + 2, message: parsed.error.issues[0]?.message ?? "Datos inválidos" })
      } else {
        validRows.push({ idx: i, data: parsed.data })
      }
    }

    if (validRows.length === 0) return NextResponse.json({ imported: 0, updated: 0, errors })

    await prisma.provider.createMany({
      data: validRows.map(({ data: d }) => ({
        userId: session.user.id,
        name: d.nombre,
        type: d.tipo || null,
        contactEmail: d.email_contacto || null,
        contactPhone: d.telefono_contacto || null,
        website: d.web || null,
        notes: d.notas || null,
        monthlyCost: d.coste_mensual || null,
        dependencyLevel: DEP_MAP[d.nivel_dependencia.toLowerCase()] ?? "LOW",
        status: "ACTIVE",
      })),
    })

    return NextResponse.json({ imported: validRows.length, updated: 0, errors })
  } catch (err) {
    console.error("[providers/import]", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Error al procesar el archivo" }, { status: 500 })
  }
}
