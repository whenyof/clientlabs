import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { buildClientPredictions } from "@/modules/sales/services/clientPredictions"

/**
 * GET /api/sales/client-predictions
 * Segmentación de clientes (VIP, Leal, Oportunidad, Riesgo, Perdido) para el usuario en sesión.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const predictions = await buildClientPredictions(session.user.id)
    return NextResponse.json(predictions)
  } catch {
    return NextResponse.json(
      { error: "Failed to load client predictions" },
      { status: 500 }
    )
  }
}
