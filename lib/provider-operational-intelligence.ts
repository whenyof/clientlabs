import { prisma } from "@/lib/prisma"
import { differenceInDays } from "date-fns"

/**
 * Operational intelligence for providers
 * Simple, rule-based stock risk calculation
 */

export type StockRiskLevel = "OK" | "REPONER_PRONTO" | "RIESGO"

export type StockRiskIndicator = {
    level: StockRiskLevel
    message: string
    daysSinceLastOrder: number
    daysUntilReorder: number | null
    recommendedAction?: string
}

/**
 * Calculate stock risk for a provider
 * Based on: last order date, average frequency, estimated consumption
 */
/**
 * Calculate stock risk for a provider
 * Based on: last order date, average frequency, estimated consumption
 */
export async function calculateStockRisk(providerId: string): Promise<StockRiskIndicator> {
    const provider = await prisma.provider.findUnique({
        where: { id: providerId },
        include: {
            payments: {
                orderBy: { paymentDate: "desc" },
                take: 10 // Last 10 orders for frequency calculation
            },
            orders: {
                orderBy: { orderDate: "desc" },
                take: 1
            }
        }
    })

    if (!provider) {
        return {
            level: "OK",
            message: "Proveedor no encontrado",
            daysSinceLastOrder: 0,
            daysUntilReorder: null
        }
    }

    return calculateStockRiskFromData(provider)
}

/**
 * Calculate stock risk from existing provider data (Avoids DB call)
 */
export function calculateStockRiskFromData(provider: any): StockRiskIndicator {
    // Calculate or use cached values
    // Priority: Explicit lastOrderDate > Most recent Order > Most recent Payment
    let lastActivityDate = provider.lastOrderDate

    if (!lastActivityDate) {
        const lastPayment = provider.payments?.[0]?.paymentDate
        const lastOrder = provider.orders?.[0]?.orderDate

        if (lastOrder && lastPayment) {
            lastActivityDate = new Date(lastOrder) > new Date(lastPayment) ? lastOrder : lastPayment
        } else {
            lastActivityDate = lastOrder || lastPayment
        }
    }

    const lastOrderDate = lastActivityDate || null

    const averageFrequency = provider.averageOrderFrequency ||
        calculateAverageFrequency(provider.payments || [])

    const daysSinceLastOrder = lastOrderDate
        ? differenceInDays(new Date(), new Date(lastOrderDate))
        : 0

    // Simple rule-based risk calculation
    if (!lastOrderDate || !averageFrequency) {
        return {
            level: "OK",
            message: "Sin datos suficientes para calcular riesgo",
            daysSinceLastOrder: 0,
            daysUntilReorder: null
        }
    }

    // Calculate days until recommended reorder
    const daysUntilReorder = averageFrequency - daysSinceLastOrder

    // Risk levels based on clear thresholds
    if (daysSinceLastOrder >= averageFrequency) {
        // Already past average frequency
        return {
            level: "RIESGO",
            message: `Pedido vencido (${daysSinceLastOrder} días sin pedido)`,
            daysSinceLastOrder,
            daysUntilReorder: 0,
            recommendedAction: "Enviar pedido urgente"
        }
    } else if (daysSinceLastOrder >= averageFrequency * 0.8) {
        // 80% of average frequency reached
        return {
            level: "REPONER_PRONTO",
            message: `Reponer pronto (${daysUntilReorder} días restantes)`,
            daysSinceLastOrder,
            daysUntilReorder,
            recommendedAction: "Preparar pedido"
        }
    } else {
        // Still OK
        return {
            level: "OK",
            message: `Stock OK (${daysUntilReorder} días restantes)`,
            daysSinceLastOrder,
            daysUntilReorder
        }
    }
}

/**
 * Calculate average frequency between orders
 */
function calculateAverageFrequency(payments: any[]): number | null {
    if (payments.length < 2) return null

    const sortedPayments = [...payments].sort((a, b) =>
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    )

    let totalDays = 0
    let intervals = 0

    for (let i = 0; i < sortedPayments.length - 1; i++) {
        const days = differenceInDays(
            new Date(sortedPayments[i].paymentDate),
            new Date(sortedPayments[i + 1].paymentDate)
        )
        totalDays += days
        intervals++
    }

    return intervals > 0 ? Math.round(totalDays / intervals) : null
}

/**
 * Update provider operational data (call after new payment)
 */
