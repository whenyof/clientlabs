"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { ensureUserExists } from "@/lib/ensure-user"


/* ==================== CLIENT ACTIONS ==================== */

// Update client generic data
export async function updateClientData(
    clientId: string,
    data: any
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const client = await prisma.client.findUnique({
        where: { id: clientId, userId: session.user.id },
    })

    if (!client) return { success: false, error: "Client not found" }

    const updated = await prisma.client.update({
        where: { id: clientId },
        data: {
            ...data,
            updatedAt: new Date()
        },
    })

    revalidatePath("/dashboard/clients")
    revalidatePath("/dashboard/other")
    return updated
}

// Update client info
export async function updateClientInfo(
    clientId: string,
    data: {
        name?: string
        email?: string
        phone?: string
    }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const client = await prisma.client.findUnique({
        where: { id: clientId, userId: session.user.id },
    })

    if (!client) return { success: false, error: "Client not found" }

    const updateData = {
        name: data.name?.trim() || client.name,
        email: data.email?.trim() || client.email,
        phone: data.phone?.trim() || client.phone,
    }
    const merged = { ...client, ...updateData }
    await prisma.client.update({
        where: { id: clientId },
        data: {
            ...updateData,

            updatedAt: new Date(),
        },
    })

    revalidatePath("/dashboard/clients")
    revalidatePath("/dashboard/other")
    return { success: true }
}

// Add note to client
export async function addClientNote(clientId: string, text: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const client = await prisma.client.findUnique({
        where: { id: clientId, userId: session.user.id },
    })

    if (!client) return { success: false, error: "Client not found" }

    // Note: Activity model doesn't have clientId, so we store in client.notes
    // and update timestamp for activity tracking
    const currentNotes = client.notes || ""
    const timestamp = new Date().toISOString()
    const newNote = `[NOTE:${timestamp}] ${text}`
    const updatedNotes = currentNotes ? `${currentNotes}\n\n${newNote}` : newNote
    const merged = { ...client, notes: updatedNotes }
    await prisma.client.update({
        where: { id: clientId },
        data: {
            notes: updatedNotes,

            updatedAt: new Date()
        },
    })

    revalidatePath("/dashboard/clients")
    revalidatePath("/dashboard/other")
    return { success: true }
}

// Register client interaction
export async function registerClientInteraction(
    clientId: string,
    type: "CALL" | "MEETING" | "EMAIL",
    notes: string
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const client = await prisma.client.findUnique({
        where: { id: clientId, userId: session.user.id },
    })

    if (!client) return { success: false, error: "Client not found" }

    const titles = {
        CALL: "Llamada realizada",
        MEETING: "Reunión realizada",
        EMAIL: "Email enviado",
    }

    // Store interaction in client notes
    const currentNotes = client.notes || ""
    const timestamp = new Date().toISOString()
    // Format must match getClientTimeline regex: [INTERACTION:ISO] TYPE - Content
    const newNote = `[INTERACTION:${timestamp}] ${type} - ${notes.replace(/\n/g, " ")}`
    const updatedNotes = currentNotes ? `${currentNotes}\n\n${newNote}` : newNote
    const merged = { ...client, notes: updatedNotes }
    await prisma.client.update({
        where: { id: clientId },
        data: {
            notes: updatedNotes,

            updatedAt: new Date()
        },
    })

    revalidatePath("/dashboard/clients")
    revalidatePath("/dashboard/other")
    return { success: true }
}


