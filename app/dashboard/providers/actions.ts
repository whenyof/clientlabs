"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma, safeDbCheck, safePrismaQuery } from "@/lib/prisma"
import { revalidatePath, unstable_noStore } from "next/cache"
import { ensureUserExists } from "@/lib/ensure-user"
import { createInvoiceForProviderOrder } from "@/modules/invoicing/services/invoice.service"
import {
    ProviderOrderType,
    ProviderOrderStatus,
    ProviderTimelineEventType,
    ProviderStatus,
    ProviderDependency,
    ProviderOperationalState,
    ProviderFileCategory,
    TaskStatus,
    TaskPriority
} from "@prisma/client"

// ...

// In Helper Function or Calls:
// createProviderOrder:
// ...
// timelineEvents: {
//    create: {
//        userId: session.user.id,
//        providerId: data.providerId,
//        type: ProviderTimelineEventType.ORDER
//    }
// }

// registerProviderPayment:
// ...
// await tx.providerTimelineEvent.create({
//     data: {
//         userId: session.user.id,
//         providerId: data.providerId,
//         type: ProviderTimelineEventType.PAYMENT,
//         orderId: order.id,
//         paymentId: payment.id
//     }
// })

// addProviderNote
// ...
// type: ProviderTimelineEventType.NOTE

// Helper to check auth
// Helper to check auth
async function checkAuth() {
    const session = await getServerSession(authOptions)
    // 🔒 Security: Block execution if no valid session or user ID
    if (!session || !session.user || !session.user.id) {
        return null
    }
    return session as { user: { id: string; email?: string | null; name?: string | null } }
}

// Create Provider
export async function createProvider(data: {
    name: string
    type: string | null
    monthlyCost: number | null
    dependency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    status?: "ACTIVE" | "PAUSED" | "BLOCKED"
    contactEmail?: string | null
    contactPhone?: string | null
    website?: string | null
    notes?: string | null
    isCritical?: boolean
    averageOrderFrequency?: number | null
    lastOrderDate?: Date | null
    // UI fields passed but ignored by DB (missing columns)
    autoCreateTaskOnRisk?: boolean
    autoNotifyBeforeRestock?: number | null
}) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    // 🚀 PHASE 6: Connection check before critical write
    const isDbAlive = await safeDbCheck()
    if (!isDbAlive) return { success: false, error: "La base de datos está temporalmente fuera de línea. Reintente en unos segundos." }

    await ensureUserExists(session.user)

    try {
        console.log("Creating provider with data:", JSON.stringify(data, null, 2))
        const provider = await safePrismaQuery(() => prisma.provider.create({
            data: {
                userId: session.user.id,
                name: data.name,
                type: data.type,
                monthlyCost: data.monthlyCost,
                dependencyLevel: data.dependency,
                contactEmail: data.contactEmail,
                contactPhone: data.contactPhone,
                website: data.website,
                notes: data.notes,
                status: data.status || "ACTIVE",
                isCritical: data.isCritical || false,
                averageOrderFrequency: data.averageOrderFrequency,
                lastOrderDate: data.lastOrderDate,
            },
            include: {
                payments: true,
                tasks: true,
                _count: {
                    select: {
                        payments: true,
                        tasks: true
                    }
                }
            }
        }))
        console.log("Provider created successfully:", provider.id)

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/providers")
        return { success: true, provider }
    } catch (error) {
        console.error("Error creating provider:", error)
        return { success: false, error: "Error al crear proveedor" }
    }
}

// ... (skip direct updates/delete logic in this chunk to avoiding replace issues if possible, but the chunk is huge?)
// Actually I will target `createProvider` nicely.
// And then target `getProvidersWithInsightsAction` separately or implicitly.
// I'll just do `createProvider` first.

// Update Provider
export async function updateProvider(id: string, data: any) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    const isDbAlive = await safeDbCheck()
    if (!isDbAlive) return { success: false, error: "Base de datos no disponible." }

    try {
        const updateData: any = { ...data }
        if (data.dependency) {
            updateData.dependencyLevel = data.dependency
            delete updateData.dependency
        }

        const provider = await safePrismaQuery(() => prisma.provider.update({
            where: { id, userId: session.user.id },
            data: {
                ...updateData,
                updatedAt: new Date()
            }
        }))

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/providers")
        return { success: true, provider }
    } catch (error) {
        console.error("Error updating provider:", error)
        return { success: false, error: "Error al actualizar el proveedor" }
    }
}

// Delete Provider
export async function deleteProvider(id: string) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    const isDbAlive = await safeDbCheck()
    if (!isDbAlive) return { success: false, error: "Base de datos no disponible para borrado." }

    try {
        await safePrismaQuery(() => prisma.provider.delete({
            where: { id, userId: session.user.id }
        }))
        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/providers")
        return { success: true }
    } catch (error) {
        console.error("Error deleting provider:", error)
        return { success: false, error: "Error al eliminar el proveedor" }
    }
}

// Register Payment (Convenience for Order + Payment)
export async function registerProviderPayment(data: {
    providerId: string
    amount: number
    paymentDate: Date
    concept?: string
    notes?: string
    orderId?: string
    method?: string
    status?: "PENDING" | "PAID"
}) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    const isDbAlive = await safeDbCheck()
    if (!isDbAlive) return { success: false, error: "Base de datos no disponible." }

    await ensureUserExists(session.user)

    try {
        const result = await safePrismaQuery(() => prisma.$transaction(async (tx) => {
            // If orderId provided, validate the order allows payments
            if (data.orderId) {
                const order = await tx.providerOrder.findUnique({
                    where: { id: data.orderId, userId: session.user.id },
                    include: { payment: true }
                })
                if (!order) throw new Error("Pedido no encontrado")
                if (order.status === "CANCELLED") throw new Error("No se puede pagar un pedido cancelado")
                if (order.payment) throw new Error("Este pedido ya tiene un pago vinculado")
            }

            const paymentStatus = data.status || "PAID"

            // 1. Create Payment
            const payment = await tx.providerPayment.create({
                data: {
                    userId: session.user.id,
                    providerId: data.providerId,
                    amount: data.amount,
                    paymentDate: data.paymentDate,
                    concept: data.concept,
                    notes: data.notes || "Pago registrado",
                    method: data.method || "MANUAL",
                    orderId: data.orderId,
                    status: paymentStatus,
                }
            })

            // 2. If no orderId, create an auto-order as root (quick payment flow)
            let orderId = data.orderId
            if (!orderId) {
                const autoOrder = await tx.providerOrder.create({
                    data: {
                        userId: session.user.id,
                        providerId: data.providerId,
                        amount: data.amount,
                        orderDate: data.paymentDate,
                        status: paymentStatus === "PAID" ? ProviderOrderStatus.PAID : ProviderOrderStatus.PENDING,
                        type: ProviderOrderType.ONE_TIME,
                        description: data.concept || "Pago directo"
                    }
                })
                orderId = autoOrder.id

                // Link payment to auto-order
                await tx.providerPayment.update({
                    where: { id: payment.id },
                    data: { orderId: autoOrder.id }
                })

                // Timeline: order created
                await tx.providerTimelineEvent.create({
                    data: {
                        userId: session.user.id,
                        providerId: data.providerId,
                        type: ProviderTimelineEventType.ORDER,
                        orderId: autoOrder.id
                    }
                })
            }

            // 3. Timeline: payment created
            await tx.providerTimelineEvent.create({
                data: {
                    userId: session.user.id,
                    providerId: data.providerId,
                    type: ProviderTimelineEventType.PAYMENT,
                    orderId,
                    paymentId: payment.id
                }
            })

            // 4. SYNC RULE: Payment PAID → Order PAID (pedido solo pasa a PAID con pago completado)
            if (paymentStatus === "PAID" && data.orderId) {
                await tx.providerOrder.update({
                    where: { id: data.orderId },
                    data: { status: ProviderOrderStatus.PAID }
                })
                await tx.provider.update({
                    where: { id: data.providerId },
                    data: { lastOrderDate: new Date() }
                })
            }

            return payment
        }))

        // Run analytics outside transaction
        try {
            const { updateProviderOperationalData, processLightAutomations } = await import("@/lib/provider-operational-intelligence")
            await updateProviderOperationalData(data.providerId)
            await processLightAutomations(data.providerId)
        } catch (error) {
            console.error("Non-critical: Intelligence update failed", error)
        }

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/finance")
        return { success: true, payment: result }

    } catch (error) {
        console.error("Error registering payment:", error)
        return { success: false, error: "Error al registrar pago" }
    }
}

