export const maxDuration = 10
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getAnalyticsPro } from "@/modules/analytics/services/analytics-pro-aggregator.service"
import type { AnalyticsPeriod } from "@/modules/analytics/types/analytics-pro.types"

/**
 * GET /api/analytics
 * Returns professional analytics data driven by backend logic.
 * Query param: ?period=7d|30d|90d|12m (default: 30d)
 */
export async function GET(request: NextRequest) {
 try {
 // 1. Validate session
 const session = await getServerSession(authOptions)
 if (!session?.user?.id) {
 return NextResponse.json(
 { success: false, error: "Unauthorized" },
 { status: 401 }
 )
 }

 // 2. Parse query parameters
 const { searchParams } = new URL(request.url)
 const period = (searchParams.get("period") || "30d") as AnalyticsPeriod

 // Validate period to prevent invalid inputs
 const validPeriods: AnalyticsPeriod[] = ["7d", "30d", "90d", "12m"]
 if (!validPeriods.includes(period)) {
 return NextResponse.json(
 { success: false, error: "Invalid period format. Use 7d, 30d, 90d or 12m" },
 { status: 400 }
 )
 }

 // 3. Call aggregator (multi-tenant isolated by userId)
 const data = await getAnalyticsPro(session.user.id, period)

 // 4. Return formatted response
 return NextResponse.json({
 success: true,
 data,
 metadata: {
 period,
 generatedAt: new Date().toISOString(),
 userId: session.user.id // verified server-side
 }
 })

 } catch (error) {
 console.error("[API_ANALYTICS_ERROR]", error)
 return NextResponse.json(
 { success: false, error: "Internal Server Error" },
 { status: 500 }
 )
 }
}
