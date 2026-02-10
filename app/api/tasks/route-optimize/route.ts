import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/app/api/tasks/utils"
import { startOfDay, endOfDay } from "date-fns"
import { optimizeRoute } from "@/modules/tasks/lib/routeOptimizer"

/**
 * POST /api/tasks/route-optimize
 * Body: { date: string (YYYY-MM-DD), baseLat?: number, baseLng?: number, speedKmh?: number }
 * Returns: { orderedTaskIds: string[], estimatedTravelMinutes: number }
 * Only includes tasks with coordinates for that day.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as {
      date?: string
      baseLat?: number
      baseLng?: number
      speedKmh?: number
    }
    const dateStr = body.date
    if (!dateStr) {
      return NextResponse.json(
        { error: "date (YYYY-MM-DD) is required" },
        { status: 400 }
      )
    }
    const day = startOfDay(new Date(dateStr))
    const dayEnd = endOfDay(day)
    const base =
      body.baseLat != null &&
      body.baseLng != null &&
      Number.isFinite(body.baseLat) &&
      Number.isFinite(body.baseLng)
        ? { lat: body.baseLat, lng: body.baseLng }
        : null
    const speedKmh =
      body.speedKmh != null && Number.isFinite(body.speedKmh) && body.speedKmh > 0
        ? body.speedKmh
        : undefined

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        status: "PENDING",
        dueDate: { gte: day, lte: dayEnd },
        latitude: { not: null },
        longitude: { not: null },
      },
      select: { id: true, latitude: true, longitude: true },
    })

    const result = optimizeRoute(
      tasks as { id: string; latitude: number | null; longitude: number | null }[],
      base,
      speedKmh
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("[POST /api/tasks/route-optimize]:", error)
    return NextResponse.json(
      { error: "Failed to optimize route" },
      { status: 500 }
    )
  }
}
