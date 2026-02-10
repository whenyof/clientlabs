import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getSalesComparisons } from "@/modules/sales/services/salesAnalytics"

/**
 * GET /api/sales/comparisons?from=ISO&to=ISO
 * Devuelve comparativas del motor central (actual, anterior, YoY) para el usuario en sesión.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")
    if (!fromParam || !toParam) {
      return NextResponse.json(
        { error: "Query params from and to (ISO dates) required" },
        { status: 400 }
      )
    }
    const from = new Date(fromParam)
    const to = new Date(toParam)
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
      return NextResponse.json({ error: "Invalid from or to" }, { status: 400 })
    }
    const comparisons = await getSalesComparisons({
      userId: session.user.id,
      from,
      to,
    })
    return NextResponse.json(comparisons)
  } catch {
    return NextResponse.json(
      { error: "Failed to load comparisons" },
      { status: 500 }
    )
  }
}
