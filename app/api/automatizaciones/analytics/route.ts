export const maxDuration = 10
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getCachedData, setCachedData } from "@/lib/redis-cache"
import { format, subDays, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.user.id
    const cacheKey = `automatizaciones-analytics-${userId}`
    const cached = await getCachedData(cacheKey)
    if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } })

    const now = new Date()
    const thirtyDaysAgo = subDays(now, 30)

    const autos = await prisma.automatizacion.findMany({
      where: { userId },
      select: { id: true, nombre: true, activa: true, vecesEjecutada: true },
    })

    const logs = await prisma.automatizacionLog.findMany({
      where: {
        automatizacion: { userId },
        ejecutadaEn: { gte: thirtyDaysAgo },
      },
      select: { ejecutadaEn: true, resultado: true },
    })

    const total = autos.length
    const active = autos.filter(a => a.activa).length
    const totalExecutions = autos.reduce((s, a) => s + a.vecesEjecutada, 0)
    const successLogs = logs.filter(l => l.resultado === "success" || l.resultado === "ok").length
    const successRate = logs.length > 0 ? Math.round((successLogs / logs.length) * 100) : 100

    // Executions per automation (top 8)
    const byAuto = autos
      .filter(a => a.vecesEjecutada > 0)
      .sort((a, b) => b.vecesEjecutada - a.vecesEjecutada)
      .slice(0, 8)
      .map(a => ({
        name: a.nombre.length > 16 ? a.nombre.slice(0, 16) + "…" : a.nombre,
        total: a.vecesEjecutada,
      }))

    // Activity last 14 days (every 2 days)
    const days = eachDayOfInterval({ start: subDays(now, 13), end: now })
    const dayMap = new Map<string, number>()
    days.forEach(d => dayMap.set(format(d, "dd MMM", { locale: es }), 0))
    logs.forEach(l => {
      const key = format(new Date(l.ejecutadaEn), "dd MMM", { locale: es })
      if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) ?? 0) + 1)
    })
    const activity = Array.from(dayMap.entries())
      .map(([date, total]) => ({ date, total }))
      .filter((_, i) => i % 2 === 0 || i === days.length - 1)

    // Results breakdown
    const resultMap = new Map<string, number>()
    logs.forEach(l => resultMap.set(l.resultado, (resultMap.get(l.resultado) ?? 0) + 1))
    const byResult = [
      { name: "Exitosa", value: successLogs, color: "#1FA97A" },
      { name: "Error", value: logs.length - successLogs, color: "#EF4444" },
    ].filter(r => r.value > 0)

    const result = { kpis: { total, active, totalExecutions, successRate }, byAuto, activity, byResult }
    await setCachedData(cacheKey, result, 60)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[api/automatizaciones/analytics] GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
