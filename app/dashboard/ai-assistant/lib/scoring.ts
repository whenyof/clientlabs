// AI Lead Scoring Logic

export interface LeadData {
  id: string
  name: string
  email: string
  company: string
  interactions: number
  timeSinceLastActivity: number // in days
  source: string
  jobTitle?: string
  companySize?: number
  budget?: string
  timeline?: string
}

export interface ScoringResult {
  score: number
  category: 'hot' | 'warm' | 'cold'
  factors: {
    positive: string[]
    negative: string[]
  }
  confidence: number
}

/**
 * Calculate lead score based on multiple factors
 */
export function calculateLeadScore(lead: LeadData): ScoringResult {
  let score = 0
  const factors = {
    positive: [] as string[],
    negative: [] as string[]
  }

  // Interaction score (0-30 points)
  if (lead.interactions >= 10) {
    score += 30
    factors.positive.push('Alta frecuencia de interacción')
  } else if (lead.interactions >= 5) {
    score += 20
    factors.positive.push('Buena frecuencia de interacción')
  } else if (lead.interactions >= 2) {
    score += 10
    factors.positive.push('Interacciones moderadas')
  } else {
    factors.negative.push('Baja frecuencia de interacción')
  }

  // Recency score (0-25 points)
  if (lead.timeSinceLastActivity <= 1) {
    score += 25
    factors.positive.push('Actividad muy reciente')
  } else if (lead.timeSinceLastActivity <= 7) {
    score += 20
    factors.positive.push('Actividad reciente')
  } else if (lead.timeSinceLastActivity <= 30) {
    score += 10
    factors.positive.push('Actividad moderadamente reciente')
  } else {
    factors.negative.push('Actividad antigua')
  }

  // Source quality score (0-15 points)
  const highQualitySources = ['referral', 'conference', 'direct', 'partnership']
  const mediumQualitySources = ['social', 'content', 'email', 'webinar']

  if (highQualitySources.includes(lead.source.toLowerCase())) {
    score += 15
    factors.positive.push('Fuente de alta calidad')
  } else if (mediumQualitySources.includes(lead.source.toLowerCase())) {
    score += 8
    factors.positive.push('Fuente de calidad media')
  } else {
    factors.negative.push('Fuente de baja calidad')
  }

  // Company size score (0-10 points)
  if (lead.companySize && lead.companySize >= 100) {
    score += 10
    factors.positive.push('Empresa grande')
  } else if (lead.companySize && lead.companySize >= 50) {
    score += 6
    factors.positive.push('Empresa mediana')
  } else if (lead.companySize && lead.companySize >= 10) {
    score += 3
    factors.positive.push('Empresa pequeña')
  }

  // Budget score (0-10 points)
  if (lead.budget === 'high' || lead.budget === 'enterprise') {
    score += 10
    factors.positive.push('Presupuesto alto')
  } else if (lead.budget === 'medium') {
    score += 6
    factors.positive.push('Presupuesto medio')
  } else if (lead.budget === 'low') {
    score += 2
    factors.positive.push('Presupuesto bajo')
  }

  // Timeline score (0-10 points)
  if (lead.timeline === 'immediate' || lead.timeline === '1-3 months') {
    score += 10
    factors.positive.push('Timeline favorable')
  } else if (lead.timeline === '3-6 months') {
    score += 5
    factors.positive.push('Timeline moderado')
  } else if (lead.timeline === '6+ months') {
    score += 1
    factors.positive.push('Timeline largo')
  }

  // Determine category
  let category: 'hot' | 'warm' | 'cold'
  if (score >= 80) {
    category = 'hot'
  } else if (score >= 50) {
    category = 'warm'
  } else {
    category = 'cold'
  }

  // Calculate confidence based on data completeness
  let dataPoints = 0
  if (lead.jobTitle) dataPoints++
  if (lead.companySize) dataPoints++
  if (lead.budget) dataPoints++
  if (lead.timeline) dataPoints++

  const confidence = Math.min(100, 60 + (dataPoints * 10)) // Base 60% + 10% per data point

  return {
    score: Math.min(100, score),
    category,
    factors,
    confidence
  }
}

/**
 * Detect hot leads from a list
 */
export function detectHotLeads(leads: LeadData[]): LeadData[] {
  return leads.filter(lead => {
    const result = calculateLeadScore(lead)
    return result.category === 'hot'
  })
}

/**
 * Sort leads by score (highest first)
 */
export function sortLeadsByScore(leads: LeadData[]): LeadData[] {
  return leads.sort((a, b) => {
    const scoreA = calculateLeadScore(a).score
    const scoreB = calculateLeadScore(b).score
    return scoreB - scoreA
  })
}

/**
 * Get lead insights and recommendations
 */
export function getLeadInsights(lead: LeadData): {
  score: ScoringResult
  recommendations: string[]
  riskLevel: 'low' | 'medium' | 'high'
} {
  const score = calculateLeadScore(lead)
  const recommendations: string[] = []

  // Generate recommendations based on score
  if (score.category === 'hot') {
    recommendations.push('Contactar inmediatamente - alta prioridad')
    recommendations.push('Preparar propuesta personalizada')
    recommendations.push('Agendar demo técnica')
  } else if (score.category === 'warm') {
    recommendations.push('Enviar email de seguimiento')
    recommendations.push('Invitar a webinar')
    recommendations.push('Compartir case studies relevantes')
  } else {
    recommendations.push('Añadir a lista de nurturing')
    recommendations.push('Enviar newsletter mensual')
    recommendations.push('Monitorear actividad futura')
  }

  // Calculate risk level based on recency
  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  if (lead.timeSinceLastActivity > 90) {
    riskLevel = 'high'
  } else if (lead.timeSinceLastActivity > 30) {
    riskLevel = 'medium'
  }

  return {
    score,
    recommendations,
    riskLevel
  }
}