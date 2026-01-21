// AI Action Recommendations Logic

export interface LeadContext {
  id: string
  score: number
  category: 'hot' | 'warm' | 'cold'
  lastActivity: number // days ago
  interactions: number
  companySize?: number
  budget?: string
  timeline?: string
}

export interface ClientContext {
  id: string
  churnRisk: number
  engagementScore: number
  lastActivity: number // days ago
  contractValue: number
  timeAsCustomer: number // months
  supportTickets: number
}

export interface ActionRecommendation {
  id: string
  type: 'call' | 'email' | 'meeting' | 'follow_up' | 'demo' | 'proposal'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  title: string
  description: string
  leadId?: string
  clientId?: string
  suggestedTime: string
  expectedImpact: number // 1-10
  confidence: number // 0-100
}

/**
 * Generate action recommendations for leads
 */
export function suggestLeadActions(lead: LeadContext): ActionRecommendation[] {
  const recommendations: ActionRecommendation[] = []

  if (lead.category === 'hot') {
    // Urgent actions for hot leads
    recommendations.push({
      id: `call-${lead.id}`,
      type: 'call',
      priority: 'urgent',
      title: 'Llamar inmediatamente',
      description: `Lead caliente con score ${lead.score}. Contactar hoy mismo para mantener el momentum.`,
      leadId: lead.id,
      suggestedTime: 'Hoy antes de las 18:00',
      expectedImpact: 9,
      confidence: 85
    })

    recommendations.push({
      id: `meeting-${lead.id}`,
      type: 'meeting',
      priority: 'high',
      title: 'Agendar demo técnica',
      description: 'Programar una demo de 30 minutos para mostrar valor y resolver objeciones.',
      leadId: lead.id,
      suggestedTime: 'Mañana 10:00-11:00',
      expectedImpact: 8,
      confidence: 78
    })

  } else if (lead.category === 'warm') {
    // Medium priority actions for warm leads
    recommendations.push({
      id: `email-${lead.id}`,
      type: 'email',
      priority: 'high',
      title: 'Enviar propuesta personalizada',
      description: 'Lead receptivo. Enviar propuesta técnica adaptada a sus necesidades.',
      leadId: lead.id,
      suggestedTime: 'Esta semana',
      expectedImpact: 7,
      confidence: 72
    })

    recommendations.push({
      id: `follow_up-${lead.id}`,
      type: 'follow_up',
      priority: 'medium',
      title: 'Seguimiento semanal',
      description: 'Mantener el engagement con contenido relevante semanalmente.',
      leadId: lead.id,
      suggestedTime: 'Cada 7 días',
      expectedImpact: 5,
      confidence: 65
    })

  } else {
    // Low priority actions for cold leads
    recommendations.push({
      id: `nurture-${lead.id}`,
      type: 'email',
      priority: 'low',
      title: 'Añadir a nurturing',
      description: 'Lead frío. Incluir en campaña de email marketing mensual.',
      leadId: lead.id,
      suggestedTime: 'Próximo mes',
      expectedImpact: 3,
      confidence: 45
    })
  }

  return recommendations
}

/**
 * Generate action recommendations for clients at risk
 */
export function suggestClientRetentionActions(client: ClientContext): ActionRecommendation[] {
  const recommendations: ActionRecommendation[] = []

  if (client.churnRisk > 70) {
    // Critical retention actions
    recommendations.push({
      id: `urgent-call-${client.id}`,
      type: 'call',
      priority: 'urgent',
      title: 'Llamada de retención urgente',
      description: `Cliente crítico con ${client.churnRisk}% riesgo de churn. Contactar inmediatamente.`,
      clientId: client.id,
      suggestedTime: 'Hoy mismo',
      expectedImpact: 10,
      confidence: 90
    })

    recommendations.push({
      id: `account-review-${client.id}`,
      type: 'meeting',
      priority: 'urgent',
      title: 'Revisión de cuenta gratuita',
      description: 'Ofrecer una revisión gratuita del servicio para identificar problemas.',
      clientId: client.id,
      suggestedTime: 'Esta semana',
      expectedImpact: 9,
      confidence: 85
    })

  } else if (client.churnRisk > 40) {
    // Medium risk actions
    recommendations.push({
      id: `check-in-${client.id}`,
      type: 'call',
      priority: 'high',
      title: 'Llamada de seguimiento',
      description: 'Realizar check-in mensual para asegurar satisfacción del cliente.',
      clientId: client.id,
      suggestedTime: 'Esta semana',
      expectedImpact: 6,
      confidence: 70
    })

    recommendations.push({
      id: `engagement-${client.id}`,
      type: 'email',
      priority: 'medium',
      title: 'Campaña de engagement',
      description: 'Enviar actualizaciones de producto y casos de éxito relevantes.',
      clientId: client.id,
      suggestedTime: 'Semanal',
      expectedImpact: 5,
      confidence: 65
    })

  } else {
    // Low risk maintenance
    recommendations.push({
      id: `newsletter-${client.id}`,
      type: 'email',
      priority: 'low',
      title: 'Newsletter mensual',
      description: 'Mantener informado con actualizaciones y mejores prácticas.',
      clientId: client.id,
      suggestedTime: 'Mensual',
      expectedImpact: 2,
      confidence: 40
    })
  }

  return recommendations
}

