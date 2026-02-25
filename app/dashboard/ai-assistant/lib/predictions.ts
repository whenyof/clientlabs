// AI Revenue Prediction Logic

export interface HistoricalData {
  month: string
  revenue: number
  leads: number
  conversions: number
  churnRate: number
  marketingSpend: number
  newCustomers: number
}

export interface PredictionFactors {
  trendStrength: number
  seasonality: number
  leadQuality: number
  marketConditions: number
  competitivePressure: number
}

export interface RevenuePrediction {
  predictedRevenue: number
  confidence: number
  range: {
    min: number
    max: number
  }
  factors: string[]
  risks: string[]
  opportunities: string[]
}

/**
 * Predict monthly revenue based on historical data and current factors
 */
export function predictMonthlyRevenue(
  historicalData: HistoricalData[],
  currentFactors: PredictionFactors
): RevenuePrediction {
  if (historicalData.length < 3) {
    return {
      predictedRevenue: 0,
      confidence: 0,
      range: { min: 0, max: 0 },
      factors: [],
      risks: ['Datos históricos insuficientes'],
      opportunities: []
    }
  }

  // Calculate trend from last 6 months
  const recentData = historicalData.slice(-6)
  const revenues = recentData.map(d => d.revenue)

  // Simple linear regression for trend
  const trend = calculateTrend(revenues)
  const averageRevenue = revenues.reduce((sum, r) => sum + r, 0) / revenues.length

  // Apply factors
  let prediction = averageRevenue * (1 + trend)

  // Adjust for current factors
  prediction *= (1 + currentFactors.trendStrength * 0.1)
  prediction *= (1 + currentFactors.leadQuality * 0.05)
  prediction *= (1 + currentFactors.marketConditions * 0.03)

  // Seasonal adjustment (simplified)
  const currentMonth = new Date().getMonth()
  const seasonalMultiplier = getSeasonalMultiplier(currentMonth)
  prediction *= seasonalMultiplier

  // Calculate confidence based on data consistency
  const revenueStdDev = calculateStandardDeviation(revenues)
  const cv = revenueStdDev / averageRevenue // Coefficient of variation
  const confidence = Math.max(0, Math.min(100, 100 - (cv * 100)))

  // Calculate prediction range
  const margin = prediction * (1 - confidence / 100) * 0.3 // 30% uncertainty at low confidence
  const range = {
    min: Math.max(0, prediction - margin),
    max: prediction + margin
  }

  // Generate factors, risks, and opportunities
  const factors = generateFactors(currentFactors, trend, seasonalMultiplier)
  const risks = generateRisks(currentFactors, cv)
  const opportunities = generateOpportunities(currentFactors, trend)

  return {
    predictedRevenue: Math.round(prediction),
    confidence: Math.round(confidence),
    range: {
      min: Math.round(range.min),
      max: Math.round(range.max)
    },
    factors,
    risks,
    opportunities
  }
}

/**
 * Calculate linear trend from revenue data
 */
function calculateTrend(revenues: number[]): number {
  const n = revenues.length
  if (n < 2) return 0

  const x = Array.from({ length: n }, (_, i) => i)
  const y = revenues

  const sumX = x.reduce((sum, val) => sum + val, 0)
  const sumY = y.reduce((sum, val) => sum + val, 0)
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0)
  const sumXX = x.reduce((sum, val) => sum + val * val, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)

  // Return as percentage change per period
  return slope / (sumY / n)
}

/**
 * Calculate standard deviation
 */
function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  return Math.sqrt(variance)
}

/**
 * Get seasonal multiplier for month (simplified)
 */
function getSeasonalMultiplier(month: number): number {
  // Simplified seasonal patterns (higher in Q4, lower in Q1)
  const multipliers = [0.9, 0.85, 1.0, 1.05, 1.1, 1.0, 0.95, 0.9, 0.95, 1.0, 1.15, 1.2]
  return multipliers[month] || 1.0
}

/**
 * Generate explanation factors
 */
