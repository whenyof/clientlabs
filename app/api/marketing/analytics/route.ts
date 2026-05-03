export const maxDuration = 10
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getCachedData, setCachedData } from "@/lib/redis-cache"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.user.id
    const cacheKey = `marketing-analytics-${userId}`
    const cached = await getCachedData(cacheKey)
    if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } })

    const editions = await prisma.newsletterEdicion.findMany({
      where: { userId },
      select: { titulo: true, estado: true, totalEnviados: true, totalAbiertos: true, totalClicks: true, enviadaEn: true },
      orderBy: { enviadaEn: "desc" },
    })

    const total = editions.length
    const sent = editions.filter(e => e.estado === "enviada").length
    const totalSent = editions.reduce((s, e) => s + e.totalEnviados, 0)

    const sentEditions = editions.filter(e => e.totalEnviados > 0)
    const avgOpenRate = sentEditions.length > 0
      ? Math.round(sentEditions.reduce((s, e) => s + (e.totalAbiertos / e.totalEnviados) * 100, 0) / sentEditions.length)
      : 0
    const avgClickRate = sentEditions.length > 0
      ? Math.round(sentEditions.reduce((s, e) => s + (e.totalClicks / e.totalEnviados) * 100, 0) / sentEditions.length)
      : 0

    // Last 6 sent editions: open + click rate
    const byEdition = editions
      .filter(e => e.estado === "enviada" && e.totalEnviados > 0)
      .slice(0, 6)
      .reverse()
      .map(e => ({
        name: e.titulo.length > 14 ? e.titulo.slice(0, 14) + "…" : e.titulo,
        apertura: Math.round((e.totalAbiertos / e.totalEnviados) * 100),
        clicks: Math.round((e.totalClicks / e.totalEnviados) * 100),
      }))

    // Status breakdown
    const statusMap = new Map<string, number>()
    editions.forEach(e => statusMap.set(e.estado, (statusMap.get(e.estado) ?? 0) + 1))
    const STATUS_LABELS: Record<string, string> = { enviada: "Enviada", borrador: "Borrador", programada: "Programada" }
    const STATUS_COLORS: Record<string, string> = { enviada: "#1FA97A", borrador: "#94A3B8", programada: "#3B82F6" }
    const byStatus = Array.from(statusMap.entries()).map(([estado, value]) => ({
      name: STATUS_LABELS[estado] ?? estado,
      value,
      color: STATUS_COLORS[estado] ?? "#94A3B8",
    }))

    const result = { kpis: { total, sent, totalSent, avgOpenRate, avgClickRate }, byEdition, byStatus }
    await setCachedData(cacheKey, result, 60)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[api/marketing/analytics] GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
