import { Transaction, FixedExpense, Budget, FinancialGoal } from '@prisma/client'

// Financial Calculations

export const calculateNetProfit = (income: number, expenses: number): number => {
  return income + expenses // expenses are negative
}

export const calculateBurnRate = (expenses: number, months: number = 1): number => {
  return Math.abs(expenses) / months
}

export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export const calculateROI = (investment: number, returns: number): number => {
  if (investment === 0) return 0
  return ((returns - investment) / investment) * 100
}

export const calculateBudgetUtilization = (spent: number, budget: number): number => {
  if (budget === 0) return 0
  return (spent / budget) * 100
}

export const calculateCashFlow = (income: number, expenses: number): number => {
  return income + expenses // expenses are negative
}

export const calculateProfitMargin = (profit: number, revenue: number): number => {
  if (revenue === 0) return 0
  return (profit / revenue) * 100
}

export const calculateBreakEvenPoint = (fixedCosts: number, pricePerUnit: number, variableCostPerUnit: number): number => {
  if (pricePerUnit - variableCostPerUnit === 0) return 0
  return fixedCosts / (pricePerUnit - variableCostPerUnit)
}

export const calculatePaybackPeriod = (initialInvestment: number, cashFlows: number[]): number => {
  let cumulativeCashFlow = -initialInvestment
  let years = 0

  for (const cashFlow of cashFlows) {
    cumulativeCashFlow += cashFlow
    years += 1

    if (cumulativeCashFlow >= 0) {
      return years
    }
  }

  return -1 // Never pays back
}

export const calculateNPV = (cashFlows: number[], discountRate: number): number => {
  let npv = cashFlows[0] // Initial investment (negative)

  for (let i = 1; i < cashFlows.length; i++) {
    npv += cashFlows[i] / Math.pow(1 + discountRate, i)
  }

  return npv
}

export const calculateIRR = (cashFlows: number[], guess: number = 0.1): number => {
  const maxIterations = 100
  const tolerance = 0.0001
  let rate = guess

  for (let i = 0; i < maxIterations; i++) {
    let npv = cashFlows[0]
    let derivative = 0

    for (let j = 1; j < cashFlows.length; j++) {
      npv += cashFlows[j] / Math.pow(1 + rate, j)
      derivative -= j * cashFlows[j] / Math.pow(1 + rate, j + 1)
    }

    const newRate = rate - npv / derivative

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate * 100 // Return as percentage
    }

    rate = newRate
  }

  return 0 // Could not find IRR
}

// Transaction analysis
export const analyzeTransactionPatterns = (transactions: Transaction[]) => {
  const categories = transactions.reduce((acc, transaction) => {
    const category = transaction.category
    if (!acc[category]) {
      acc[category] = { total: 0, count: 0, average: 0 }
    }
    acc[category].total += transaction.amount
    acc[category].count += 1
    return acc
  }, {} as Record<string, { total: number; count: number; average: number }>)

  // Calculate averages
  Object.keys(categories).forEach(category => {
    categories[category].average = categories[category].total / categories[category].count
  })

  return categories
}

export const calculateMonthlyRecurringRevenue = (transactions: Transaction[]): number => {
  const monthlyIncome = transactions
    .filter(t => t.type === 'INCOME' && t.origin === 'AUTOMATIC')
    .reduce((sum, t) => sum + t.amount, 0)

  return monthlyIncome
}

export const calculateChurnRisk = (transactions: Transaction[], months: number = 6): number => {
  const recentTransactions = transactions.filter(t =>
    new Date(t.date) >= new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000)
  )

  if (recentTransactions.length === 0) return 100

  const avgTransactionValue = recentTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / recentTransactions.length
  const volatility = calculateStandardDeviation(recentTransactions.map(t => Math.abs(t.amount)))

  // Risk factors
  let risk = 0

  // Low transaction frequency
  if (recentTransactions.length < 3) risk += 30

  // High volatility
  if (volatility > avgTransactionValue * 0.5) risk += 25

  // Negative cash flow
  const totalCashFlow = recentTransactions.reduce((sum, t) => sum + t.amount, 0)
  if (totalCashFlow < 0) risk += 20

  // Recent large expenses
  const largeExpenses = recentTransactions.filter(t => t.amount < -avgTransactionValue * 2)
  risk += largeExpenses.length * 10

  return Math.min(risk, 100)
}

export const calculateStandardDeviation = (values: number[]): number => {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  return Math.sqrt(variance)
}

// Budget analysis
export const analyzeBudgetPerformance = (budgets: Budget[], transactions: Transaction[]) => {
  return budgets.map(budget => {
    const categoryTransactions = transactions.filter(t =>
      t.category === budget.category &&
      new Date(t.date).getMonth() === new Date().getMonth() &&
      new Date(t.date).getFullYear() === new Date().getFullYear()
    )

    const spent = Math.abs(categoryTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0))

    const utilization = calculateBudgetUtilization(spent, budget.limit)
    const remaining = budget.limit - spent
    const status = utilization > 100 ? 'exceeded' : utilization > 80 ? 'warning' : 'good'

    return {
      ...budget,
      spent,
      utilization,
      remaining,
      status
    }
  })
}

// Goal analysis
export const analyzeGoalProgress = (goals: FinancialGoal[]) => {
  return goals.map(goal => {
    const progress = getGoalProgress(goal.current, goal.target)
    const daysRemaining = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    const dailyTarget = daysRemaining > 0 ? (goal.target - goal.current) / daysRemaining : 0
    const status = progress >= 100 ? 'completed' : daysRemaining < 0 ? 'overdue' : 'on_track'

    return {
      ...goal,
      progress,
      daysRemaining,
      dailyTarget,
      status
    }
  })
}

export const getGoalProgress = (current: number, target: number): number => {
  return Math.min((current / target) * 100, 100)
}

// Fixed expenses analysis
export const calculateMonthlyFixedExpenses = (fixedExpenses: FixedExpense[]): number => {
  return fixedExpenses
    .filter(expense => expense.active)
    .reduce((total, expense) => {
      switch (expense.frequency) {
        case 'MONTHLY':
          return total + expense.amount
        case 'QUARTERLY':
          return total + (expense.amount / 3)
        case 'SEMIANNUAL':
          return total + (expense.amount / 6)
        case 'ANNUAL':
          return total + (expense.amount / 12)
        default:
          return total
      }
    }, 0)
}

export const getUpcomingFixedExpenses = (fixedExpenses: FixedExpense[], days: number = 30) => {
  const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

  return fixedExpenses
    .filter(expense => expense.active && expense.nextPayment <= futureDate)
    .sort((a, b) => a.nextPayment.getTime() - b.nextPayment.getTime())
}