export async function updateProviderOperationalData(providerId: string) {
    const provider = await prisma.provider.findUnique({
        where: { id: providerId },
        include: {
            payments: {
                orderBy: { paymentDate: "desc" },
                take: 10
            },
            orders: {
                orderBy: { orderDate: "desc" },
                take: 1
            }
        }
    })

    if (!provider) return

    // Re-calculate lastOrderDate properly mixing orders and payments
    let lastOrderDate = provider.lastOrderDate

    // If not set, or we want to ensure it's up to date with latest data:
    const lastPayment = provider.payments[0]?.paymentDate
    const lastOrder = provider.orders[0]?.orderDate

    let latestActivity = null
    if (lastOrder && lastPayment) {
        latestActivity = new Date(lastOrder) > new Date(lastPayment) ? lastOrder : lastPayment
    } else {
        latestActivity = lastOrder || lastPayment
    }

    lastOrderDate = latestActivity

    const averageFrequency = calculateAverageFrequency(provider.payments)

    await prisma.provider.update({
        where: { id: providerId },
        data: {
            lastOrderDate,
            averageOrderFrequency: averageFrequency
        }
    })
}

/**
 * Get all providers sorted by operational priority
 * RIESGO > REPONER_PRONTO > OK
 */
export async function getProvidersByOperationalPriority(userId: string) {
    const providers = await prisma.provider.findMany({
        where: { userId },
        include: {
            payments: {
                orderBy: { paymentDate: "desc" },
                take: 10
            },
            orders: {
                orderBy: { orderDate: "desc" },
                take: 1
            },
            _count: {
                select: {
                    payments: true,
                    tasks: true
                }
            }
        }
    })

    // Calculate risk for each provider
    const providersWithRisk = providers.map((provider) => {
        const risk = calculateStockRiskFromData(provider)
        return {
            ...provider,
            stockRisk: risk
        }
    })

    // Sort by priority: RIESGO > REPONER_PRONTO > OK
    const priorityOrder = {
        RIESGO: 0,
        REPONER_PRONTO: 1,
        OK: 2
    }

    return providersWithRisk.sort((a, b) => {
        const aPriority = priorityOrder[a.stockRisk.level]
        const bPriority = priorityOrder[b.stockRisk.level]

        if (aPriority !== bPriority) {
            return aPriority - bPriority
        }

        // If same priority, sort by days since last order (descending)
        return b.stockRisk.daysSinceLastOrder - a.stockRisk.daysSinceLastOrder
    })
}

/**
 * Update consumption rate (manual input from user)
 */
export async function updateConsumptionRate(providerId: string, rate: number | null) {
    return await prisma.provider.update({
        where: { id: providerId },
        data: { estimatedConsumptionRate: rate }
    })
}

/**
 * Get operational summary for dashboard KPIs
 */
export async function getOperationalSummary(userId: string) {
    const providers = await getProvidersByOperationalPriority(userId)

    const riskCount = providers.filter(p => p.stockRisk.level === "RIESGO").length
    const soonCount = providers.filter(p => p.stockRisk.level === "REPONER_PRONTO").length
    const okCount = providers.filter(p => p.stockRisk.level === "OK").length

    return {
        total: providers.length,
        risk: riskCount,
        soon: soonCount,
        ok: okCount,
        needsAction: riskCount + soonCount
    }
}

/**
 * Process light automations based on current risk level
 * This is called whenever operational data is updated
 */
export async function processLightAutomations(providerId: string) {
    const provider = await prisma.provider.findUnique({
        where: { id: providerId },
        include: {
            tasks: {
                where: { status: "PENDING" }
            }
        }
    })

    if (!provider) return

    const risk = await calculateStockRisk(providerId)

    // 1. autoCreateTaskOnRisk: Create task when stock enters RIESGO
    // 1. autoCreateTaskOnRisk: Create task when stock enters RIESGO
    if (provider.autoCreateTaskOnRisk && risk.level === "RIESGO") {
        const taskExists = provider.tasks.some(t => t.title.includes("REPOSICIÓN URGENTE"))
        if (!taskExists) {
            await prisma.providerTask.create({
                data: {
                    providerId,
                    userId: provider.userId,
                    title: `⚠️ REPOSICIÓN URGENTE: ${provider.name}`,
                    description: `El sistema ha detectado un riesgo de stock. ${risk.message}. Se recomienda realizar un pedido inmediatamente.`,
                    priority: "HIGH",
                    dueDate: new Date()
                }
            })
        }
    }

    // 2. autoNotifyBeforeRestock: Avisar X días antes de reposición estimada
    if (provider.autoNotifyBeforeRestock && risk.daysUntilReorder !== null) {
        if (risk.daysUntilReorder <= provider.autoNotifyBeforeRestock && risk.daysUntilReorder > 0) {
            const taskExists = provider.tasks.some(t => t.title.includes("Preparar reposición"))
            if (!taskExists) {
                const dueDate = new Date()
                dueDate.setDate(dueDate.getDate() + Math.max(0, risk.daysUntilReorder))

                await prisma.providerTask.create({
                    data: {
                        providerId,
                        userId: provider.userId,
                        title: `📦 Preparar reposición: ${provider.name}`,
                        description: `Recordatorio automático: Faltan aproximadamente ${risk.daysUntilReorder} días para que sea necesario reponer stock.`,
                        priority: "MEDIUM",
                        dueDate
                    }
                })
            }
        }
    }
}