// ────────────────────────────────────────────────────────────
// PAYMENT STATUS UPDATE (with sync rules)
// ────────────────────────────────────────────────────────────
// Sync rules:
//   PAID → linked order → CLOSED
//   FAILED → linked order → ISSUE
//   CANCELLED → no order change (order stays as-is)

export async function updateProviderPaymentStatus(
    paymentId: string,
    newStatus: "PENDING" | "PAID" | "FAILED" | "CANCELLED"
) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const result = await safePrismaQuery(() => prisma.$transaction(async (tx) => {
            const payment = await tx.providerPayment.findUnique({
                where: { id: paymentId, userId: session.user.id },
                include: { order: true }
            })

            if (!payment) throw new Error("Pago no encontrado")
            if (payment.status === newStatus) return payment

            // Update payment status
            const updated = await tx.providerPayment.update({
                where: { id: paymentId },
                data: { status: newStatus },
                include: { order: true }
            })

            // Timeline: payment status changed
            await tx.providerTimelineEvent.create({
                data: {
                    userId: session.user.id,
                    providerId: payment.providerId,
                    type: ProviderTimelineEventType.PAYMENT,
                    paymentId: payment.id,
                    orderId: payment.orderId
                }
            })

            // SYNC RULE: Payment PAID → Order PAID (pedido solo puede estar PAID si existe pago PAID)
            if (newStatus === "PAID" && payment.orderId) {
                await tx.providerOrder.update({
                    where: { id: payment.orderId },
                    data: { status: ProviderOrderStatus.PAID }
                })
                await tx.providerTimelineEvent.create({
                    data: {
                        userId: session.user.id,
                        providerId: payment.providerId,
                        type: ProviderTimelineEventType.ORDER,
                        orderId: payment.orderId
                    }
                })
                await tx.provider.update({
                    where: { id: payment.providerId },
                    data: { lastOrderDate: new Date() }
                })
            }

            // SYNC RULE: Payment CANCELLED → Order vuelve a RECEIVED y se desvincula el pago (permitir registrar otro)
            if (newStatus === "CANCELLED" && payment.orderId) {
                const ord = await tx.providerOrder.findUnique({ where: { id: payment.orderId } })
                if (ord && (ord.status === "PAID" || ord.status === "CLOSED")) {
                    await tx.providerOrder.update({
                        where: { id: payment.orderId },
                        data: { status: ProviderOrderStatus.RECEIVED }
                    })
                    await tx.providerPayment.update({
                        where: { id: payment.id },
                        data: { orderId: null }
                    })
                    await tx.providerTimelineEvent.create({
                        data: {
                            userId: session.user.id,
                            providerId: payment.providerId,
                            type: ProviderTimelineEventType.ORDER,
                            orderId: payment.orderId
                        }
                    })
                }
            }

            // SYNC RULE: Payment FAILED → Order ISSUE
            if (newStatus === "FAILED" && payment.orderId) {
                const order = await tx.providerOrder.findUnique({ where: { id: payment.orderId } })
                if (order && order.status !== "CANCELLED" && order.status !== "CLOSED") {
                    await tx.providerOrder.update({
                        where: { id: payment.orderId },
                        data: { status: ProviderOrderStatus.ISSUE }
                    })
                    await tx.providerTimelineEvent.create({
                        data: {
                            userId: session.user.id,
                            providerId: payment.providerId,
                            type: ProviderTimelineEventType.ORDER,
                            orderId: payment.orderId
                        }
                    })
                }
            }

            return updated
        }))

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/finance")
        return { success: true, payment: result }
    } catch (error: any) {
        console.error("Error updating payment status:", error)
        return { success: false, error: error.message || "Error al actualizar pago" }
    }
}

// Create Task
export async function createProviderTask(data: {
    providerId: string
    title: string
    description?: string
    priority: "LOW" | "MEDIUM" | "HIGH"
    dueDate?: Date
}) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    const isDbAlive = await safeDbCheck()
    if (!isDbAlive) return { success: false, error: "Base de datos no disponible." }

    await ensureUserExists(session.user)

    try {
        const result = await safePrismaQuery(() => prisma.$transaction(async (tx) => {
            const task = await tx.providerTask.create({
                data: {
                    userId: session.user.id,
                    providerId: data.providerId,
                    title: data.title,
                    description: data.description,
                    priority: data.priority as any,
                    dueDate: data.dueDate,
                    status: "PENDING"
                }
            })

            // Create Timeline Event for TASK
            await tx.providerTimelineEvent.create({
                data: {
                    userId: session.user.id,
                    providerId: data.providerId,
                    type: ProviderTimelineEventType.TASK,
                    taskId: task.id
                }
            })

            // Update provider status if it was OK
            const provider = await tx.provider.findUnique({
                where: { id: data.providerId },
                select: { status: true }
            })

            if (provider?.status === "OK") {
                await tx.provider.update({
                    where: { id: data.providerId },
                    data: { status: "PENDING" }
                })
            }

            return task
        }))

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/providers")
        return { success: true, task: result }
    } catch (error) {
        console.error("Error creating task:", error)
        return { success: false, error: "Error al crear tarea" }
    }
}

// Toggle Provider Task Status
export async function toggleProviderTaskStatus(taskId: string, completed: boolean) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    const isDbAlive = await safeDbCheck()
    if (!isDbAlive) return { success: false, error: "Base de datos no disponible para actualizar tarea." }

    try {
        const task = await safePrismaQuery(() => prisma.providerTask.update({
            where: {
                id: taskId,
                userId: session.user.id
            },
            data: {
                status: completed ? "DONE" : "PENDING"
            }
        }))

        // Recalculate provider status
        await recalculateProviderStatus(task.providerId)

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/providers")
        return { success: true, task }
    } catch (error) {
        console.error("Error toggling task:", error)
        return { success: false, error: "Error al actualizar tarea" }
    }
}

