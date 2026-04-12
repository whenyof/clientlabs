export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/finance/pagos
 * Returns provider payments (ProviderPayment) for the authenticated user.
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
  let fromDate: Date
  if (period === "quarter") {
    fromDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
  } else if (period === "year") {
    fromDate = new Date(now.getFullYear(), 0, 1)
  } else {
    fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const yearStart = new Date(now.getFullYear(), 0, 1)

  try {
    const [pagosPeriodo, pagosAnio] = await Promise.all([
      prisma.providerPayment.findMany({
        where: {
          userId: session.user.id,
          paymentDate: { gte: fromDate },
        },
        select: {
          id: true,
          amount: true,
          paymentDate: true,
          concept: true,
          method: true,
          status: true,
          Provider: { select: { id: true, name: true } },
        },
        orderBy: { paymentDate: "desc" },
      }),
      prisma.providerPayment.aggregate({
        where: {
          userId: session.user.id,
          paymentDate: { gte: yearStart },
        },
        _sum: { amount: true },
      }),
    ])

    const totalPagadoMes = pagosPeriodo.reduce((s, p) => s + p.amount, 0)
    const totalPagadoAnio = Number(pagosAnio._sum.amount ?? 0)

    // Pending provider invoices (VENDOR invoices not paid)
    const pendingVendorInvoices = await prisma.invoice.findMany({
      where: {
        userId: session.user.id,
        type: "VENDOR",
        status: { notIn: ["PAID", "CANCELED"] },
      },
      select: { total: true },
    })
    const pendientePagar = pendingVendorInvoices.reduce((s, i) => s + Number(i.total), 0)

    // Find top provider this year
    const topProviderAgg = await prisma.providerPayment.groupBy({
      by: ["providerId"],
      where: {
        userId: session.user.id,
        paymentDate: { gte: yearStart },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 1,
    })

    let topProveedor = "—"
    if (topProviderAgg.length > 0) {
      const topProv = await prisma.provider.findFirst({
        where: { id: topProviderAgg[0].providerId },
        select: { name: true },
      })
      topProveedor = topProv?.name ?? "—"
    }

    const pagos = pagosPeriodo.map((p) => ({
      id: p.id,
      fecha: p.paymentDate,
      proveedor: p.Provider.name,
      concepto: p.concept ?? "—",
      importe: p.amount,
      metodo: p.method ?? "OTHER",
      estado: p.status,
    }))

    return NextResponse.json({
      success: true,
      pagos,
      kpis: {
        totalPagadoMes,
        pendientePagar,
        topProveedor,
        totalPagadoAnio,
      },
    })
  } catch (error) {
    console.error("Error cargando pagos:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
