export const maxDuration = 30
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const MAX_ROWS = 5_000

// Fix 1: Zod schema per row — same constraints as createProductSchema in route.ts
const importRowSchema = z.object({
  nombre: z.string().min(1, "nombre es obligatorio").max(200).trim(),
  descripcion: z.string().max(2000).trim().optional().default(""),
  precio_unitario: z.preprocess(
    (v) => parseFloat(String(v ?? "0").replace(",", ".")),
    z.number({ message: "precio_unitario inválido" }).min(0, "precio debe ser ≥ 0").max(999999)
  ),
  tipo_iva: z.preprocess(
    (v) => Number(v ?? "21"),
    z.union(
      [z.literal(0), z.literal(4), z.literal(10), z.literal(21)],
      { message: "tipo_iva debe ser 0, 4, 10 o 21" }
    )
  ),
  unidad: z.string().max(50).trim().optional().default("ud"),
  tipo: z.preprocess(
    (v) => String(v ?? "PRODUCTO").trim().toUpperCase(),
    z.enum(["PRODUCTO", "SERVICIO"], { message: "tipo debe ser PRODUCTO o SERVICIO" })
  ),
  categoria: z.string().max(100).trim().optional().default(""),
})

// Fix 3 mitigation: reconstruct row from known keys only to prevent prototype pollution
const KNOWN_KEYS = ["nombre", "descripcion", "precio_unitario", "tipo_iva", "unidad", "tipo", "categoria"] as const
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
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 })
    }

    // Fix 2: server-side file size gate before buffering
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Archivo demasiado grande (máx. 5 MB)" }, { status: 400 })
    }

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
      // Fix 3: use @e965/xlsx (maintained fork, no known ReDoS/prototype-pollution CVEs)
      const XLSX = await import("@e965/xlsx")
      const workbook = XLSX.read(buffer, { type: "buffer" })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      rawRows = XLSX.utils.sheet_to_json<unknown>(sheet, { defval: "" })
    } else {
      return NextResponse.json({ error: "Formato no soportado. Usa .csv o .xlsx" }, { status: 400 })
    }

    // Fix 2: cap row count before iterating
    if (rawRows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `Demasiadas filas (máx. ${MAX_ROWS}). Divide el archivo en partes más pequeñas.` },
        { status: 400 }
      )
    }

    // Fix 1 + 3: sanitize then validate every row with Zod
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

    if (validRows.length === 0) {
      return NextResponse.json({ imported: 0, updated: 0, errors })
    }

    // Fix 2: batch reads — fetch all existing products in ONE query
    const existing = await prisma.product.findMany({
      where: { userId: session.user.id, deletedAt: null },
      select: { id: true, name: true },
    })
    const existingByName = new Map(existing.map((p) => [p.name.toLowerCase(), p.id]))

    const toCreate: ValidRow[] = []
    const toUpdate: { id: string; data: ValidRow }[] = []

    for (const { data } of validRows) {
      const existingId = existingByName.get(data.nombre.toLowerCase())
      if (existingId) {
        toUpdate.push({ id: existingId, data })
      } else {
        toCreate.push(data)
      }
    }

    // Fix 2: batch writes in a single transaction
    await prisma.$transaction([
      ...(toCreate.length > 0
        ? [prisma.product.createMany({
            data: toCreate.map((d) => ({
              userId: session.user.id,
              name: d.nombre,
              description: d.descripcion || null,
              price: d.precio_unitario,
              taxRate: d.tipo_iva,
              unit: d.unidad || "ud",
              category: d.categoria || null,
              isService: d.tipo === "SERVICIO",
              active: true,
            })),
          })]
        : []),
      ...toUpdate.map(({ id, data: d }) =>
        prisma.product.update({
          where: { id },
          data: {
            description: d.descripcion || null,
            price: d.precio_unitario,
            taxRate: d.tipo_iva,
            unit: d.unidad || "ud",
            category: d.categoria || null,
            isService: d.tipo === "SERVICIO",
          },
        })
      ),
    ])

    return NextResponse.json({ imported: toCreate.length, updated: toUpdate.length, errors })
  } catch (err) {
    console.error("[products/import]", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Error al procesar el archivo" }, { status: 500 })
  }
}
