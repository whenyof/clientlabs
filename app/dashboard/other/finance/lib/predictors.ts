import { Transaction, FixedExpense, CashflowForecast } from '@prisma/client'

// Financial Prediction Algorithms

export const predictMonthlyRevenue = (
  historicalData: { month: string; revenue: number }[],
  months: number = 3
): number => {
  if (historicalData.length < 2) return 0

  // Simple moving average
  const recent = historicalData.slice(-months)
  const average = recent.reduce((sum, item) => sum + item.revenue, 0) / recent.length

  // Add trend factor
  const trend = calculateTrend(historicalData)
  const prediction = average * (1 + trend / 100)

  return Math.max(0, prediction)
}

export const predictMonthlyExpenses = (
  historicalData: { month: string; expenses: number }[],
  fixedExpenses: FixedExpense[],
  months: number = 3
): number => {
  // Fixed expenses are predictable
  const monthlyFixed = fixedExpenses
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

  // Variable expenses based on historical data
  if (historicalData.length < 2) return monthlyFixed

  const recent = historicalData.slice(-months)
  const averageVariable = recent.reduce((sum, item) => sum + item.expenses, 0) / recent.length

  // Remove fixed expenses from historical data to get variable portion
  const variableExpenses = Math.max(0, averageVariable - monthlyFixed)

  // Add trend factor
  const trend = calculateTrend(historicalData.map(item => ({ month: item.month, revenue: item.expenses })))
  const predictedVariable = variableExpenses * (1 + trend / 100)

  return monthlyFixed + predictedVariable
}

export const predictCashFlow = (
  predictedIncome: number,
  predictedExpenses: number,
  currentCash: number = 0
): number => {
  return currentCash + (predictedIncome - predictedExpenses)
}

export const predictBurnRate = (
  currentExpenses: number,
  cashReserves: number,
  months: number = 6
): number => {
  if (currentExpenses >= 0) return 0 // Not burning cash
  return Math.abs(currentExpenses) * months / cashReserves
}

export const predictPaybackPeriod = (
  investment: number,
  monthlyCashFlow: number
): number => {
  if (monthlyCashFlow <= 0) return -1 // Never pays back
  return investment / monthlyCashFlow
}

export const predictProfitabilityDate = (
  currentRevenue: number,
  currentExpenses: number,
  growthRate: number = 0.1,
  expenseGrowthRate: number = 0.05
): Date => {
  let months = 0
  let revenue = currentRevenue
  let expenses = Math.abs(currentExpenses) // Convert to positive

  while (revenue < expenses && months < 120) { // Max 10 years
    months++
    revenue *= (1 + growthRate / 12) // Monthly growth
    expenses *= (1 + expenseGrowthRate / 12)
  }

  const predictionDate = new Date()
  predictionDate.setMonth(predictionDate.getMonth() + months)
  return predictionDate
}

export const predictSeasonalTrends = (
  historicalData: { month: string; value: number }[]
): { peakMonth: string; lowMonth: string; seasonalityIndex: number } => {
  if (historicalData.length < 12) {
    return { peakMonth: '', lowMonth: '', seasonalityIndex: 0 }
  }

  // Calculate monthly averages
  const monthlyAverages = new Map<string, number[]>()

  historicalData.forEach(item => {
    const month = item.month.substring(0, 3) // Get first 3 letters
    if (!monthlyAverages.has(month)) {
      monthlyAverages.set(month, [])
    }
    monthlyAverages.get(month)!.push(item.value)
  })

  const monthlyStats = Array.from(monthlyAverages.entries()).map(([month, values]) => ({
    month,
    average: values.reduce((sum, val) => sum + val, 0) / values.length,
    count: values.length
  }))

  const overallAverage = monthlyStats.reduce((sum, stat) => sum + stat.average, 0) / monthlyStats.length

  const peakMonth = monthlyStats.reduce((max, stat) =>
    stat.average > max.average ? stat : max
  )

  const lowMonth = monthlyStats.reduce((min, stat) =>
    stat.average < min.average ? stat : min
  )

  // Calculate seasonality index (coefficient of variation)
  const variances = monthlyStats.map(stat => Math.pow(stat.average - overallAverage, 2))
  const variance = variances.reduce((sum, val) => sum + val, 0) / monthlyStats.length
  const stdDev = Math.sqrt(variance)
  const seasonalityIndex = stdDev / overallAverage

  return {
    peakMonth: peakMonth.month,
    lowMonth: lowMonth.month,
    seasonalityIndex
  }
}

