import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { detectSalesAnomalies } from "@/modules/sales/services/anomalyDetection"

/**
 * GET /api/sales/anomalies?from=ISO&to=ISO
 * Detecta anomalías en ventas para el usuario en sesión (reglas estadísticas, Prisma real).
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
    const anomalies = await detectSalesAnomalies(session.user.id, { from, to })
    return NextResponse.json(anomalies)
  } catch {
    return NextResponse.json(
      { error: "Failed to detect anomalies" },
      { status: 500 }
    )
  }
}
