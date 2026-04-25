// Enhanced Mock Data for Complete AI Assistant
export interface AiInsight {
  id: string
  type: 'hot_lead' | 'risk_client' | 'opportunity' | 'warning' | 'success'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  createdAt: string
  leadId?: string
  clientId?: string
  actionUrl?: string
  metadata?: any
}

export interface LeadScore {
  id: string
  leadId: string
  name: string
  company: string
  score: number
  category: 'hot' | 'warm' | 'cold'
  lastActivity: string
  predictedValue: number
  nextAction: string
  email: string
  phone: string
  avatar?: string
  industry?: string
}

export interface AiPrediction {
  month: string
  predictedRevenue: number
  confidence: number
  factors: string[]
  trend: 'up' | 'down' | 'stable'
}

export interface AiRecommendation {
  id: string
  type: 'call' | 'email' | 'meeting' | 'follow_up' | 'automation' | 'alert'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  title: string
  description: string
  leadId?: string
  clientId?: string
  suggestedTime: string
  expectedImpact: number
  confidence: number
  status: 'pending' | 'applied' | 'ignored' | 'scheduled'
  createdAt: string
}

export interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: string
  actions: string[]
  status: 'active' | 'paused' | 'draft'
  executions: number
  lastRun: string
  successRate: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  type?: 'text' | 'email' | 'action' | 'analysis'
  metadata?: any
}

export interface TimelineEvent {
  id: string
  type: 'analysis' | 'recommendation' | 'automation' | 'email' | 'call'
  title: string
  description: string
  timestamp: string
  impact?: 'positive' | 'negative' | 'neutral'
  metadata?: any
}

// Enhanced AI Insights with more variety
export const mockAiInsights: AiInsight[] = [
  {
    id: '1',
    type: 'hot_lead',
    title: '🚀 Lead Premium Detectado',
    description: 'TechCorp S.L. ha mostrado interés en el plan Enterprise. Han descargado 3 recursos técnicos en las últimas 24h.',
    impact: 'high',
    confidence: 94,
    createdAt: '2025-01-21T10:30:00Z',
    leadId: 'lead-1',
    actionUrl: '/dashboard/leads/lead-1'
  },
  {
    id: '2',
    type: 'risk_client',
    title: '⚠️ Riesgo de Abandono Crítico',
    description: 'Cliente premium sin actividad en 45 días. Patrón similar a 3 clientes que cancelaron recientemente.',
    impact: 'high',
    confidence: 87,
    createdAt: '2025-01-21T09:15:00Z',
    clientId: 'client-risk-1',
    actionUrl: '/dashboard/clients/client-risk-1'
  },
  {
    id: '3',
    type: 'opportunity',
    title: '💎 Oportunidad de Upselling',
    description: 'Cliente actual podría necesitar módulo avanzado. Similar a perfil de clientes que aumentaron 40% su contrato.',
    impact: 'medium',
    confidence: 78,
    createdAt: '2025-01-21T08:45:00Z',
    clientId: 'client-up-1',
    actionUrl: '/dashboard/clients/client-up-1'
  },
  {
    id: '4',
    type: 'success',
    title: '✅ Automatización Exitosa',
    description: 'Email de seguimiento automático generó respuesta positiva. Cliente solicitó demo técnica.',
    impact: 'high',
    confidence: 92,
    createdAt: '2025-01-21T07:20:00Z',
    leadId: 'lead-success-1'
  },
  {
    id: '5',
    type: 'warning',
    title: '📉 Disminución de Engagement',
    description: '5 clientes redujeron uso del producto en 30%. Posible insatisfacción o cambio de prioridades.',
    impact: 'medium',
    confidence: 76,
    createdAt: '2025-01-21T06:45:00Z'
  }
]

