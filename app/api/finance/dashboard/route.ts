import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getCachedData, setCachedData } from "@/lib/redis-cache"

export const maxDuration = 15

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const userId = session.user.id
  const cacheKey = `finance:dashboard:${userId}`

  const cached = await getCachedData(cacheKey)
  if (cached) return NextResponse.json(cached)

  try {
    const now = new Date()
    const mesInicio = new Date(now.getFullYear(), now.getMonth(), 1)
    const mesFin = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const [facturasMes, pendientes, vencidas, ultimasFacturas] = await Promise.all([
      // Facturado este mes (facturas CUSTOMER emitidas)
      prisma.invoice.aggregate({
        where: {
          userId,
          type: "CUSTOMER",
          issueDate: { gte: mesInicio, lte: mesFin },
          status: { notIn: ["DRAFT", "CANCELED"] },
        },
        _sum: { total: true },
        _count: { id: true },
      }),

      // Pendiente de cobro (SENT + VIEWED + PARTIAL)
      prisma.invoice.aggregate({
        where: {
          userId,
          type: "CUSTOMER",
          status: { in: ["SENT", "VIEWED", "PARTIAL"] },
        },
        _sum: { total: true },
        _count: { id: true },
      }),

      // Vencidas (OVERDUE)
      prisma.invoice.findMany({
        where: { userId, type: "CUSTOMER", status: "OVERDUE" },
        select: {
          id: true,
          number: true,
          total: true,
          dueDate: true,
          Client: { select: { name: true } },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),

      // Últimas 5 facturas
      prisma.invoice.findMany({
        where: { userId, type: "CUSTOMER" },
        select: {
          id: true,
          number: true,
          total: true,
          status: true,
          issueDate: true,
          dueDate: true,
          Client: { select: { name: true } },
        },
        orderBy: { issueDate: "desc" },
        take: 5,
      }),
    ])

    // Count vencidas for alerts
    const numVencidas = await prisma.invoice.count({
      where: { userId, type: "CUSTOMER", status: "OVERDUE" },
    })

    // Total vencido
    const totalVencidoAgg = await prisma.invoice.aggregate({
      where: { userId, type: "CUSTOMER", status: "OVERDUE" },
      _sum: { total: true },
    })

    const data = {
      success: true,
      kpis: {
        facturadoMes: Number(facturasMes._sum.total ?? 0),
        numFacturasMes: facturasMes._count.id,
        pendienteCobro: Number(pendientes._sum.total ?? 0),
        numPendientes: pendientes._count.id,
        vencido: Number(totalVencidoAgg._sum.total ?? 0),
        numVencidas,
      },
      facturasVencidas: vencidas.map((f) => ({
        id: f.id,
        number: f.number,
        total: Number(f.total),
        dueDate: f.dueDate.toISOString(),
        cliente: f.Client?.name ?? null,
      })),
      ultimasFacturas: ultimasFacturas.map((f) => ({
        id: f.id,
        number: f.number,
        total: Number(f.total),
        status: f.status,
        issueDate: f.issueDate.toISOString(),
        dueDate: f.dueDate.toISOString(),
        cliente: f.Client?.name ?? null,
      })),
    }

    await setCachedData(cacheKey, data, 60)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Error al cargar dashboard" }, { status: 500 })
  }
}
