// Mock Data for Professional Integrations Module

export interface Integration {
  id: string
  name: string
  provider: string
  category: string
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  description: string
  logo: string
  features: string[]
  lastSync?: string
  errorMessage?: string
  config?: any
  usage: {
    requests: number
    success: number
    errors: number
    revenue: number
  }
}

export interface IntegrationLog {
  id: string
  integrationId: string
  type: 'connect' | 'disconnect' | 'sync' | 'webhook' | 'error' | 'config'
  action: string
  timestamp: string
  success: boolean
  data?: any
  error?: string
}

export interface Workflow {
  id: string
  name: string
  description: string
  trigger: {
    integration: string
    event: string
  }
  actions: {
    integration: string
    action: string
  }[]
  active: boolean
  executions: number
  lastRun?: string
}

export interface IntegrationStats {
  totalConnected: number
  totalRevenue: number
  totalRequests: number
  avgSuccessRate: number
  topIntegration: string
}

// Integration Categories
export const integrationCategories = [
  {
    id: 'payments',
    name: 'Pagos',
    description: 'Procesadores de pago y TPV',
    icon: '💳',
    integrations: ['stripe', 'paypal', 'bizum', 'pos']
  },
  {
    id: 'phone',
    name: 'Telefonía',
    description: 'Llamadas y SMS',
    icon: '📞',
    integrations: ['twilio', 'aircall']
  },
  {
    id: 'booking',
    name: 'Reservas',
    description: 'Gestión de citas y reservas',
    icon: '📅',
    integrations: ['calendly', 'booksy']
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Email, WhatsApp y redes sociales',
    icon: '📢',
    integrations: ['mailchimp', 'whatsapp', 'facebook', 'instagram']
  },
  {
    id: 'orders',
    name: 'Pedidos',
    description: 'E-commerce y delivery',
    icon: '🛒',
    integrations: ['shopify', 'glovo', 'uber-eats']
  },
  {
    id: 'operations',
    name: 'Operaciones',
    description: 'Herramientas de productividad',
    icon: '⚙️',
    integrations: ['notion', 'trello', 'slack', 'google-workspace']
  }
]

// Mock Integrations Data
export const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Stripe',
    provider: 'stripe',
    category: 'payments',
    status: 'connected',
    description: 'Procesador de pagos internacional con soporte completo',
    logo: '💳',
    features: ['Pagos únicos', 'Suscripciones', 'Reembolsos', 'Webhooks'],
    lastSync: '2025-01-21T10:30:00Z',
    usage: {
      requests: 1250,
      success: 1245,
      errors: 5,
      revenue: 45200
    }
  },
  {
    id: '2',
    name: 'PayPal',
    provider: 'paypal',
    category: 'payments',
    status: 'connected',
    description: 'Plataforma de pagos global con protección al comprador',
    logo: '🅿️',
    features: ['Pagos express', 'Botón PayPal', 'Pagos recurrentes'],
    lastSync: '2025-01-21T09:15:00Z',
    usage: {
      requests: 890,
      success: 875,
      errors: 15,
      revenue: 12800
    }
  },
  {
    id: '3',
    name: 'Twilio',
    provider: 'twilio',
    category: 'phone',
    status: 'connected',
    description: 'API de comunicaciones para SMS, voz y WhatsApp',
    logo: '📱',
    features: ['SMS programables', 'Llamadas VoIP', 'WhatsApp Business', 'Verificación 2FA'],
    lastSync: '2025-01-21T08:45:00Z',
    usage: {
      requests: 650,
      success: 640,
      errors: 10,
      revenue: 0
    }
  },
  {
    id: '4',
    name: 'Calendly',
    provider: 'calendly',
    category: 'booking',
    status: 'disconnected',
    description: 'Sistema de reservas automáticas con calendario inteligente',
    logo: '📅',
    features: ['Reservas 24/7', 'Sincronización calendario', 'Recordatorios automáticos', 'Pagos integrados'],
    usage: {
      requests: 0,
      success: 0,
      errors: 0,
      revenue: 0
    }
  },
  {
    id: '5',
    name: 'Shopify',
    provider: 'shopify',
    category: 'orders',
    status: 'connected',
    description: 'Plataforma e-commerce completa con gestión de inventario',
    logo: '🛍️',
    features: ['Catálogo productos', 'Carrito de compras', 'Procesamiento pagos', 'Envíos automáticos'],
    lastSync: '2025-01-21T07:20:00Z',
    usage: {
      requests: 2100,
      success: 2080,
      errors: 20,
      revenue: 67800
    }
  },
  {
    id: '6',
    name: 'Trello',
    provider: 'trello',
    category: 'operations',
    status: 'connected',
    description: 'Gestión de proyectos visual con tableros Kanban',
    logo: '📋',
    features: ['Tableros colaborativos', 'Cards y listas', 'Automation', 'Power-ups'],
    lastSync: '2025-01-21T06:45:00Z',
    usage: {
      requests: 450,
      success: 445,
      errors: 5,
      revenue: 0
    }
  },
  {
    id: '7',
    name: 'Mailchimp',
    provider: 'mailchimp',
    category: 'marketing',
    status: 'pending',
    description: 'Plataforma de email marketing con automatización',
    logo: '📧',
    features: ['Campañas email', 'Automatización', 'Segmentación', 'Analytics'],
    usage: {
      requests: 0,
      success: 0,
      errors: 0,
      revenue: 0
    }
  },
  {
    id: '8',
    name: 'Glovo',
    provider: 'glovo',
    category: 'orders',
    status: 'error',
    description: 'Plataforma de delivery con integración API',
    logo: '🚚',
    features: ['Pedidos delivery', 'Tracking GPS', 'Pagos automáticos', 'Gestión flota'],
    errorMessage: 'Error de autenticación - API key expirada',
    usage: {
      requests: 120,
      success: 95,
      errors: 25,
      revenue: 8900
    }
  },
  {
    id: '9',
    name: 'Notion',
    provider: 'notion',
    category: 'operations',
    status: 'disconnected',
    description: 'Workspace all-in-one para notas, docs y bases de datos',
    logo: '📝',
    features: ['Bases de datos', 'Documentos colaborativos', 'Wikis', 'Calendarios'],
    usage: {
      requests: 0,
      success: 0,
      errors: 0,
      revenue: 0
    }
  },
  {
    id: '10',
    name: 'Aircall',
    provider: 'aircall',
    category: 'phone',
    status: 'connected',
    description: 'Telefonía cloud con CRM integrado',
    logo: '☎️',
    features: ['Llamadas ilimitadas', 'Grabación llamadas', 'IVR', 'Reportes'],
    lastSync: '2025-01-21T05:30:00Z',
    usage: {
      requests: 380,
      success: 375,
      errors: 5,
      revenue: 0
    }
  }
]