// Delete Provider Task
export async function deleteProviderTask(taskId: string) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    const isDbAlive = await safeDbCheck()
    if (!isDbAlive) return { success: false, error: "Base de datos no disponible para eliminar tarea." }

    try {
        const task = await safePrismaQuery(() => prisma.providerTask.delete({
            where: {
                id: taskId,
                userId: session.user.id
            }
        }))

        // Recalculate provider status
        await recalculateProviderStatus(task.providerId)

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/providers")
        return { success: true }
    } catch (error) {
        console.error("Error deleting task:", error)
        return { success: false, error: "Error al eliminar tarea" }
    }
}

// Add Provider Note
export async function addProviderNote(providerId: string, content: string) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    const isDbAlive = await safeDbCheck()
    if (!isDbAlive) return { success: false, error: "Base de datos no disponible para añadir nota." }

    await ensureUserExists(session.user)

    try {
        const note = await safePrismaQuery(() => prisma.providerNote.create({
            data: {
                userId: session.user.id,
                providerId,
                content,
                // Create linked timeline event
                timelineEvents: {
                    create: {
                        userId: session.user.id,
                        providerId,
                        type: ProviderTimelineEventType.NOTE
                    }
                }
            }
        }))

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/providers")
        return { success: true, note }
    } catch (error) {
        console.error("Error adding note:", error)
        return { success: false, error: "Error al añadir nota" }
    }
}

// Recalculate Provider Status
async function recalculateProviderStatus(providerId: string) {
    try {
        const provider = await safePrismaQuery(() => prisma.provider.findUnique({
            where: { id: providerId },
            include: {
                tasks: {
                    where: { status: "PENDING" }
                }
            }
        }))

        if (!provider) return

        // If VIP or manually set to ISSUE, don't auto-change
        if (provider.status === "ISSUE") return

        const hasPendingTasks = provider.tasks.length > 0

        let newStatus = provider.status
        if (hasPendingTasks) {
            newStatus = "PENDING"
        } else {
            newStatus = "OK"
        }

        if (newStatus !== provider.status) {
            await safePrismaQuery(() => prisma.provider.update({
                where: { id: providerId },
                data: { status: newStatus as any }
            }))
        }
    } catch (error) {
        console.error("Error recalculating provider status:", error)
    }
}

// Get Provider Timeline
export async function getProviderTimeline(providerId: string) {
    unstable_noStore() // Prevent caching - always fresh data
    const session = await checkAuth()
    if (!session) return []

    // 🚀 Connection check (optional for reads, but good for stability)
    const isDbAlive = await safeDbCheck()
    if (!isDbAlive) return [] // Return empty array instead of crashing

    try {
        const [timelineEvents, contactLogs, providerFiles] = await safePrismaQuery(() => Promise.all([
            // 1. Fetch Timeline Events with linked data
            prisma.providerTimelineEvent.findMany({
                where: { providerId, userId: session.user.id },
                orderBy: { createdAt: 'desc' },
                take: 50, // More events for context
                include: {
                    note: true,
                    order: {
                        include: {
                            payment: true
                        }
                    },
                    payment: true,
                    task: true,
                    ProviderFile: true,
                }
            }),
            // 2. Fetch Contact Logs (Directly)
            prisma.providerContactLog.findMany({
                where: { providerId, userId: session.user.id },
                orderBy: { createdAt: 'desc' },
                take: 20
            }),
            // 3. Fetch Files (that might not have timeline events yet)
            prisma.providerFile.findMany({
                where: { providerId, userId: session.user.id, orderId: null }, // Global files
                orderBy: { createdAt: 'desc' },
                take: 20
            })
        ]))

        // Map TimelineEvents to UI format (lowercase relation names match Prisma schema)
        const events = timelineEvents.map((e: any) => {
            if (e.type === ProviderTimelineEventType.NOTE && e.note) {
                return {
                    id: `note-${e.note.id}`,
                    type: 'NOTE',
                    title: 'Nota añadida',
                    description: e.note.content.length > 50 ? e.note.content.slice(0, 50) + '...' : e.note.content,
                    date: e.createdAt,
                    icon: 'message-square',
                    severity: 'info',
                    entityId: e.note.id,
                    content: e.note.content
                }
            }
            if (e.type === ProviderTimelineEventType.ORDER && e.order) {
                const statusMap: Record<string, { label: string, severity: 'info' | 'success' | 'warning' | 'error' }> = {
                    DRAFT: { label: 'Borrador', severity: 'info' },
                    PENDING: { label: 'Pendiente', severity: 'warning' },
                    RECEIVED: { label: 'Recibido', severity: 'info' },
                    ISSUE: { label: 'Incidencia', severity: 'error' },
                    CANCELLED: { label: 'Cancelado', severity: 'error' },
                    CLOSED: { label: 'Cerrado', severity: 'success' },
                    COMPLETED: { label: 'Cerrado', severity: 'success' },
                    PAID: { label: 'Pagado', severity: 'success' },
                }
                const config = statusMap[e.order.status] || { label: e.order.status, severity: 'info' }

                return {
                    id: `order-${e.order.id}-${e.id}`,
                    type: 'ORDER',
                    title: `Pedido #${e.order.id.slice(-4).toUpperCase()}`,
                    description: `${e.order.description || 'Pedido'} · ${e.order.amount}€ (${config.label})`,
                    date: e.createdAt,
                    icon: 'shopping-bag',
                    severity: config.severity,
                    entityId: e.order.id,
                    status: e.order.status,
                    statusLabel: config.label,
                    amount: e.order.amount
                }
            }
            if (e.type === ProviderTimelineEventType.PAYMENT && e.payment) {
                const paymentStatusMap: Record<string, { label: string, severity: 'info' | 'success' | 'warning' | 'error' }> = {
                    PENDING: { label: 'Pendiente', severity: 'warning' },
                    PAID: { label: 'Pagado', severity: 'success' },
                    FAILED: { label: 'Fallido', severity: 'error' },
                    CANCELLED: { label: 'Cancelado', severity: 'error' },
                }
                const pConfig = paymentStatusMap[e.payment.status] || { label: e.payment.status, severity: 'info' }

                return {
                    id: `payment-${e.payment.id}-${e.id}`,
                    type: 'PAYMENT',
                    title: `Pago ${pConfig.label.toLowerCase()}`,
                    description: `${e.payment.concept || 'Pago'} · ${e.payment.amount}€`,
                    date: e.createdAt,
                    icon: 'credit-card',
                    severity: pConfig.severity,
                    entityId: e.payment.id,
                    status: e.payment.status,
                    statusLabel: pConfig.label,
                    amount: e.payment.amount
                }
            }
            if (e.type === ProviderTimelineEventType.TASK && e.task) {
                return {
                    id: `task-event-${e.id}`,
                    type: 'TASK',
                    title: e.task.status === "DONE" ? 'Tarea completada' : 'Tarea creada',
                    description: e.task.title,
                    date: e.createdAt,
                    icon: e.task.status === "DONE" ? 'check-circle' : 'circle',
                    severity: e.task.status === "DONE" ? 'success' : 'warning',
                    entityId: e.task.id,
                    status: e.task.status
                }
            }
            if (e.type === ProviderTimelineEventType.FILE && e.ProviderFile) {
                const f = e.ProviderFile
                return {
                    id: `file-${f.id}-${e.id}`,
                    type: 'FILE_ADDED',
                    title: f.name,
                    description: `${f.name} (${f.category})`,
                    date: e.createdAt,
                    icon: 'file-text',
                    importance: 'LOW',
                    entityId: f.id,
                    fileId: f.id,
                    url: f.url,
                    name: f.name,
                    category: f.category
                }
            }
            return null
        }).filter(Boolean) as any[]

        // Map Contact Logs
        const logEvents = contactLogs.map(c => ({
            id: `contact-${c.id}`,
            type: 'CONTACT_LOG',
            title: c.contactType === 'EMAIL' ? 'Email enviado' :
                c.contactType === 'CALL' ? 'Llamada realizada' : 'Contacto registrado',
            description: c.subject || c.notes || 'Interacción con el proveedor',
            date: c.createdAt,
            icon: c.contactType === 'EMAIL' ? 'mail' : c.contactType === 'CALL' ? 'phone' : 'message-circle',
            importance: 'LOW',
            entityId: c.id
        }))

        // Map Files (Global ones without specific events)
        const eventFileIds = new Set(events.filter(e => e.type === 'FILE_ADDED').map(e => e.fileId))
        const fileEvents = providerFiles
            .filter(f => !eventFileIds.has(f.id))
            .map(f => ({
                id: `file-global-${f.id}`,
                type: 'FILE_ADDED',
                title: 'Archivo',
                description: `${f.name} (${f.category})`,
                date: f.createdAt,
                icon: 'file-text',
                importance: 'LOW',
                entityId: f.id,
                url: f.url
            }))

        // Combine and Sort
        const timeline = [...events, ...logEvents, ...fileEvents]
        timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        return timeline
    } catch (error) {
        console.error("Error loading timeline:", error)
        return []
    }
}

