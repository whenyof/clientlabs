import { NextRequest, NextResponse } from "next/server"
import { getSessionUserId } from "@/app/api/tasks/utils"
import { getCalendarTasks } from "@/modules/tasks/services/getCalendarTasks"

/**
 * GET /api/tasks/calendar?from=ISO&to=ISO
 * Returns tasks in the given date range as calendar events (normalized start/end).
 * - Validates session (401 if not authenticated).
 * - Validates from/to (400 if missing or invalid).
 * - Fetches user tasks in range with Client/Lead, maps via mapTaskToCalendarEvent.
 * - Response: array of { id, title, start, end, status, priority, assignedTo?, clientName?, leadName? } (start/end as ISO strings).
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
        { error: "Query params 'from' and 'to' are required (ISO date or datetime)" },
        { status: 400 }
      )
    }

    const from = new Date(fromParam)
    const to = new Date(toParam)
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format for 'from' or 'to'" },
        { status: 400 }
      )
    }
    if (from > to) {
      return NextResponse.json(
        { error: "'from' must be before or equal to 'to'" },
        { status: 400 }
      )
    }

    const events = await getCalendarTasks(userId, from, to)
    return NextResponse.json(events)
  } catch (error) {
    console.error("[GET /api/tasks/calendar]:", error)
    return NextResponse.json(
      { error: "Failed to load calendar tasks" },
      { status: 500 }
    )
  }
}
