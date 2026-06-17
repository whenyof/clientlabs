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

// ── Capa de mapeo flexible de cabeceras + parseo tolerante ──────────────────
// Se aplica ANTES del Zod: cada usuario exporta su catálogo con nombres de
// columna distintos, así que normalizamos y mapeamos a los campos canónicos.

// minúsculas, sin acentos, sin no-alfanuméricos (% / _ …), espacios colapsados
function norm(s: unknown): string {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// Alias por campo canónico (las claves del Zod son: nombre, descripcion,
// precio_unitario, tipo_iva, unidad, tipo, categoria).
const HEADER_ALIASES: Record<(typeof KNOWN_KEYS)[number], string[]> = {
  nombre: ["nombre", "name", "concepto", "producto", "articulo", "item", "titulo"],
  descripcion: ["descripcion", "description", "detalle", "observaciones", "desc"],
  precio_unitario: ["precio", "precio_unitario", "precio unitario", "precio ud", "precio/ud", "pvp", "importe", "importe unitario", "tarifa", "coste", "valor", "price"],
  tipo_iva: ["iva", "%iva", "tipo iva", "porcentaje iva", "impuesto", "vat", "tax", "taxrate"],
  unidad: ["unidad", "unidad de medida", "ud", "medida", "unit"],
  tipo: ["tipo", "producto servicio", "clase", "servicio"],
  categoria: ["categoria", "category", "familia", "grupo", "seccion"],
}

// normalized alias → campo canónico (primer canónico que reclame el alias gana)
const ALIAS_TO_CANON = new Map<string, (typeof KNOWN_KEYS)[number]>()
for (const key of KNOWN_KEYS) {
  for (const alias of HEADER_ALIASES[key]) {
    const n = norm(alias)
    if (!ALIAS_TO_CANON.has(n)) ALIAS_TO_CANON.set(n, key)
  }
}

// Construye { cabeceraOriginal → campo canónico } a partir de las claves de una fila
function buildHeaderMap(sampleRow: unknown): Map<string, (typeof KNOWN_KEYS)[number]> {
  const map = new Map<string, (typeof KNOWN_KEYS)[number]>()
  const assigned = new Set<string>()
  for (const origKey of Object.keys((sampleRow ?? {}) as Record<string, unknown>)) {
    const canon = ALIAS_TO_CANON.get(norm(origKey))
    if (canon && !assigned.has(canon)) {
      map.set(origKey, canon)
      assigned.add(canon)
    }
  }
  return map
}

// "12,90 €" / "12.90€" / "1.234,56" → "1234.56" (string apto para el parseFloat del Zod)
function cleanNumber(s: string): string {
  let t = s.replace(/[^\d.,-]/g, "")
  if (t.includes(",") && t.includes(".")) {
    t = t.replace(/\./g, "").replace(",", ".") // punto = miles, coma = decimal
  } else if (t.includes(",")) {
    t = t.replace(",", ".")
  }
  return t
}

// "21%" → "21"; "0,21"/"0.21" → "21"; "" → "" (deja el default del Zod)
function cleanIva(s: string): string {
  const t = s.replace(/[^\d.,-]/g, "").replace(",", ".")
  if (t === "") return ""
  const n = parseFloat(t)
  if (isNaN(n)) return ""
  return String(n <= 1 ? Math.round(n * 100) : n)
}

const SERVICE_UNITS = new Set(["h", "hora", "horas", "mes", "meses", "sesion", "sesiones"])

// Devuelve "SERVICIO" | "PRODUCTO" (lo que el Zod espera). Si no hay columna tipo,
// heurística de respaldo por unidad/categoría.
function resolveTipo(rawTipo: string, unidad: string, categoria: string): "SERVICIO" | "PRODUCTO" {
  const t = norm(rawTipo)
  if (t) return t === "servicio" ? "SERVICIO" : "PRODUCTO"
  if (SERVICE_UNITS.has(norm(unidad)) || norm(categoria).includes("servic")) return "SERVICIO"
  return "PRODUCTO"
}

// Reescribe una fila cruda a las claves canónicas, con parseo tolerante de valores.
function mapRow(raw: unknown, headerMap: Map<string, (typeof KNOWN_KEYS)[number]>): Record<string, string> {
  const r = raw as Record<string, unknown>
  const out = Object.create(null) as Record<string, string>
  for (const key of KNOWN_KEYS) out[key] = ""
  for (const [origKey, canon] of headerMap) {
    out[canon] = String(r[origKey] ?? "").trim()
  }
  out.precio_unitario = cleanNumber(out.precio_unitario)
  out.tipo_iva = cleanIva(out.tipo_iva)
  out.tipo = resolveTipo(out.tipo, out.unidad, out.categoria)
  return out
}

// ── Validación + escritura (compartido por preview/commit/legacy) ───────────

type ValidRow = z.infer<typeof importRowSchema>

// Normalización SOLO para detectar duplicados por nombre (no toca el parseo).
function normName(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim()
}

const createPayload = (userId: string, d: ValidRow) => ({
  userId,
  name: d.nombre,
  description: d.descripcion || null,
  price: d.precio_unitario,
  taxRate: d.tipo_iva,
  unit: d.unidad || "ud",
  category: d.categoria || null,
  isService: d.tipo === "SERVICIO",
  active: true,
})

const updatePayload = (d: ValidRow) => ({
  description: d.descripcion || null,
  price: d.precio_unitario,
  taxRate: d.tipo_iva,
  unit: d.unidad || "ud",
  category: d.categoria || null,
  isService: d.tipo === "SERVICIO",
})

// Valida filas ya mapeadas a claves canónicas con el Zod de fila.
function validateMappedRows(mappedRows: Record<string, string>[]): {
  validRows: { idx: number; data: ValidRow }[]
  errors: { row: number; message: string }[]
} {
  const validRows: { idx: number; data: ValidRow }[] = []
  const errors: { row: number; message: string }[] = []
  for (let i = 0; i < mappedRows.length; i++) {
    const parsed = importRowSchema.safeParse(sanitizeRow(mappedRows[i]))
    if (!parsed.success) {
      errors.push({ row: i + 2, message: parsed.error.issues[0]?.message ?? "Datos inválidos" })
    } else {
      validRows.push({ idx: i, data: parsed.data })
    }
  }
  return { validRows, errors }
}

// ── Modo COMMIT: body JSON { rows: [{ ...campos, action }] } ya revisado ─────
type CommitRow = {
  nombre?: unknown
  descripcion?: unknown
  precioUnitario?: unknown
  tipoIva?: unknown
  unidad?: unknown
  isService?: unknown
  categoria?: unknown
  action?: unknown
}

async function runCommit(req: NextRequest, userId: string) {
  const body = (await req.json().catch(() => null)) as { rows?: unknown } | null
  const rowsInput = body?.rows
  if (!Array.isArray(rowsInput)) {
    return NextResponse.json({ error: "Falta el array 'rows'" }, { status: 400 })
  }
  if (rowsInput.length > MAX_ROWS) {
    return NextResponse.json({ error: `Demasiadas filas (máx. ${MAX_ROWS}).` }, { status: 400 })
  }

  let skipped = 0
  const errors: { row: number; motivo: string }[] = []
  const validated: { action: "create" | "overwrite"; data: ValidRow }[] = []

  for (let i = 0; i < rowsInput.length; i++) {
    const r = (rowsInput[i] ?? {}) as CommitRow
    const action = String(r.action ?? "create")
    if (action === "skip") { skipped++; continue }

    // Reutiliza el mismo Zod de fila; isService → tipo PRODUCTO/SERVICIO
    const parsed = importRowSchema.safeParse(sanitizeRow({
      nombre: r.nombre,
      descripcion: r.descripcion,
      precio_unitario: r.precioUnitario,
      tipo_iva: r.tipoIva,
      unidad: r.unidad,
      tipo: r.isService ? "SERVICIO" : "PRODUCTO",
      categoria: r.categoria,
    }))
    if (!parsed.success) {
      errors.push({ row: i + 1, motivo: parsed.error.issues[0]?.message ?? "Datos inválidos" })
      continue
    }
    validated.push({ action: action === "overwrite" ? "overwrite" : "create", data: parsed.data })
  }

  // Resuelve los "overwrite" contra el catálogo del usuario por nombre normalizado
  // (no confiamos en ids del cliente → garantiza pertenencia).
  const existing = await prisma.product.findMany({
    where: { userId, deletedAt: null },
    select: { id: true, name: true },
  })
  const byNorm = new Map(existing.map((p) => [normName(p.name), p.id]))

  const toCreate: ValidRow[] = []
  const toUpdate: { id: string; data: ValidRow }[] = []
  for (const { action, data } of validated) {
    const id = action === "overwrite" ? byNorm.get(normName(data.nombre)) : undefined
    if (id) toUpdate.push({ id, data })
    else toCreate.push(data) // create, o overwrite cuyo destino ya no existe
  }

  if (toCreate.length || toUpdate.length) {
    await prisma.$transaction([
      ...(toCreate.length
        ? [prisma.product.createMany({ data: toCreate.map((d) => createPayload(userId, d)) })]
        : []),
      ...toUpdate.map(({ id, data }) => prisma.product.update({ where: { id }, data: updatePayload(data) })),
    ])
  }

  return NextResponse.json({ imported: toCreate.length, updated: toUpdate.length, skipped, errors })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    // Modo COMMIT: body JSON { rows: [...] } ya revisado en el preview
    if ((req.headers.get("content-type") || "").includes("application/json")) {
      return await runCommit(req, session.user.id)
    }

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

    // Mapeo flexible de cabeceras → campos canónicos (antes del Zod)
    const headerMap = buildHeaderMap(rawRows[0])
    const mappedCanon = new Set(headerMap.values())

    // Columnas obligatorias: si tras el mapeo faltan, error claro indicando cuál
    // y qué nombres se aceptan (en vez de "precio_unitario inválido" a secas).
    if (rawRows.length > 0) {
      const required: (typeof KNOWN_KEYS)[number][] = ["nombre", "precio_unitario"]
      const missing = required.filter((k) => !mappedCanon.has(k))
      if (missing.length > 0) {
        const detail = missing
          .map((k) => `"${k}" (acepta: ${HEADER_ALIASES[k].join(", ")})`)
          .join("; ")
        return NextResponse.json(
          { error: `Falta(n) columna(s) obligatoria(s): ${detail}` },
          { status: 400 }
        )
      }
    }

    const mappedRows = rawRows.map((r) => mapRow(r, headerMap))

    // Fix 1 + 3: sanitize then validate every row with Zod
    const { validRows, errors } = validateMappedRows(mappedRows)

    const dryRun = formData.get("dryRun") === "true"

    // ── Modo PREVIEW: NO escribe. Devuelve filas + resumen + duplicados ──────
    if (dryRun) {
      const existing = await prisma.product.findMany({
        where: { userId: session.user.id, deletedAt: null },
        select: { id: true, name: true },
      })
      const existingByNorm = new Map(existing.map((p) => [normName(p.name), p.id]))

      const rows = validRows.map(({ idx, data }) => {
        const existingId = existingByNorm.get(normName(data.nombre)) ?? null
        return {
          rowIndex: idx,
          nombre: data.nombre,
          descripcion: data.descripcion,
          precioUnitario: data.precio_unitario,
          tipoIva: data.tipo_iva,
          unidad: data.unidad,
          isService: data.tipo === "SERVICIO",
          categoria: data.categoria,
          isDuplicate: existingId !== null,
          existingId,
        }
      })

      const duplicados = rows.filter((r) => r.isDuplicate).length
      const servicios = rows.filter((r) => r.isService).length
      const summary = {
        total: rows.length,
        nuevos: rows.length - duplicados,
        duplicados,
        productos: rows.length - servicios,
        servicios,
        errores: errors.length,
      }
      return NextResponse.json({
        rows,
        summary,
        errors: errors.map((e) => ({ row: e.row, motivo: e.message })),
      })
    }

    // ── Modo LEGACY: subir fichero escribe directo (comportamiento existente) ─
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
