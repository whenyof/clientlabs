export interface Automation {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'draft'
  triggerType: string
  triggerConfig: Record<string, any>
  actions: AutomationAction[]
  runs: number
  successRate: number
  revenueGenerated: number
  timeSaved: number
  createdAt: string
  lastRun?: string
  isPremium: boolean
  category: string
}

export interface AutomationAction {
  id: string
  type: string
  config: Record<string, any>
  order: number
}

export interface AutomationLog {
  id: string
  automationId: string
  status: 'success' | 'error' | 'running'
  executionTime: number
  result?: Record<string, any>
  error?: string
  createdAt: string
}

export interface AutomationTemplate {
  id: string
  name: string
  description: string
  category: string
  triggerType: string
  actions: Omit<AutomationAction, 'id'>[]
  estimatedSavings: number
  isPremium: boolean
  icon: string
}

export interface AutomationKPIs {
  totalAutomations: number
  activeAutomations: number
  totalRuns: number
  successRate: number
  revenueGenerated: number
  timeSaved: number
}

// Automation Templates - Professional & Revenue-Generating
export const automationTemplates: AutomationTemplate[] = [
  // SALES AUTOMATIONS
  {
    id: 'lead-whatsapp-email',
    name: 'Lead → WhatsApp + Email Automático',
    description: 'Cuando llega un lead, envía WhatsApp inmediato y secuencia de emails personalizados',
    category: 'sales',
    triggerType: 'new_lead',
    estimatedSavings: 240, // horas/año
    isPremium: true,
    icon: '💬',
    actions: [
      {
        type: 'whatsapp_message',
        config: {
          message: '¡Hola {{lead.name}}! Gracias por tu interés. Te contactaremos pronto.',
          delay: 0
        },
        order: 1
      },
      {
        type: 'email_sequence',
        config: {
          sequenceId: 'lead_nurture',
          emails: [
            { subject: 'Bienvenido a ClientLabs', delay: 1 },
            { subject: 'Tu consulta pendiente', delay: 3 },
            { subject: '¿Necesitas ayuda?', delay: 7 }
          ]
        },
        order: 2
      }
    ]
  },
  {
    id: 'client-invoice-contract',
    name: 'Cliente Nuevo → Factura + Contrato',
    description: 'Al ganar un cliente, genera automáticamente factura y envía contrato digital',
    category: 'sales',
    triggerType: 'client_won',
    estimatedSavings: 180,
    isPremium: true,
    icon: '📄',
    actions: [
      {
        type: 'generate_invoice',
        config: {
          template: 'standard',
          dueDays: 30
        },
        order: 1
      },
      {
        type: 'send_contract',
        config: {
          contractId: 'standard_contract',
          signatureRequired: true
        },
        order: 2
      },
      {
        type: 'slack_notification',
        config: {
          channel: 'sales',
          message: '🎉 Nuevo cliente ganado: {{client.name}}'
        },
        order: 3
      }
    ]
  },
  {
    id: 'abandoned-cart-reminder',
    name: 'Abandono Carrito → Recordatorio',
    description: 'Detecta carritos abandonados y envía recordatorios inteligentes',
    category: 'sales',
    triggerType: 'cart_abandoned',
    estimatedSavings: 120,
    isPremium: false,
    icon: '🛒',
    actions: [
      {
        type: 'email_send',
        config: {
          template: 'cart_recovery',
          subject: '¿Olvidaste algo en tu carrito?',
          delay: 1
        },
        order: 1
      },
      {
        type: 'whatsapp_message',
        config: {
          message: 'Hola {{customer.name}}, vimos que dejaste productos en tu carrito. ¿Te ayudamos?',
          delay: 24
        },
        order: 2
      }
    ]
  },

  // AI AUTOMATIONS
  {
    id: 'call-summary-ai',
    name: 'Resumen Llamadas con IA',
    description: 'Transcribe llamadas y genera resúmenes ejecutivos automáticamente',
    category: 'ai',
    triggerType: 'call_completed',
    estimatedSavings: 300,
    isPremium: true,
    icon: '🤖',
    actions: [
      {
        type: 'transcribe_call',
        config: {
          provider: 'openai',
          language: 'es'
        },
        order: 1
      },
      {
        type: 'ai_summary',
        config: {
          prompt: 'Resume la llamada en 3 puntos clave para el equipo de ventas',
          sendTo: 'sales_manager'
        },
        order: 2
      },
      {
        type: 'create_task',
        config: {
          title: 'Seguimiento post-llamada',
          assignee: 'sales_rep',
          dueDate: '+1d'
        },
        order: 3
      }
    ]
  },
  {
    id: 'lead-scoring-ai',
    name: 'Clasificar Leads con IA',
    description: 'Analiza nuevos leads y asigna puntuación automáticamente',
    category: 'ai',
    triggerType: 'new_lead',
    estimatedSavings: 200,
    isPremium: true,
    icon: '🎯',
    actions: [
      {
        type: 'ai_score_lead',
        config: {
          criteria: ['company_size', 'budget', 'timeline', 'authority'],
          scale: '1-100'
        },
        order: 1
      },
      {
        type: 'conditional_action',
        config: {
          condition: 'score > 80',
          ifTrue: [
            {
              type: 'assign_to_rep',
              config: { rep: 'senior_sales' }
            },
            {
              type: 'schedule_call',
              config: { delay: 1 }
            }
          ],
          ifFalse: [
            {
              type: 'add_to_nurture',
              config: { sequence: 'low_priority' }
            }
          ]
        },
        order: 2
      }
    ]
  },

  // OPERATIONS AUTOMATIONS
  {
    id: 'order-slack-notification',
    name: 'Pedido → Notificación Slack',
    description: 'Al recibir pedido, notifica automáticamente al equipo de operaciones',
    category: 'operations',
    triggerType: 'new_order',
    estimatedSavings: 60,
    isPremium: false,
    icon: '📦',
    actions: [
      {
        type: 'slack_notification',
        config: {
          channel: 'orders',
          message: '🆕 Nuevo pedido: {{order.id}} - {{customer.name}} - €{{order.total}}'
        },
        order: 1
      },
      {
        type: 'update_inventory',
        config: {
          items: '{{order.items}}'
        },
        order: 2
      }
    ]
  },
  {
    id: 'ticket-auto-assign',
    name: 'Ticket → Asignar Agente',
    description: 'Clasifica tickets automáticamente y asigna al agente apropiado',
    category: 'operations',
    triggerType: 'new_ticket',
    estimatedSavings: 150,
    isPremium: false,
    icon: '🎫',
    actions: [
      {
        type: 'classify_ticket',
        config: {
          categories: ['technical', 'billing', 'sales', 'support']
        },
        order: 1
      },
      {
        type: 'assign_agent',
        config: {
          rules: {
            technical: 'tech_support',
            billing: 'accounting',
            sales: 'sales_team',
            support: 'customer_service'
          }
        },
        order: 2
      },
      {
        type: 'set_priority',
        config: {
          urgent_keywords: ['error', 'broken', 'urgente'],
          high_keywords: ['problema', 'issue', 'ayuda']
        },
        order: 3
      }
    ]
  },

  // MARKETING AUTOMATIONS
  {
    id: 'lead-email-sequence',
    name: 'Lead → Secuencia Emails',
    description: 'Nurtura leads con secuencia de emails automatizada',
    category: 'marketing',
    triggerType: 'new_lead',
    estimatedSavings: 400,
    isPremium: false,
    icon: '📧',
    actions: [
      {
        type: 'add_to_segment',
        config: {
          segment: 'new_leads'
        },
        order: 1
      },
      {
        type: 'email_sequence',
        config: {
          sequenceId: 'lead_nurture_full',
          emails: [
            { subject: 'Bienvenido a ClientLabs', delay: 0 },
            { subject: 'Descubre nuestras soluciones', delay: 2 },
            { subject: 'Casos de éxito', delay: 5 },
            { subject: 'Oferta especial', delay: 10 }
          ]
        },
        order: 2
      },
      {
        type: 'lead_scoring',
        config: {
          track: ['opens', 'clicks', 'replies']
        },
        order: 3
      }
    ]
  }
]

