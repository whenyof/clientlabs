import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { calculateSalesForecast } from "@/modules/sales/lib/forecast"

/**
 * GET /api/sales/forecast
 * Returns real forecast (historical + pipeline + trend) for the current user.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const forecast = await calculateSalesForecast(session.user.id)
    return NextResponse.json(forecast)
  } catch (error) {
    console.error("[sales/forecast]", error)
    return NextResponse.json(
      { error: "Failed to compute forecast" },
      { status: 500 }
    )
  }
}