// Add manual purchase/sale
export async function addClientPurchase(
    clientId: string,
    data: {
        concept: string
        amount: number
        date: Date
        note?: string
    }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    await ensureUserExists(session.user as any)

    const client = await prisma.client.findUnique({
        where: { id: clientId, userId: session.user.id },
    })

    if (!client) return { success: false, error: "Client not found" }

    // Create sale
    await prisma.sale.create({
        data: {
            id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: session.user.id,
            clientId,
            clientName: client.name || "Sin nombre",
            clientEmail: client.email || undefined,
            product: data.concept,
            price: data.amount,
            total: data.amount,
            currency: client.currency,
            paymentMethod: "MANUAL",
            provider: "MANUAL",
            status: "PAGADO",
            notes: data.note,
            saleDate: data.date,
            updatedAt: new Date(),
        },
    })

    // Update client totalSpent
    const newTotalSpent = (client.totalSpent ?? 0) + data.amount
    const merged = { ...client, totalSpent: newTotalSpent }
    await prisma.client.update({
        where: { id: clientId },
        data: {
            totalSpent: newTotalSpent,

            updatedAt: new Date(),
        },
    })

    revalidatePath("/dashboard/clients")
    revalidatePath("/dashboard/other")
    return { success: true }
}

// Get client timeline (all events)
export async function getClientTimeline(clientId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return []

    const client = await prisma.client.findUnique({
        where: { id: clientId, userId: session.user.id },
        include: {
            Sale: {
                orderBy: { createdAt: "desc" },
            },
            CalendarEvent: {
                orderBy: { createdAt: "desc" },
            },
            transactions: {
                orderBy: { createdAt: "desc" },
            },
        },
    })

    if (!client) return []

    const timeline: Array<{
        id: string
        type: string
        title: string
        description: string
        date: Date
        amount?: number
        currency?: string
        notes?: string | null
        icon?: string
        severity?: 'info' | 'success' | 'warning' | 'error'
    }> = []

    // Client creation
    timeline.push({
        id: `created-${client.id}`,
        type: "CREATED",
        title: "Cliente creado",
        description: "Cliente añadido al sistema",
        date: client.createdAt,
        icon: "user-plus",
        severity: 'info' as any
    })

    // Sales/Purchases
    client.Sale.forEach((sale) => {
        timeline.push({
            id: sale.id,
            type: "SALE",
            title: "Compra registrada",
            description: sale.product || "Compra",
            date: sale.createdAt,
            amount: sale.total ?? undefined,
            currency: sale.currency,
            notes: sale.notes,
            icon: "shopping-cart",
            severity: 'success' as any
        })
    })

    // Risk Changes & Status Changes from notes
    const systemLogRegex = /\[SYSTEM:([^\]]+)\]\s*([^\n]+)/g
    let systemMatch
    while ((systemMatch = systemLogRegex.exec(client.notes || "")) !== null) {
        const date = new Date(systemMatch[1])
        const content = systemMatch[2].trim()

        let type = "SYSTEM"
        let title = "Evento del sistema"
        let icon = "sparkles"
        let severity: any = 'info'

        if (content.includes("Cambio de Riesgo:")) {
            type = "RISK_CHANGE"
            title = "Prioridad actualizada"
            icon = "alert-circle"
            severity = 'warning'
        } else if (content.includes("Estado actualizado:")) {
            type = "STATUS_CHANGE"
            title = "Estado actualizado"
            icon = "trending-up"
            severity = 'info'
        }

        timeline.push({
            id: `system-${systemMatch[1]}`,
            type,
            title,
            description: content,
            date,
            icon,
            severity
        })
    }

    // Parse notes for events
    if (client.notes) {
        // Notes
        const noteRegex = /\[NOTE:([^\]]+)\]\s*([^\n]+)/g
        let match
        while ((match = noteRegex.exec(client.notes)) !== null) {
            timeline.push({
                id: `note-${match[1]}`,
                type: "NOTE",
                title: "Nota añadida",
                description: match[2].trim(),
                date: new Date(match[1]),
                icon: "message-square",
                severity: 'info'
            })
        }

        // Interactions
        const interactionRegex = /\[INTERACTION:([^\]]+)\]\s*(\w+)\s*-\s*([^\n]+)/g
        while ((match = interactionRegex.exec(client.notes)) !== null) {
            const interactionType = match[2].trim()
            let title = "Interacción"
            let icon = "clock"
            let severity: any = 'info'

            if (interactionType === "CALL") { title = "Llamada"; icon = "phone"; }
            else if (interactionType === "MEETING") { title = "Reunión"; icon = "users"; }
            else if (interactionType === "EMAIL") { title = "Email"; icon = "mail"; }
            else if (interactionType === "PAYMENT_PAID") { title = "Pago realizado"; icon = "shopping-cart"; severity = 'success'; }
            else if (interactionType === "PAYMENT_CANCELLED") { title = "Pago cancelado"; icon = "x-circle"; severity = 'error'; }
            else if (interactionType === "SALE_DELETED") { title = "Venta eliminada"; icon = "trash-2"; severity = 'error'; }

            timeline.push({
                id: `interaction-${match[1]}`,
                type: interactionType,
                title,
                description: match[3].trim(),
                date: new Date(match[1]),
                icon,
                severity
            })
        }

        // Reminders
        const reminderRegex = /\[REMINDER(?:_COMPLETED)?:([^\]]+)\]\s*([^-]+)-\s*Due:\s*([^-]+)-\s*([^\[]+)\[STATUS:(\w+)\]/g
        while ((match = reminderRegex.exec(client.notes)) !== null) {
            const isCompleted = match[5] === "COMPLETED"
            timeline.push({
                id: `reminder-${match[1]}`,
                type: isCompleted ? "REMINDER_COMPLETED" : "REMINDER_CREATED",
                title: isCompleted ? "Recordatorio completado" : "Recordatorio creado",
                description: `${match[2].trim()} - ${match[4].trim()}`,
                date: new Date(match[1]),
                notes: `Due: ${new Date(match[3].trim()).toLocaleDateString()}`,
                icon: "bell",
                severity: isCompleted ? 'success' : 'warning'
            })
        }
    }

    // Sort by date descending
    timeline.sort((a, b) => b.date.getTime() - a.date.getTime())

    return timeline
}