// ========================================
// AUTOMATION ACTIONS
// ========================================

/**
 * Toggle critical flag for a provider
 */
export async function toggleProviderCritical(providerId: string, isCritical: boolean) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        await prisma.provider.updateMany({
            where: {
                id: providerId,
                userId: session.user.id
            },
            data: { isCritical }
        })

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/providers")

        return { success: true }
    } catch (error) {
        console.error("Error toggling critical flag:", error)
        return { success: false, error: "Error al actualizar" }
    }
}

/**
 * Update monthly budget limit
 */
export async function updateProviderBudget(providerId: string, limit: number | null) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        await prisma.provider.updateMany({
            where: {
                id: providerId,
                userId: session.user.id
            },
            data: { monthlyBudgetLimit: limit }
        })

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/providers")

        return { success: true }
    } catch (error) {
        console.error("Error updating budget:", error)
        return { success: false, error: "Error al actualizar presupuesto" }
    }
}

/**
 * Update reminder interval (in days)
 */
export async function updateProviderReminder(providerId: string, days: number | null) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        await prisma.provider.updateMany({
            where: {
                id: providerId,
                userId: session.user.id
            },
            data: {
                reminderInterval: days,
                lastReminderDate: days ? new Date() : null
            }
        })

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/providers")

        return { success: true }
    } catch (error) {
        console.error("Error updating reminder:", error)
        return { success: false, error: "Error al actualizar recordatorio" }
    }
}

/**
 * Acknowledge a reminder (updates lastReminderDate)
 */
export async function acknowledgeProviderReminder(providerId: string) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        await prisma.provider.updateMany({
            where: {
                id: providerId,
                userId: session.user.id
            },
            data: { lastReminderDate: new Date() }
        })

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/providers")

        return { success: true }
    } catch (error) {
        console.error("Error acknowledging reminder:", error)
        return { success: false, error: "Error al confirmar recordatorio" }
    }
}

/**
 * Get provider alerts (wrapper for client use)
 */
export async function getProviderAlertsAction(providerId: string) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized", alerts: [] }

    try {
        // Import here to avoid circular dependencies
        const { getProviderAlerts, calculateProviderAutomaticStatus, getSpendingComparison } = await import("@/lib/provider-automations")

        const alerts = await getProviderAlerts(providerId)
        const automaticStatus = await calculateProviderAutomaticStatus(providerId)
        const spendingComparison = await getSpendingComparison(providerId)

        return {
            success: true,
            alerts,
            automaticStatus,
            spendingComparison
        }
    } catch (error) {
        console.error("Error getting alerts:", error)
        return { success: false, error: "Error al obtener alertas", alerts: [] }
    }
}

// ========================================
// QUICK ACTIONS & CONTACT LOG
// ========================================

/**
 * Log a contact interaction with a provider
 */
export async function logProviderContact(
    providerId: string,
    contactType: "EMAIL" | "CALL" | "REMINDER" | "CALENDAR" | "EXTERNAL_LINK",
    subject?: string | null,
    notes?: string | null
) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    await ensureUserExists(session.user)

    try {
        await prisma.providerContactLog.create({
            data: {
                providerId,
                userId: session.user.id,
                contactType,
                subject,
                notes
            }
        })

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/providers")

        return { success: true }
    } catch (error) {
        console.error("Error logging contact:", error)
        return { success: false, error: "Error al registrar contacto" }
    }
}

/**
 * Get contact history for a provider
 */
export async function getProviderContactHistory(providerId: string) {
    const session = await checkAuth()
    if (!session) return []

    try {
        const logs = await prisma.providerContactLog.findMany({
            where: {
                providerId,
                userId: session.user.id
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 50
        })

        return logs
    } catch (error) {
        console.error("Error getting contact history:", error)
        return []
    }
}

/**
 * Save email template for a provider
 */
export async function saveEmailTemplate(
    providerId: string,
    template: { id: string; name: string; subject: string; body: string }
) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const provider = await prisma.provider.findFirst({
            where: {
                id: providerId,
                userId: session.user.id
            }
        })

        if (!provider) {
            return { success: false, error: "Proveedor no encontrado" }
        }

        // Parse existing templates
        let templates: any[] = []
        if (provider.emailTemplates) {
            try {
                templates = JSON.parse(provider.emailTemplates)
            } catch (e) {
                templates = []
            }
        }

        // Add or update template
        const existingIndex = templates.findIndex(t => t.id === template.id)
        if (existingIndex >= 0) {
            templates[existingIndex] = template
        } else {
            templates.push(template)
        }

        // Save back
        await prisma.provider.update({
            where: { id: providerId },
            data: {
                emailTemplates: JSON.stringify(templates)
            }
        })

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/providers")

        return { success: true }
    } catch (error) {
        console.error("Error saving template:", error)
        return { success: false, error: "Error al guardar template" }
    }
}

/**
 * Get email templates for a provider
 */
