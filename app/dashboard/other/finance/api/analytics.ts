import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { calculateNetProfit, calculateGrowthRate, analyzeTransactionPatterns } from '../lib/calculations'
import { predictMonthlyRevenue, predictMonthlyExpenses, predictCashFlow } from '../lib/predictors'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // month, quarter, year
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range based on period
    let dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } else {
      const now = new Date()
      switch (period) {
        case 'month':
          dateFilter = {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
            lte: new Date(now.getFullYear(), now.getMonth() + 1, 0)
          }
          break
        case 'quarter':
          const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
          const quarterEnd = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0)
          dateFilter = { gte: quarterStart, lte: quarterEnd }
          break
        case 'year':
          dateFilter = {
            gte: new Date(now.getFullYear(), 0, 1),
            lte: new Date(now.getFullYear(), 11, 31)
          }
          break
      }
    }

    // Get transactions for the period
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: dateFilter
      },
      include: {
        Client: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Calculate KPIs
    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = Math.abs(transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0))

    const netProfit = calculateNetProfit(income, expenses)

    const pendingPayments = transactions
      .filter(t => t.status === 'PENDING')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    // Get previous period for comparison
    const previousPeriodStart = new Date(dateFilter.gte)
    const previousPeriodEnd = new Date(dateFilter.lte)

    if (period === 'month') {
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1)
      previousPeriodEnd.setMonth(previousPeriodEnd.getMonth() - 1)
    } else if (period === 'quarter') {
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 3)
      previousPeriodEnd.setMonth(previousPeriodEnd.getMonth() - 3)
    } else if (period === 'year') {
      previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1)
      previousPeriodEnd.setFullYear(previousPeriodEnd.getFullYear() - 1)
    }

    const previousTransactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd
        }
      }
    })

    const previousIncome = previousTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

    const previousExpenses = Math.abs(previousTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0))

    // Calculate growth rates
    const incomeGrowth = calculateGrowthRate(income, previousIncome)
    const expenseGrowth = calculateGrowthRate(expenses, previousExpenses)
    const profitGrowth = calculateGrowthRate(netProfit, calculateNetProfit(previousIncome, previousExpenses))

    // Analyze transaction patterns
    const categoryAnalysis = analyzeTransactionPatterns(transactions)

    // Get client revenue breakdown
    const clientRevenue = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, t) => {
        const clientId = t.clientId || 'no-client'
        const clientName = t.Client?.name || 'Sin cliente'
        if (!acc[clientId]) {
          acc[clientId] = {
            clientId,
            clientName,
            totalRevenue: 0,
            transactions: 0
          }
        }
        acc[clientId].totalRevenue += t.amount
        acc[clientId].transactions += 1
        return acc
      }, {} as Record<string, any>)

    // Monthly trend data (last 6 months)
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - i, 1)
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)

      const monthTransactions = await prisma.transaction.findMany({
        where: {
          userId: session.user.id,
          date: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      })

      const monthIncome = monthTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0)

      const monthExpenses = Math.abs(monthTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0))

      monthlyTrend.push({
        month: monthStart.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        income: monthIncome,
        expenses: monthExpenses,
        profit: monthIncome - monthExpenses
      })
    }

    // Get fixed expenses
    const fixedExpenses = await prisma.fixedExpense.findMany({
      where: {
        userId: session.user.id,
        active: true
      }
    })

    // Generate predictions
    const predictedRevenue = predictMonthlyRevenue(
      monthlyTrend.map(item => ({ month: item.month, revenue: item.income }))
    )

    const predictedExpenses = predictMonthlyExpenses(
      monthlyTrend.map(item => ({ month: item.month, expenses: item.expenses })),
      fixedExpenses
    )

    const predictedCashFlow = predictCashFlow(predictedRevenue, predictedExpenses, netProfit)

    // Get budgets and analyze performance
    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id
      }
    })

    // Calculate budget performance
    const budgetPerformance = budgets.map(budget => {
      const categoryTransactions = transactions.filter(t =>
        t.category === budget.category && t.type === 'EXPENSE'
      )
      const spent = Math.abs(categoryTransactions.reduce((sum, t) => sum + t.amount, 0))
      const utilization = spent / budget.limit * 100

      return {
        ...budget,
        spent,
        utilization,
        remaining: budget.limit - spent,
        status: utilization > 100 ? 'exceeded' : utilization > 80 ? 'warning' : 'good'
      }
    })

    // Get alerts
    const alerts = await prisma.financeAlert.findMany({
      where: {
        userId: session.user.id,
        read: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    // Get financial goals
    const financialGoals = await prisma.financialGoal.findMany({
      where: { userId: session.user.id },
      orderBy: { deadline: 'asc' }
    })

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
        burnRate: expenses > 0 ? income / expenses : 0,
        recurringPayments: fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0),
        growthRate: profitGrowth,
        cashFlow: netProfit
      },
      trends: {
        incomeGrowth,
        expenseGrowth,
        profitGrowth
      },
      categoryBreakdown: Object.entries(categoryAnalysis).map(([category, data]: [string, any]) => ({
        category,
        amount: data.total,
        percentage: (data.total / (income + expenses)) * 100,
        count: data.count,
        average: data.average
      })),
      clientRevenue: Object.values(clientRevenue),
      monthlyTrend,
      predictions: {
        nextMonthRevenue: predictedRevenue,
        nextMonthExpenses: predictedExpenses,
        nextMonthCashFlow: predictedCashFlow
      },
      budgets: budgetPerformance,
      alerts,
      transactionCount: transactions.length
    })

  } catch (error) {
    console.error('Error getting analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}