"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { recalculateClientStatus } from "../other/clients/actions"
import { ensureUserExists } from "@/lib/ensure-user"

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

// Create Task
export async function createTask(data: TaskData) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    await ensureUserExists(session.user)

    // Create task
    const task = await prisma.task.create({
        data: {
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: session.user.id,
            title: data.title,
            dueDate: data.dueDate,
            priority: data.priority || "MEDIUM",
            type: data.type || "MANUAL",
            clientId: data.clientId,
            leadId: data.leadId,
            status: "PENDING",
            description: (data as any).description, // Add description support if we add it to type
            updatedAt: new Date(),
        }
    })

    if (data.clientId) {
        await recalculateClientStatus(data.clientId)
    }

    revalidatePath("/dashboard/clients")
    revalidatePath("/dashboard/other")
    revalidatePath("/dashboard/tasks")
    return { success: true, taskId: task.id }
}

// Update Task
export async function updateTask(id: string, data: Partial<TaskData>) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    await prisma.task.update({
        where: { id, userId: session.user.id },
        data: {
            title: data.title,
            dueDate: data.dueDate,
            priority: data.priority,
            type: data.type,
        }
    })

    revalidatePath("/dashboard/clients")
    revalidatePath("/dashboard/other")
    revalidatePath("/dashboard/tasks")
    return { success: true }
}

// Complete/Uncomplete Task
export async function toggleTaskCompletion(id: string, completed: boolean) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    const task = await prisma.task.update({
        where: { id, userId: session.user.id },
        data: {
            status: completed ? "DONE" : "PENDING"
        }
    })

    if (task.clientId) {
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

// Delete Task
export async function deleteTask(id: string) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    const task = await prisma.task.delete({
        where: { id, userId: session.user.id }
    })

    if (task.clientId) {
        await recalculateClientStatus(task.clientId)
    }

    revalidatePath("/dashboard/clients")
    revalidatePath("/dashboard/other")
    revalidatePath("/dashboard/tasks")
    return { success: true }
}
