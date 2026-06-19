export const maxDuration = 15
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generarFichero130, nombreFichero130 } from "@/lib/fiscal/modelo130"
import { computeQuarterFiscals, isQuarter, quarterToNum } from "@/lib/fiscal/trimestral"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ quarter: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { quarter: rawQuarter } = await params
  if (!isQuarter(rawQuarter)) {
    return NextResponse.json({ error: "Trimestre inválido" }, { status: 400 })
  }
  const userId = session.user.id
  const year = new Date().getFullYear()
  const trimestre = quarterToNum(rawQuarter)

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
    const nombre = (perfil.legalName || perfil.companyName || "").trim()

    // Mismo cálculo que el panel — imposible que diverjan
    const { irpf } = await computeQuarterFiscals(userId, rawQuarter, year)

    const fichero = generarFichero130({
      nif,
      nombre,
      ejercicio: year,
      trimestre,
      c01_ingresosAcumulados: irpf.ingresosAcumulados,
      c05_gastosAcumulados: irpf.gastosDeducibles,
      c11_retenciones: irpf.retenciones,
      c13_pagosPrevios: irpf.pagosAnteriores,
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
