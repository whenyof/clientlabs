import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getUnifiedMovements } from "@/modules/finance/finance-engine"

function getDateRange(period: string, startDate?: string | null, endDate?: string | null) {
  if (startDate && endDate) {
    return { from: new Date(startDate), to: new Date(endDate) }
  }
  const now = new Date()
  switch (period) {
    case "quarter": {
      const q = Math.floor(now.getMonth() / 3)
      return {
        from: new Date(now.getFullYear(), q * 3, 1),
        to: new Date(now.getFullYear(), q * 3 + 3, 0),
      }
    }
    case "year":
      return {
        from: new Date(now.getFullYear(), 0, 1),
        to: new Date(now.getFullYear(), 11, 31),
      }
    default:
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      }
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "month"
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const { from, to } = getDateRange(period, startDate, endDate)

  try {
    const movements = await getUnifiedMovements(session.user.id, from, to)
    return NextResponse.json({
      success: true,
      movements: movements.map((m) => ({
        ...m,
        date: m.date.toISOString(),
      })),
      from: from.toISOString(),
      to: to.toISOString(),
    })
  } catch (error) {
    console.error("Error getting movements:", error)
    return NextResponse.json({ success: true, movements: [], from: from.toISOString(), to: to.toISOString() })
  }
}
