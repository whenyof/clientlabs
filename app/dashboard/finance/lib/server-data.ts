/**
 * Server-side finance data. Same logic as analytics API.
 * Used by the finance page (server component) — no API calls, no 401.
 */

import { prisma } from "@/lib/prisma"
import {
  getFinanceSummary,
  getFinanceMonthlyTrend,
  getFinanceChartSeries,
} from "@/modules/finance/services/finance-aggregator"
import { getUnifiedMovements } from "@/modules/finance/finance-engine"
import { getMovements } from "@/modules/finance/movements"
import type { Movement } from "@/modules/finance/movements"
import { predictMonthlyRevenue, predictMonthlyExpenses, predictCashFlow } from "./predictors"
import { detectRecurringExpenses } from "./recurring-expenses"

function growthRate(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / Math.abs(previous)) * 100
}

function getDateRange(period: string) {
  const now = new Date()
  switch (period) {
    case "today":
    case "day":
      return {
        from: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
        to: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
      }
    case "week": {
      const from = new Date(now)
      from.setDate(from.getDate() - 6)
      from.setHours(0, 0, 0, 0)
      return {
        from,
        to: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
      }
    }
    case "quarter": {
      const q = Math.floor(now.getMonth() / 3)
      const toDate = new Date(now.getFullYear(), q * 3 + 3, 0)
      return {
        from: new Date(now.getFullYear(), q * 3, 1),
        to: new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 999),
      }
    }
    case "year":
      return {
        from: new Date(now.getFullYear(), 0, 1),
        to: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
      }
    default:
      // month
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
      }
  }
}

function getPreviousRange(period: string, from: Date, to: Date): { from: Date; to: Date } {
  const prevFrom = new Date(from)
  const prevTo = new Date(to)
  if (period === "today" || period === "day" || period === "week") {
    const days = Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)) + 1
    prevFrom.setDate(prevFrom.getDate() - days)
    prevTo.setDate(prevTo.getDate() - days)
  } else if (period === "month") {
    prevFrom.setMonth(prevFrom.getMonth() - 1)
    prevTo.setMonth(prevTo.getMonth() - 1)
  } else if (period === "quarter") {
    prevFrom.setMonth(prevFrom.getMonth() - 3)
    prevTo.setMonth(prevTo.getMonth() - 3)
  } else {
    prevFrom.setFullYear(prevFrom.getFullYear() - 1)
    prevTo.setFullYear(prevTo.getFullYear() - 1)
  }
  return { from: prevFrom, to: prevTo }
}

const defaultKpis = {
  totalIncome: 0,
  totalExpenses: 0,
  netProfit: 0,
  pendingPayments: 0,
  burnRate: 0,
  recurringPayments: 0,
  growthRate: 0,
  cashFlow: 0,
}

function defaultMonthlyTrend(): { month: string; income: number; expenses: number; profit: number }[] {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return {
      month: d.toLocaleDateString("es-ES", { month: "short", year: "numeric" }),
      income: 0,
      expenses: 0,
      profit: 0,
    }
  })
}

export type ChartSeriesPoint = {
  date: string
  label: string
  income: number
  expense: number
  profit: number
}

export type FinancePageData = {
  analytics: {
    success: boolean
    period: string
    kpis: typeof defaultKpis
    trends: { incomeGrowth: number; expenseGrowth: number; profitGrowth: number }
    monthlyTrend: { month: string; income: number; expenses: number; profit: number }[]
    chartSeries: ChartSeriesPoint[]
    predictions: { nextMonthRevenue: number; nextMonthExpenses: number; nextMonthCashFlow: number }
    fixedExpenses: Array<{ id: string; name: string; amount: number; frequency: string; nextPayment: string; active: boolean }>
    financialGoals: Array<{ id: string; title: string; target: number; current: number; deadline: string; status: string; priority?: string }>
    budgets: Array<{ id: string; category: string; limit: number; spent: number; remaining?: number; status?: string; utilization?: number }>
    alerts: Array<{ id: string; type: string; message: string; severity: string; read: boolean }>
    categoryBreakdown: Array<{ category: string; amount: number; percentage: number; count: number; average: number }>
    clientRevenue: Array<{ clientId: string; clientName: string; totalRevenue: number; transactions: number }>
    transactionCount: number
    detectedRecurringExpenses: Array<{
      supplier: string
      averageAmount: number
      frequency: "monthly" | "weekly" | "quarterly"
      lastPayment: string
      nextEstimatedPayment: string
    }>
  }
  movements: Array<{ id: string; type: string; date: string; amount: number; label: string; meta?: Record<string, unknown> }>
  /** Ledger: same source as KPIs (sales + purchases + transactions), for Movements tab */
  ledgerMovements: Movement[]
}

