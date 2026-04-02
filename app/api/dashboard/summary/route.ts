export const dynamic = "force-dynamic"
export const maxDuration = 30

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getCached, setCached } from "@/lib/cache"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const userId = session.user.id
  const cacheKey = `dashboard-summary-${userId}`
  const cached = getCached(cacheKey)
  if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } })
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())

  try {
    const [
      leadsActive,
      leadsNewThisWeek,
      leadsThisMonth,
      leadsRecent,
      leadsByStatusRaw,
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
      // Leads este mes
      prisma.lead.count({
        where: { userId, createdAt: { gte: startOfMonth } },
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
      // Leads por estado
      prisma.lead.groupBy({
        by: ["leadStatus"],
        where: { userId },
        _count: true,
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

    const leadsByStatusMap: Record<string, number> = {}
    for (const row of leadsByStatusRaw) {
      leadsByStatusMap[row.leadStatus] = row._count
    }
    const leadsByStatus = {
      NEW: leadsByStatusMap["NEW"] ?? 0,
      CONTACTED: leadsByStatusMap["CONTACTED"] ?? 0,
      QUALIFIED: leadsByStatusMap["QUALIFIED"] ?? 0,
      CONVERTED: leadsByStatusMap["CONVERTED"] ?? 0,
      LOST: leadsByStatusMap["LOST"] ?? 0,
    }

    const result = {
      kpis: {
        leadsActive,
        leadsNewThisWeek,
        leadsThisMonth,
        invoicedThisMonth,
        invoicedPrevMonth,
        pendingCobro: Number(invoicesPending._sum.total ?? 0),
        pendingCobroCount: invoicesPendingCount,
        tasksHighPriority: tasksHighPriority.length,
        tasksOverdue,
        invoicesOverdue,
        clientsActive,
      },
      leadsByStatus,
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
    }
    setCached(cacheKey, result, 60)
    return NextResponse.json(result)
  } catch (err) {
    console.error("[GET /api/dashboard/summary]:", err)
    return NextResponse.json({ error: "Error al cargar datos" }, { status: 500 })
  }
}
