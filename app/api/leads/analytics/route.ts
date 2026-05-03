export const maxDuration = 10
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getCachedData, setCachedData } from "@/lib/redis-cache"
import { format, subDays, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"

const FUNNEL: { status: string; label: string; color: string }[] = [
  { status: "NEW",        label: "Nuevos",       color: "#94A3B8" },
  { status: "CONTACTED",  label: "Contactados",  color: "#3B82F6" },
  { status: "INTERESTED", label: "Interesados",  color: "#F59E0B" },
  { status: "QUALIFIED",  label: "Cualificados", color: "#8B5CF6" },
  { status: "CONVERTED",  label: "Convertidos",  color: "#1FA97A" },
]
const TEMP_META: Record<string, { name: string; color: string }> = {
  HOT:  { name: "Caliente", color: "#EF4444" },
  WARM: { name: "Tibio",    color: "#F59E0B" },
  COLD: { name: "Frío",     color: "#94A3B8" },
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.user.id
    const cacheKey = `leads-analytics-${userId}`
    const cached = await getCachedData(cacheKey)
    if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } })

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = subDays(now, 29)
    const staleDate = weekAgo
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [all, stalled] = await Promise.all([
      prisma.lead.findMany({
        where: { userId },
        select: { leadStatus: true, temperature: true, source: true, createdAt: true, lastActionAt: true },
      }),
      prisma.lead.count({
        where: {
          userId,
          NOT: { leadStatus: { in: ["CONVERTED", "LOST"] } },
          OR: [
            { lastActionAt: { not: null, lt: staleDate } },
            { lastActionAt: null, createdAt: { lt: staleDate } },
          ],
        },
      }),
    ])

    const total = all.length
    const newThisWeek = all.filter(l => new Date(l.createdAt) >= weekAgo).length
    const converted = all.filter(l => l.leadStatus === "CONVERTED").length
    const lost = all.filter(l => l.leadStatus === "LOST").length
    const totalThisMonth = all.filter(l => new Date(l.createdAt) >= monthStart).length
    const convThisMonth = all.filter(l => l.leadStatus === "CONVERTED" && new Date(l.createdAt) >= monthStart).length
    const conversionRate = totalThisMonth > 0 ? Math.round((convThisMonth / totalThisMonth) * 100) : 0

    // Pipeline funnel
    const funnel = FUNNEL.map(f => ({
      label: f.label,
      value: all.filter(l => l.leadStatus === f.status).length,
      color: f.color,
    }))

    // Temperature distribution
    const tempMap = new Map<string, number>()
    all.filter(l => l.temperature).forEach(l => {
      const t = l.temperature as string
      tempMap.set(t, (tempMap.get(t) ?? 0) + 1)
    })
    const temperature = Array.from(tempMap.entries()).map(([k, v]) => ({
      name: TEMP_META[k]?.name ?? k,
      value: v,
      color: TEMP_META[k]?.color ?? "#94A3B8",
    }))

    // Daily trend last 30 days (every 3rd day)
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: now })
    const dayMap = new Map<string, number>()
    days.forEach(d => dayMap.set(format(d, "dd MMM", { locale: es }), 0))
    all.filter(l => new Date(l.createdAt) >= thirtyDaysAgo).forEach(l => {
      const key = format(new Date(l.createdAt), "dd MMM", { locale: es })
      if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) ?? 0) + 1)
    })
    const daily = Array.from(dayMap.entries())
      .map(([date, total]) => ({ date, total }))
      .filter((_, i) => i % 3 === 0 || i === days.length - 1)

    // Source breakdown (top 8)
    const srcMap = new Map<string, number>()
    all.forEach(l => {
      const s = l.source ?? "Directo"
      srcMap.set(s, (srcMap.get(s) ?? 0) + 1)
    })
    const bySrc = Array.from(srcMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)

    const result = { kpis: { total, newThisWeek, converted, conversionRate, stalled, lost }, funnel, temperature, daily, bySrc }
    await setCachedData(cacheKey, result, 60)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[api/leads/analytics] GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
