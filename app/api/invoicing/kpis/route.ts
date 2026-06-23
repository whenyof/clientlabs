export const maxDuration = 10
/**
 * GET /api/invoicing/kpis
 *
 * Query params:
 *   period  — "month" | "quarter" | "year" | "custom"  (default "month")
 *   from    — ISO date (required for custom)
 *   to      — ISO date (required for custom)
 *
 * Returns executive financial KPIs computed via aggregation queries.
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getExecutiveKPIs, type KPIPeriod, type KPITimeFilter } from "@/modules/invoicing/services/kpi.service"
import { getUserWorkspace } from "@/lib/get-workspace"
import { checkPermission } from "@/lib/check-permission"
import { aggKey, getCachedData, setCachedData, AGG_TTL } from "@/lib/cache/aggregates"

const VALID_PERIODS = new Set<KPIPeriod>(["month", "quarter", "year", "custom"])

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const wsResult = await getUserWorkspace(session.user.id)
  if (wsResult && wsResult.role !== "OWNER") {
    const allowed = await checkPermission(session.user.id, wsResult.workspace.id, "viewReports")
    if (!allowed) {
      return NextResponse.json({ error: "Sin permisos para ver informes", upgradeUrl: "/precios" }, { status: 403 })
    }
  }

  const { searchParams } = request.nextUrl
  const rawPeriod = searchParams.get("period") ?? "month"
  const period = VALID_PERIODS.has(rawPeriod as KPIPeriod) ? (rawPeriod as KPIPeriod) : "month"

  const filter: KPITimeFilter = {
    period,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  }

  if (period === "custom" && (!filter.from || !filter.to)) {
    return NextResponse.json(
      { error: "Custom period requires 'from' and 'to' query parameters" },
      { status: 400 }
    )
  }

  const cacheKey = aggKey(session.user.id, "inv-kpis", [period, filter.from, filter.to])

  try {
    const cached = await getCachedData(cacheKey)
    if (cached) return NextResponse.json(cached)

    const kpis = await getExecutiveKPIs(session.user.id, filter)
    const payload = {
      success: true,
      kpis,
      period,
      range: {
        from: filter.from ?? null,
        to: filter.to ?? null,
      },
    }
    await setCachedData(cacheKey, payload, AGG_TTL)
    return NextResponse.json(payload)
  } catch (e) {
    console.error("Invoicing KPIs error:", e)
    return NextResponse.json({ error: "Failed to load KPIs" }, { status: 500 })
  }
}
