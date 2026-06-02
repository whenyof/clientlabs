export const maxDuration = 30
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { LeadStatus, LeadTemp } from "@prisma/client"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_ROWS = 5_000

const STATUS_MAP: Record<string, LeadStatus> = {
  nuevo: "NEW",
  contactado: "CONTACTED",
  interesado: "INTERESTED",
  cualificado: "QUALIFIED",
  calificado: "QUALIFIED",
  estancado: "STALLED",
  perdido: "LOST",
  convertido: "CONVERTED",
}

const TEMP_MAP: Record<string, LeadTemp> = {
  caliente: "HOT",
  tibio: "WARM",
  frio: "COLD",
  frío: "COLD",
}

const importRowSchema = z.object({
  nombre: z.string().max(200).trim().optional().default(""),
  email: z.string().max(200).trim().optional().default(""),
  telefono: z.string().max(50).trim().optional().default(""),
  mensaje: z.string().max(2000).trim().optional().default(""),
  origen: z.string().max(100).trim().optional().default("import"),
  estado: z.string().max(50).trim().optional().default("nuevo"),
  temperatura: z.string().max(50).trim().optional().default(""),
})

const KNOWN_KEYS = ["nombre", "email", "telefono", "mensaje", "origen", "estado", "temperatura"] as const

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
      if (!clean.nombre && !clean.email) {
        errors.push({ row: i + 2, message: "Se requiere nombre o email" })
        continue
      }
      const parsed = importRowSchema.safeParse(clean)
      if (!parsed.success) {
        errors.push({ row: i + 2, message: parsed.error.issues[0]?.message ?? "Datos inválidos" })
      } else {
        validRows.push({ idx: i, data: parsed.data })
      }
    }

    if (validRows.length === 0) return NextResponse.json({ imported: 0, updated: 0, errors })

    const emails = validRows.filter(r => r.data.email).map(r => r.data.email as string)
    const existing = await prisma.lead.findMany({
      where: { userId: session.user.id, email: { in: emails } },
      select: { id: true, email: true },
    })
    const existingByEmail = new Map(existing.map(l => [l.email!, l.id]))

    const toCreate: ValidRow[] = []
    const toUpdate: { id: string; data: ValidRow }[] = []

    for (const { data } of validRows) {
      const existingId = data.email ? existingByEmail.get(data.email) : undefined
      if (existingId) {
        toUpdate.push({ id: existingId, data })
      } else {
        toCreate.push(data)
      }
    }

    await prisma.$transaction([
      ...(toCreate.length > 0
        ? [prisma.lead.createMany({
            data: toCreate.map(d => ({
              userId: session.user.id,
              name: d.nombre || null,
              email: d.email || null,
              phone: d.telefono || null,
              message: d.mensaje || null,
              source: d.origen || "import",
              status: STATUS_MAP[d.estado.toLowerCase()] ?? "NEW",
              leadStatus: STATUS_MAP[d.estado.toLowerCase()] ?? "NEW",
              temperature: (d.temperatura ? TEMP_MAP[d.temperatura.toLowerCase()] : null) ?? null,
            })),
          })]
        : []),
      ...toUpdate.map(({ id, data: d }) =>
        prisma.lead.update({
          where: { id },
          data: {
            name: d.nombre || undefined,
            phone: d.telefono || undefined,
            message: d.mensaje || undefined,
            source: d.origen || undefined,
            status: STATUS_MAP[d.estado.toLowerCase()] ?? undefined,
            leadStatus: STATUS_MAP[d.estado.toLowerCase()] ?? undefined,
            temperature: d.temperatura ? (TEMP_MAP[d.temperatura.toLowerCase()] ?? undefined) : undefined,
          },
        })
      ),
    ])

    return NextResponse.json({ imported: toCreate.length, updated: toUpdate.length, errors })
  } catch (err) {
    console.error("[leads/import]", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Error al procesar el archivo" }, { status: 500 })
  }
}