export async function getEmailTemplates(providerId: string) {
    const session = await checkAuth()
    if (!session) return []

    try {
        const provider = await prisma.provider.findFirst({
            where: {
                id: providerId,
                userId: session.user.id
            }
        })

        if (!provider || !provider.emailTemplates) {
            return []
        }

        return JSON.parse(provider.emailTemplates)
    } catch (error) {
        console.error("Error getting templates:", error)
        return []
    }
}

// ========================================
// OPERATIONAL INTELLIGENCE
// ========================================

/**
 * Get stock risk for a provider
 */
export async function getProviderStockRisk(providerId: string) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized", risk: null }

    try {
        const { calculateStockRisk } = await import("@/lib/provider-operational-intelligence")
        const risk = await calculateStockRisk(providerId)

        return { success: true, risk }
    } catch (error) {
        console.error("Error calculating stock risk:", error)
        return { success: false, error: "Error al calcular riesgo", risk: null }
    }
}

/**
 * Update consumption rate (manual input)
 */
export async function updateProviderConsumptionRate(providerId: string, rate: number | null) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        await prisma.provider.updateMany({
            where: {
                id: providerId,
                userId: session.user.id
            },
            data: { estimatedConsumptionRate: rate }
        })

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/providers")

        return { success: true }
    } catch (error) {
        console.error("Error updating consumption rate:", error)
        return { success: false, error: "Error al actualizar tasa de consumo" }
    }
}

/**
 * Get operational summary for dashboard
 */
export async function getOperationalSummaryAction() {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized", summary: null }

    try {
        const { getOperationalSummary } = await import("@/lib/provider-operational-intelligence")
        const summary = await getOperationalSummary(session.user.id)

        return { success: true, summary }
    } catch (error) {
        console.error("Error getting operational summary:", error)
        return { success: false, error: "Error al obtener resumen", summary: null }
    }
}

/**
 * Update operational data after payment (call this after registerProviderPayment)
 */
export async function updateProviderOperationalDataAction(providerId: string) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const { updateProviderOperationalData, processLightAutomations } = await import("@/lib/provider-operational-intelligence")
        await updateProviderOperationalData(providerId)

        // Trigger light automations
        await processLightAutomations(providerId)

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/providers")

        return { success: true }
    } catch (error) {
        console.error("Error updating operational data:", error)
        return { success: false, error: "Error al actualizar datos operativos" }
    }
}

// ========================================
// ECONOMIC IMPACT & RISK INDICATOR
// ========================================

/**
 * Calculate economic impact metrics & Risk Indicator for a provider
 */
export async function getProviderEconomicImpact(providerId: string) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized", data: null }

    try {
        const now = new Date()
        const oneYearAgo = new Date(now)
        oneYearAgo.setFullYear(now.getFullYear() - 1)

        const threeMonthsAgo = new Date(now)
        threeMonthsAgo.setMonth(now.getMonth() - 3)

        const sixMonthsAgo = new Date(now)
        sixMonthsAgo.setMonth(now.getMonth() - 6)

        // 1. Fetch Provider Details + All Payments
        // We need provider details for Risk Rules (isCritical, budget, etc.)
        const provider = await prisma.provider.findUnique({
            where: { id: providerId, userId: session.user.id }
        })

        if (!provider) return { success: false, error: "Provider not found", data: null }

        // Fetch ALL user payments L12M for global share
        const allPayments = await prisma.providerPayment.findMany({
            where: {
                userId: session.user.id,
                paymentDate: {
                    gte: oneYearAgo
                }
            },
            select: {
                providerId: true,
                amount: true,
                paymentDate: true
            }
        })

        // 2. Calculate Economic Metrics
        const totalUserSpend = allPayments.reduce((sum, p) => sum + p.amount, 0)

        const providerPayments = allPayments.filter(p => p.providerId === providerId)
        const providerTotalSpend = providerPayments.reduce((sum, p) => sum + p.amount, 0)

        const spendPercentage = totalUserSpend > 0
            ? (providerTotalSpend / totalUserSpend) * 100
            : 0

        const monthlyAverage = providerTotalSpend / 12

        // 3. Trend Analysis
        let currentPeriodSpend = 0
        let previousPeriodSpend = 0

        providerPayments.forEach(p => {
            const date = new Date(p.paymentDate)
            if (date >= threeMonthsAgo) {
                currentPeriodSpend += p.amount
            } else if (date >= sixMonthsAgo && date < threeMonthsAgo) {
                previousPeriodSpend += p.amount
            }
        })

        let trend: "UP" | "DOWN" | "STABLE" = "STABLE"
        let delta = 0

        if (previousPeriodSpend === 0) {
            if (currentPeriodSpend > 0) trend = "UP"
        } else {
            delta = ((currentPeriodSpend - previousPeriodSpend) / previousPeriodSpend) * 100
            if (delta > 10) trend = "UP"
            else if (delta < -10) trend = "DOWN"
        }

        // 4. RISK / OPPORTUNITY INDICATOR LOGIC
        // Rules:
        // RED: Critical, >15% spend increase (delta > 15), Over budget (if set), No recent orders (implied if type PRODUCT usually)
        // ORANGE: Important without review (simplify to: notes missing?), Irregular payments (simplify to: large variance or gaps? Let's use > 30 days gap for monthly)
        // BLUE: High spend (> 5% of total), Low dependency
        // GREEN: Else

        let indicator = {
            level: "GREEN" as "GREEN" | "ORANGE" | "RED" | "BLUE",
            label: "Estable",
            reason: "Sin incidencias detectadas"
        }

        const isOverBudget = provider.monthlyBudgetLimit ? (monthlyAverage > provider.monthlyBudgetLimit) : false
        // Basic check for "irregular payments": check if standard deviation is high? Or just if last payment > 45 days ago for a supposed monthly provider?
        // Let's use "Payment Gap" > 45 days if last payment exists
        const lastPaymentDate = providerPayments.length > 0
            ? new Date(Math.max(...providerPayments.map(p => new Date(p.paymentDate).getTime())))
            : null
        const daysSincePayment = lastPaymentDate
            ? Math.floor((now.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24))
            : 999

        // RED Logic
        if (
            (provider.isCritical) ||
            (delta > 15) ||
            (isOverBudget) ||
            (provider.type === "PRODUCT" && (!provider.lastOrderDate || (now.getTime() - new Date(provider.lastOrderDate).getTime()) > 1000 * 60 * 60 * 24 * 60)) // > 60 days
        ) {
            indicator.level = "RED"
            indicator.label = "Riesgo Operativo"
            if (provider.isCritical) indicator.reason = "Proveedor crítico marcado manualmente"
            else if (delta > 15) indicator.reason = `Gasto disparado (+${delta.toFixed(0)}%)`
            else if (isOverBudget) indicator.reason = "Supera el presupuesto mensual asignado"
            else indicator.reason = "Falta registro de pedidos recientes"
        }
        // ORANGE Logic
        else if (
            (provider.dependencyLevel === "HIGH" && !provider.notes) || // Important without notes/review
            (daysSincePayment > 45 && provider.monthlyCost && provider.monthlyCost > 0) // Should pay monthly but didn't
        ) {
            indicator.level = "ORANGE"
            indicator.label = "Revisión Recomendada"
            if (daysSincePayment > 45) indicator.reason = "Pagos irregulares o detenidos"
            else indicator.reason = "Proveedor clave sin notas de revisión"
        }
        // BLUE Logic
        else if (
            providerTotalSpend > 0 &&
            spendPercentage > 5 &&
            provider.dependencyLevel === "LOW"
        ) {
            indicator.level = "BLUE"
            indicator.label = "Oportunidad"
            indicator.reason = "Alto impacto en costes, baja dependencia. Negociable."
        }


        return {
            success: true,
            data: {
                totalSpendL12M: providerTotalSpend,
                monthlyAverage,
                spendPercentage,
                trend,
                indicator // Return the calculated indicator
            }
        }

    } catch (error) {
        console.error("Error calculating economic impact:", error)
        return { success: false, error: "Error al calcular impacto económico", data: null }
    }
}


