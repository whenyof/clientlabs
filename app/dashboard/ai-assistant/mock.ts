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