import { Client } from "@prisma/client"

type ClientWithTasks = {
    status: string
    updatedAt: Date | string
    createdAt: Date | string
    isVip?: boolean
    Task?: { id: string, status?: string }[]
    notes?: string | null
}

export function deriveClientStatus(client: ClientWithTasks, referenceNow?: Date): "ACTIVE" | "FOLLOW_UP" | "INACTIVE" | "VIP" {
    // 1. VIP is sticky (User manually sets it, logic shouldn't downgrade it usually, unless explicit)
    // The prompt says: "VIP -> siempre VIP".
    if (client.status === "VIP") return "VIP"

    // 2. Pending Tasks -> FOLLOW_UP
    const hasPendingTasks = client.Task?.some(t => t.status === "PENDING")
    if (hasPendingTasks) return "FOLLOW_UP"

    // 3. Activity Check
    // "Si no hay tareas y actividad reciente -> ACTIVE"
    // "Si no hay actividad -> INACTIVE"
    // Activity threshold? Prompt mentions "No activity -> INACTIVE". 
    // Usually 30 days is a standard. Let's use 30 as default or read from prompt history (it was 30).
    // Prompt says "Si no hay actividad -> INACTIVE".

    const now = referenceNow || new Date()
    const lastActivity = new Date(client.updatedAt || client.createdAt)
    const daysSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)

    // Logic:
    // If we have tasks -> Follow Up (Already handled)
    // Else:

    // If recent activity (< 30 days) and NOT Follow Up -> ACTIVE
    if (daysSinceActivity <= 30) {
        // If it was inactive, it becomes active.
        return "ACTIVE"
    }

    // If > 30 days and no tasks -> INACTIVE
    return "INACTIVE"
}

export function isClientForgotten(client: ClientWithTasks, referenceNow?: Date): boolean {
    const status = deriveClientStatus(client, referenceNow)

    // Definition from previous code:
    // Not Inactive, Not VIP, No Pending Tasks, No Future Reminders, > 14 days activity

    if (status === "INACTIVE" || status === "VIP") return false
    if (status === "FOLLOW_UP") return false // because it has tasks usually, or user set it

    const now = referenceNow || new Date()
    const lastActivity = new Date(client.updatedAt || client.createdAt)
    const daysSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)

    // Check reminders
    const hasFutureReminders = client.notes?.includes("[REMINDER:") &&
        client.notes.split("[REMINDER:").some(part => {
            const match = part.match(/Due: ([^\]-]+)/);
            return match && new Date(match[1]) > now;
        });

    if (hasFutureReminders) return false

    return daysSinceActivity > 14
}
