import { NextRequest, NextResponse } from "next/server"
import { getSessionUserId } from "@/app/api/tasks/utils"
import { getCalendarEvents } from "@/modules/calendar/services/calendar-events.service"

/**
 * GET /api/calendar/events?from=ISO&to=ISO
 * Devuelve tareas y recordatorios unificados (CalendarItem[]) para el usuario en el rango.
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

    if (!fromParam || !toParam) {
      return NextResponse.json(
        { error: "Query params 'from' and 'to' are required (ISO)" },
        { status: 400 }
      )
    }

    const from = new Date(fromParam)
    const to = new Date(toParam)
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
    }
    if (from > to) {
      return NextResponse.json({ error: "'from' must be before or equal to 'to'" }, { status: 400 })
    }

    const events = await getCalendarEvents(userId, from, to)
    return NextResponse.json(events)
  } catch (error) {
    console.error("[GET /api/calendar/events]:", error)
    return NextResponse.json(
      { error: "Failed to load calendar events" },
      { status: 500 }
    )
  }
}
