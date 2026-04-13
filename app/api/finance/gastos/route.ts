export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/finance/gastos
 * Returns vendor invoices (expenses) for the authenticated user.
 * Query: period (month|quarter|year)
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const period = searchParams.get("period") ?? "month"

  const now = new Date()
  let fromDateMes: Date
  let fromDateAnio: Date

  fromDateMes = new Date(now.getFullYear(), now.getMonth(), 1)
  fromDateAnio = new Date(now.getFullYear(), 0, 1)

  if (period === "quarter") {
    fromDateMes = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
  } else if (period === "year") {
    fromDateMes = fromDateAnio
  }

  try {
    const gastos = await prisma.invoice.findMany({
      where: {
        userId: session.user.id,
        type: "VENDOR",
        issueDate: { gte: fromDateMes },
        status: { not: "CANCELED" },
      },
      select: {
        id: true,
        number: true,
        status: true,
        issueDate: true,
        subtotal: true,
        taxAmount: true,
        total: true,
        notes: true,
        Provider: { select: { id: true, name: true } },
      },
      orderBy: { issueDate: "desc" },
    })

    const [aggMes, aggAnio] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          userId: session.user.id,
          type: "VENDOR",
          issueDate: { gte: fromDateMes },
          status: { not: "CANCELED" },
        },
        _sum: { total: true, taxAmount: true },
      }),
      prisma.invoice.aggregate({
        where: {
          userId: session.user.id,
          type: "VENDOR",
          issueDate: { gte: fromDateAnio },
          status: { not: "CANCELED" },
        },
        _sum: { total: true, taxAmount: true },
      }),
    ])

    const rows = gastos.map((g) => ({
      id: g.id,
      numero: g.number,
      proveedor: g.Provider?.name ?? "Sin proveedor",
      concepto: g.notes ?? "—",
      fecha: g.issueDate,
      base: Number(g.subtotal),
      iva: Number(g.taxAmount),
      total: Number(g.total),
      estado: g.status,
    }))

    return NextResponse.json({
      success: true,
      gastos: rows,
      kpis: {
        totalGastadoMes: Number(aggMes._sum.total ?? 0),
        totalGastadoAnio: Number(aggAnio._sum.total ?? 0),
        ivaDeducibleAcumulado: Number(aggAnio._sum.taxAmount ?? 0),
      },
    })
  } catch (error) {
    console.error("Error cargando gastos:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

/**
 * POST /api/finance/gastos
 * Creates a new vendor invoice (expense).
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { proveedor, concepto, fecha, base, ivaRate, categoria, documentUrl } = body

    if (!proveedor || !fecha || base === undefined) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const baseNum = parseFloat(base)
    const rate = parseFloat(ivaRate ?? "21")
    const taxAmount = +(baseNum * (rate / 100)).toFixed(2)
    const total = +(baseNum + taxAmount).toFixed(2)

    // Auto-generate number: G-YYYY-NNN
    const year = new Date(fecha).getFullYear()
    const count = await prisma.invoice.count({
      where: { userId: session.user.id, type: "VENDOR", number: { startsWith: `G-${year}-` } },
    })
    const number = `G-${year}-${String(count + 1).padStart(3, "0")}`

    const issueDate = new Date(fecha)
    const dueDate = new Date(fecha)

    const invoice = await prisma.invoice.create({
      data: {
        userId: session.user.id,
        number,
        series: "G",
        type: "VENDOR",
        status: "SENT",
        issueDate,
        dueDate,
        subtotal: baseNum,
        taxAmount,
        taxTotal: taxAmount,
        total,
        notes: [concepto, categoria ? `Categoría: ${categoria}` : null].filter(Boolean).join(" | "),
        pdfUrl: documentUrl ?? null,
      },
    })

    return NextResponse.json({ success: true, id: invoice.id, number: invoice.number })
  } catch (error) {
    console.error("Error creando gasto:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