// ========================================
// LIGHT AUTOMATIONS
// ========================================

/**
 * Update light automation settings for a provider
 */
export async function updateProviderLightAutomations(
    providerId: string,
    data: {
        autoCreateTaskOnRisk?: boolean
        autoNotifyBeforeRestock?: number | null
        autoSuggestOrder?: boolean
    }
) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        // Feature disabled: DB columns do not exist yet
        /* await prisma.provider.updateMany({
            where: {
                id: providerId,
                userId: session.user.id
            },
            data
        }) */

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/providers")

        return { success: true }
    } catch (error) {
        console.error("Error updating light automations:", error)
        return { success: false, error: "Error al actualizar automatizaciones" }
    }
}

/**
 * Get AI insights for a provider
 */
export async function getProviderInsightsAction(providerId: string) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const provider = await prisma.provider.findUnique({
            where: { id: providerId, userId: session.user.id },
            select: { id: true }
        })

        // Default to false since feature is not ready in DB
        const aiInsightsEnabled = false

        if (!provider || !aiInsightsEnabled) {
            return { success: true, insights: [] }
        }

        const { getProviderInsights } = await import("@/lib/provider-insights")
        const allInsights = await getProviderInsights(providerId)

        // Filter out ignored IDs
        const ignoredIds: string[] = []
        const insights = allInsights.filter(ins => !ignoredIds.includes(ins.id))

        return { success: true, insights }
    } catch (error) {
        console.error("Error getting insights:", error)
        return { success: false, error: "Error al obtener insights" }
    }
}

/**
 * Update AI settings for a provider
 */
export async function updateProviderAiSettings(
    providerId: string,
    data: { enabled?: boolean, ignoreId?: string }
) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const provider = await prisma.provider.findUnique({
            where: { id: providerId, userId: session.user.id },
            select: { id: true }
        })

        if (!provider) return { success: false, error: "Provider not found" }

        // Feature disabled: DB columns do not exist yet
        /*
        const updateData: any = {}
        if (data.enabled !== undefined) updateData.aiInsightsEnabled = data.enabled

        if (data.ignoreId) {
            const currentIgnored = provider.ignoredInsightIds ? provider.ignoredInsightIds.split(",") : []
            if (!currentIgnored.includes(data.ignoreId)) {
                updateData.ignoredInsightIds = [...currentIgnored, data.ignoreId].join(",")
            }
        }

        await prisma.provider.update({
            where: { id: providerId },
            data: updateData
        })
        */

        revalidatePath("/dashboard/other/providers")
        return { success: true }
    } catch (error) {
        console.error("Error updating AI settings:", error)
        return { success: false, error: "Error al actualizar ajustes de IA" }
    }
}

/**
 * Get all providers with their AI priority and insights
 */
// ... (cleanup)

export async function getProvidersWithInsightsAction() {
    unstable_noStore() // Ensure fresh data
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }


    try {
        console.log("Fetching providers for user:", session.user.id)
        const providers = await prisma.provider.findMany({
            where: { userId: session.user.id },
            include: {
                payments: { orderBy: { paymentDate: "desc" }, take: 12 },
                tasks: { where: { status: "PENDING" } },
                contactLogs: { orderBy: { createdAt: "desc" }, take: 1 },
                files: { orderBy: { createdAt: "desc" } },
                services: true
            }
        })
        console.log(`Found ${providers.length} providers`)

        const { calculateGlobalPriority, generateProviderInsights } = await import("@/lib/provider-insights")

        const providersWithPriority = await Promise.all(providers.map(async (p) => {
            const insights = generateProviderInsights(p)
            const priority = calculateGlobalPriority(insights)

            // Filter out ignored
            // const ignoredIds = p.ignoredInsightIds ? p.ignoredInsightIds.split(",") : []
            const ignoredIds: string[] = []
            const activeInsights = insights.filter(ins => !ignoredIds.includes(ins.id))

            return {
                ...p,
                aiPriority: priority,
                insightCount: activeInsights.length,
                topInsight: activeInsights[0] || null
            }
        }))

        // Sort by priority DESC
        return {
            success: true,
            providers: providersWithPriority.sort((a, b) => b.aiPriority - a.aiPriority)
        }
    } catch (error) {
        console.error("Error getting providers with insights:", error)
        return { success: false, error: "Error al obtener proveedores" }
    }
}

// ========================================
// FILE MANAGEMENT
// ========================================

/**
 * Create a file record for a provider
 */
export async function createProviderFile(data: {
    providerId: string
    name: string
    url: string
    category: "INVOICE" | "ORDER" | "CONTRACT" | "OTHER"
    group?: string
    notes?: string
    size?: number
    type?: string
}) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    await ensureUserExists(session.user)

    try {
        const file = await prisma.providerFile.create({
            data: {
                userId: session.user.id,
                providerId: data.providerId,
                name: data.name,
                url: data.url,
                category: data.category,
                group: data.group || null,
                notes: data.notes || null,
                size: data.size,
                type: data.type
            }
        })

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/providers")
        return { success: true, file }
    } catch (error) {
        console.error("Error creating file:", error)
        return { success: false, error: "Error al crear archivo" }
    }
}

/**
 * Delete a provider file
 */
export async function deleteProviderFile(fileId: string) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        await prisma.providerFile.delete({
            where: {
                id: fileId,
                userId: session.user.id
            }
        })

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/providers")
        return { success: true }
    } catch (error) {
        console.error("Error deleting file:", error)
        return { success: false, error: "Error al eliminar archivo" }
    }
}

// ========================================
// PROVIDER FILES (contextual)
// ========================================

/**
 * Get all files for a provider, grouped by context (order, payment, general)
 */