export async function loadFinancePageData(
  userId: string,
  period: string = "month"
): Promise<FinancePageData> {
  const { from, to } = getDateRange(period)
  const { from: prevFrom, to: prevTo } = getPreviousRange(period, from, to)

  try {
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)

    const [summary, prevSummary, monthlyTrend, chartSeries, movements, ledgerMovements, fixedExpenses, transactions, transactionsForRecurrence, budgets, alerts, financialGoals] =
      await Promise.all([
        getFinanceSummary(userId, from, to),
        getFinanceSummary(userId, prevFrom, prevTo),
        getFinanceMonthlyTrend(userId),
        getFinanceChartSeries(userId, period),
        getUnifiedMovements(userId, from, to),
        getMovements({ userId, from, to }),
        prisma.fixedExpense.findMany({ where: { userId, active: true } }),
        prisma.transaction.findMany({
          where: { userId, date: { gte: from, lte: to } },
          include: { Client: { select: { id: true, name: true } } },
          orderBy: { date: "desc" },
        }),
        prisma.transaction.findMany({
          where: { userId, type: "EXPENSE", date: { gte: twelveMonthsAgo } },
          select: { type: true, amount: true, date: true, concept: true, category: true },
          orderBy: { date: "asc" },
        }),
        prisma.budget.findMany({ where: { userId } }),
        prisma.financeAlert.findMany({
          where: { userId, read: false },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.financialGoal.findMany({
          where: { userId },
          orderBy: { deadline: "asc" },
        }),
      ])

    const detectedRecurring = detectRecurringExpenses(transactionsForRecurrence)

    const income = summary.income
    const expenses = summary.expenses
    const netProfit = summary.profit
    if (typeof process !== "undefined") {
      console.log("KPI income:", income, "KPI expenses:", expenses, "Movements:", ledgerMovements.length)
    }
    const cashFlow = summary.profit
    const pendingPayments = summary.pendingIncome
    const incomeGrowth = growthRate(income, prevSummary.income)
    const expenseGrowth = growthRate(expenses, prevSummary.expenses)
    const profitGrowth = growthRate(netProfit, prevSummary.profit)
    const recurringPayments = fixedExpenses.reduce((sum, e) => sum + e.amount, 0)
    const burnRate = expenses

    const categoryAnalysis = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((acc, t) => {
        const cat = t.category || "Otros"
        if (!acc[cat]) acc[cat] = { total: 0, count: 0 }
        acc[cat].total += Math.abs(t.amount)
        acc[cat].count += 1
        return acc
      }, {} as Record<string, { total: number; count: number }>)
    const totalCat = Object.values(categoryAnalysis).reduce((s, d) => s + d.total, 0)
    const categoryBreakdown = Object.entries(categoryAnalysis).map(([category, data]) => ({
      category,
      amount: data.total,
      percentage: totalCat > 0 ? (data.total / totalCat) * 100 : 0,
      count: data.count,
      average: data.count > 0 ? data.total / data.count : 0,
    }))

    const clientRevenueMap = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((acc, t) => {
        const id = t.clientId || "no-client"
        const name = (t.Client as { name?: string } | null)?.name || "Sin cliente"
        if (!acc[id]) acc[id] = { clientId: id, clientName: name, totalRevenue: 0, transactions: 0 }
        acc[id].totalRevenue += t.amount
        acc[id].transactions += 1
        return acc
      }, {} as Record<string, { clientId: string; clientName: string; totalRevenue: number; transactions: number }>)

    const budgetPerformance = budgets.map((budget) => {
      const spent = categoryBreakdown.find((c) => c.category === budget.category)?.amount ?? 0
      const utilization = budget.limit > 0 ? (spent / budget.limit) * 100 : 0
      return {
        ...budget,
        spent,
        utilization,
        remaining: budget.limit - spent,
        status: utilization > 100 ? "exceeded" : utilization > 80 ? "warning" : "good",
      }
    })

    const predictedRevenue = predictMonthlyRevenue(
      monthlyTrend.map((m) => ({ month: m.month, revenue: m.income }))
    )
    const predictedExpenses = predictMonthlyExpenses(
      monthlyTrend.map((m) => ({ month: m.month, expenses: m.expenses })),
      fixedExpenses
    )
    const predictedCashFlow = predictCashFlow(predictedRevenue, predictedExpenses, netProfit)

    const serializedMovements = movements.map((m) => ({
      id: m.id,
      type: m.type,
      date: m.date.toISOString(),
      amount: m.amount,
      label: m.label,
      meta: m.meta,
    }))

    return {
      analytics: {
        success: true,
        period,
        kpis: {
          totalIncome: income,
          totalExpenses: expenses,
          netProfit,
          pendingPayments,
          burnRate,
          recurringPayments,
          growthRate: profitGrowth,
          cashFlow,
        },
        trends: { incomeGrowth, expenseGrowth, profitGrowth },
        monthlyTrend,
        chartSeries: chartSeries ?? [],
        predictions: {
          nextMonthRevenue: predictedRevenue,
          nextMonthExpenses: predictedExpenses,
          nextMonthCashFlow: predictedCashFlow,
        },
        fixedExpenses: fixedExpenses.map((e) => ({
          id: e.id,
          name: e.name,
          amount: e.amount,
          frequency: e.frequency,
          nextPayment: e.nextPayment.toISOString(),
          active: e.active,
        })),
        detectedRecurringExpenses: detectedRecurring.map((r) => ({
          supplier: r.supplier,
          averageAmount: r.averageAmount,
          frequency: r.frequency,
          lastPayment: r.lastPayment.toISOString(),
          nextEstimatedPayment: r.nextEstimatedPayment.toISOString(),
        })),
        financialGoals: financialGoals.map((g) => ({
          id: g.id,
          title: g.title,
          target: g.target,
          current: g.current,
          deadline: g.deadline.toISOString(),
          status: g.status,
          priority: g.priority ?? undefined,
        })),
        budgets: budgetPerformance,
        alerts: alerts.map((a) => ({
          id: a.id,
          type: a.type,
          message: a.message,
          severity: a.severity,
          read: a.read,
        })),
        categoryBreakdown,
        clientRevenue: Object.values(clientRevenueMap),
        transactionCount: transactions.length,
      },
      movements: serializedMovements,
      ledgerMovements,
    }
  } catch (err) {
    console.error("[loadFinancePageData] error:", err)
    return {
      analytics: {
        success: false,
        period,
        kpis: defaultKpis,
        trends: { incomeGrowth: 0, expenseGrowth: 0, profitGrowth: 0 },
        monthlyTrend: defaultMonthlyTrend(),
        chartSeries: [],
        predictions: { nextMonthRevenue: 0, nextMonthExpenses: 0, nextMonthCashFlow: 0 },
        fixedExpenses: [],
        financialGoals: [],
        budgets: [],
        alerts: [],
        categoryBreakdown: [],
        clientRevenue: [],
        transactionCount: 0,
        detectedRecurringExpenses: [],
      },
      movements: [],
      ledgerMovements: [],
    }
  }
}
