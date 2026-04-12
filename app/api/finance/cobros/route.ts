export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/finance/cobros
 * Returns received payments (InvoicePayment) for the authenticated user.
 * Query: period (month|quarter|year), method
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const period = searchParams.get("period") ?? "month"
  const method = searchParams.get("method") ?? ""

  const now = new Date()
  let fromDate: Date
  if (period === "quarter") {
    fromDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
  } else if (period === "year") {
    fromDate = new Date(now.getFullYear(), 0, 1)
  } else {
    fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  try {
    const payments = await prisma.invoicePayment.findMany({
      where: {
        paidAt: { gte: fromDate },
        Invoice: { userId: session.user.id },
        ...(method ? { method } : {}),
      },
      select: {
        id: true,
        amount: true,
        method: true,
        reference: true,
        paidAt: true,
        Invoice: {
          select: {
            id: true,
            number: true,
            status: true,
            Client: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { paidAt: "desc" },
    })

    const totalCobrado = payments.reduce((sum, p) => sum + Number(p.amount), 0)

    // Pending invoices (SENT or PARTIAL)
    const pendingInvoices = await prisma.invoice.findMany({
      where: {
        userId: session.user.id,
        status: { in: ["SENT", "PARTIAL"] },
      },
      select: { total: true },
    })
    const pendienteCobrar = pendingInvoices.reduce((sum, inv) => sum + Number(inv.total), 0)

    // Total invoiced this period for percentage
    const periodInvoices = await prisma.invoice.findMany({
      where: {
        userId: session.user.id,
        type: "CUSTOMER",
        issuedAt: { gte: fromDate },
      },
      select: { total: true },
    })
    const totalFacturado = periodInvoices.reduce((sum, inv) => sum + Number(inv.total), 0)

    const porcentajeCobrado = totalFacturado > 0
      ? Math.round((totalCobrado / totalFacturado) * 100)
      : 0

    const cobros = payments.map((p) => ({
      id: p.id,
      fecha: p.paidAt,
      invoiceId: p.Invoice.id,
      invoiceNumber: p.Invoice.number,
      cliente: p.Invoice.Client?.name ?? p.Invoice.Client?.email ?? "—",
      importe: Number(p.amount),
      metodo: p.method,
      referencia: p.reference,
    }))

    return NextResponse.json({
      success: true,
      cobros,
      kpis: {
        totalCobrado,
        pendienteCobrar,
        porcentajeCobrado,
      },
    })
  } catch (error) {
    console.error("Error cargando cobros:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
