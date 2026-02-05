import { prisma } from "@/lib/prisma"
import { startOfMonth, endOfMonth, subMonths, differenceInDays } from "date-fns"

/**
 * Calculate provider alerts based on spending, reminders, and status
 * Returns clear, actionable alerts without AI
 */

export type ProviderAlert = {
    type: "BUDGET_EXCEEDED" | "BUDGET_WARNING" | "UNUSUAL_SPENDING" | "REMINDER_DUE" | "CRITICAL_PROVIDER" | "OVERDUE_TASK"
    severity: "LOW" | "MEDIUM" | "HIGH"
    message: string
    details?: string
}

/**
 * Get all alerts for a provider
 */
export async function getProviderAlerts(providerId: string): Promise<ProviderAlert[]> {
    const provider = await prisma.provider.findUnique({
        where: { id: providerId },
        include: {
            payments: {
                orderBy: { paymentDate: "desc" },
                take: 100 // Last 100 payments for analysis
            },
            tasks: {
                where: { status: "PENDING" },
                orderBy: { dueDate: "asc" }
            }
        }
    })

    if (!provider) return []

    const alerts: ProviderAlert[] = []

    // 1. CRITICAL PROVIDER FLAG (highest priority)
    if (provider.isCritical) {
        alerts.push({
            type: "CRITICAL_PROVIDER",
            severity: "HIGH",
            message: "Proveedor marcado como crítico",
            details: "Requiere atención prioritaria"
        })
    }

    // 2. BUDGET ALERTS
    if (provider.monthlyBudgetLimit && provider.monthlyBudgetLimit > 0) {
        const currentMonthSpending = await getMonthlySpending(providerId, new Date())
        const budgetUsage = (currentMonthSpending / provider.monthlyBudgetLimit) * 100

        if (budgetUsage >= 100) {
            alerts.push({
                type: "BUDGET_EXCEEDED",
                severity: "HIGH",
                message: `Presupuesto excedido (${budgetUsage.toFixed(0)}%)`,
                details: `Gastado: ${formatCurrency(currentMonthSpending)} de ${formatCurrency(provider.monthlyBudgetLimit)}`
            })
        } else if (budgetUsage >= 80) {
            alerts.push({
                type: "BUDGET_WARNING",
                severity: "MEDIUM",
                message: `Presupuesto al ${budgetUsage.toFixed(0)}%`,
                details: `Gastado: ${formatCurrency(currentMonthSpending)} de ${formatCurrency(provider.monthlyBudgetLimit)}`
            })
        }
    }

    // 3. UNUSUAL SPENDING DETECTION (simple comparison with previous month)
    const currentMonthSpending = await getMonthlySpending(providerId, new Date())
    const previousMonthSpending = await getMonthlySpending(providerId, subMonths(new Date(), 1))

    if (previousMonthSpending > 0 && currentMonthSpending > 0) {
        const increasePercentage = ((currentMonthSpending - previousMonthSpending) / previousMonthSpending) * 100

        if (increasePercentage >= 50) {
            alerts.push({
                type: "UNUSUAL_SPENDING",
                severity: "MEDIUM",
                message: `Gasto inusual (+${increasePercentage.toFixed(0)}% vs mes anterior)`,
                details: `Mes actual: ${formatCurrency(currentMonthSpending)} | Mes anterior: ${formatCurrency(previousMonthSpending)}`
            })
        }
    }

    // 4. REMINDER ALERTS
    if (provider.reminderInterval && provider.reminderInterval > 0) {
        const daysSinceLastReminder = provider.lastReminderDate
            ? differenceInDays(new Date(), provider.lastReminderDate)
            : provider.reminderInterval + 1 // Trigger immediately if never reminded

        if (daysSinceLastReminder >= provider.reminderInterval) {
            alerts.push({
                type: "REMINDER_DUE",
                severity: "LOW",
                message: `Recordatorio de pedido`,
                details: `Configurado cada ${provider.reminderInterval} días`
            })
        }
    }

    // 5. OVERDUE TASKS
    const now = new Date()
    const overdueTasks = provider.tasks.filter(task =>
        task.dueDate && task.dueDate < now
    )

    if (overdueTasks.length > 0) {
        const highPriorityOverdue = overdueTasks.filter(t => t.priority === "HIGH")

        if (highPriorityOverdue.length > 0) {
            alerts.push({
                type: "OVERDUE_TASK",
                severity: "HIGH",
                message: `${highPriorityOverdue.length} tarea(s) prioritaria(s) vencida(s)`,
                details: highPriorityOverdue[0].title
            })
        } else {
            alerts.push({
                type: "OVERDUE_TASK",
                severity: "MEDIUM",
                message: `${overdueTasks.length} tarea(s) vencida(s)`,
                details: overdueTasks[0].title
            })
        }
    }

    return alerts
}

