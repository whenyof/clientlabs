export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { invalidateUserAggregates } from "@/lib/cache/aggregates"

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
  const search = searchParams.get("search")?.trim() ?? ""
  const cursor = searchParams.get("cursor") // formato: "<issueDate ISO>|<id>"
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 50), 1), 100)

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

  // Keyset estable (issueDate desc, id desc de desempate). El cursor evita
  // OFFSET y no salta/duplica filas si cambian los datos entre páginas.
  const and: import("@prisma/client").Prisma.InvoiceWhereInput[] = [
    { issueDate: { gte: fromDateMes } },
  ]
  if (cursor) {
    const sep = cursor.lastIndexOf("|")
    const cd = new Date(cursor.slice(0, sep))
    const cid = cursor.slice(sep + 1)
    if (!isNaN(cd.getTime()) && cid) {
      and.push({ OR: [{ issueDate: { lt: cd } }, { issueDate: cd, id: { lt: cid } }] })
    }
  }
  const listWhere: import("@prisma/client").Prisma.InvoiceWhereInput = {
    userId: session.user.id,
    type: "VENDOR",
    status: { not: "CANCELED" },
    ...(search
      ? {
          OR: [
            { number: { contains: search, mode: "insensitive" } },
            { notes: { contains: search, mode: "insensitive" } },
            { providerName: { contains: search, mode: "insensitive" } },
            { Provider: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
    AND: and,
  }

  try {
    const rowsRaw = await prisma.invoice.findMany({
      where: listWhere,
      select: {
        id: true,
        number: true,
        status: true,
        issueDate: true,
        subtotal: true,
        taxAmount: true,
        total: true,
        notes: true,
        pdfUrl: true,
        providerName: true,
        Provider: { select: { id: true, name: true } },
      },
      orderBy: [{ issueDate: "desc" }, { id: "desc" }],
      take: limit + 1, // +1 para detectar si hay más sin COUNT
    })
    const hasMore = rowsRaw.length > limit
    const gastos = hasMore ? rowsRaw.slice(0, limit) : rowsRaw
    const last = gastos[gastos.length - 1]
    const nextCursor = hasMore && last ? `${new Date(last.issueDate).toISOString()}|${last.id}` : null

    // KPIs por agregación SQL pura sobre columnas reales (period/año), sin
    // depender de las filas cargadas ni del término de búsqueda.
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
      proveedor: g.Provider?.name ?? g.providerName ?? "Sin proveedor",
      concepto: g.notes ?? "—",
      fecha: g.issueDate,
      base: Number(g.subtotal),
      iva: Number(g.taxAmount),
      total: Number(g.total),
      estado: g.status,
      documentUrl: g.pdfUrl ?? null,
    }))

    return NextResponse.json({
      success: true,
      gastos: rows,
      nextCursor,
      hasMore,
      kpis: {
        totalGastadoMes: Number(aggMes._sum.total ?? 0),
        totalGastadoAnio: Number(aggAnio._sum.total ?? 0),
        ivaDeducibleAcumulado: Number(aggAnio._sum.taxAmount ?? 0),
        // IVA del periodo seleccionado por SUM SQL (antes se sumaba la lista en
        // cliente; ahora exacto e independiente de la paginación).
        ivaDeduciblePeriodo: Number(aggMes._sum.taxAmount ?? 0),
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
    const { proveedor, concepto, fecha, base, ivaRate, categoria, documentUrl, providerId } = body

    if (!proveedor || !fecha || base === undefined) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Si el usuario asocio el gasto a un proveedor existente, validar propiedad
    let linkedProviderId: string | null = null
    if (providerId) {
      const provider = await prisma.provider.findFirst({
        where: { id: providerId, userId: session.user.id },
        select: { id: true },
      })
      linkedProviderId = provider?.id ?? null
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
        // Nombre del proveedor siempre como texto (se ve en la lista aunque no haya FK);
        // providerId solo si el usuario confirmo asociarlo a un proveedor existente.
        providerName: String(proveedor),
        ...(linkedProviderId ? { providerId: linkedProviderId } : {}),
      },
    })

    await invalidateUserAggregates(session.user.id)
    return NextResponse.json({ success: true, id: invoice.id, number: invoice.number })
  } catch (error) {
    console.error("Error creando gasto:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
