export const maxDuration = 30
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const VALID_TAX_RATES = [0, 4, 10, 21]

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

    const fileName = file.name.toLowerCase()
    const buffer = Buffer.from(await file.arrayBuffer())
    let rows: Record<string, string>[] = []

    if (fileName.endsWith(".csv")) {
      const { parse } = await import("papaparse")
      const text = buffer.toString("utf-8")
      const result = parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h: string) => h.trim(),
        transform: (v: string) => v.trim(),
      })
      rows = result.data
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      const XLSX = await import("xlsx")
      const workbook = XLSX.read(buffer, { type: "buffer" })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" })
    } else {
      return NextResponse.json({ error: "Formato no soportado. Usa .csv o .xlsx" }, { status: 400 })
    }

    let imported = 0
    let updated = 0
    const errors: { row: number; message: string }[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2

      const nombre = (row["nombre"] ?? "").trim()
      if (!nombre) {
        errors.push({ row: rowNum, message: "nombre es obligatorio" })
        continue
      }

      const precioRaw = (row["precio_unitario"] ?? "0").trim().replace(",", ".")
      const precio = parseFloat(precioRaw)
      if (isNaN(precio) || precio < 0) {
        errors.push({ row: rowNum, message: `precio_unitario inválido: "${row["precio_unitario"]}"` })
        continue
      }

      const ivaRaw = (row["tipo_iva"] ?? "21").trim()
      const iva = Number(ivaRaw)
      if (!VALID_TAX_RATES.includes(iva)) {
        errors.push({ row: rowNum, message: `tipo_iva debe ser 0, 4, 10 o 21 (recibido: "${ivaRaw}")` })
        continue
      }

      const tipoRaw = (row["tipo"] ?? "PRODUCTO").trim().toUpperCase()
      if (tipoRaw !== "PRODUCTO" && tipoRaw !== "SERVICIO") {
        errors.push({ row: rowNum, message: `tipo debe ser PRODUCTO o SERVICIO (recibido: "${row["tipo"]}")` })
        continue
      }
      const isService = tipoRaw === "SERVICIO"

      const unit = (row["unidad"] ?? "ud").trim() || "ud"
      const description = (row["descripcion"] ?? "").trim() || null
      const category = (row["categoria"] ?? "").trim() || null

      const existing = await prisma.product.findFirst({
        where: { userId: session.user.id, name: nombre, deletedAt: null },
        select: { id: true },
      })

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: { description, price: precio, taxRate: iva, unit, category, isService },
        })
        updated++
      } else {
        await prisma.product.create({
          data: {
            userId: session.user.id,
            name: nombre,
            description,
            price: precio,
            taxRate: iva,
            unit,
            category,
            isService,
            active: true,
          },
        })
        imported++
      }
    }

    return NextResponse.json({ imported, updated, errors })
  } catch (err) {
    console.error("[products/import]", err instanceof Error ? err.message : err)
    return NextResponse.json({ error: "Error al procesar el archivo" }, { status: 500 })
  }
}