// Mock Integration Logs
export const mockIntegrationLogs: IntegrationLog[] = [
  {
    id: '1',
    integrationId: '1',
    type: 'sync',
    action: 'Sincronización de pagos completada',
    timestamp: '2025-01-21T10:30:00Z',
    success: true,
    data: { records: 25, amount: 45200 }
  },
  {
    id: '2',
    integrationId: '3',
    type: 'webhook',
    action: 'Webhook SMS recibido',
    timestamp: '2025-01-21T10:15:00Z',
    success: true,
    data: { phone: '+34600123456', message: 'Cita confirmada' }
  },
  {
    id: '3',
    integrationId: '5',
    type: 'sync',
    action: 'Sincronización productos Shopify',
    timestamp: '2025-01-21T09:45:00Z',
    success: true,
    data: { products: 45, orders: 12 }
  },
  {
    id: '4',
    integrationId: '8',
    type: 'error',
    action: 'Error de conexión Glovo',
    timestamp: '2025-01-21T09:30:00Z',
    success: false,
    error: 'API key expired',
    data: { attempt: 3, endpoint: '/orders' }
  },
  {
    id: '5',
    integrationId: '6',
    type: 'connect',
    action: 'Conexión Trello exitosa',
    timestamp: '2025-01-21T08:20:00Z',
    success: true,
    data: { boards: 3, members: 5 }
  }
]

// Mock Workflows
export const mockWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'Pago → Confirmación automática',
    description: 'Cuando se recibe un pago, enviar confirmación por email y SMS',
    trigger: {
      integration: 'Stripe',
      event: 'payment.succeeded'
    },
    actions: [
      {
        integration: 'Mailchimp',
        action: 'Enviar email confirmación'
      },
      {
        integration: 'Twilio',
        action: 'Enviar SMS confirmación'
      }
    ],
    active: true,
    executions: 45,
    lastRun: '2025-01-21T10:30:00Z'
  },
  {
    id: '2',
    name: 'Pedido → Actualización inventario',
    description: 'Cuando llega un pedido, actualizar stock en tiempo real',
    trigger: {
      integration: 'Shopify',
      event: 'order.created'
    },
    actions: [
      {
        integration: 'Notion',
        action: 'Actualizar base de datos inventario'
      },
      {
        integration: 'Trello',
        action: 'Crear card en tablero producción'
      }
    ],
    active: true,
    executions: 23,
    lastRun: '2025-01-21T09:15:00Z'
  },
  {
    id: '3',
    name: 'Reserva → Recordatorio automático',
    description: '24h antes de la cita, enviar recordatorios por email y WhatsApp',
    trigger: {
      integration: 'Calendly',
      event: 'event.scheduled'
    },
    actions: [
      {
        integration: 'Twilio',
        action: 'Enviar WhatsApp recordatorio'
      },
      {
        integration: 'Mailchimp',
        action: 'Enviar email recordatorio'
      }
    ],
    active: false,
    executions: 0
  }
]

// Mock Statistics
export const mockIntegrationStats: IntegrationStats = {
  totalConnected: 6,
  totalRevenue: 134700,
  totalRequests: 5340,
  avgSuccessRate: 98.2,
  topIntegration: 'Shopify'
}

// AI Recommendations
export const mockAIRecommendations = [
  {
    id: '1',
    title: 'Conectar Calendly',
    description: 'Basado en tu volumen de reservas, Calendly optimizaría tu proceso de citas un 40%',
    impact: 'high',
    integration: 'Calendly'
  },
  {
    id: '2',
    title: 'Automatizar recordatorios',
    description: 'Crear workflow automático para recordatorios de citas ahorraría 15 horas/mes',
    impact: 'medium',
    workflow: 'Reserva → Recordatorio automático'
  },
  {
    id: '3',
    title: 'Integrar WhatsApp Business',
    description: 'El 60% de tus clientes prefieren WhatsApp. Aumentaría engagement en 200%',
    impact: 'high',
    integration: 'WhatsApp'
  }
]

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(amount)
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-ES').format(num)
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'connected':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'disconnected':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    case 'error':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

export const getStatusText = (status: string) => {
  switch (status) {
    case 'connected':
      return 'Conectado'
    case 'disconnected':
      return 'Desconectado'
    case 'error':
      return 'Error'
    case 'pending':
      return 'Pendiente'
    default:
      return status
  }
}

export const getCategoryName = (category: string) => {
  const categories: Record<string, string> = {
    payments: 'Pagos',
    phone: 'Telefonía',
    booking: 'Reservas',
    marketing: 'Marketing',
    orders: 'Pedidos',
    operations: 'Operaciones',
    analytics: 'Analytics'
  }
  return categories[category] || category
}