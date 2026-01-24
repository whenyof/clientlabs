// Professional Plans Configuration
// Prices in cents for Stripe (15€ = 1500, 29€ = 2900, 59€ = 5900)

export interface Plan {
  id: string
  name: string
  price: number
  currency: string
  interval: 'month' | 'year'
  stripePriceId: string
  features: string[]
  limits: {
    clients: number
    automations: number
    integrations: number
    aiRequests: number
  }
  badge: string
  popular?: boolean
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 1500, // 15€
    currency: 'EUR',
    interval: 'month',
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || '',
    features: [
      'Hasta 200 clientes',
      '5 automatizaciones',
      'Soporte por email',
      'Dashboard básico',
      '1 usuario'
    ],
    limits: {
      clients: 200,
      automations: 5,
      integrations: 2,
      aiRequests: 100
    },
    badge: 'Básico'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 2900, // 29€
    currency: 'EUR',
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
    features: [
      'Clientes ilimitados',
      'Automatizaciones ilimitadas',
      'IA básica incluida',
      'Todas las integraciones',
      'Soporte prioritario',
      'Hasta 5 usuarios'
    ],
    limits: {
      clients: -1, // unlimited
      automations: -1,
      integrations: -1,
      aiRequests: 1000
    },
    badge: 'Más popular',
    popular: true
  },
  {
    id: 'business',
    name: 'Business',
    price: 5900, // 59€
    currency: 'EUR',
    interval: 'month',
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID || '',
    features: [
      'IA avanzada',
      'Reportes PDF profesionales',
      'Multi-empresa',
      'API completa',
      'Soporte VIP 24/7',
      'Usuarios ilimitados',
      'White-label'
    ],
    limits: {
      clients: -1,
      automations: -1,
      integrations: -1,
      aiRequests: -1
    },
    badge: 'Enterprise'
  }
]

export const PLAN_NAMES = {
  starter: 'Starter',
  pro: 'Pro',
  business: 'Business',
  trial: 'Prueba gratuita',
  free: 'Gratuito'
}

export const PLAN_COLORS = {
  starter: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  pro: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  business: 'bg-green-500/20 text-green-400 border-green-500/30',
  trial: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  free: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

export function getPlanById(planId: string): Plan | undefined {
  return PLANS.find(plan => plan.id === planId)
}

export function formatPrice(price: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  }).format(price / 100)
}

export function getPlanLimits(planId: string) {
  const plan = getPlanById(planId)
  return plan?.limits || {
    clients: 0,
    automations: 0,
    integrations: 0,
    aiRequests: 0
  }
}

export function canUpgrade(currentPlan: string, targetPlan: string): boolean {
  const order = ['trial', 'free', 'starter', 'pro', 'business']
  const currentIndex = order.indexOf(currentPlan)
  const targetIndex = order.indexOf(targetPlan)
  return targetIndex > currentIndex
}