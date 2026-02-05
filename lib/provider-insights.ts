import { prisma } from "@/lib/prisma"
import { differenceInDays, subDays } from "date-fns"
import { calculateStockRisk, calculateStockRiskFromData, StockRiskIndicator } from "./provider-operational-intelligence"

export type InsightType = "RISK" | "OPPORTUNITY" | "INFO" | "ALERT"
export type InsightAction = "CONTACT" | "TASK" | "REVIEW_STOCK" | "PAYMENT" | "NONE"

export interface ProviderInsight {
    id: string
    type: InsightType
    title: string
    message: string
    reason: string
    priority: number // 0 to 100
    action: InsightAction
    actionLabel?: string
}

/**
 * Generates contextual insights for a provider based on real data
 */
export async function getProviderInsights(providerId: string): Promise<ProviderInsight[]> {
    const provider = await prisma.provider.findUnique({
        where: { id: providerId },
        include: {
            payments: {
                orderBy: { paymentDate: "desc" },
                take: 12 // Last year of orders approx
            },
            tasks: {
                where: { status: "PENDING" }
            },
            contactLogs: {
                orderBy: { createdAt: "desc" },
                take: 1
            }
        }
    })

    if (!provider) return []

    return generateProviderInsights(provider)
}

/**
 * Generates insights from existing provider data (Avoids DB call)
 */
export function generateProviderInsights(provider: any): ProviderInsight[] {
    const insights: ProviderInsight[] = []

    // 1. STOCK RISK INSIGHT
    // Use cached risk calculation avoiding DB
    const risk = calculateStockRiskFromData(provider)

    if (risk.level === "RIESGO") {
        insights.push({
            id: `risk-stock-${provider.id}`,
            type: "RISK",
            title: "Riesgo de rotura de stock",
            message: "Se estima que el stock está en niveles críticos.",
            reason: `Basado en tu frecuencia media de ${provider.averageOrderFrequency || 0} días y que tu último pedido fue hace ${risk.daysSinceLastOrder} días.`,
            priority: 95,
            action: "CONTACT",
            actionLabel: "Realizar pedido"
        })
    } else if (risk.level === "REPONER_PRONTO") {
        insights.push({
            id: `risk-stock-soon-${provider.id}`,
            type: "ALERT",
            title: "Reposición próxima",
            message: "Deberías preparar un nuevo pedido en los próximos días.",
            reason: `Estás al 80% del ciclo habitual de pedido. Faltan aprox. ${risk.daysUntilReorder} días.`,
            priority: 60,
            action: "TASK",
            actionLabel: "Crear recordatorio"
        })
    }

    // 2. BUDGET / COST INSIGHT
    if (provider.monthlyBudgetLimit && provider.payments?.length > 0) {
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()

        const monthlyTotal = provider.payments
            .filter((p: any) => new Date(p.paymentDate).getMonth() === currentMonth && new Date(p.paymentDate).getFullYear() === currentYear)
            .reduce((sum: number, p: any) => sum + p.amount, 0)

        if (monthlyTotal > provider.monthlyBudgetLimit) {
            insights.push({
                id: `budget-exceeded-${provider.id}`,
                type: "ALERT",
                title: "Presupuesto excedido",
                message: `Has superado el límite mensual de ${provider.monthlyBudgetLimit}€.`,
                reason: `El gasto acumulado este mes es de ${monthlyTotal.toFixed(2)}€.`,
                priority: 85,
                action: "REVIEW_STOCK",
                actionLabel: "Revisar costes"
            })
        }
    }

    // 3. INACTIVITY INSIGHT
    const lastContactDate = provider.contactLogs?.[0]?.createdAt || provider.createdAt
    const daysSinceContact = differenceInDays(new Date(), new Date(lastContactDate))

    if (daysSinceContact > 45 && provider.dependency === "HIGH") {
        insights.push({
            id: `inactivity-${provider.id}`,
            type: "OPPORTUNITY",
            title: "Falta de contacto",
            message: "No has interactuado con este proveedor estratégico en más de 45 días.",
            reason: `Es un proveedor de dependencia ALTA. Mantener la relación es clave para negociaciones futuras.`,
            priority: 40,
            action: "CONTACT",
            actionLabel: "Contactar"
        })
    }

    // 4. VOLUME OPPORTUNITY (Simple logic: if a lot of small payments, suggest consolidation)
    const recentPayments = provider.payments?.slice(0, 5) || []
    if (recentPayments.length >= 3) {
        const avgAmount = recentPayments.reduce((sum: number, p: any) => sum + p.amount, 0) / recentPayments.length
        // const totalAmount = recentPayments.reduce((sum: number, p: any) => sum + p.amount, 0)
        const daysSpan = differenceInDays(new Date(recentPayments[0].paymentDate), new Date(recentPayments[recentPayments.length - 1].paymentDate))

        if (daysSpan < 30 && avgAmount < 200) {
            insights.push({
                id: `consolidation-${provider.id}`,
                type: "OPPORTUNITY",
                title: "Oportunidad de consolidación",
                message: "Estás realizando muchos pedidos pequeños en poco tiempo.",
                reason: `Has hecho ${recentPayments.length} pedidos en ${daysSpan} días. Consolidar pedidos podría reducir costes de envío o gestión.`,
                priority: 30,
                action: "REVIEW_STOCK",
                actionLabel: "Analizar pedidos"
            })
        }
    }

    return insights.sort((a, b) => b.priority - a.priority)
}

/**
 * Calculate global priority score from insights
 */
export function calculateGlobalPriority(insights: ProviderInsight[]): number {
    if (insights.length === 0) return 0

    // Weighted priority: highest priority insight is the base, others add a small bonus
    const maxPriority = insights[0].priority
    const bonus = insights.slice(1).reduce((acc, ins) => acc + (ins.priority * 0.1), 0)

    return maxPriority + bonus
}

/**
 * Calculates a global priority score for sorting the provider list
 */
export async function getProviderGlobalPriority(providerId: string): Promise<number> {
    const insights = await getProviderInsights(providerId)
    return calculateGlobalPriority(insights)
}
