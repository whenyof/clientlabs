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
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'EUR',
    interval: 'month',
    stripePriceId: '',
    features: [
      '50 leads totales',
      '20 clientes activos',
      '10 facturas / mes',
      'Pipeline visual básico',
      '1 formulario embebible',
      '1 usuario',
      'Soporte por email (48h)',
    ],
    limits: {
      clients: 20,
      automations: 0,
      integrations: 0,
      aiRequests: 0
    },
    badge: 'Gratis'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 1499, // 14,99€
    currency: 'EUR',
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
    features: [
      'Leads, clientes y facturas ilimitados',
      'Hasta 3 usuarios',
      'Sin marca de agua en facturas',
      'IA para calificar leads',
      'Automatizaciones básicas (5 activas)',
      'Google Calendar sync',
      'Soporte prioritario por chat (24h)',
    ],
    limits: {
      clients: -1,
      automations: 5,
      integrations: -1,
      aiRequests: 1000
    },
    badge: 'Más popular',
    popular: true
  },
  {
    id: 'business',
    name: 'Business',
    price: 2999, // 29,99€
    currency: 'EUR',
    interval: 'month',
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID || '',
    features: [
      'Todo ilimitado · Hasta 10 usuarios',
      'IA avanzada con predicciones de cierre',
      'Automatizaciones ilimitadas',
      'Webhooks y API completa',
      'Roles y permisos de equipo',
      'Verifactu incluido',
      'Soporte dedicado (videollamada mensual)',
    ],
    limits: {
      clients: -1,
      automations: -1,
      integrations: -1,
      aiRequests: -1
    },
    badge: 'Business'
  }
]

export const PLAN_NAMES = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
  trial: 'Prueba gratuita',
}

export const PLAN_COLORS = {
  free: 'bg-gray-500/20 text-[var(--text-secondary)] border-gray-500/30',
  pro: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  business: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  trial: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
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
  const order = ['trial', 'free', 'pro', 'business']
  const currentIndex = order.indexOf(currentPlan.toLowerCase())
  const targetIndex = order.indexOf(targetPlan.toLowerCase())
  return targetIndex > currentIndex
}