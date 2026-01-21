// Mock data for AI Assistant
export interface AiInsight {
  id: string
  type: 'hot_lead' | 'risk_client' | 'opportunity' | 'warning'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  createdAt: string
  leadId?: string
  clientId?: string
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
}

export interface AiPrediction {
  month: string
  predictedRevenue: number
  confidence: number
  factors: string[]
}

export interface AiRecommendation {
  id: string
  type: 'email' | 'call' | 'meeting' | 'follow_up'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  title: string
  description: string
  leadId?: string
  clientId?: string
  suggestedTime: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  type?: 'text' | 'email' | 'action'
  metadata?: any
}

// Mock AI Insights
export const mockAiInsights: AiInsight[] = [
  {
    id: '1',
    type: 'hot_lead',
    title: 'Lead Caliente Detectado',
    description: 'María García ha interactuado 5 veces esta semana y mostró interés en el plan Enterprise',
    impact: 'high',
    confidence: 92,
    createdAt: '2025-01-21T10:30:00Z',
    leadId: 'lead-1'
  },
  {
    id: '2',
    type: 'risk_client',
    title: 'Cliente en Riesgo',
    description: 'TechCorp S.L. no ha tenido actividad en 30 días. Probabilidad de churn: 75%',
    impact: 'high',
    confidence: 78,
    createdAt: '2025-01-21T09:15:00Z',
    clientId: 'client-risk-1'
  },
  {
    id: '3',
    type: 'opportunity',
    title: 'Oportunidad de Upselling',
    description: 'StartupXYZ podría necesitar más usuarios. Score de conversión: 85%',
    impact: 'medium',
    confidence: 85,
    createdAt: '2025-01-21T08:45:00Z',
    clientId: 'client-up-1'
  },
  {
    id: '4',
    type: 'warning',
    title: 'Actividad Anómala',
    description: 'Cliente premium ha reducido uso en un 40% esta semana',
    impact: 'medium',
    confidence: 67,
    createdAt: '2025-01-21T07:20:00Z',
    clientId: 'client-warn-1'
  }
]

// Mock Lead Scores
export const mockLeadScores: LeadScore[] = [
  {
    id: '1',
    leadId: 'lead-1',
    name: 'María García',
    company: 'InnovateTech',
    score: 95,
    category: 'hot',
    lastActivity: '2025-01-21T10:00:00Z',
    predictedValue: 2500,
    nextAction: 'Llamar inmediatamente',
    email: 'maria.garcia@innovatetech.com',
    phone: '+34 600 123 456'
  },
  {
    id: '2',
    leadId: 'lead-2',
    name: 'Carlos Rodríguez',
    company: 'DataFlow Solutions',
    score: 78,
    category: 'warm',
    lastActivity: '2025-01-20T15:30:00Z',
    predictedValue: 1800,
    nextAction: 'Enviar propuesta técnica',
    email: 'carlos.rodriguez@dataflow.com',
    phone: '+34 601 234 567'
  },
  {
    id: '3',
    leadId: 'lead-3',
    name: 'Ana López',
    company: 'CloudMasters',
    score: 45,
    category: 'cold',
    lastActivity: '2025-01-15T09:15:00Z',
    predictedValue: 800,
    nextAction: 'Enviar newsletter mensual',
    email: 'ana.lopez@cloudmasters.es',
    phone: '+34 602 345 678'
  },
  {
    id: '4',
    leadId: 'lead-4',
    name: 'David Martín',
    company: 'FutureApps',
    score: 82,
    category: 'warm',
    lastActivity: '2025-01-19T14:20:00Z',
    predictedValue: 2100,
    nextAction: 'Agendar demo técnica',
    email: 'david.martin@futureapps.com',
    phone: '+34 603 456 789'
  }
]

// Mock Predictions
export const mockPredictions: AiPrediction[] = [
  {
    month: 'Ene',
    predictedRevenue: 45200,
    confidence: 88,
    factors: ['Tendencia positiva', '3 nuevos clientes']
  },
  {
    month: 'Feb',
    predictedRevenue: 48900,
    confidence: 85,
    factors: ['Lead caliente', 'Renovaciones']
  },
  {
    month: 'Mar',
    predictedRevenue: 52100,
    confidence: 82,
    factors: ['Campaña marketing', 'Upselling']
  },
  {
    month: 'Abr',
    predictedRevenue: 47800,
    confidence: 79,
    factors: ['Estacionalidad', 'Mantenimiento']
  }
]

// Mock Recommendations
export const mockRecommendations: AiRecommendation[] = [
  {
    id: '1',
    type: 'call',
    priority: 'urgent',
    title: 'Llamar a María García',
    description: 'Lead caliente con score 95%. Ha mostrado interés en Enterprise',
    leadId: 'lead-1',
    suggestedTime: 'Hoy 11:00'
  },
  {
    id: '2',
    type: 'email',
    priority: 'high',
    title: 'Enviar propuesta a Carlos Rodríguez',
    description: 'Cliente warm listo para propuesta técnica detallada',
    leadId: 'lead-2',
    suggestedTime: 'Mañana 09:00'
  },
  {
    id: '3',
    type: 'meeting',
    priority: 'medium',
    title: 'Demo técnica con David Martín',
    description: 'Agendar demo de 30 minutos para mostrar funcionalidades',
    leadId: 'lead-4',
    suggestedTime: 'Jueves 10:00'
  },
  {
    id: '4',
    type: 'follow_up',
    priority: 'low',
    title: 'Seguimiento Ana López',
    description: 'Enviar newsletter mensual y mantener engagement',
    leadId: 'lead-3',
    suggestedTime: 'Próxima semana'
  }
]

// Mock Chat Messages
export const mockChatHistory: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: '¿Cuáles son mis leads más calientes esta semana?',
    timestamp: '2025-01-21T10:00:00Z'
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Basándome en el análisis de actividad, tienes 3 leads calientes:\n\n1. **María García** (InnovateTech) - Score: 95%\n   - 5 interacciones esta semana\n   - Interés en plan Enterprise\n   - Valor estimado: €2,500\n\n2. **Carlos Rodríguez** (DataFlow Solutions) - Score: 82%\n   - Interesado en soluciones técnicas\n   - Valor estimado: €2,100\n\n¿Te gustaría que genere un email personalizado para alguno de ellos?',
    timestamp: '2025-01-21T10:00:05Z'
  },
  {
    id: '3',
    role: 'user',
    content: 'Sí, genera un email para María García',
    timestamp: '2025-01-21T10:01:00Z'
  },
  {
    id: '4',
    role: 'assistant',
    content: 'He generado un email personalizado para María García. ¿Quieres que lo revise o lo envíe directamente?',
    timestamp: '2025-01-21T10:01:03Z',
    type: 'email',
    metadata: {
      recipient: 'María García',
      subject: 'Propuesta Personalizada para InnovateTech'
    }
  }
]

// AI KPIs
export const mockAiKPIs = {
  totalInsights: 24,
  hotLeads: 3,
  riskClients: 2,
  predictionsAccuracy: 87,
  automatedActions: 156,
  revenuePredicted: 45200,
  emailsGenerated: 23,
  callsSuggested: 8
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

export const getInsightIcon = (type: AiInsight['type']) => {
  const icons = {
    hot_lead: '🔥',
    risk_client: '⚠️',
    opportunity: '💎',
    warning: '🚨'
  }
  return icons[type] || '🤖'
}

export const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-yellow-400'
  return 'text-red-400'
}

export const getPriorityColor = (priority: AiRecommendation['priority']) => {
  const colors = {
    urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
  return colors[priority]
}