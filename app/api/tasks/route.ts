import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const maxDuration = 30
import { prisma } from "@/lib/prisma"
import { invalidateCache } from "@/lib/cache"
import {
 getSessionUserId,
 buildTaskWhere,
 mapEntityToTaskFields,
 generateTaskId,
 type TaskEntityType,
 type TaskPriorityParam,
} from "@/app/api/tasks/utils"
import { recalculateClientStatus } from "@/modules/clients/actions"
import { enqueueTaskSyncForAllProviders } from "@/lib/calendar-sync"
import { syncTaskToGoogle } from "@/lib/google-calendar"
import { notifyTaskCreated } from "@/lib/notification-service"

/**
 * GET /api/tasks
 * List tasks for the logged-in user.
 * Query: status, priority, from, to, assignedTo, entityType, entityId
 */
export async function GET(request: NextRequest) {
 console.warn("[api/tasks] GET handler invoked")
 try {
 const userId = await getSessionUserId()
 console.warn("[api/tasks] userId:", userId ?? "NULL")
 if (!userId) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
 }

 const { searchParams } = new URL(request.url)
 const where = buildTaskWhere(userId, {
 status: searchParams.get("status"),
 priority: searchParams.get("priority"),
 from: searchParams.get("from"),
 to: searchParams.get("to"),
 assignedTo: searchParams.get("assignedTo"),
 entityType: searchParams.get("entityType"),
 entityId: searchParams.get("entityId"),
 })

 const tasks = await prisma.task.findMany({
 where,
 orderBy: [
 { dueDate: { sort: "asc", nulls: "last" } },
 { routeOrder: { sort: "asc", nulls: "last" } },
 { createdAt: "desc" },
 ],
 include: {
 Client: { select: { id: true, name: true } },
 Lead: { select: { id: true, name: true } },
 },
 })

 return NextResponse.json(tasks)
 } catch (error) {
 console.error("[GET /api/tasks]:", error)
 return NextResponse.json(
 { error: "Failed to list tasks" },
 { status: 500 }
 )
 }
}

/** Request body for creating a task */
export type CreateTaskBody = {
 title: string
 description?: string | null
 dueDate?: string | null
 startAt?: string | null
 endAt?: string | null
 estimatedMinutes?: number | null
 priority?: TaskPriorityParam | null
 assignedToId?: string | null
 entityType?: TaskEntityType | null
 entityId?: string | null
}

/**
 * POST /api/tasks
 * Create a new task. Always scoped to session user.
 */
export async function POST(request: NextRequest) {
 console.warn("[api/tasks] POST handler invoked")
 try {
 const userId = await getSessionUserId()
 console.warn("[api/tasks] POST userId:", userId ?? "NULL")
 if (!userId) {
 return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
 }

 const body = (await request.json()) as CreateTaskBody
 const {
 title,
 description,
 dueDate,
 startAt,
 endAt,
 estimatedMinutes,
 priority,
 assignedToId,
 entityType,
 entityId,
 } = body

 let resolvedStartAt: Date | null = startAt ? new Date(startAt) : null
 let resolvedEndAt: Date | null = endAt ? new Date(endAt) : null
 if (resolvedStartAt && estimatedMinutes != null && estimatedMinutes > 0 && !resolvedEndAt) {
 resolvedEndAt = new Date(resolvedStartAt.getTime() + estimatedMinutes * 60 * 1000)
 }

 if (!title || typeof title !== "string" || title.trim() === "") {
 return NextResponse.json(
 { error: "title is required and must be a non-empty string" },
 { status: 400 }
 )
 }

 const entity = mapEntityToTaskFields(entityType, entityId)

 const task = await prisma.task.create({
 data: {
 id: generateTaskId(),
 userId,
 title: title.trim(),
 description: description?.trim() ?? null,
 status: "PENDING",
 priority: (priority ?? "MEDIUM") as TaskPriorityParam,
 type: "MANUAL",
 dueDate: dueDate ? new Date(dueDate) : null,
 startAt: resolvedStartAt,
 endAt: resolvedEndAt,
 estimatedMinutes: estimatedMinutes ?? null,
 assignedTo: assignedToId ?? null,
 leadId: entity.leadId ?? null,
 clientId: entity.clientId ?? null,
 sourceModule: entity.sourceModule ?? null,
 sourceId: entity.sourceId ?? null,
 updatedAt: new Date(),
 },
 include: {
 Client: { select: { id: true, name: true } },
 Lead: { select: { id: true, name: true } },
 },
 })

 if (task.clientId) {
 await recalculateClientStatus(task.clientId)
 }

 // Create a lead activity so the task appears in the lead timeline (awaited so timeline re-fetch sees it)
 if (entityType === "LEAD" && entityId) {
   await prisma.activity.create({
     data: {
       userId,
       leadId: entityId,
       type: "TASK",
       title: `Nueva tarea: ${title.trim()}`,
       description: null,
       metadata: { taskId: task.id },
     },
   }).catch(err => console.error("[tasks/route] lead activity create:", err))
 }

 enqueueTaskSyncForAllProviders(task.id, userId, "CREATE").catch((err) =>
 console.error("[calendar-sync] enqueue create:", err)
 )
 syncTaskToGoogle(userId, {
   id: task.id,
   title: task.title,
   description: task.description,
   dueDate: task.dueDate?.toISOString() ?? null,
   startAt: task.startAt?.toISOString() ?? null,
   endAt: task.endAt?.toISOString() ?? null,
 }).catch((err) => console.error("[google-calendar] sync create:", err))

 invalidateCache(`tasks-kpis-${userId}`)
 invalidateCache(`dashboard-summary-${userId}`)
 notifyTaskCreated(userId, task.title, task.id).catch(() => {})
 return NextResponse.json(task, { status: 201 })
 } catch (error) {
 console.error("[POST /api/tasks]:", error)
 return NextResponse.json(
 { error: "Failed to create task" },
 { status: 500 }
 )
 }
}
