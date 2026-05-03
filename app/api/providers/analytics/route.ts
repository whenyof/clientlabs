export const maxDuration = 10
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getCachedData, setCachedData } from "@/lib/redis-cache"

const DEP_META: Record<string, { label: string; color: string }> = {
  LOW:      { label: "Bajo",    color: "#1FA97A" },
  MEDIUM:   { label: "Medio",   color: "#F59E0B" },
  HIGH:     { label: "Alto",    color: "#EF4444" },
  CRITICAL: { label: "Crítico", color: "#7C3AED" },
}
const OPS_META: Record<string, { label: string; color: string }> = {
  OK:        { label: "Operativo",  color: "#1FA97A" },
  ATTENTION: { label: "Atención",   color: "#F59E0B" },
  RISK:      { label: "En riesgo",  color: "#EF4444" },
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.user.id
    const cacheKey = `providers-analytics-${userId}`
    const cached = await getCachedData(cacheKey)
    if (cached) return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } })

    const providers = await prisma.provider.findMany({
      where: { userId },
      select: { name: true, status: true, monthlyCost: true, isCritical: true, dependencyLevel: true, operationalState: true },
    })

    const total = providers.length
    const active = providers.filter(p => p.status === "ACTIVE").length
    const critical = providers.filter(p => p.isCritical).length
    const atRisk = providers.filter(p => p.operationalState === "RISK").length
    const totalMonthlyCost = providers.reduce((s, p) => s + (p.monthlyCost ?? 0), 0)

    // Top 8 providers by cost
    const byCost = providers
      .filter(p => (p.monthlyCost ?? 0) > 0)
      .sort((a, b) => (b.monthlyCost ?? 0) - (a.monthlyCost ?? 0))
      .slice(0, 8)
      .map(p => ({
        name: (p.name ?? "").length > 16 ? (p.name ?? "").slice(0, 16) + "…" : (p.name ?? ""),
        cost: p.monthlyCost ?? 0,
        critical: p.isCritical,
      }))

    // Dependency level breakdown
    const depMap = new Map<string, number>()
    providers.forEach(p => depMap.set(p.dependencyLevel ?? "LOW", (depMap.get(p.dependencyLevel ?? "LOW") ?? 0) + 1))
    const byDependency = Array.from(depMap.entries()).map(([k, v]) => ({
      name: DEP_META[k]?.label ?? k,
      value: v,
      color: DEP_META[k]?.color ?? "#94A3B8",
    }))

    // Operational state breakdown
    const opsMap = new Map<string, number>()
    providers.forEach(p => opsMap.set(p.operationalState ?? "OK", (opsMap.get(p.operationalState ?? "OK") ?? 0) + 1))
    const byOperationalState = Array.from(opsMap.entries()).map(([k, v]) => ({
      key: k,
      name: OPS_META[k]?.label ?? k,
      value: v,
      color: OPS_META[k]?.color ?? "#94A3B8",
    }))

    const result = { kpis: { total, active, critical, atRisk, totalMonthlyCost }, byCost, byDependency, byOperationalState }
    await setCachedData(cacheKey, result, 60)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[api/providers/analytics] GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
