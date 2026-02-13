/**
 * GET /api/invoicing/aging
 *
 * Query params:
 *   drilldown — "true" to include individual invoices grouped by bucket
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

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const drilldown = request.nextUrl.searchParams.get("drilldown") === "true"

    try {
        const report = drilldown
            ? await getAgingReportWithDrillDown(session.user.id)
            : await getAgingReport(session.user.id)

        return NextResponse.json({ success: true, ...report })
    } catch (e) {
        console.error("Aging report error:", e)
        return NextResponse.json(
            { error: "Failed to load aging report" },
            { status: 500 }
        )
    }
}