function generateFactors(factors: PredictionFactors, trend: number, seasonal: number): string[] {
  const result = []

  if (Math.abs(trend) > 0.05) {
    result.push(`Tendencia ${trend > 0 ? 'positiva' : 'negativa'} de ${Math.abs(trend * 100).toFixed(1)}%`)
  }

  if (factors.leadQuality > 0.7) {
    result.push('Alta calidad de leads')
  }

  if (factors.marketConditions > 0.5) {
    result.push('Condiciones de mercado favorables')
  }

  if (seasonal > 1.1) {
    result.push('Temporada alta')
  } else if (seasonal < 0.95) {
    result.push('Temporada baja')
  }

  return result.length > 0 ? result : ['Tendencia histórica']
}

/**
 * Generate risk factors
 */
function generateRisks(factors: PredictionFactors, coefficientOfVariation: number): string[] {
  const result = []

  if (coefficientOfVariation > 0.3) {
    result.push('Alta variabilidad histórica')
  }

  if (factors.competitivePressure > 0.7) {
    result.push('Alta presión competitiva')
  }

  if (factors.marketConditions < -0.3) {
    result.push('Condiciones de mercado adversas')
  }

  if (factors.leadQuality < 0.3) {
    result.push('Baja calidad de leads')
  }

  return result.length > 0 ? result : ['Riesgos mínimos identificados']
}

/**
 * Generate opportunities
 */
function generateOpportunities(factors: PredictionFactors, trend: number): string[] {
  const result = []

  if (trend > 0.1) {
    result.push('Momentum positivo continuado')
  }

  if (factors.marketConditions > 0.5) {
    result.push('Ventana de oportunidad de mercado')
  }

  if (factors.leadQuality > 0.8) {
    result.push('Pipeline de alta calidad')
  }

  return result.length > 0 ? result : ['Monitorear tendencias emergentes']
}

/**
 * Predict churn risk for existing customers
 */
export function predictChurnRisk(customerData: {
  lastActivity: number // days ago
  engagementScore: number // 0-100
  contractValue: number
  timeAsCustomer: number // months
  supportTickets: number
}): {
  riskLevel: 'low' | 'medium' | 'high'
  probability: number
  recommendations: string[]
} {
  let riskScore = 0

  // Recency factor
  if (customerData.lastActivity > 90) riskScore += 40
  else if (customerData.lastActivity > 60) riskScore += 25
  else if (customerData.lastActivity > 30) riskScore += 10

  // Engagement factor
  if (customerData.engagementScore < 20) riskScore += 30
  else if (customerData.engagementScore < 40) riskScore += 15

  // Support tickets factor
  if (customerData.supportTickets > 5) riskScore += 20
  else if (customerData.supportTickets > 2) riskScore += 10

  // Time factor (newer customers have higher risk)
  if (customerData.timeAsCustomer < 3) riskScore += 15
  else if (customerData.timeAsCustomer < 6) riskScore += 5

  // Contract value factor (higher value = higher risk if other factors present)
  if (customerData.contractValue > 10000 && riskScore > 20) riskScore += 10

  const probability = Math.min(95, riskScore * 2.5)

  let riskLevel: 'low' | 'medium' | 'high'
  if (probability > 70) riskLevel = 'high'
  else if (probability > 40) riskLevel = 'medium'
  else riskLevel = 'low'

  const recommendations = generateChurnRecommendations(riskLevel, customerData)

  return {
    riskLevel,
    probability: Math.round(probability),
    recommendations
  }
}

/**
 * Generate churn prevention recommendations
 */
function generateChurnRecommendations(
  riskLevel: string,
  customerData: any
): string[] {
  const recommendations = []

  if (riskLevel === 'high') {
    recommendations.push('Contactar inmediatamente al cliente')
    recommendations.push('Ofrecer revisión gratuita del servicio')
    recommendations.push('Programar reunión de retención')
    if (customerData.lastActivity > 60) {
      recommendations.push('Enviar email de re-engagement personalizado')
    }
  } else if (riskLevel === 'medium') {
    recommendations.push('Aumentar frecuencia de comunicación')
    recommendations.push('Enviar actualizaciones de producto')
    recommendations.push('Ofrecer webinar exclusivo')
  } else {
    recommendations.push('Mantener engagement regular')
    recommendations.push('Enviar newsletter mensual')
  }

  return recommendations
}