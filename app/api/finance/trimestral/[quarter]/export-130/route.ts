export const maxDuration = 15
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generarFichero130, nombreFichero130 } from "@/lib/fiscal/modelo130"

type Quarter = "q1" | "q2" | "q3" | "q4"

function quarterToNum(q: Quarter): 1 | 2 | 3 | 4 {
  return ({ q1: 1, q2: 2, q3: 3, q4: 4 } as const)[q]
}

function getQuarterEnd(q: Quarter, year: number): Date {
  switch (q) {
    case "q1": return new Date(year, 2, 31, 23, 59, 59)
    case "q2": return new Date(year, 5, 30, 23, 59, 59)
    case "q3": return new Date(year, 8, 30, 23, 59, 59)
    case "q4": return new Date(year, 11, 31, 23, 59, 59)
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

  // El 130 usa datos ACUMULADOS desde el 1 de enero hasta el fin del trimestre
  const inicioAno = new Date(year, 0, 1)
  const finTrimestre = getQuarterEnd(quarter, year)

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

    // Facturas emitidas acumuladas del año hasta el fin del trimestre
    const facturasAno = await prisma.invoice.findMany({
      where: {
        userId,
        type: "CUSTOMER",
        isRectification: false,
        issueDate: { gte: inicioAno, lte: finTrimestre },
        status: { notIn: ["DRAFT", "CANCELED"] },
      },
      select: { subtotal: true, irpfAmount: true },
    })

    // Gastos deducibles acumulados del año hasta el fin del trimestre
    const gastosAno = await prisma.invoice.findMany({
      where: {
        userId,
        type: "VENDOR",
        issueDate: { gte: inicioAno, lte: finTrimestre },
        status: { notIn: ["DRAFT", "CANCELED"] },
      },
      select: { subtotal: true },
    })

    const ingresosAcumulados = facturasAno.reduce((s, f) => s + Number(f.subtotal ?? 0), 0)
    const gastosAcumulados = gastosAno.reduce((s, g) => s + Number(g.subtotal ?? 0), 0)

    // Retenciones IRPF soportadas: suma de irpfAmount en facturas emitidas
    // (IRPF que el cliente ha retenido al pagar la factura)
    const retencionesAcumuladas = facturasAno.reduce((s, f) => s + Number(f.irpfAmount ?? 0), 0)

    // Pagos 130 anteriores del mismo año: el usuario los ajustará manualmente en AEAT
    // (desde ClientLabs no podemos saber qué ingresaron en trimestres previos)
    const pagosPrevios = 0

    const fichero = generarFichero130({
      nif,
      nombre,
      ejercicio: year,
      trimestre,
      c01_ingresosAcumulados: +ingresosAcumulados.toFixed(2),
      c05_gastosAcumulados: +gastosAcumulados.toFixed(2),
      c11_retenciones: +retencionesAcumuladas.toFixed(2),
      c13_pagosPrevios: pagosPrevios,
    })

    const filename = nombreFichero130(nif, year, trimestre)

    return new Response(fichero, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (e) {
    console.error("export-130 error:", e)
    return NextResponse.json({ error: "Error generando fichero 130" }, { status: 500 })
  }
}
