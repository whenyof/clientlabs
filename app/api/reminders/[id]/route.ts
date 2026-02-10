import { NextRequest, NextResponse } from "next/server"
import { getSessionUserId } from "@/app/api/tasks/utils"
import { prisma } from "@/lib/prisma"

/**
 * PATCH /api/reminders/:id
 * Marcar completado (status: DONE) o reprogramar (start, end).
 * Solo el dueño del recordatorio.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const { status, start, end } = body as {
      status?: string
      start?: string
      end?: string
    }

    const reminder = await prisma.reminder.findFirst({
      where: { id, userId },
    })
    if (!reminder) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 })
    }

    const update: { status?: "PENDING" | "DONE"; start?: Date; end?: Date } = {}
    if (status === "DONE" || status === "PENDING") {
      update.status = status
    }
    if (typeof start === "string") {
      const d = new Date(start)
      if (!Number.isNaN(d.getTime())) update.start = d
    }
    if (typeof end === "string") {
      const d = new Date(end)
      if (!Number.isNaN(d.getTime())) update.end = d
    }

    const updated = await prisma.reminder.update({
      where: { id },
      data: update,
    })

    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      start: updated.start.toISOString(),
      end: updated.end.toISOString(),
      status: updated.status,
    })
  } catch (error) {
    console.error("[PATCH /api/reminders/:id]:", error)
    return NextResponse.json(
      { error: "Failed to update reminder" },
      { status: 500 }
    )
  }
}