// Recalculate and update client status based on tasks
export async function recalculateClientStatus(clientId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return null

    const client = await prisma.client.findUnique({
        where: { id: clientId, userId: session.user.id },
        include: {
            Task: {
                where: { status: "PENDING" },
                select: { id: true }
            }
        }
    })

    if (!client || client.status === "VIP") return client?.status

    const hasPendingTasks = (client as any).Task?.length > 0
    let newStatus = client.status

    if (hasPendingTasks) {
        newStatus = "FOLLOW_UP"
    } else if (client.status === "FOLLOW_UP") {
        newStatus = "ACTIVE"
    }

    if (client.status !== newStatus) {
        const merged = { ...client, status: newStatus }
        await prisma.client.update({
            where: { id: clientId },
            data: {
                status: newStatus,

                updatedAt: new Date()
            }
        })
    }

    return newStatus
}

// Update client status
export async function updateClientStatus(
    clientId: string,
    status: "ACTIVE" | "FOLLOW_UP" | "INACTIVE" | "VIP"
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const client = await prisma.client.findUnique({
        where: { id: clientId, userId: session.user.id },
    })

    if (!client) return { success: false, error: "Client not found" }

    const merged = { ...client, status }
    await prisma.client.update({
        where: { id: clientId },
        data: {
            status,

            updatedAt: new Date(),
        },
    })

    // No revalidatePath here to avoid flickering, relying on optimistic UI
    return { success: true }
}

// Create client reminder
export async function createClientReminder(
    clientId: string,
    data: {
        type: string
        dueDate: Date
        note?: string
    }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    await ensureUserExists(session.user as any)

    const client = await prisma.client.findUnique({
        where: { id: clientId, userId: session.user.id },
    })

    if (!client) return { success: false, error: "Client not found" }

    // 1. Create Task via centralized API
    const { createTask } = await import("@/lib/api/tasks")
    const task = await createTask({
        title: `Recordatorio: ${data.type}`,
        description: data.note || "Recordatorio automático",
        dueDate: data.dueDate.toISOString(),
        priority: "HIGH",
        entityType: "CLIENT",
        entityId: clientId,
    })

    // 2. Store reminder in client notes (legacy support/timeline)
    const reminderEntry = `\n[REMINDER:${new Date().toISOString()}] ${data.type} - Due: ${data.dueDate.toISOString()} - ${data.note || "No note"} [STATUS:PENDING]`
    const updatedNotes = (client.notes || "") + reminderEntry
    const merged = { ...client, notes: updatedNotes }
    await prisma.client.update({
        where: { id: clientId },
        data: {
            notes: updatedNotes,

            updatedAt: new Date(),
        },
    })

    await recalculateClientStatus(clientId)

    return { success: true, task }
}

