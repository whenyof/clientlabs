// AI Helper Functions for Mock Intelligence

export const generateLeadScore = (leadData: any): number => {
  // Mock scoring algorithm
  let score = 50 // Base score

  // Activity factor
  score += Math.min(leadData.interactions * 2, 20)

  // Recency factor
  const daysSinceActivity = Math.floor((Date.now() - new Date(leadData.lastActivity).getTime()) / (1000 * 60 * 60 * 24))
  score += Math.max(0, 15 - daysSinceActivity)

  // Company size factor
  if (leadData.companySize > 100) score += 10
  else if (leadData.companySize > 50) score += 5

  // Budget factor
  const budgetScores: Record<string, number> = { 'low': 0, 'medium': 5, 'high': 10, 'enterprise': 15 }
  score += budgetScores[leadData.budget] || 0

  // Random variation for realism
  score += Math.floor(Math.random() * 10) - 5

  return Math.min(100, Math.max(0, score))
}

export const categorizeLead = (score: number): 'hot' | 'warm' | 'cold' => {
  if (score >= 80) return 'hot'
  if (score >= 50) return 'warm'
  return 'cold'
}

export const generateNextAction = (category: string, score: number): string => {
  const actions = {
    hot: [
      'Llamar inmediatamente',
      'Agendar demo técnica',
      'Enviar propuesta urgente',
      'Reunión con decision maker'
    ],
    warm: [
      'Enviar email seguimiento',
      'Compartir case study',
      'Invitar a webinar',
      'Propuesta técnica detallada'
    ],
    cold: [
      'Añadir a nurturing',
      'Enviar newsletter mensual',
      'Actualizar base de datos',
      'Monitorear actividad futura'
    ]
  }

  const categoryActions = actions[category as keyof typeof actions] || actions.cold
  return categoryActions[Math.floor(Math.random() * categoryActions.length)]
}

export const calculatePredictedValue = (score: number, companySize?: number): number => {
  let baseValue = score * 10 // Base calculation

  // Company size multiplier
  if (companySize) {
    if (companySize > 500) baseValue *= 2.5
    else if (companySize > 100) baseValue *= 2.0
    else if (companySize > 50) baseValue *= 1.5
    else if (companySize > 10) baseValue *= 1.2
  }

  // Random variation for realism
  baseValue *= (0.8 + Math.random() * 0.4) // ±20% variation

  return Math.round(baseValue)
}

export const generateAiInsight = (type: string): string => {
  const insights = {
    hot_lead: [
      'Lead ha mostrado interés extremo en funcionalidades premium',
      'Múltiples interacciones positivas en las últimas 24h',
      'Perfil coincide con clientes de alto valor',
      'Comportamiento indica intención de compra inmediata'
    ],
    risk_client: [
      'Reducción significativa de engagement detectada',
      'Patrón similar a clientes que cancelaron recientemente',
      'Sin actividad en período crítico de retención',
      'Indicadores de insatisfacción identificados'
    ],
    opportunity: [
      'Cliente actual podría beneficiarse de expansión',
      'Uso del producto indica necesidad de funcionalidades adicionales',
      'Perfil compatible con productos complementarios',
      'Momento óptimo para propuesta de upgrade'
    ],
    warning: [
      'Anomalía detectada en patrón de uso habitual',
      'Métricas por debajo del promedio del segmento',
      'Posible cambio en necesidades del cliente',
      'Recomendable monitoreo adicional'
    ]
  }

  const typeInsights = insights[type as keyof typeof insights] || insights.warning
  return typeInsights[Math.floor(Math.random() * typeInsights.length)]
}