// Enhanced Lead Scores with more data
export const mockLeadScores: LeadScore[] = [
  {
    id: '1',
    leadId: 'lead-1',
    name: 'María García',
    company: 'TechCorp Solutions',
    score: 96,
    category: 'hot',
    lastActivity: '2025-01-21T10:00:00Z',
    predictedValue: 2500,
    nextAction: 'Llamar inmediatamente',
    email: 'maria.garcia@techcorp.com',
    phone: '+34 600 123 456',
    avatar: 'MG',
    industry: 'Tecnología'
  },
  {
    id: '2',
    leadId: 'lead-2',
    name: 'Carlos Rodríguez',
    company: 'DataFlow Systems',
    score: 84,
    category: 'warm',
    lastActivity: '2025-01-20T15:30:00Z',
    predictedValue: 1800,
    nextAction: 'Enviar propuesta técnica',
    email: 'carlos.rodriguez@dataflow.com',
    phone: '+34 601 234 567',
    avatar: 'CR',
    industry: 'Consultoría'
  },
  {
    id: '3',
    leadId: 'lead-3',
    name: 'Ana López',
    company: 'CloudMasters Ltd',
    score: 67,
    category: 'warm',
    lastActivity: '2025-01-19T09:15:00Z',
    predictedValue: 1200,
    nextAction: 'Agendar demo técnica',
    email: 'ana.lopez@cloudmasters.es',
    phone: '+34 602 345 678',
    avatar: 'AL',
    industry: 'Cloud Computing'
  },
  {
    id: '4',
    leadId: 'lead-4',
    name: 'David Martín',
    company: 'FutureApps Inc',
    score: 91,
    category: 'hot',
    lastActivity: '2025-01-19T14:20:00Z',
    predictedValue: 3200,
    nextAction: 'Reunión con CTO',
    email: 'david.martin@futureapps.com',
    phone: '+34 603 456 789',
    avatar: 'DM',
    industry: 'Desarrollo Software'
  },
  {
    id: '5',
    leadId: 'lead-5',
    name: 'Laura Sánchez',
    company: 'InnovateLab',
    score: 73,
    category: 'warm',
    lastActivity: '2025-01-18T11:45:00Z',
    predictedValue: 950,
    nextAction: 'Enviar case studies',
    email: 'laura.sanchez@innovatelab.com',
    phone: '+34 604 567 890',
    avatar: 'LS',
    industry: 'Innovación'
  }
]

// Enhanced Predictions
export const mockPredictions: AiPrediction[] = [
  {
    month: 'Ene',
    predictedRevenue: 45200,
    confidence: 88,
    factors: ['Tendencia positiva', '3 nuevos clientes Enterprise', 'Aumento engagement'],
    trend: 'up'
  },
  {
    month: 'Feb',
    predictedRevenue: 48900,
    confidence: 85,
    factors: ['Lead caliente TechCorp', 'Renovaciones existentes', 'Campaña marketing'],
    trend: 'up'
  },
  {
    month: 'Mar',
    predictedRevenue: 52100,
    confidence: 82,
    factors: ['Upselling oportunidades', 'Nuevo producto', 'Mejor conversión'],
    trend: 'up'
  },
  {
    month: 'Abr',
    predictedRevenue: 47800,
    confidence: 79,
    factors: ['Estacionalidad baja', 'Mantenimiento contratos', 'Reducción marketing'],
    trend: 'down'
  }
]