// Complete client reminder
export async function completeClientReminder(
    clientId: string,
    reminderTimestamp: string
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const client = await prisma.client.findUnique({
        where: { id: clientId, userId: session.user.id },
    })

    if (!client || !client.notes) return { success: false, error: "Client not found" }

    // Mark reminder as completed
    const updatedNotes = client.notes.replace(
        `[REMINDER:${reminderTimestamp}]`,
        `[REMINDER_COMPLETED:${reminderTimestamp}]`
    ).replace("[STATUS:PENDING]", "[STATUS:COMPLETED]")

    await prisma.client.update({
        where: { id: clientId },
        data: {
            notes: updatedNotes,
            updatedAt: new Date(),
        },
    })

    await recalculateClientStatus(clientId)

    return { success: true }
}

// Get client reminders
export async function getClientReminders(clientId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return []

    const client = await prisma.client.findUnique({
        where: { id: clientId, userId: session.user.id },
    })

    if (!client) return []

    const reminders: Array<{
        id: string
        type: string
        dueDate: Date
        note: string
        status: "PENDING" | "COMPLETED"
        createdAt: Date
    }> = []

    if (client.notes) {
        const reminderRegex = /\[REMINDER(?:_COMPLETED)?:([^\]]+)\]\s*([^-]+)-\s*Due:\s*([^-]+)-\s*([^\[]+)\[STATUS:(\w+)\]/g
        let match

        while ((match = reminderRegex.exec(client.notes)) !== null) {
            reminders.push({
                id: match[1],
                type: match[2].trim(),
                dueDate: new Date(match[3].trim()),
                note: match[4].trim(),
                status: match[5] as "PENDING" | "COMPLETED",
                createdAt: new Date(match[1]),
            })
        }
    }

    return reminders
}

/* ==================== SALES ACTIONS ==================== */

// Get client sales
export async function getClientSales(clientId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return []

    const sales = await prisma.sale.findMany({
        where: {
            clientId,
            userId: session.user.id,
        },
        orderBy: { saleDate: "desc" },
    })

    return sales
}

// Helper to recalculate total spent
async function recalculateClientTotalSpent(clientId: string) {
    const [aggregations, client] = await Promise.all([
        prisma.sale.aggregate({
            where: {
                clientId,
                OR: [
                    { status: "PAID" },
                    { status: "PAGADO" } // Legacy support
                ]
            },
            _sum: { total: true },
        }),
        prisma.client.findUnique({ where: { id: clientId } }),
    ])
    const totalSpent = aggregations._sum.total || 0
    const merged = client ? { ...client, totalSpent } : null
    await prisma.client.update({
        where: { id: clientId },
        data: {
            totalSpent,

            updatedAt: new Date()
        }
    })
    return totalSpent
}

// Create client sale/payment
export async function createClientSale(
    clientId: string,
    data: {
        product: string
        total: number
        saleDate: Date
        status?: string
        notes?: string
    }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    await ensureUserExists(session.user as any)

    const client = await prisma.client.findUnique({
        where: { id: clientId, userId: session.user.id },
    })

    if (!client) return { success: false, error: "Client not found" }

    // Create sale
    const sale = await prisma.sale.create({
        data: {
            id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: session.user.id,
            clientId,
            clientName: client.name || "Sin nombre",
            clientEmail: client.email,
            product: data.product,
            price: data.total,
            total: data.total,
            currency: client.currency,
            paymentMethod: "MANUAL",
            provider: "MANUAL",
            status: data.status || "PENDING", // Default to PENDING to be safe, unless specified
            notes: data.notes,
            saleDate: data.saleDate,
            updatedAt: new Date(),
        },
    })

    // Recalculate total spent
    await recalculateClientTotalSpent(clientId)

    // We rely on the Sale entity for the timeline, so no need to add a redundant INTERACTION note for creation.
    // This avoids the 'Email' timeline bug caused by unknown interaction types.

    revalidatePath("/dashboard/clients")
    revalidatePath("/dashboard/other")
    return sale
}

