import type { Prisma, PrismaClient } from "@prisma/client"
import type { Task, Client, Lead } from "@prisma/client"

/** Prisma client shape used by calendar helpers (task.findMany). */
type PrismaLike = Pick<PrismaClient, "task">

/**
 * Task with optional Client/Lead for calendar list. Matches Prisma findMany include.
 */
export type TaskWithRelations = Task & {
  Client?: Pick<Client, "id" | "name"> | null
  Lead?: Pick<Lead, "id" | "name"> | null
}

/**
 * Calendar-optimized DTO. No Prisma types in API response; ready for UI or external consumers.
 */
export type CalendarTaskDTO = {
  id: string
  title: string
  dueDate: string | null
  startAt: string | null
  endAt: string | null
  estimatedMinutes: number | null
  status: string
  priority: string
  assignedTo: string | null
  clientId: string | null
  leadId: string | null
  clientName: string | null
  leadName: string | null
}

/** Build where clause: tasks visible in [from, to] (dueDate in range or startAt/endAt overlap). */
export function buildCalendarRangeWhere(
  userId: string,
  from: Date,
  to: Date
): Prisma.TaskWhereInput {
  const toEnd = new Date(to)
  toEnd.setHours(23, 59, 59, 999)
  return {
    userId,
    OR: [
      { dueDate: { gte: from, lte: toEnd } },
      {
        startAt: { not: null, lte: toEnd },
        OR: [{ endAt: { gte: from } }, { endAt: null }],
      },
    ],
  }
}

/**
 * Fetch tasks in date range for calendar. Uses dueDate-in-range or startAt/endAt overlap.
 */
export async function getTasksInDateRange(
  prisma: PrismaLike,
  userId: string,
  from: Date,
  to: Date
): Promise<TaskWithRelations[]> {
  const where = buildCalendarRangeWhere(userId, from, to)
  const rows = await prisma.task.findMany({
    where,
    orderBy: [
      { dueDate: { sort: "asc", nulls: "last" } },
      { startAt: { sort: "asc", nulls: "last" } },
      { routeOrder: { sort: "asc", nulls: "last" } },
    ],
    include: {
      Client: { select: { id: true, name: true } },
      Lead: { select: { id: true, name: true } },
    },
  })
  return rows as TaskWithRelations[]
}

/**
 * Group tasks by assignee (assignedTo or "unassigned"). Keys are assignee ids.
 */
export function groupTasksByAssignedTo(
  tasks: TaskWithRelations[]
): Record<string, TaskWithRelations[]> {
  const map: Record<string, TaskWithRelations[]> = {}
  for (const t of tasks) {
    const key = t.assignedTo ?? "unassigned"
    if (!map[key]) map[key] = []
    map[key].push(t)
  }
  return map
}

/**
 * Map a task with relations to calendar DTO. ISO dates for JSON; no Prisma types.
 */
export function mapTaskToCalendarDTO(task: TaskWithRelations): CalendarTaskDTO {
  return {
    id: task.id,
    title: task.title,
    dueDate: task.dueDate?.toISOString() ?? null,
    startAt: task.startAt?.toISOString() ?? null,
    endAt: task.endAt?.toISOString() ?? null,
    estimatedMinutes: task.estimatedMinutes ?? null,
    status: task.status,
    priority: task.priority,
    assignedTo: task.assignedTo ?? null,
    clientId: task.clientId ?? null,
    leadId: task.leadId ?? null,
    clientName: task.Client?.name ?? null,
    leadName: task.Lead?.name ?? null,
  }
}

/**
 * Fetch tasks in range and return calendar DTOs. Single entry point for API.
 */
export async function getCalendarTasks(
  prisma: PrismaLike,
  userId: string,
  from: Date,
  to: Date
): Promise<CalendarTaskDTO[]> {
  const tasks = await getTasksInDateRange(prisma, userId, from, to)
  return tasks.map(mapTaskToCalendarDTO)
}
