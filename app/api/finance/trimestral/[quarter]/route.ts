export const maxDuration = 15

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { computeQuarterFiscals, isQuarter } from "@/lib/fiscal/trimestral"

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
    return NextResponse.json({ error: "Trimestre invalido" }, { status: 400 })
  }

  const now = new Date()
  const year = now.getFullYear()

  try {
    // Cálculo ÚNICO compartido con los exports 303/130 (lo que se ve = lo que se presenta)
    const data = await computeQuarterFiscals(session.user.id, rawQuarter, year)

    const isDeadlinePast = data.deadline < now
    const daysLeft = Math.ceil((data.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return NextResponse.json({
      success: true,
      quarter: data.quarter,
      year: data.year,
      deadline: data.deadline.toISOString(),
      deadlinePast: isDeadlinePast,
      daysLeft: isDeadlinePast ? 0 : daysLeft,
      // 303
      baseImponibleVentas: data.iva.baseImponibleVentas,
      ivaRepercutido: data.iva.ivaRepercutido,
      baseImponibleCompras: data.iva.baseImponibleCompras,
      ivaSoportado: data.iva.ivaSoportado,
      ivaResult: data.iva.ivaResult,
      // 130
      ingresosAcumulados: data.irpf.ingresosAcumulados,
      gastosDeducibles: data.irpf.gastosDeducibles,
      rendimientoNeto: data.irpf.rendimientoNeto,
      irpf20: data.irpf.irpf20,
      retenciones: data.irpf.retenciones,
      pagosAnteriores: data.irpf.pagosAnteriores,
      irpfResult: data.irpf.irpfResult,
      // Tablas
      facturas: data.facturas,
      gastos: data.gastos,
    })
  } catch (error) {
    console.error("Error cargando datos trimestrales:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