// Enhanced Recommendations
export const mockRecommendations: AiRecommendation[] = [
  {
    id: '1',
    type: 'call',
    priority: 'urgent',
    title: 'Llamar a María García (TechCorp)',
    description: 'Lead con score 96%. Ha descargado recursos técnicos 3 veces en 24h. Probabilidad conversión: 85%',
    leadId: 'lead-1',
    suggestedTime: 'Hoy antes de las 18:00',
    expectedImpact: 9,
    confidence: 85,
    status: 'pending',
    createdAt: '2025-01-21T10:30:00Z'
  },
  {
    id: '2',
    type: 'email',
    priority: 'high',
    title: 'Enviar propuesta técnica a Carlos',
    description: 'Cliente warm listo para propuesta. Interesado en integración APIs. Template personalizado disponible.',
    leadId: 'lead-2',
    suggestedTime: 'Mañana 09:00',
    expectedImpact: 7,
    confidence: 78,
    status: 'scheduled',
    createdAt: '2025-01-21T09:15:00Z'
  },
  {
    id: '3',
    type: 'meeting',
    priority: 'high',
    title: 'Demo técnica con David Martín',
    description: 'CTO de FutureApps quiere ver integración completa. Preparar demo de 45 minutos.',
    leadId: 'lead-4',
    suggestedTime: 'Jueves 10:00',
    expectedImpact: 8,
    confidence: 82,
    status: 'pending',
    createdAt: '2025-01-21T08:45:00Z'
  },
  {
    id: '4',
    type: 'follow_up',
    priority: 'medium',
    title: 'Seguimiento Ana López',
    description: 'Enviar newsletter técnico semanal + 2 case studies relevantes para sector cloud.',
    leadId: 'lead-3',
    suggestedTime: 'Semanal',
    expectedImpact: 5,
    confidence: 65,
    status: 'applied',
    createdAt: '2025-01-21T07:20:00Z'
  },
  {
    id: '5',
    type: 'automation',
    priority: 'low',
    title: 'Crear automatización bienvenida',
    description: 'Configurar secuencia automática: email bienvenida → demo → seguimiento semanal.',
    suggestedTime: 'Próxima semana',
    expectedImpact: 6,
    confidence: 70,
    status: 'pending',
    createdAt: '2025-01-21T06:45:00Z'
  }
]

// Automation Rules
export const mockAutomationRules: AutomationRule[] = [
  {
    id: '1',
    name: 'Bienvenida Nuevo Lead',
    description: 'Secuencia automática para nuevos leads: email bienvenida, recursos técnicos, demo.',
    trigger: 'Nuevo lead registrado',
    actions: ['Enviar email bienvenida', 'Asignar score inicial', 'Notificar equipo ventas'],
    status: 'active',
    executions: 156,
    lastRun: '2025-01-21T09:30:00Z',
    successRate: 94
  },
  {
    id: '2',
    name: 'Nurturing Leads Fríos',
    description: 'Campaña mensual para leads con score < 50: newsletter + case studies.',
    trigger: 'Lead score < 50 por 30 días',
    actions: ['Enviar newsletter mensual', 'Compartir recursos sector'],
    status: 'active',
    executions: 89,
    lastRun: '2025-01-20T08:00:00Z',
    successRate: 67
  },
  {
    id: '3',
    name: 'Alerta Churn Riesgo',
    description: 'Notificación inmediata cuando cliente muestra signos de abandono.',
    trigger: 'Engagement < 20% por 15 días',
    actions: ['Notificar manager', 'Crear tarea seguimiento', 'Enviar email retención'],
    status: 'active',
    executions: 23,
    lastRun: '2025-01-19T14:15:00Z',
    successRate: 87
  }
]

// Enhanced Chat Messages
export const mockChatHistory: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: '¿Cuáles son mis oportunidades más importantes hoy?',
    timestamp: '2025-01-21T10:00:00Z'
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Buenos días. Basándome en el análisis de hoy, tienes **4 oportunidades críticas**:\n\n🔥 **María García (TechCorp)** - Score 96\n- Ha interactuado 5 veces esta semana\n- Interés confirmado en Enterprise\n- Valor estimado: €2,500\n\n📞 **Carlos Rodríguez (DataFlow)** - Score 84\n- Listo para propuesta técnica\n- Reunión programada mañana\n\n💼 **David Martín (FutureApps)** - Score 91\n- CTO solicita demo técnica\n- Alta probabilidad de cierre\n\n⚠️ **Cliente Premium en riesgo**\n- Sin actividad 45 días\n- Patrón similar a cancelaciones previas\n\n¿Te gustaría que prepare un email personalizado para alguna de estas oportunidades?',
    timestamp: '2025-01-21T10:00:05Z',
    type: 'analysis'
  },
  {
    id: '3',
    role: 'user',
    content: 'Prepara un email para María García',
    timestamp: '2025-01-21T10:01:00Z'
  },
  {
    id: '4',
    role: 'assistant',
    content: 'He generado un email personalizado para María García basado en su perfil y comportamiento:\n\n**Asunto:** Propuesta Personalizada para TechCorp Solutions\n\n**Contenido preparado:**\n- Saludo personalizado con contexto de su empresa\n- Mención específica a recursos técnicos descargados\n- Propuesta Enterprise adaptada a su tamaño\n- Llamado a acción para demo técnica\n- Firma profesional con contacto directo\n\n¿Quieres que lo envíe automáticamente o prefieres revisarlo primero?',
    timestamp: '2025-01-21T10:01:03Z',
    type: 'email',
    metadata: {
      recipient: 'María García',
      subject: 'Propuesta Personalizada para TechCorp Solutions',
      template: 'enterprise_lead'
    }
  }
]

