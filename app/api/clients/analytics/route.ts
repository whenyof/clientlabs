export const maxDuration = 10
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getCachedData, setCachedData } from "@/lib/redis-cache"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"

const SRC_COLORS = ["#1FA97A", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#94A3B8"]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.user.id
    const cacheKey = `clients-analytics-${userId}`
    const cached = await getCachedData(cacheKey)
    if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } })

    const now = new Date()
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const all = await prisma.client.findMany({
      where: { userId },
      select: { id: true, name: true, createdAt: true, totalSpent: true, status: true, source: true, riskLevel: true },
    })

    const total = all.length
    const active = all.filter(c => c.status === "ACTIVE").length
    const newThisMonth = all.filter(c => new Date(c.createdAt) >= monthAgo).length
    const totalRevenue = all.reduce((s, c) => s + (c.totalSpent ?? 0), 0)
    const avgRevenue = total > 0 ? totalRevenue / total : 0

    // Monthly new clients (last 6 months)
    const byMonth = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i)
      const start = startOfMonth(d)
      const end = endOfMonth(d)
      const count = all.filter(c => new Date(c.createdAt) >= start && new Date(c.createdAt) <= end).length
      return { month: format(d, "MMM yy", { locale: es }), total: count }
    })

    // Top 5 clients by revenue
    const topClients = all
      .filter(c => (c.totalSpent ?? 0) > 0)
      .sort((a, b) => (b.totalSpent ?? 0) - (a.totalSpent ?? 0))
      .slice(0, 5)
      .map(c => ({
        name: (c.name ?? "Sin nombre").length > 18 ? (c.name ?? "Sin nombre").slice(0, 18) + "…" : (c.name ?? "Sin nombre"),
        revenue: c.totalSpent ?? 0,
      }))

    // Source breakdown
    const srcMap = new Map<string, number>()
    all.forEach(c => srcMap.set(c.source ?? "Directo", (srcMap.get(c.source ?? "Directo") ?? 0) + 1))
    const bySource = Array.from(srcMap.entries())
      .map(([name, value], i) => ({ name, value, color: SRC_COLORS[i % SRC_COLORS.length] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)

    // Risk level breakdown
    const riskMap = new Map<string, number>()
    all.forEach(c => riskMap.set(c.riskLevel ?? "LOW", (riskMap.get(c.riskLevel ?? "LOW") ?? 0) + 1))
    const RISK_META: Record<string, { label: string; color: string }> = {
      LOW:      { label: "Bajo",    color: "#1FA97A" },
      MEDIUM:   { label: "Medio",   color: "#F59E0B" },
      HIGH:     { label: "Alto",    color: "#EF4444" },
      CRITICAL: { label: "Crítico", color: "#7C3AED" },
    }
    const byRisk = Array.from(riskMap.entries()).map(([k, v]) => ({
      name: RISK_META[k]?.label ?? k,
      value: v,
      color: RISK_META[k]?.color ?? "#94A3B8",
    }))

    const result = { kpis: { total, active, newThisMonth, totalRevenue, avgRevenue }, byMonth, topClients, bySource, byRisk }
    await setCachedData(cacheKey, result, 60)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[api/clients/analytics] GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
