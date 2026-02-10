import { NextRequest, NextResponse } from "next/server"
import { getSessionUserId } from "@/app/api/tasks/utils"
import { getMoneyOpportunity } from "@/modules/tasks/services/money-opportunity.service"

function addDays(d: Date, days: number): Date {
  const out = new Date(d)
  out.setDate(out.getDate() + days)
  return out
}

/**
 * GET /api/tasks/money-opportunity?from=ISO&to=ISO
 * Returns free minutes, jobs that fit, and potential revenue in the range.
 * Default range: next 7 days. Read-only.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")

    const now = new Date()
    const from = fromParam ? new Date(fromParam) : now
    const to = toParam ? new Date(toParam) : addDays(now, 7)

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
      return NextResponse.json(
        { error: "Invalid from/to (use ISO dates, from <= to)" },
        { status: 400 }
      )
    }

    const result = await getMoneyOpportunity(userId, from, to)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[GET /api/tasks/money-opportunity]:", error)
    return NextResponse.json(
      { error: "Failed to compute money opportunity" },
      { status: 500 }
    )
  }
}