export async function getProviderFiles(providerId: string) {
    unstable_noStore()
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized", files: [], grouped: { orders: [], payments: [], general: [] } }

    try {
        const files = await prisma.providerFile.findMany({
            where: { providerId, userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                order: { select: { id: true, description: true, amount: true, status: true, orderDate: true } },
                payment: { select: { id: true, concept: true, amount: true, status: true, paymentDate: true } },
            }
        })

        // Group by context
        const orderFiles = files.filter(f => f.orderId && !f.paymentId)
        const paymentFiles = files.filter(f => f.paymentId)
        const generalFiles = files.filter(f => !f.orderId && !f.paymentId)

        // Group order files by orderId
        const orderGroups: Record<string, { order: any, files: typeof files }> = {}
        for (const f of orderFiles) {
            if (!f.orderId) continue
            if (!orderGroups[f.orderId]) {
                orderGroups[f.orderId] = { order: f.order, files: [] }
            }
            orderGroups[f.orderId].files.push(f)
        }

        // Group payment files by paymentId
        const paymentGroups: Record<string, { payment: any, files: typeof files }> = {}
        for (const f of paymentFiles) {
            if (!f.paymentId) continue
            if (!paymentGroups[f.paymentId]) {
                paymentGroups[f.paymentId] = { payment: f.payment, files: [] }
            }
            paymentGroups[f.paymentId].files.push(f)
        }

        return {
            success: true,
            files,
            grouped: {
                orders: Object.values(orderGroups),
                payments: Object.values(paymentGroups),
                general: generalFiles,
            }
        }
    } catch (error) {
        console.error("Error getting files:", error)
        return { success: false, error: "Error al obtener archivos", files: [], grouped: { orders: [], payments: [], general: [] } }
    }
}

// ========================================
// SERVICES MANAGEMENT
// ========================================

/**
 * Get all services for the current user
 */
export async function getAllServices() {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const services = await prisma.service.findMany({
            where: { userId: session.user.id },
            orderBy: { name: 'asc' }
        })

        return { success: true, services }
    } catch (error) {
        console.error("Error getting services:", error)
        return { success: false, error: "Error al obtener servicios" }
    }
}

/**
 * Create a new service
 */
export async function createService(name: string) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    await ensureUserExists(session.user)

    try {
        const existing = await prisma.service.findFirst({
            where: {
                userId: session.user.id,
                name: { equals: name, mode: 'insensitive' }
            }
        })

        if (existing) return { success: true, service: existing }

        const service = await prisma.service.create({
            data: {
                userId: session.user.id,
                name: name.trim()
            }
        })

        return { success: true, service }
    } catch (error) {
        console.error("Error creating service:", error)
        return { success: false, error: "Error al crear servicio" }
    }
}

/**
 * Link a service to a provider
 */
export async function addServiceToProvider(providerId: string, serviceId: string) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        })

        if (!service) return { success: false, error: "Service not found" }

        await prisma.provider.update({
            where: { id: providerId, userId: session.user.id },
            data: {
                services: {
                    connect: { id: serviceId }
                }
            }
        })

        // Log to timeline
        await prisma.providerContactLog.create({
            data: {
                userId: session.user.id,
                providerId,
                contactType: "EXTERNAL_LINK",
                subject: `Servicio añadido: ${service.name}`,
                notes: "Vinculación operativa registrada"
            }
        })

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/providers")
        return { success: true }
    } catch (error) {
        console.error("Error linking service:", error)
        return { success: false, error: "Error al vincular servicio" }
    }
}

/**
 * Unlink a service from a provider
 */
export async function removeServiceFromProvider(providerId: string, serviceId: string) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        })

        await prisma.provider.update({
            where: { id: providerId, userId: session.user.id },
            data: {
                services: {
                    disconnect: { id: serviceId }
                }
            }
        })

        // Log to timeline
        if (service) {
            await prisma.providerContactLog.create({
                data: {
                    userId: session.user.id,
                    providerId,
                    contactType: "EXTERNAL_LINK",
                    subject: `Servicio eliminado: ${service.name}`,
                    notes: "Desvinculación operativa registrada"
                }
            })
        }

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/providers")
        return { success: true }
    } catch (error) {
        console.error("Error unlinking service:", error)
        return { success: false, error: "Error al desvincular servicio" }
    }
}

// ========================================
// ORDERS MANAGEMENT
// ========================================

/**
 * Create a new provider order (Source of Truth)
 */
export async function createProviderOrder(data: {
    providerId: string
    orderDate: Date
    amount: number
    expectedDeliveryDate?: Date
    type?: ProviderOrderType
    description?: string
    status?: ProviderOrderStatus
}) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    const isDbAlive = await safeDbCheck()
    if (!isDbAlive) return { success: false, error: "Base de datos no disponible." }

    await ensureUserExists(session.user)

    try {
        const orderType = data.type || ProviderOrderType.ONE_TIME
        // New orders start as DRAFT or PENDING, never as COMPLETED/PAID
        const orderStatus = data.status === ProviderOrderStatus.DRAFT
            ? ProviderOrderStatus.DRAFT
            : ProviderOrderStatus.PENDING

        const result = await safePrismaQuery(() => prisma.$transaction(async (tx) => {
            // 1. Create Order (NO auto-payment — payments are explicit)
            const newOrder = await tx.providerOrder.create({
                data: {
                    userId: session.user.id,
                    providerId: data.providerId,
                    orderDate: data.orderDate,
                    amount: data.amount,
                    expectedDeliveryDate: data.expectedDeliveryDate,
                    description: data.description,
                    type: orderType,
                    status: orderStatus,
                },
                include: {
                    payment: true
                }
            })

            // 2. Create Timeline Event: ORDER_CREATED
            await tx.providerTimelineEvent.create({
                data: {
                    userId: session.user.id,
                    providerId: data.providerId,
                    type: ProviderTimelineEventType.ORDER,
                    orderId: newOrder.id
                }
            })

            return newOrder
        }))

        // Refresh analytics
        try {
            const { updateProviderOperationalData } = await import("@/lib/provider-operational-intelligence")
            await updateProviderOperationalData(data.providerId)
        } catch (e) {
            console.error("Operational update failed", e)
        }

        revalidatePath("/dashboard/providers")
        return { success: true, order: result }

    } catch (error) {
        console.error("Error creating provider order:", error)
        return { success: false, error: "Error al crear el pedido" }
    }
}

// ────────────────────────────────────────────────────────────
// ORDER STATUS TRANSITIONS (with sync rules)
// ────────────────────────────────────────────────────────────
// FASE B: Flujo PENDING → RECEIVED → PAID (solo vía pago) | CANCELLED
// RECEIVED no puede pasar a PAID/CLOSED manualmente; solo al marcar pago como PAID.
const VALID_ORDER_TRANSITIONS: Record<string, string[]> = {
    DRAFT: ["PENDING", "CANCELLED"],
    PENDING: ["RECEIVED", "CANCELLED", "ISSUE"],
    RECEIVED: ["CANCELLED", "ISSUE"], // PAID solo vía updateProviderPaymentStatus/registerProviderPayment
    ISSUE: ["RECEIVED", "CANCELLED"],
    CANCELLED: [],
    PAID: [],
    CLOSED: [],
}

/**
 * Update order status with validation and sync rules
 */
