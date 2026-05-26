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
      return 'bg-[var(--bg-main)]0/20 text-[var(--text-secondary)] border-[var(--border-subtle)]'
    case 'error':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    default:
      return 'bg-[var(--bg-main)]0/20 text-[var(--text-secondary)] border-[var(--border-subtle)]'
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