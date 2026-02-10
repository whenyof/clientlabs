import { NextRequest, NextResponse } from "next/server"
import { getSessionUserId } from "@/app/api/tasks/utils"
import { getSmartSlots } from "@/modules/calendar/services/smart-slots.service"
import { startOfDay } from "date-fns"

/**
 * GET /api/calendar/smart-slots?date=ISO&duration=minutes
 * Devuelve los mejores huecos para colocar una tarea (top 10 por score).
 * Solo usuario autenticado; fecha y duración obligatorios.
 */
export async function GET(request: NextRequest) {
  try {
    const sessionUserId = await getSessionUserId()
    if (!sessionUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")
    const durationParam = searchParams.get("duration")

    if (!dateParam) {
      return NextResponse.json(
        { error: "Query param 'date' is required (ISO date)" },
        { status: 400 }
      )
    }
    const date = new Date(dateParam)
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
    }

    const durationMinutes = durationParam ? parseInt(durationParam, 10) : 30
    if (Number.isNaN(durationMinutes) || durationMinutes < 1 || durationMinutes > 480) {
      return NextResponse.json(
        { error: "Query param 'duration' must be between 1 and 480 (minutes)" },
        { status: 400 }
      )
    }

    const slots = await getSmartSlots({
      userId: sessionUserId,
      date: startOfDay(date),
      durationMinutes,
    })

    return NextResponse.json(
      slots.map((s) => ({
        start: s.start.toISOString(),
        end: s.end.toISOString(),
        score: s.score,
      }))
    )
  } catch (error) {
    console.error("[GET /api/calendar/smart-slots]:", error)
    return NextResponse.json(
      { error: "Failed to get smart slots" },
      { status: 500 }
    )
  }
}