// Mock Automations Data
export const mockAutomations: Automation[] = [
  {
    id: '1',
    name: 'Lead → WhatsApp Automático',
    description: 'Envía WhatsApp inmediato a nuevos leads',
    status: 'active',
    triggerType: 'new_lead',
    triggerConfig: { source: 'website' },
    actions: [
      {
        id: '1',
        type: 'whatsapp_message',
        config: { message: '¡Hola! Gracias por tu interés. Te contactaremos pronto.' },
        order: 1
      }
    ],
    runs: 245,
    successRate: 98.5,
    revenueGenerated: 12500,
    timeSaved: 120,
    createdAt: '2024-01-15T10:00:00Z',
    lastRun: '2024-01-20T14:30:00Z',
    isPremium: true,
    category: 'sales'
  },
  {
    id: '2',
    name: 'Cliente Nuevo → Factura Automática',
    description: 'Genera facturas automáticamente para nuevos clientes',
    status: 'active',
    triggerType: 'client_won',
    triggerConfig: {},
    actions: [
      {
        id: '2',
        type: 'generate_invoice',
        config: { template: 'standard', dueDays: 30 },
        order: 1
      },
      {
        id: '3',
        type: 'email_send',
        config: { template: 'invoice_sent' },
        order: 2
      }
    ],
    runs: 89,
    successRate: 95.2,
    revenueGenerated: 8900,
    timeSaved: 200,
    createdAt: '2024-01-12T09:15:00Z',
    lastRun: '2024-01-19T11:20:00Z',
    isPremium: true,
    category: 'sales'
  },
  {
    id: '3',
    name: 'Ticket → Notificación Slack',
    description: 'Notifica nuevos tickets al equipo de soporte',
    status: 'paused',
    triggerType: 'new_ticket',
    triggerConfig: { priority: 'high' },
    actions: [
      {
        id: '4',
        type: 'slack_notification',
        config: { channel: 'support', message: 'Nuevo ticket urgente: {{ticket.title}}' },
        order: 1
      }
    ],
    runs: 156,
    successRate: 87.3,
    revenueGenerated: 0,
    timeSaved: 80,
    createdAt: '2024-01-10T14:45:00Z',
    lastRun: '2024-01-18T16:10:00Z',
    isPremium: false,
    category: 'operations'
  }
]

