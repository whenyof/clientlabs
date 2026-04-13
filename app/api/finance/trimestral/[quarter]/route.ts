export const maxDuration = 15

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type Quarter = "q1" | "q2" | "q3" | "q4"

function getQuarterDateRange(quarter: Quarter, year: number): { start: Date; end: Date } {
  switch (quarter) {
    case "q1": return { start: new Date(year, 0, 1), end: new Date(year, 2, 31, 23, 59, 59) }
    case "q2": return { start: new Date(year, 3, 1), end: new Date(year, 5, 30, 23, 59, 59) }
    case "q3": return { start: new Date(year, 6, 1), end: new Date(year, 8, 30, 23, 59, 59) }
    case "q4": return { start: new Date(year, 9, 1), end: new Date(year, 11, 31, 23, 59, 59) }
  }
}

function getDeadline(quarter: Quarter, year: number): Date {
  switch (quarter) {
    case "q1": return new Date(year, 3, 20)
    case "q2": return new Date(year, 6, 20)
    case "q3": return new Date(year, 9, 20)
    case "q4": return new Date(year + 1, 0, 30)
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
  const quarter = rawQuarter as Quarter
  if (!["q1", "q2", "q3", "q4"].includes(quarter)) {
    return NextResponse.json({ error: "Trimestre invalido" }, { status: 400 })
  }

  const userId = session.user.id
  const now = new Date()
  const year = now.getFullYear()
  const { start, end } = getQuarterDateRange(quarter, year)
  const deadline = getDeadline(quarter, year)
  const yearStart = new Date(year, 0, 1)

  try {
    // Facturas emitidas del trimestre (CUSTOMER)
    const facturasRaw = await prisma.invoice.findMany({
      where: {
        userId,
        type: "CUSTOMER",
        isRectification: false,
        issueDate: { gte: start, lte: end },
      },
      select: {
        id: true,
        number: true,
        issueDate: true,
        subtotal: true,
        taxAmount: true,
        total: true,
        status: true,
        Client: { select: { name: true, email: true } },
      },
      orderBy: { issueDate: "asc" },
    })

    // Gastos del trimestre (SUPPLIER invoices)
    const gastosRaw = await prisma.invoice.findMany({
      where: {
        userId,
        type: "VENDOR",
        issueDate: { gte: start, lte: end },
      },
      select: {
        id: true,
        number: true,
        issueDate: true,
        subtotal: true,
        taxAmount: true,
        total: true,
        Provider: { select: { name: true } },
        lines: { select: { description: true }, take: 1 },
      },
      orderBy: { issueDate: "asc" },
    })

    // Acumulados del año hasta fin del trimestre (para IRPF 130)
    const facturasAno = await prisma.invoice.findMany({
      where: {
        userId,
        type: "CUSTOMER",
        isRectification: false,
        issueDate: { gte: yearStart, lte: end },
      },
      select: { subtotal: true },
    })

    const gastosAno = await prisma.invoice.findMany({
      where: {
        userId,
        type: "VENDOR",
        issueDate: { gte: yearStart, lte: end },
      },
      select: { subtotal: true },
    })

    // --- Calcs 303 ---
    const baseImponibleVentas = facturasRaw.reduce((s, f) => s + Number(f.subtotal), 0)
    const ivaRepercutido = facturasRaw.reduce((s, f) => s + Number(f.taxAmount), 0)
    const baseImponibleCompras = gastosRaw.reduce((s, g) => s + Number(g.subtotal), 0)
    const ivaSoportado = gastosRaw.reduce((s, g) => s + Number(g.taxAmount), 0)
    const ivaResult = +(ivaRepercutido - ivaSoportado).toFixed(2)

    // --- Calcs 130 ---
    const ingresosAcumulados = facturasAno.reduce((s, f) => s + Number(f.subtotal), 0)
    const gastosDeducibles = gastosAno.reduce((s, g) => s + Number(g.subtotal), 0)
    const rendimientoNeto = ingresosAcumulados - gastosDeducibles
    const irpf20 = rendimientoNeto > 0 ? rendimientoNeto * 0.2 : 0
    // Retenciones: approximation 15% IRPF retenido en facturas del año
    const retenciones = facturasAno.reduce((s, f) => s + Number(f.subtotal) * 0.15, 0)
    const pagosAnteriores = 0
    const irpfResult = +Math.max(0, irpf20 - retenciones - pagosAnteriores).toFixed(2)

    const isDeadlinePast = deadline < now
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return NextResponse.json({
      success: true,
      quarter,
      year,
      deadline: deadline.toISOString(),
      deadlinePast: isDeadlinePast,
      daysLeft: isDeadlinePast ? 0 : daysLeft,
      // 303
      baseImponibleVentas: +baseImponibleVentas.toFixed(2),
      ivaRepercutido: +ivaRepercutido.toFixed(2),
      baseImponibleCompras: +baseImponibleCompras.toFixed(2),
      ivaSoportado: +ivaSoportado.toFixed(2),
      ivaResult,
      // 130
      ingresosAcumulados: +ingresosAcumulados.toFixed(2),
      gastosDeducibles: +gastosDeducibles.toFixed(2),
      rendimientoNeto: +rendimientoNeto.toFixed(2),
      irpf20: +irpf20.toFixed(2),
      retenciones: +retenciones.toFixed(2),
      pagosAnteriores,
      irpfResult,
      // Tables
      facturas: facturasRaw.map((f) => ({
        id: f.id,
        numero: f.number,
        cliente: f.Client?.name ?? f.Client?.email ?? "—",
        fecha: f.issueDate.toISOString(),
        base: +Number(f.subtotal).toFixed(2),
        iva: +Number(f.taxAmount).toFixed(2),
        total: +Number(f.total).toFixed(2),
        estado: f.status,
      })),
      gastos: gastosRaw.map((g) => ({
        id: g.id,
        fecha: g.issueDate.toISOString(),
        proveedor: g.Provider?.name ?? "—",
        concepto: g.lines[0]?.description ?? g.number,
        base: +Number(g.subtotal).toFixed(2),
        iva: +Number(g.taxAmount).toFixed(2),
        total: +Number(g.total).toFixed(2),
      })),
    })
  } catch (error) {
    console.error("Error cargando datos trimestrales:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
