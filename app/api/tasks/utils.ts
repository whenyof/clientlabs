import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { Prisma } from "@prisma/client"

export type TaskEntityType = "LEAD" | "CLIENT" | "PROVIDER" | "SALE"
export type TaskPriorityParam = "LOW" | "MEDIUM" | "HIGH"
export type TaskStatusParam = "PENDING" | "DONE" | "CANCELLED"

/** Returns current user id or null. Use for 401 when null. */
export async function getSessionUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return session?.user?.id ?? null
}

/** Build Prisma where clause for Task list from searchParams. Always scoped by userId. */
export function buildTaskWhere(
  userId: string,
  params: {
    status?: string | null
    priority?: string | null
    from?: string | null
    to?: string | null
    assignedTo?: string | null
    entityType?: string | null
    entityId?: string | null
  }
): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = { userId }

  if (params.status && params.status !== "all") {
    where.status = params.status as TaskStatusParam
  }
  if (params.priority && params.priority !== "all") {
    where.priority = params.priority as TaskPriorityParam
  }
  if (params.from || params.to) {
    where.dueDate = {}
    if (params.from) where.dueDate.gte = new Date(params.from)
    if (params.to) {
      const to = new Date(params.to)
      to.setHours(23, 59, 59, 999)
      where.dueDate.lte = to
    }
  }
  if (params.assignedTo != null && params.assignedTo !== "") {
    where.assignedTo = params.assignedTo
  }
  if (params.entityType && params.entityId) {
    const et = params.entityType.toUpperCase()
    if (et === "LEAD") where.leadId = params.entityId
    else if (et === "CLIENT") where.clientId = params.entityId
    else if (et === "PROVIDER" || et === "SALE") {
      where.sourceModule = et
      where.sourceId = params.entityId
    }
  }

  return where
}

/** Map entityType + entityId to Task create data (leadId, clientId, sourceModule, sourceId). */
export function mapEntityToTaskFields(
  entityType: TaskEntityType | null | undefined,
  entityId: string | null | undefined
): {
  leadId?: string | null
  clientId?: string | null
  sourceModule?: string | null
  sourceId?: string | null
} {
  if (!entityType || !entityId) return {}
  const et = entityType.toUpperCase()
  if (et === "LEAD") return { leadId: entityId, clientId: null, sourceModule: "LEAD", sourceId: entityId }
  if (et === "CLIENT") return { clientId: entityId, leadId: null, sourceModule: "CLIENT", sourceId: entityId }
  if (et === "PROVIDER" || et === "SALE") return { sourceModule: et, sourceId: entityId }
  return {}
}

/** Generate a unique task id (no @default in schema). */
export function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}