// Timeline Events
export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: '1',
    type: 'analysis',
    title: 'Análisis completo de leads realizado',
    description: 'Procesados 156 leads, identificados 8 de alta prioridad',
    timestamp: '2025-01-21T09:00:00Z',
    impact: 'positive'
  },
  {
    id: '2',
    type: 'recommendation',
    title: 'Nueva recomendación urgente generada',
    description: 'Llamar a María García - score 96, actividad reciente alta',
    timestamp: '2025-01-21T09:15:00Z',
    impact: 'positive'
  },
  {
    id: '3',
    type: 'automation',
    title: 'Automatización ejecutada exitosamente',
    description: 'Email de seguimiento enviado a 23 leads - 94% tasa apertura',
    timestamp: '2025-01-21T08:30:00Z',
    impact: 'positive'
  },
  {
    id: '4',
    type: 'email',
    title: 'Email personalizado enviado',
    description: 'Propuesta técnica enviada a Carlos Rodríguez - respuesta en 2h',
    timestamp: '2025-01-20T16:45:00Z',
    impact: 'positive'
  },
  {
    id: '5',
    type: 'call',
    title: 'Llamada completada exitosamente',
    description: 'Demo técnica con David Martín - interesado en contrato Enterprise',
    timestamp: '2025-01-20T11:30:00Z',
    impact: 'positive'
  }
]

// Enhanced AI KPIs
export const mockAiKPIs = {
  totalInsights: 24,
  hotLeads: 3,
  riskClients: 2,
  predictionsAccuracy: 87,
  automatedActions: 156,
  revenuePredicted: 45200,
  emailsGenerated: 23,
  callsSuggested: 8,
  activeAutomations: 12,
  avgResponseTime: 2.3, // hours
  conversionRate: 34.5,
  customerSatisfaction: 4.7,
  aiConfidence: 89
}

// Settings mock
export const mockAiSettings = {
  aggressiveness: 7, // 1-10
  notifications: {
    urgentRecommendations: true,
    dailySummary: true,
    weeklyReport: true,
    riskAlerts: true
  },
  automations: {
    autoEmailGeneration: true,
    autoLeadScoring: true,
    autoRiskDetection: true,
    smartScheduling: false
  },
  integrations: {
    crm: true,
    email: true,
    calendar: false,
    slack: true
  }
}

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(amount)
}

export const formatPercentage = (value: number): string => {
  return `${value}%`
}

export const getInsightIcon = (type: string) => {
  const icons = {
    hot_lead: '🔥',
    risk_client: '⚠️',
    opportunity: '💎',
    warning: '🚨',
    success: '✅'
  }
  return icons[type as keyof typeof icons] || '🤖'
}

export const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-yellow-400'
  return 'text-red-400'
}

export const getPriorityColor = (priority: string) => {
  const colors = {
    urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-[var(--bg-main)]0/20 text-[var(--text-secondary)] border-[var(--border-subtle)]'
  }
  return colors[priority as keyof typeof colors]
}

export const getStatusColor = (status: string) => {
  const colors = {
    active: 'bg-green-500/20 text-green-400',
    paused: 'bg-yellow-500/20 text-yellow-400',
    draft: 'bg-[var(--bg-main)]0/20 text-[var(--text-secondary)]'
  }
  return colors[status as keyof typeof colors] || colors.draft
}