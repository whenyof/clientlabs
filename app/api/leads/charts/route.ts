export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { format, subDays, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    )
  }

  const userId = session.user.id
  const now = new Date()
  const thirtyDaysAgo = subDays(now, 30)

  // Leads de los últimos 30 días
  const leads = await prisma.lead.findMany({
    where: {
      userId,
      createdAt: { gte: thirtyDaysAgo },
    },
    select: {
      createdAt: true,
      leadStatus: true,
    }
  })

  // Todos los leads para el donut
  const allLeads = await prisma.lead.findMany({
    where: {
      userId,
    },
    select: { leadStatus: true }
  })

  // ── Datos diarios ──
  const days = eachDayOfInterval({
    start: thirtyDaysAgo,
    end: now,
  })

  const dailyMap = new Map<string, number>()
  days.forEach(day => {
    const key = format(day, "dd MMM", { locale: es })
    dailyMap.set(key, 0)
  })

  leads.forEach(lead => {
    const key = format(
      new Date(lead.createdAt),
      "dd MMM",
      { locale: es }
    )
    if (dailyMap.has(key)) {
      dailyMap.set(key, (dailyMap.get(key) || 0) + 1)
    }
  })

  // Mostrar solo cada 3 días para no saturar
  const dailyArray = Array.from(
    dailyMap.entries()
  ).map(([date, total]) => ({ date, total }))

  const dailyFiltered = dailyArray.filter(
    (_, i) => i % 3 === 0 || i === dailyArray.length - 1
  )

  // ── Datos por estado ──
  const statusMap = new Map<string, number>()
  allLeads.forEach(lead => {
    const s = lead.leadStatus
    statusMap.set(s, (statusMap.get(s) || 0) + 1)
  })

  const STATUS_COLORS: Record<string, string> = {
    NEW:       "#1FA97A",
    CONTACTED: "#3B82F6",
    QUALIFIED: "#D9A441",
    CONVERTED: "#8B5CF6",
    LOST:      "#EF4444",
  }

  const STATUS_LABELS: Record<string, string> = {
    NEW:       "Nuevo",
    CONTACTED: "Contactado",
    QUALIFIED: "Cualificado",
    CONVERTED: "Convertido",
    LOST:      "Perdido",
  }

  const byStatus = Array.from(statusMap.entries())
    .map(([status, value]) => ({
      name: STATUS_LABELS[status] || status,
      value,
      color: STATUS_COLORS[status] || "#9CA3AF",
    }))
    .filter(s => s.value > 0)
    .sort((a, b) => b.value - a.value)

  return NextResponse.json({
    daily: dailyFiltered,
    byStatus,
  })
}