// Update sale status
export async function updateSaleStatus(saleId: string, newStatus: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const sale = await prisma.sale.findUnique({
        where: { id: saleId },
    })

    if (!sale || sale.userId !== session.user.id) {
        return { success: false, error: "Sale not found" }
    }

    if (!sale.clientId) return { success: false, error: "Sale has no client" }

    const previousStatus = sale.status

    await prisma.sale.update({
        where: { id: saleId },
        data: {
            status: newStatus,
            updatedAt: new Date()
        }
    })

    // Recalculate
    await recalculateClientTotalSpent(sale.clientId)

    // Log activity if status changed to meaningful state
    let activityType = ""
    if (newStatus === "PAID" && previousStatus !== "PAID") activityType = "PAYMENT_PAID"
    if (newStatus === "CANCELLED" && previousStatus !== "CANCELLED") activityType = "PAYMENT_CANCELLED"

    if (activityType) {
        const client = await prisma.client.findUnique({ where: { id: sale.clientId } })
        if (client) {
            const noteEntry = `\n[INTERACTION:${new Date().toISOString()}] ${activityType} - Pago actualizado: ${sale.product} (${newStatus})`
            const updatedNotes = (client.notes || "") + noteEntry
            const merged = { ...client, notes: updatedNotes }
            await prisma.client.update({
                where: { id: sale.clientId },
                data: {
                    notes: updatedNotes,

                    updatedAt: new Date(),
                },
            })
        }
    }

    revalidatePath("/dashboard/clients")
    revalidatePath("/dashboard/other")
    return { success: true }
}

// Update client sale (General update)
export async function updateClientSale(
    saleId: string,
    data: {
        product?: string
        total?: number
        saleDate?: Date
        status?: string
        notes?: string
    }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const sale = await prisma.sale.findUnique({
        where: { id: saleId },
    })

    if (!sale || sale.userId !== session.user.id) {
        return { success: false, error: "Sale not found" }
    }

    const updatedSale = await prisma.sale.update({
        where: { id: saleId },
        data: {
            product: data.product ?? sale.product,
            price: data.total ?? sale.price,
            total: data.total ?? sale.total,
            saleDate: data.saleDate ?? sale.saleDate,
            status: data.status ?? sale.status,
            notes: data.notes ?? sale.notes,
            updatedAt: new Date(),
        },
    })

    if (sale.clientId) {
        await recalculateClientTotalSpent(sale.clientId)
    }

    revalidatePath("/dashboard/clients")
    revalidatePath("/dashboard/other")
    return updatedSale
}

// Delete client sale
export async function deleteClientSale(saleId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const sale = await prisma.sale.findUnique({
        where: { id: saleId },
    })

    if (!sale || sale.userId !== session.user.id) {
        return { success: false, error: "Sale not found" }
    }

    await prisma.sale.delete({
        where: { id: saleId },
    })

    // Recalculate if it was associated with a client
    if (sale.clientId) {
        await recalculateClientTotalSpent(sale.clientId)

        // Add timeline event
        const client = await prisma.client.findUnique({
            where: { id: sale.clientId },
        })

        if (client) {
            const noteEntry = `\n[INTERACTION:${new Date().toISOString()}] SALE_DELETED - Venta eliminada: ${sale.product}`
            const updatedNotes = (client.notes || "") + noteEntry
            const merged = { ...client, notes: updatedNotes }
            await prisma.client.update({
                where: { id: sale.clientId },
                data: {
                    notes: updatedNotes,

                    updatedAt: new Date(),
                },
            })
        }
    }

    revalidatePath("/dashboard/clients")
    revalidatePath("/dashboard/other")
    return { success: true }
}

// Mark sale as paid (Legacy wrapper using new logic)
export async function markSaleAsPaid(saleId: string) {
    return updateSaleStatus(saleId, "PAID")
}