// Mock Logs
export const mockAutomationLogs: AutomationLog[] = Array.from({ length: 50 }, (_, i) => ({
  id: `log-${i + 1}`,
  automationId: mockAutomations[Math.floor(Math.random() * mockAutomations.length)].id,
  status: ['success', 'error', 'running'][Math.floor(Math.random() * 3)] as 'success' | 'error' | 'running',
  executionTime: Math.floor(Math.random() * 5000) + 1000,
  result: Math.random() > 0.1 ? {
    sent: true,
    recipient: 'user@example.com',
    timestamp: new Date().toISOString()
  } : undefined,
  error: Math.random() > 0.9 ? 'Connection timeout' : undefined,
  createdAt: new Date(Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString()
}))

// KPIs
export const mockAutomationKPIs: AutomationKPIs = {
  totalAutomations: mockAutomations.length,
  activeAutomations: mockAutomations.filter(a => a.status === 'active').length,
  totalRuns: mockAutomations.reduce((sum, a) => sum + a.runs, 0),
  successRate: 94.2,
  revenueGenerated: mockAutomations.reduce((sum, a) => sum + a.revenueGenerated, 0),
  timeSaved: mockAutomations.reduce((sum, a) => sum + a.timeSaved, 0)
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(amount)
}

// Helper functions
export const getAutomationById = (id: string): Automation | undefined => {
  return mockAutomations.find(automation => automation.id === id)
}

export const getAutomationsByStatus = (status: Automation['status']): Automation[] => {
  return mockAutomations.filter(automation => automation.status === status)
}

export const getAutomationsByCategory = (category: string): Automation[] => {
  return mockAutomations.filter(automation => automation.category === category)
}

export const getTemplatesByCategory = (category: string): AutomationTemplate[] => {
  return automationTemplates.filter(template => template.category === category)
}

export const calculateAutomationROI = (automation: Automation): number => {
  if (automation.timeSaved === 0) return 0
  // Asumiendo €50/hora como costo de empleado
  const hourlyRate = 50
  const annualSavings = automation.timeSaved * hourlyRate
  return annualSavings > 0 ? (automation.revenueGenerated / annualSavings) * 100 : 0
}

export const getAutomationLogs = (automationId?: string, limit = 20): AutomationLog[] => {
  let logs = mockAutomationLogs
  if (automationId) {
    logs = logs.filter(log => log.automationId === automationId)
  }
  return logs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}