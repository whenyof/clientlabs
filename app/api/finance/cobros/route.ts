export const maxDuration = 10

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/finance/cobros
 * Returns:
 *   - pendingInvoices: open invoices (SENT, VIEWED, PARTIAL, OVERDUE) with client + payment details
 *   - cobros: received payments for the selected period
 *   - kpis: totals for both views
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
    // ── Received payments (historial) ──────────────────────────────────────
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
            Client: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { paidAt: "desc" },
    })

    // ── Pending / open invoices ────────────────────────────────────────────
    const openInvoices = await prisma.invoice.findMany({
      where: {
        userId: session.user.id,
        type: "CUSTOMER",
        status: { in: ["SENT", "VIEWED", "PARTIAL", "OVERDUE"] },
      },
      select: {
        id: true,
        number: true,
        issueDate: true,
        dueDate: true,
        total: true,
        status: true,
        Client: { select: { id: true, name: true, email: true } },
        payments: { select: { amount: true } },
      },
      orderBy: { dueDate: "asc" },
    })

    // ── KPIs ──────────────────────────────────────────────────────────────
    const totalCobrado = payments.reduce((s, p) => s + Number(p.amount), 0)

    const pendingInvoices = openInvoices.map((inv) => {
      const totalPaid = inv.payments.reduce((s, p) => s + Number(p.amount), 0)
      const pendiente = Math.max(0, Number(inv.total) - totalPaid)
      const daysFromNow = Math.round((inv.dueDate.getTime() - now.getTime()) / 86_400_000)
      return {
        id: inv.id,
        number: inv.number,
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
        total: Number(inv.total),
        totalPaid,
        pendiente,
        status: inv.status,
        daysFromNow, // negative = overdue
        cliente: inv.Client?.name ?? inv.Client?.email ?? "—",
        clienteId: inv.Client?.id ?? null,
      }
    })

    // Sort: OVERDUE first (most days overdue first), then by dueDate asc
    pendingInvoices.sort((a, b) => {
      if (a.daysFromNow < 0 && b.daysFromNow >= 0) return -1
      if (a.daysFromNow >= 0 && b.daysFromNow < 0) return 1
      return a.daysFromNow - b.daysFromNow
    })

    const totalPendiente = pendingInvoices.reduce((s, inv) => s + inv.pendiente, 0)
    const overdueInvoices = pendingInvoices.filter((inv) => inv.daysFromNow < 0)
    const totalVencido = overdueInvoices.reduce((s, inv) => s + inv.pendiente, 0)

    // Cobrado % vs total invoiced this period
    const periodInvoices = await prisma.invoice.findMany({
      where: { userId: session.user.id, type: "CUSTOMER", issueDate: { gte: fromDate } },
      select: { total: true },
    })
    const totalFacturado = periodInvoices.reduce((s, inv) => s + Number(inv.total), 0)
    const porcentajeCobrado = totalFacturado > 0 ? Math.round((totalCobrado / totalFacturado) * 100) : 0

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
      pendingInvoices,
      cobros,
      kpis: {
        totalCobrado,
        totalPendiente,
        totalVencido,
        countVencidas: overdueInvoices.length,
        porcentajeCobrado,
      },
    })
  } catch (error) {
    console.error("Error cargando cobros:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
