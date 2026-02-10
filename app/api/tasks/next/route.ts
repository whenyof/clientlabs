import { NextResponse } from "next/server"
import { getSessionUserId } from "@/app/api/tasks/utils"
import { getNextActions } from "@/modules/tasks/services/next-actions.service"

/**
 * GET /api/tasks/next
 * Returns top 5 "what to do next" tasks: sorted by priority + urgency + revenue, shorter first.
 */
export async function GET() {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const items = await getNextActions(userId)
    return NextResponse.json(items)
  } catch (error) {
    console.error("[GET /api/tasks/next]:", error)
    return NextResponse.json(
      { error: "Failed to get next actions" },
      { status: 500 }
    )
  }
}