export async function updateProviderOrderStatus(
    orderId: string,
    newStatus: "DRAFT" | "PENDING" | "RECEIVED" | "ISSUE" | "CANCELLED" | "CLOSED" | "PAID"
) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const result = await safePrismaQuery(() => prisma.$transaction(async (tx) => {
            const currentOrder = await tx.providerOrder.findUnique({
                where: { id: orderId, userId: session.user.id },
                include: { payment: true }
            })

            if (!currentOrder) throw new Error("Pedido no encontrado")
            if (currentOrder.status === newStatus) return currentOrder

            // Validate transition
            const allowed = VALID_ORDER_TRANSITIONS[currentOrder.status] || []
            if (!allowed.includes(newStatus)) {
                throw new Error(`Transición inválida: ${currentOrder.status} → ${newStatus}`)
            }

            // PAID/CLOSED solo vía pago (no transición manual desde RECEIVED)
            if ((newStatus === "CLOSED" || newStatus === "PAID") && currentOrder.payment?.status !== "PAID") {
                throw new Error("El pedido solo puede estar pagado cuando existe un pago completado. Use «Registrar pago».")
            }

            // Update order
            const order = await tx.providerOrder.update({
                where: { id: orderId, userId: session.user.id },
                data: { status: newStatus as ProviderOrderStatus },
                include: { payment: true }
            })

            // Timeline event
            await tx.providerTimelineEvent.create({
                data: {
                    userId: session.user.id,
                    providerId: order.providerId,
                    type: ProviderTimelineEventType.ORDER,
                    orderId: order.id
                }
            })

            // Sync: PAID/CLOSED → update lastOrderDate
            if (newStatus === "PAID" || newStatus === "CLOSED") {
                await tx.provider.update({
                    where: { id: order.providerId },
                    data: { lastOrderDate: new Date() }
                })
            }

            // Sync: CANCELLED → cancel linked payment if PENDING
            if (newStatus === "CANCELLED" && order.payment && order.payment.status === "PENDING") {
                await tx.providerPayment.update({
                    where: { id: order.payment.id },
                    data: { status: "CANCELLED" }
                })
                await tx.providerTimelineEvent.create({
                    data: {
                        userId: session.user.id,
                        providerId: order.providerId,
                        type: ProviderTimelineEventType.PAYMENT,
                        paymentId: order.payment.id,
                        orderId: order.id
                    }
                })
            }

            // Sync: Check if provider has no more pending/issue orders → set OK
            if (newStatus === "CLOSED" || newStatus === "CANCELLED") {
                const activeOrders = await tx.providerOrder.count({
                    where: {
                        providerId: order.providerId,
                        status: { in: ["PENDING", "RECEIVED", "ISSUE", "DRAFT"] }
                    }
                })
                if (activeOrders === 0) {
                    await tx.provider.update({
                        where: { id: order.providerId },
                        data: { status: "OK" }
                    })
                }
            }

            return order
        }))

        revalidatePath("/dashboard/providers")
        return { success: true, order: result }
    } catch (error: any) {
        console.error("Error updating order status:", error)
        return { success: false, error: error.message || "Error al actualizar pedido" }
    }
}

/**
 * Legacy compat: completeProviderOrder maps to updateProviderOrderStatus
 */
export async function completeProviderOrder(orderId: string, newStatus: "COMPLETED" | "RECEIVED") {
    // Map legacy values to new system
    const mappedStatus = newStatus === "RECEIVED" ? "RECEIVED" : "CLOSED"
    return updateProviderOrderStatus(orderId, mappedStatus as any)
}

/**
 * Update order status to CANCELLED
 */
export async function cancelProviderOrder(orderId: string) {
    return updateProviderOrderStatus(orderId, "CANCELLED")
}

// Log to timeline as highly important


/**
 * Update provider operational status
 */
/**
 * Update provider operational status
 */
export async function updateProviderOperationalDetails(providerId: string, data: {
    operationalState?: "OK" | "ATTENTION" | "RISK"
    dependencyLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    hasAlternative?: boolean
    affectedArea?: string
}) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const updateData: any = {}
        if (data.operationalState) updateData.operationalState = data.operationalState
        if (data.dependencyLevel) updateData.dependencyLevel = data.dependencyLevel
        if (data.hasAlternative !== undefined) updateData.hasAlternative = data.hasAlternative
        if (data.affectedArea) updateData.affectedArea = data.affectedArea

        await prisma.provider.update({
            where: { id: providerId, userId: session.user.id },
            data: updateData
        })

        // Log sensitive status changes
        if (data.operationalState) {
            await prisma.providerContactLog.create({
                data: {
                    userId: session.user.id,
                    providerId,
                    contactType: "EXTERNAL_LINK",
                    subject: "Cambio de Estado Operativo",
                    notes: `Nuevo estado: ${data.operationalState}`
                }
            })
        }

        revalidatePath("/dashboard/providers")
        revalidatePath("/dashboard/other/providers")
        return { success: true }
    } catch (error) {
        console.error("Error updating operational details:", error)
        return { success: false, error: "Error al actualizar estado operativo" }
    }
}

/**
 * Get provider orders - Always fresh data
 */
export async function getProviderOrders(providerId: string) {
    unstable_noStore() // Prevent caching
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const orders = await prisma.providerOrder.findMany({
            where: { providerId, userId: session.user.id },
            orderBy: { orderDate: 'desc' },
            include: {
                payment: true,
                files: true,
                invoice: { select: { id: true, number: true, status: true, total: true } }
            }
        })
        return { success: true, orders }
    } catch (error) {
        console.error("Error getting orders:", error)
        return { success: false, error: "Error al obtener pedidos" }
    }
}

/**
 * Register a file specifically for a provider, optionally linked to an order.
 * This ensures the file appears in the timeline.
 */
export async function registerProviderFile(data: {
    providerId: string
    name: string
    url: string
    category: "INVOICE" | "ORDER" | "CONTRACT" | "OTHER"
    size?: number
    type?: string
    orderId?: string
    paymentId?: string
}) {
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const file = await tx.providerFile.create({
                data: {
                    userId: session.user.id,
                    providerId: data.providerId,
                    name: data.name,
                    url: data.url,
                    category: data.category as any,
                    size: data.size,
                    type: data.type,
                    orderId: data.orderId,
                    paymentId: data.paymentId,
                }
            })

            // Timeline event for the file (FILE type + fileId so it appears in timeline)
            await tx.providerTimelineEvent.create({
                data: {
                    userId: session.user.id,
                    providerId: data.providerId,
                    type: ProviderTimelineEventType.FILE,
                    fileId: file.id,
                    orderId: data.orderId,
                    paymentId: data.paymentId,
                }
            })

            return file
        })

        // When attaching an INVOICE to an order, create/link the billing Invoice (Flujo B — single source of truth)
        if (data.category === "INVOICE" && data.orderId) {
            try {
                await createInvoiceForProviderOrder(data.orderId, session.user.id)
            } catch (e) {
                console.error("createInvoiceForProviderOrder failed:", e)
            }
        }

        revalidatePath("/dashboard/providers")
        return { success: true, file: result }
    } catch (error) {
        console.error("Error registering file:", error)
        return { success: false, error: "Error al registrar archivo" }
    }
}

/**
 * Get provider tasks - Always fresh data
 */
export async function getProviderTasks(providerId: string) {
    unstable_noStore() // Prevent caching
    const session = await checkAuth()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const tasks = await prisma.providerTask.findMany({
            where: { providerId, userId: session.user.id },
            orderBy: [{ status: 'asc' }, { dueDate: 'asc' }]
        })
        return { success: true, tasks }
    } catch (error) {
        console.error("Error getting tasks:", error)
        return { success: false, error: "Error al obtener tareas" }
    }
}
