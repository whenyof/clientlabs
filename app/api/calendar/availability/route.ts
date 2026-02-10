import { NextRequest, NextResponse } from "next/server"
import { getSessionUserId } from "@/app/api/tasks/utils"
import { getUserAvailability } from "@/modules/calendar/services/availability.service"
import { startOfDay } from "date-fns"

/**
 * GET /api/calendar/availability?date=ISO&userId=
 * Devuelve bloques de disponibilidad (FREE | TASK | BLOCK | TIME_OFF) para un día.
 * - date: obligatorio (ISO date o datetime).
 * - userId: opcional; si no se envía se usa el usuario de la sesión.
 * Seguridad: solo se devuelven datos del usuario logueado (userId debe coincidir con sesión).
 */
export async function GET(request: NextRequest) {
  try {
    const sessionUserId = await getSessionUserId()
    if (!sessionUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")
    const userIdParam = searchParams.get("userId")

    if (!dateParam) {
      return NextResponse.json(
        { error: "Query param 'date' is required (ISO date)" },
        { status: 400 }
      )
    }

    const date = new Date(dateParam)
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      )
    }

    const userId = userIdParam ?? sessionUserId
    if (userId !== sessionUserId) {
      return NextResponse.json(
        { error: "Forbidden: can only request own availability" },
        { status: 403 }
      )
    }

    const blocks = await getUserAvailability({ userId, date: startOfDay(date) })

    const dateStr = date.toISOString().slice(0, 10)
    return NextResponse.json({
      userId,
      date: dateStr,
      blocks: blocks.map((b) => ({
        start: b.start.toISOString(),
        end: b.end.toISOString(),
        type: b.type,
        ...(b.taskId != null && { taskId: b.taskId }),
        ...(b.reason != null && { reason: b.reason }),
      })),
    })
  } catch (error) {
    console.error("[GET /api/calendar/availability]:", error)
    return NextResponse.json(
      { error: "Failed to get availability" },
      { status: 500 }
    )
  }
}
