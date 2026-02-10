import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getMovements } from "@/modules/finance/movements"
import type { MovementSortField, MovementSortDir } from "@/modules/finance/movements"

function getDateRange(period: string, startDate?: string | null, endDate?: string | null) {
  if (startDate && endDate) {
    return { from: new Date(startDate), to: new Date(endDate) }
  }
  const now = new Date()
  function endOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
  }
  switch (period) {
    case "week": {
      const from = new Date(now)
      from.setDate(from.getDate() - 6)
      from.setHours(0, 0, 0, 0)
      return { from, to: endOfDay(now) }
    }
    case "quarter": {
      const q = Math.floor(now.getMonth() / 3)
      const toDate = new Date(now.getFullYear(), q * 3 + 3, 0)
      return {
        from: new Date(now.getFullYear(), q * 3, 1),
        to: endOfDay(toDate),
      }
    }
    case "year":
      return {
        from: new Date(now.getFullYear(), 0, 1),
        to: endOfDay(new Date(now.getFullYear(), 11, 31)),
      }
    default:
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      }
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (typeof process !== "undefined") {
    console.log("SESSION USER:", session?.user?.id ?? null)
  }
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "month"
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const search = searchParams.get("search") ?? undefined
  const type = searchParams.get("type") as "income" | "expense" | null
  const status = searchParams.get("status") as "paid" | "pending" | null
  const originModule = searchParams.get("originModule") as "sale" | "purchase" | "invoice" | "manual" | "provider_order" | null
  const sortBy = (searchParams.get("sortBy") as MovementSortField) || "date"
  const sortDir = (searchParams.get("sortDir") as MovementSortDir) || "desc"

  const { from, to } = getDateRange(period, startDate, endDate)

  try {
    const movements = await getMovements({
      userId: session.user.id,
      from,
      to,
      search: search || undefined,
      filters: [type, status, originModule].some(Boolean)
        ? { type: type ?? undefined, status: status ?? undefined, originModule: originModule ?? undefined }
        : undefined,
      sortBy,
      sortDir,
    })
    if (typeof process !== "undefined") {
      console.log("API MOVEMENTS:", movements.length)
    }
    return NextResponse.json({
      success: true,
      movements,
      from: from.toISOString(),
      to: to.toISOString(),
    })
  } catch (error) {
    console.error("[ledger] Error getting movements:", error)
    return NextResponse.json(
      { success: false, movements: [], from: from.toISOString(), to: to.toISOString() },
      { status: 500 }
    )
  }
}
