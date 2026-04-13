export const maxDuration = 15
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generarFichero303, nombreFichero303 } from "@/lib/fiscal/modelo303"

type Quarter = "q1" | "q2" | "q3" | "q4"

function quarterToNum(q: Quarter): 1 | 2 | 3 | 4 {
  return ({ q1: 1, q2: 2, q3: 3, q4: 4 } as const)[q]
}

function getQuarterDateRange(q: Quarter, year: number): { start: Date; end: Date } {
  switch (q) {
    case "q1": return { start: new Date(year, 0, 1), end: new Date(year, 2, 31, 23, 59, 59) }
    case "q2": return { start: new Date(year, 3, 1), end: new Date(year, 5, 30, 23, 59, 59) }
    case "q3": return { start: new Date(year, 6, 1), end: new Date(year, 8, 30, 23, 59, 59) }
    case "q4": return { start: new Date(year, 9, 1), end: new Date(year, 11, 31, 23, 59, 59) }
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ quarter: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { quarter: rawQuarter } = await params
  if (!["q1", "q2", "q3", "q4"].includes(rawQuarter)) {
    return NextResponse.json({ error: "Trimestre inválido" }, { status: 400 })
  }
  const quarter = rawQuarter as Quarter
  const userId = session.user.id
  const year = new Date().getFullYear()
  const trimestre = quarterToNum(quarter)
  const { start, end } = getQuarterDateRange(quarter, year)

  try {
    // Perfil fiscal — NIF obligatorio
    const perfil = await prisma.businessProfile.findUnique({
      where: { userId },
      select: { taxId: true, legalName: true, companyName: true },
    })

    if (!perfil?.taxId?.trim()) {
      return NextResponse.json(
        { error: "Configura tu NIF en Finanzas → Configuración fiscal antes de exportar" },
        { status: 400 }
      )
    }

    const nif = perfil.taxId.trim()
    const nombre = (perfil.legalName ?? perfil.companyName ?? "").trim()

    // Facturas emitidas del trimestre (IVA repercutido)
    const facturasVenta = await prisma.invoice.findMany({
      where: {
        userId,
        type: "CUSTOMER",
        isRectification: false,
        issueDate: { gte: start, lte: end },
        status: { notIn: ["DRAFT", "CANCELED"] },
      },
      select: {
        subtotal: true,
        taxAmount: true,
        lines: { select: { taxPercent: true, subtotal: true, taxAmount: true } },
      },
    })

    // Facturas de gastos del trimestre (IVA soportado)
    const facturasGasto = await prisma.invoice.findMany({
      where: {
        userId,
        type: "VENDOR",
        issueDate: { gte: start, lte: end },
        status: { notIn: ["DRAFT", "CANCELED"] },
      },
      select: { subtotal: true, taxAmount: true },
    })

    // Agrupa ventas por tipo de IVA a partir de las líneas
    let base4 = 0, cuota4 = 0
    let base10 = 0, cuota10 = 0
    let base21 = 0, cuota21 = 0

    for (const f of facturasVenta) {
      if (f.lines.length > 0) {
        for (const l of f.lines) {
          const rate = Number(l.taxPercent ?? 21)
          const b = Number(l.subtotal ?? 0)
          const c = Number(l.taxAmount ?? 0)
          if (rate <= 4) { base4 += b; cuota4 += c }
          else if (rate <= 10) { base10 += b; cuota10 += c }
          else { base21 += b; cuota21 += c }
        }
      } else {
        // Sin líneas: coloca todo en 21%
        base21 += Number(f.subtotal ?? 0)
        cuota21 += Number(f.taxAmount ?? 0)
      }
    }

    // IVA soportado (gastos) — todo en casilla 28/29 (corrientes)
    const baseGastos = facturasGasto.reduce((s, g) => s + Number(g.subtotal ?? 0), 0)
    const cuotaGastos = facturasGasto.reduce((s, g) => s + Number(g.taxAmount ?? 0), 0)

    const fichero = generarFichero303({
      nif,
      nombre,
      ejercicio: year,
      trimestre,
      c01_base4: +base4.toFixed(2),
      c02_cuota4: +cuota4.toFixed(2),
      c04_base10: +base10.toFixed(2),
      c05_cuota10: +cuota10.toFixed(2),
      c07_base21: +base21.toFixed(2),
      c09_cuota21: +cuota21.toFixed(2),
      c28_base: +baseGastos.toFixed(2),
      c29_cuota: +cuotaGastos.toFixed(2),
    })

    const filename = nombreFichero303(nif, year, trimestre)

    return new Response(fichero, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (e) {
    console.error("export-303 error:", e)
    return NextResponse.json({ error: "Error generando fichero 303" }, { status: 500 })
  }
}
