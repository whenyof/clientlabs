import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUserId } from "@/app/api/tasks/utils"
import type { TaskPriorityParam, TaskStatusParam } from "@/app/api/tasks/utils"
import type { TaskType } from "@prisma/client"
import { recalculateClientStatus } from "@/modules/clients/actions"
import { enqueueTaskCalendarSync, enqueueTaskSyncForAllProviders } from "@/lib/calendar-sync"

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/tasks/[id]
 * Return a single task by id. Verifies task belongs to user.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const task = await prisma.task.findFirst({
      where: { id, userId },
      include: {
        Client: { select: { id: true, name: true } },
        Lead: { select: { id: true, name: true } },
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("[GET /api/tasks/[id]]:", error)
    return NextResponse.json(
      { error: "Failed to get task" },
      { status: 500 }
    )
  }
}

/** PATCH body: allow editing title, description, dueDate, startAt, endAt, priority, assignedToId, status, completedAt, estimatedMinutes, latitude, longitude, routeOrder */
export type UpdateTaskBody = {
  title?: string
  description?: string | null
  dueDate?: string | null
  startAt?: string | null
  endAt?: string | null
  priority?: TaskPriorityParam | null
  assignedToId?: string | null
  status?: TaskStatusParam | null
  completedAt?: Date | string | null
  type?: TaskType | null
  estimatedMinutes?: number | null
  latitude?: number | null
  longitude?: number | null
  routeOrder?: number | null
}

/**
 * PATCH /api/tasks/[id]
 * Update task. Verifies task belongs to user.
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = (await request.json()) as UpdateTaskBody

    const existing = await prisma.task.findFirst({
      where: { id, userId },
      select: { id: true, clientId: true },
    })
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const data: {
      title?: string
      description?: string | null
      dueDate?: Date | null
      startAt?: Date | null
      endAt?: Date | null
      priority?: TaskPriorityParam
      assignedTo?: string | null
      status?: TaskStatusParam
      completedAt?: Date | null
      type?: TaskType
      estimatedMinutes?: number | null
      latitude?: number | null
      longitude?: number | null
      routeOrder?: number | null
      updatedAt: Date
    } = { updatedAt: new Date() }

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || body.title.trim() === "") {
        return NextResponse.json(
          { error: "title must be a non-empty string" },
          { status: 400 }
        )
      }
      data.title = body.title.trim()
    }
    if (body.description !== undefined) data.description = body.description?.trim() ?? null
    if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null
    if (body.startAt !== undefined) data.startAt = body.startAt ? new Date(body.startAt) : null
    if (body.endAt !== undefined) data.endAt = body.endAt ? new Date(body.endAt) : null
    if (body.priority !== undefined) data.priority = (body.priority ?? "MEDIUM") as TaskPriorityParam
    if (body.assignedToId !== undefined) data.assignedTo = body.assignedToId ?? null
    if (body.status !== undefined) data.status = (body.status ?? "PENDING") as TaskStatusParam
    if (body.completedAt !== undefined) data.completedAt = body.completedAt ? new Date(body.completedAt) : null
    if (body.type !== undefined) data.type = (body.type ?? "MANUAL") as TaskType
    if (body.estimatedMinutes !== undefined) data.estimatedMinutes = body.estimatedMinutes ?? null
    if (body.latitude !== undefined) data.latitude = body.latitude ?? null
    if (body.longitude !== undefined) data.longitude = body.longitude ?? null
    if (body.routeOrder !== undefined) data.routeOrder = body.routeOrder ?? null

    const task = await prisma.task.update({
      where: { id },
      data,
      include: {
        Client: { select: { id: true, name: true } },
        Lead: { select: { id: true, name: true } },
      },
    })

    if (task.clientId) {
      await recalculateClientStatus(task.clientId)
    }

    enqueueTaskSyncForAllProviders(id, userId, "UPDATE").catch((err) =>
      console.error("[calendar-sync] enqueue update:", err)
    )

    return NextResponse.json(task)
  } catch (error) {
    console.error("[PATCH /api/tasks/[id]]:", error)
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tasks/[id]
 * Hard delete. Verifies task belongs to user.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const userId = await getSessionUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.task.findFirst({
      where: { id, userId },
      include: { calendarSyncs: true },
    })
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    for (const sync of existing.calendarSyncs) {
      enqueueTaskCalendarSync(id, userId, sync.provider, "DELETE", {
        externalEventId: sync.externalEventId,
      }).catch((err) => console.error("[calendar-sync] enqueue delete:", err))
    }

    await prisma.task.delete({ where: { id } })

    if (existing.clientId) {
      await recalculateClientStatus(existing.clientId)
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[DELETE /api/tasks/[id]]:", error)
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    )
  }
}