/**
 * Generate comprehensive action plan
 */
export function generateActionPlan(
  leads: LeadContext[],
  clients: ClientContext[]
): {
  urgent: ActionRecommendation[]
  high: ActionRecommendation[]
  medium: ActionRecommendation[]
  low: ActionRecommendation[]
  summary: {
    totalActions: number
    expectedRevenue: number
    priorityDistribution: Record<string, number>
  }
} {
  const allActions: ActionRecommendation[] = []

  // Generate lead actions
  leads.forEach(lead => {
    allActions.push(...suggestLeadActions(lead))
  })

  // Generate client retention actions
  clients.forEach(client => {
    allActions.push(...suggestClientRetentionActions(client))
  })

  // Categorize by priority
  const urgent = allActions.filter(a => a.priority === 'urgent')
  const high = allActions.filter(a => a.priority === 'high')
  const medium = allActions.filter(a => a.priority === 'medium')
  const low = allActions.filter(a => a.priority === 'low')

  // Calculate summary
  const totalActions = allActions.length
  const expectedRevenue = allActions.reduce((sum, action) => sum + (action.expectedImpact * 100), 0)
  const priorityDistribution = {
    urgent: urgent.length,
    high: high.length,
    medium: medium.length,
    low: low.length
  }

  return {
    urgent,
    high,
    medium,
    low,
    summary: {
      totalActions,
      expectedRevenue,
      priorityDistribution
    }
  }
}

/**
 * Prioritize actions based on expected impact and urgency
 */
export function prioritizeActions(actions: ActionRecommendation[]): ActionRecommendation[] {
  return actions.sort((a, b) => {
    // First sort by priority
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]

    if (priorityDiff !== 0) return priorityDiff

    // Then by expected impact
    return b.expectedImpact - a.expectedImpact
  })
}

/**
 * Generate email content suggestions
 */
export function generateEmailSuggestions(
  lead: LeadContext,
  context: 'initial' | 'follow_up' | 'proposal' | 'nurture'
): {
  subject: string
  keyPoints: string[]
  callToAction: string
  tone: 'professional' | 'casual' | 'enthusiastic'
} {
  const suggestions = {
    initial: {
      subject: `Oportunidad de transformación digital para ${lead.company || 'su empresa'}`,
      keyPoints: [
        'Presentar brevemente la solución',
        'Mencionar valor específico basado en tamaño de empresa',
        'Incluir dato relevante del sector',
        'Proponer siguiente paso (llamada/demo)'
      ],
      callToAction: 'Agendar una llamada de 15 minutos',
      tone: 'professional' as const
    },
    follow_up: {
      subject: 'Seguimiento: ¿Podemos ayudar a optimizar sus procesos?',
      keyPoints: [
        'Referenciar interacción previa',
        'Ofrecer información adicional',
        'Mencionar caso de éxito similar',
        'Crear urgencia suave'
      ],
      callToAction: 'Responder a este email',
      tone: 'professional' as const
    },
    proposal: {
      subject: 'Propuesta personalizada para sus necesidades específicas',
      keyPoints: [
        'Resumir necesidades identificadas',
        'Presentar solución adaptada',
        'Incluir beneficios cuantificables',
        'Próximos pasos claros'
      ],
      callToAction: 'Revisar propuesta adjunta',
      tone: 'enthusiastic' as const
    },
    nurture: {
      subject: 'Actualización mensual: Tendencias en transformación digital',
      keyPoints: [
        'Compartir insight relevante del sector',
        'Mencionar actualización de producto',
        'Ofrecer webinar gratuito',
        'Mantener top-of-mind'
      ],
      callToAction: 'Registrarse al webinar',
      tone: 'casual' as const
    }
  }

  return suggestions[context]
}