/**
 * Get monthly spending for a provider
 */
async function getMonthlySpending(providerId: string, date: Date): Promise<number> {
    const start = startOfMonth(date)
    const end = endOfMonth(date)

    const result = await prisma.providerPayment.aggregate({
        where: {
            providerId,
            paymentDate: {
                gte: start,
                lte: end
            }
        },
        _sum: {
            amount: true
        }
    })

    return result._sum.amount || 0
}

/**
 * Calculate automatic provider status based on clear rules
 * NORMAL: No alerts or only LOW severity
 * ATENCIÓN: MEDIUM severity alerts
 * CRÍTICO: HIGH severity alerts or isCritical flag
 */
export async function calculateProviderAutomaticStatus(providerId: string): Promise<"NORMAL" | "ATENCIÓN" | "CRÍTICO"> {
    const alerts = await getProviderAlerts(providerId)

    // Critical flag always wins
    if (alerts.some(a => a.type === "CRITICAL_PROVIDER")) {
        return "CRÍTICO"
    }

    // Any HIGH severity alert
    if (alerts.some(a => a.severity === "HIGH")) {
        return "CRÍTICO"
    }

    // Any MEDIUM severity alert
    if (alerts.some(a => a.severity === "MEDIUM")) {
        return "ATENCIÓN"
    }

    return "NORMAL"
}

/**
 * Get spending comparison with previous month
 */
export async function getSpendingComparison(providerId: string) {
    const currentMonth = await getMonthlySpending(providerId, new Date())
    const previousMonth = await getMonthlySpending(providerId, subMonths(new Date(), 1))

    const difference = currentMonth - previousMonth
    const percentageChange = previousMonth > 0
        ? (difference / previousMonth) * 100
        : 0

    return {
        currentMonth,
        previousMonth,
        difference,
        percentageChange,
        trend: difference > 0 ? "up" : difference < 0 ? "down" : "stable"
    }
}

/**
 * Update reminder date (call this when user acknowledges a reminder)
 */
export async function acknowledgeReminder(providerId: string) {
    await prisma.provider.update({
        where: { id: providerId },
        data: { lastReminderDate: new Date() }
    })
}

/**
 * Toggle critical flag
 */
export async function toggleCriticalFlag(providerId: string, isCritical: boolean) {
    return await prisma.provider.update({
        where: { id: providerId },
        data: { isCritical }
    })
}

/**
 * Update budget limit
 */
export async function updateBudgetLimit(providerId: string, limit: number | null) {
    return await prisma.provider.update({
        where: { id: providerId },
        data: { monthlyBudgetLimit: limit }
    })
}

/**
 * Update reminder interval
 */
export async function updateReminderInterval(providerId: string, days: number | null) {
    return await prisma.provider.update({
        where: { id: providerId },
        data: {
            reminderInterval: days,
            lastReminderDate: days ? new Date() : null // Reset reminder date when setting interval
        }
    })
}

// Helper
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}
