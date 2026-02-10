import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import {
  getFinanceSummary,
  getFinanceMonthlyTrend,
} from "@/modules/finance/services/finance-aggregator"
import { predictMonthlyRevenue, predictMonthlyExpenses, predictCashFlow } from "../lib/predictors"

function growthRate(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / Math.abs(previous)) * 100
}

const ZERO_KPIS = {
  totalIncome: 0,
  totalExpenses: 0,
  netProfit: 0,
  pendingPayments: 0,
  burnRate: 0,
  recurringPayments: 0,
  growthRate: 0,
  cashFlow: 0,
}

const ZERO_TRENDS = { incomeGrowth: 0, expenseGrowth: 0, profitGrowth: 0 }

function emptyMonthlyTrend(): { month: string; income: number; expenses: number; profit: number }[] {
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

function getDateRange(period: string, startDate?: string | null, endDate?: string | null) {
  if (startDate && endDate) {
    return { from: new Date(startDate), to: new Date(endDate) }
  }
  const now = new Date()
  switch (period) {
    case "quarter": {
      const q = Math.floor(now.getMonth() / 3)
      return {
        from: new Date(now.getFullYear(), q * 3, 1),
        to: new Date(now.getFullYear(), q * 3 + 3, 0),
      }
    }
    case "year":
      return {
        from: new Date(now.getFullYear(), 0, 1),
        to: new Date(now.getFullYear(), 11, 31),
      }
    default:
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      }
  }
}

function getPreviousRange(
  period: string,
  from: Date,
  to: Date
): { from: Date; to: Date } {
  const prevFrom = new Date(from)
  const prevTo = new Date(to)
  if (period === "month") {
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

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "month"
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  const { from, to } = getDateRange(period, startDate, endDate)
  const { from: prevFrom, to: prevTo } = getPreviousRange(period, from, to)

  const fallbackResponse = () =>
    NextResponse.json({
      success: true,
      period,
      kpis: ZERO_KPIS,
      trends: ZERO_TRENDS,
      monthlyTrend: emptyMonthlyTrend(),
      predictions: { nextMonthRevenue: 0, nextMonthExpenses: 0, nextMonthCashFlow: 0 },
      fixedExpenses: [],
      financialGoals: [],
      budgets: [],
      alerts: [],
      categoryBreakdown: [],
      clientRevenue: [],
      transactionCount: 0,
    })

  try {
    const [summary, prevSummary, monthlyTrend, salesComparisons] = await Promise.all([
      getFinanceSummary(userId, from, to),
      getFinanceSummary(userId, prevFrom, prevTo),
      getFinanceMonthlyTrend(userId),
      getSalesComparisons({ userId, from, to }),
    ])

    const income = summary.income
    const expenses = summary.expenses

    const salesRevenue = salesComparisons.revenue.current
    if (Math.abs(salesRevenue - income) > 0.001) {
      console.error(
        "[Finance validation] MISMATCH: Sales total",
        salesRevenue,
        "!= Finance income",
        income,
        "| userId:",
        userId,
        "from:",
        from.toISOString(),
        "to:",
        to.toISOString()
      )
    } else {
      console.log("[Finance validation] OK: Sales total = Finance income =", income)
    }
    const pendingPayments = summary.pendingIncome
    const netProfit = summary.profit
    const cashFlow = summary.profit
    const incomeGrowth = growthRate(income, prevSummary.income)
    const expenseGrowth = growthRate(expenses, prevSummary.expenses)
    const profitGrowth = growthRate(netProfit, prevSummary.profit)
    const growthRateVal = profitGrowth

    const fixedExpenses = await prisma.fixedExpense.findMany({
      where: { userId, active: true },
    })
    const recurringPayments = fixedExpenses.reduce((sum, e) => sum + e.amount, 0)
    const burnRate = expenses

    const transactions = await prisma.transaction.findMany({
      where: { userId, date: { gte: from, lte: to } },
      include: { Client: { select: { id: true, name: true } } },
      orderBy: { date: "desc" },
    })

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

    const clientRevenue = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((acc, t) => {
        const id = t.clientId || "no-client"
        const name = (t.Client as { name?: string } | null)?.name || "Sin cliente"
        if (!acc[id]) acc[id] = { clientId: id, clientName: name, totalRevenue: 0, transactions: 0 }
        acc[id].totalRevenue += t.amount
        acc[id].transactions += 1
        return acc
      }, {} as Record<string, { clientId: string; clientName: string; totalRevenue: number; transactions: number }>)

    const budgets = await prisma.budget.findMany({ where: { userId } })
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

    const alerts = await prisma.financeAlert.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    const financialGoals = await prisma.financialGoal.findMany({
      where: { userId },
      orderBy: { deadline: "asc" },
    })

    const predictedRevenue = predictMonthlyRevenue(
      monthlyTrend.map((m) => ({ month: m.month, revenue: m.income }))
    )
    const predictedExpenses = predictMonthlyExpenses(
      monthlyTrend.map((m) => ({ month: m.month, expenses: m.expenses })),
      fixedExpenses
    )
    const predictedCashFlow = predictCashFlow(predictedRevenue, predictedExpenses, netProfit)

    return NextResponse.json({
      success: true,
      period,
      fixedExpenses,
      financialGoals,
      kpis: {
        totalIncome: income,
        totalExpenses: expenses,
        netProfit,
        pendingPayments,
        burnRate,
        recurringPayments,
        growthRate: growthRateVal,
        cashFlow,
      },
      trends: { incomeGrowth, expenseGrowth, profitGrowth },
      categoryBreakdown,
      clientRevenue: Object.values(clientRevenue),
      monthlyTrend,
      predictions: {
        nextMonthRevenue: predictedRevenue,
        nextMonthExpenses: predictedExpenses,
        nextMonthCashFlow: predictedCashFlow,
      },
      budgets: budgetPerformance,
      alerts,
      transactionCount: transactions.length,
    })
  } catch (error) {
    console.error("Error getting analytics:", error)
    return fallbackResponse()
  }
}
