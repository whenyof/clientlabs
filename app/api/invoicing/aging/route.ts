export const maxDuration = 10
/**
 * GET /api/invoicing/aging
 *
 * Query params:
 * drilldown — "true" to include individual invoices grouped by bucket
 *
 * Returns Accounts Receivable Aging Report computed via DB aggregation.
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
 getAgingReport,
 getAgingReportWithDrillDown,
} from "@/modules/invoicing/services/aging.service"
import { aggKey, getCachedData, setCachedData, AGG_TTL } from "@/lib/cache/aggregates"

export async function GET(request: NextRequest) {
 const session = await getServerSession(authOptions)
 if (!session?.user?.id) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
 }

 const drilldown = request.nextUrl.searchParams.get("drilldown") === "true"
 const cacheKey = aggKey(session.user.id, "inv-aging", [drilldown ? "1" : "0"])

 try {
 const cached = await getCachedData(cacheKey)
 if (cached) return NextResponse.json(cached)

 const report = drilldown
 ? await getAgingReportWithDrillDown(session.user.id)
 : await getAgingReport(session.user.id)

 const payload = { success: true, ...report }
 await setCachedData(cacheKey, payload, AGG_TTL)
 return NextResponse.json(payload)
 } catch (e) {
 console.error("Aging report error:", e)
 return NextResponse.json(
 { error: "Failed to load aging report" },
 { status: 500 }
 )
 }
}