export const predictChurnRisk = (
  transactions: Transaction[],
  monthsToAnalyze: number = 6
): { riskLevel: 'low' | 'medium' | 'high'; probability: number; factors: string[] } => {
  const factors: string[] = []
  let riskScore = 0

  // Analyze transaction frequency
  const recentTransactions = transactions.filter(t =>
    new Date(t.date) >= new Date(Date.now() - monthsToAnalyze * 30 * 24 * 60 * 60 * 1000)
  )

  if (recentTransactions.length < 3) {
    riskScore += 40
    factors.push('Baja frecuencia de transacciones')
  }

  // Analyze transaction amounts
  const amounts = recentTransactions.map(t => Math.abs(t.amount))
  if (amounts.length > 0) {
    const averageAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
    const volatility = calculateStandardDeviation(amounts) / averageAmount

    if (volatility > 0.5) {
      riskScore += 25
      factors.push('Alta volatilidad en montos')
    }
  }

  // Analyze payment methods consistency
  const paymentMethods = [...new Set(recentTransactions.map(t => t.paymentMethod))]
  if (paymentMethods.length > 3) {
    riskScore += 15
    factors.push('Múltiples métodos de pago')
  }

  // Analyze negative trends
  const monthlyTotals = new Map<string, number>()
  recentTransactions.forEach(t => {
    const monthKey = t.date.toISOString().substring(0, 7) // YYYY-MM
    monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) || 0) + t.amount)
  })

  const monthlyValues = Array.from(monthlyTotals.values())
  if (monthlyValues.length >= 3) {
    const trend = calculateTrend(monthlyValues.map((value, index) => ({ month: index.toString(), revenue: value })))
    if (trend < -10) {
      riskScore += 20
      factors.push('Tendencia negativa en ingresos')
    }
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high'
  if (riskScore >= 60) riskLevel = 'high'
  else if (riskScore >= 30) riskLevel = 'medium'
  else riskLevel = 'low'

  return {
    riskLevel,
    probability: Math.min(riskScore, 100),
    factors
  }
}

export const predictOptimalPricing = (
  costPerUnit: number,
  marketPrice: number,
  elasticity: number = 1.5
): { optimalPrice: number; expectedProfit: number; confidence: number } => {
  // Simple price optimization using price elasticity
  const optimalPrice = costPerUnit * (elasticity / (elasticity - 1))
  const expectedProfit = (optimalPrice - costPerUnit) * (marketPrice / optimalPrice) * 1000 // Simplified

  // Confidence based on data availability
  const confidence = 75 // Placeholder - would be calculated from historical data

  return {
    optimalPrice,
    expectedProfit,
    confidence
  }
}

export const predictExpenseAnomalies = (
  transactions: Transaction[],
  threshold: number = 2.0 // Standard deviations
): Transaction[] => {
  const expenses = transactions.filter(t => t.type === 'EXPENSE')

  if (expenses.length < 10) return []

  const amounts = expenses.map(t => Math.abs(t.amount))
  const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
  const stdDev = calculateStandardDeviation(amounts)

  const anomalyThreshold = mean + (threshold * stdDev)

  return expenses.filter(t => Math.abs(t.amount) > anomalyThreshold)
}

// Helper functions
const calculateTrend = (data: { month: string; revenue: number }[]): number => {
  if (data.length < 2) return 0

  const n = data.length
  const sumX = (n * (n - 1)) / 2
  const sumY = data.reduce((sum, item) => sum + item.revenue, 0)
  const sumXY = data.reduce((sum, item, index) => sum + (index * item.revenue), 0)
  const sumXX = (n * (n - 1) * (2 * n - 1)) / 6

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Return percentage change per period
  if (intercept === 0) return 0
  return (slope / intercept) * 100
}

const calculateStandardDeviation = (values: number[]): number => {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  return Math.sqrt(variance)
}

// Forecasting functions
export const generateCashFlowForecast = (
  transactions: Transaction[],
  fixedExpenses: FixedExpense[],
  months: number = 6
): CashflowForecast[] => {
  const forecasts: CashflowForecast[] = []

  for (let i = 0; i < months; i++) {
    const forecastDate = new Date()
    forecastDate.setMonth(forecastDate.getMonth() + i + 1)
    forecastDate.setDate(1) // First day of the month

    // Predict income and expenses for this month
    const historicalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .map(t => ({ month: t.date.toISOString().substring(0, 7), revenue: t.amount }))

    const historicalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .map(t => ({ month: t.date.toISOString().substring(0, 7), revenue: Math.abs(t.amount) }))

    const predictedIncome = predictMonthlyRevenue(historicalIncome, 3)
    const predictedExpenses = predictMonthlyExpenses(historicalExpenses, fixedExpenses, 3)

    const confidence = Math.max(0.5, Math.min(0.95, 0.8 - (i * 0.1))) // Decreasing confidence over time

    forecasts.push({
      date: forecastDate,
      predictedIncome,
      predictedExpense: predictedExpenses,
      predictedNet: predictedIncome - predictedExpenses,
      confidence,
      factors: [
        'Datos históricos de transacciones',
        'Gastos fijos recurrentes',
        'Tendencias de crecimiento'
      ]
    } as CashflowForecast)
  }

  return forecasts
}