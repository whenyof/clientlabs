export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const userId = session.user.id
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())

  try {
    const [
      leadsActive,
      leadsNewThisWeek,
      leadsRecent,
      invoicesPaid,
      invoicesPaidPrevMonth,
      invoicesPending,
      invoicesPendingCount,
      tasksHighPriority,
      tasksOverdue,
      invoicesOverdue,
      clientsActive,
      activityLeads,
      activityInvoices,
      activityTasks,
    ] = await Promise.all([
      // Leads activos (QUALIFIED + CONTACTED)
      prisma.lead.count({
        where: {
          userId,
          leadStatus: { in: ["QUALIFIED", "CONTACTED"] },
        },
      }),
      // Leads nuevos esta semana
      prisma.lead.count({
        where: {
          userId,
          createdAt: { gte: startOfWeek },
        },
      }),
      // Últimos 5 leads
      prisma.lead.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          leadStatus: true,
          createdAt: true,
        },
      }),
      // Facturado este mes
      prisma.invoice.aggregate({
        where: {
          userId,
          status: "PAID",
          type: "CUSTOMER",
          updatedAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),
      // Facturado mes anterior (para comparación)
      prisma.invoice.aggregate({
        where: {
          userId,
          status: "PAID",
          type: "CUSTOMER",
          updatedAt: {
            gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            lt: startOfMonth,
          },
        },
        _sum: { total: true },
      }),
      // Pendiente de cobro (suma)
      prisma.invoice.aggregate({
        where: {
          userId,
          status: { in: ["SENT", "OVERDUE"] },
          type: "CUSTOMER",
        },
        _sum: { total: true },
      }),
      // Pendiente de cobro (contador)
      prisma.invoice.count({
        where: {
          userId,
          status: { in: ["SENT", "OVERDUE"] },
          type: "CUSTOMER",
        },
      }),
      // Tareas prioritarias (HIGH) sin completar
      prisma.task.findMany({
        where: {
          userId,
          priority: "HIGH",
          status: { not: "DONE" },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
        select: {
          id: true,
          title: true,
          dueDate: true,
          priority: true,
          type: true,
        },
      }),
      // Tareas atrasadas
      prisma.task.count({
        where: {
          userId,
          dueDate: { lt: now },
          status: { not: "DONE" },
        },
      }),
      // Facturas vencidas (conteo)
      prisma.invoice.count({
        where: { userId, status: "OVERDUE", type: "CUSTOMER" },
      }),
      // Clientes activos
      prisma.client.count({
        where: { userId },
      }),
      // Actividad: últimos leads
      prisma.lead.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, name: true, createdAt: true },
      }),
      // Actividad: facturas pagadas recientes
      prisma.invoice.findMany({
        where: { userId, status: "PAID" },
        orderBy: { updatedAt: "desc" },
        take: 3,
        select: { id: true, number: true, total: true, updatedAt: true },
      }),
      // Actividad: tareas completadas recientes
      prisma.task.findMany({
        where: { userId, status: "DONE" },
        orderBy: { updatedAt: "desc" },
        take: 2,
        select: { id: true, title: true, updatedAt: true },
      }),
    ])

    const invoicedThisMonth = Number(invoicesPaid._sum.total ?? 0)
    const invoicedPrevMonth = Number(invoicesPaidPrevMonth._sum.total ?? 0)

    return NextResponse.json({
      kpis: {
        leadsActive,
        leadsNewThisWeek,
        invoicedThisMonth,
        invoicedPrevMonth,
        pendingCobro: Number(invoicesPending._sum.total ?? 0),
        pendingCobroCount: invoicesPendingCount,
        tasksHighPriority: tasksHighPriority.length,
        tasksOverdue,
        invoicesOverdue,
        clientsActive,
      },
      leadsRecent,
      tasksHighPriority,
      activityFeed: {
        leads: activityLeads,
        invoices: activityInvoices,
        tasks: activityTasks,
      },
      meta: {
        userName: session.user.name ?? "",
        currentDate: now.toISOString(),
      },
    })
  } catch (err) {
    console.error("[GET /api/dashboard/summary]:", err)
    return NextResponse.json({ error: "Error al cargar datos" }, { status: 500 })
  }
}