export const generateEmailSuggestion = (leadData: any): {
  subject: string
  preview: string
  type: string
} => {
  const templates = [
    {
      subject: `Propuesta personalizada para ${leadData.company}`,
      preview: 'Solución adaptada específicamente a sus necesidades actuales',
      type: 'proposal'
    },
    {
      subject: '¿Podemos ayudarle a optimizar sus procesos?',
      preview: 'Nuevos insights sobre eficiencia operacional en su sector',
      type: 'follow_up'
    },
    {
      subject: 'Demo técnica: vea nuestros resultados en acción',
      preview: '15 minutos para mostrar cómo transformamos operaciones similares',
      type: 'demo'
    },
    {
      subject: 'Actualización mensual: tendencias en su industria',
      preview: 'Insights exclusivos sobre el futuro de su sector',
      type: 'nurture'
    }
  ]

  return templates[Math.floor(Math.random() * templates.length)]
}

export const predictRevenue = (historicalData: number[]): {
  predicted: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
} => {
  if (historicalData.length < 2) {
    return { predicted: 0, confidence: 0, trend: 'stable' }
  }

  // Simple trend calculation
  const recent = historicalData.slice(-3)
  const avg = recent.reduce((sum, val) => sum + val, 0) / recent.length

  // Calculate trend
  const trend = recent[recent.length - 1] > recent[0] ? 'up' :
    recent[recent.length - 1] < recent[0] ? 'down' : 'stable'

  // Add some variation for prediction
  const variation = (Math.random() - 0.5) * 0.2 // ±10%
  const predicted = avg * (1 + variation)

  // Confidence based on data consistency
  const stdDev = calculateStandardDeviation(recent)
  const cv = stdDev / avg // Coefficient of variation
  const confidence = Math.max(0, Math.min(100, 100 - (cv * 200)))

  return {
    predicted: Math.round(predicted),
    confidence: Math.round(confidence),
    trend
  }
}

export const calculateStandardDeviation = (values: number[]): number => {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  return Math.sqrt(variance)
}

export const generateAutomationSuggestion = (context: string): {
  name: string
  description: string
  trigger: string
  actions: string[]
} => {
  const suggestions = [
    {
      name: 'Secuencia de Bienvenida Premium',
      description: 'Automatización completa para nuevos leads Enterprise',
      trigger: 'Nuevo lead con presupuesto alto',
      actions: ['Email personalizado', 'Asignar account manager', 'Agendar demo', 'Seguimiento semanal']
    },
    {
      name: 'Alerta Churn Temprana',
      description: 'Detección y prevención de abandono de clientes',
      trigger: 'Engagement < 30% por 10 días',
      actions: ['Notificar equipo', 'Enviar email retención', 'Crear tarea seguimiento', 'Ofrecer soporte prioritario']
    },
    {
      name: 'Nurturing Leads Calientes',
      description: 'Campaña intensiva para leads con alto potencial',
      trigger: 'Lead score > 80',
      actions: ['Email diario con contenido premium', 'Llamada semanal', 'Invitación eventos exclusivos', 'Propuesta personalizada']
    }
  ]

  return suggestions[Math.floor(Math.random() * suggestions.length)]
}

export const calculateRiskScore = (clientData: any): {
  score: number
  level: 'low' | 'medium' | 'high'
  factors: string[]
} => {
  let score = 0
  const factors = []

  // Activity factor
  const daysSinceActivity = Math.floor((Date.now() - new Date(clientData.lastActivity).getTime()) / (1000 * 60 * 60 * 24))
  if (daysSinceActivity > 30) {
    score += 30
    factors.push('Sin actividad reciente')
  }

  // Engagement factor
  if (clientData.engagementScore < 30) {
    score += 25
    factors.push('Bajo engagement')
  }

  // Support factor
  if (clientData.supportTickets > 3) {
    score += 20
    factors.push('Múltiples tickets de soporte')
  }

  // Contract factor
  if (clientData.contractValue > 5000 && score > 20) {
    score += 15
    factors.push('Cliente de alto valor en riesgo')
  }

  let level: 'low' | 'medium' | 'high' = 'low'
  if (score > 60) level = 'high'
  else if (score > 30) level = 'medium'

  return { score: Math.min(100, score), level, factors }
}