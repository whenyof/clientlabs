"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { recalculateClientStatus } from "@/modules/clients/actions"
import { ensureUserExists } from "@/lib/ensure-user"
import {
  createTask as createTaskViaApi,
  updateTask as updateTaskViaApi,
  completeTask as completeTaskViaApi,
  getTask as getTaskViaApi,
  deleteTask as deleteTaskViaApi,
} from "@/lib/api/tasks"

// Types that match what the UI expects
export type TaskData = {
    title: string
    dueDate?: Date
    priority?: "LOW" | "MEDIUM" | "HIGH"
    type?: "CALL" | "EMAIL" | "MEETING" | "MANUAL"
    clientId?: string
    leadId?: string
}

// Helper to check auth
async function checkAuth() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return null
    return session as { user: { id: string; email?: string | null; name?: string | null } }
}

// Create Task (via centralized API)
export async function createTask(data: TaskData) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    await ensureUserExists(session.user)

    const entityType = data.clientId ? "CLIENT" as const : data.leadId ? "LEAD" as const : null
    const entityId = data.clientId ?? data.leadId ?? null

    const task = await createTaskViaApi({
        title: data.title,
        description: (data as { description?: string }).description ?? null,
        dueDate: data.dueDate?.toISOString() ?? null,
        priority: data.priority || "MEDIUM",
        entityType: entityType ?? undefined,
        entityId: entityId ?? undefined,
    })

    if (data.clientId) {
        await recalculateClientStatus(data.clientId)
    }

    revalidatePath("/dashboard/clients")
    revalidatePath("/dashboard/other")
    revalidatePath("/dashboard/tasks")
    return { success: true, taskId: task.id }
}

// Update Task (via centralized API)
export async function updateTask(id: string, data: Partial<TaskData>) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    const payload: Parameters<typeof updateTaskViaApi>[1] = {}
    if (data.title !== undefined) payload.title = data.title
    if (data.dueDate !== undefined) payload.dueDate = data.dueDate?.toISOString() ?? null
    if (data.priority !== undefined) payload.priority = data.priority
    if (data.type !== undefined) payload.type = data.type

    const updated = await updateTaskViaApi(id, payload)
    const clientId = updated?.clientId as string | null | undefined
    if (clientId) {
        await recalculateClientStatus(clientId)
    }

    revalidatePath("/dashboard/clients")
    revalidatePath("/dashboard/other")
    revalidatePath("/dashboard/tasks")
    return { success: true }
}

// Complete/Uncomplete Task (via centralized API)
export async function toggleTaskCompletion(id: string, completed: boolean) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    let task: { clientId?: string | null }
    if (completed) {
        task = await completeTaskViaApi(id)
    } else {
        task = await updateTaskViaApi(id, { status: "PENDING", completedAt: null })
    }

    if (task?.clientId) {
        await recalculateClientStatus(task.clientId)
    }

    revalidatePath("/dashboard/clients")
    revalidatePath("/dashboard/other")
    revalidatePath("/dashboard/tasks")
    return { success: true }
}

// Get Tasks
export async function getTasks(filters?: { leadId?: string, clientId?: string }) {
    const session = await checkAuth()
    if (!session) return []

    const where: any = {
        userId: session.user.id
    }

    if (filters?.leadId) where.leadId = filters.leadId
    if (filters?.clientId) where.clientId = filters.clientId

    const tasks = await prisma.task.findMany({
        where,
        orderBy: [
            { dueDate: 'asc' },
            { createdAt: 'desc' }
        ],
        include: {
            Client: { select: { name: true } },
            Lead: { select: { name: true } }
        }
    })

    return tasks.map(t => ({
        ...t,
        clientName: t.Client?.name,
        leadName: t.Lead?.name,
    }))
}

// Delete Task (via centralized API)
export async function deleteTask(id: string) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    const task = await getTaskViaApi(id)
    await deleteTaskViaApi(id)

    if (task?.clientId) {
        await recalculateClientStatus(task.clientId)
    }

    revalidatePath("/dashboard/clients")
    revalidatePath("/dashboard/other")
    revalidatePath("/dashboard/tasks")
    return { success: true }
}
