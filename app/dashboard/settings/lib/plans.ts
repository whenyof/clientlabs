// Plan configuration — fuente de verdad para precios y features en settings
// Precios en céntimos (17,99€ = 1799). Solo display UI — no tocar Stripe priceIds.

export interface Plan {
  id: string
  name: string
  price: number
  priceYearly: number
  yearlyTotal?: number
  savings?: string
  currency: string
  interval: 'month' | 'year'
  stripePriceId: string
  stripePriceIdYearly: string
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
    name: 'Básico',
    price: 1799, // 17,99€/mes
    priceYearly: 1499, // 14,99€/mes en anual
    yearlyTotal: 17988, // 179,88€/año
    savings: '17%',
    currency: 'EUR',
    interval: 'month',
    stripePriceId: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || '',
    stripePriceIdYearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || '',
    features: [
      '1 usuario incluido',
      '100 leads',
      '50 clientes activos',
      '20 facturas al mes',
      'Verifactu incluido (F1, F2, rectificativas)',
      'Presupuestos ilimitados',
      '3 automatizaciones activas',
      'Soporte por email',
    ],
    limits: {
      clients: 50,
      automations: 3,
      integrations: 0,
      aiRequests: 0,
    },
    badge: 'Básico',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 2999, // 29,99€/mes
    priceYearly: 2499, // 24,99€/mes en anual
    yearlyTotal: 29988, // 299,88€/año
    savings: '17%',
    currency: 'EUR',
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
    stripePriceIdYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
    features: [
      '3 usuarios incluidos',
      '500 leads',
      '200 clientes activos',
      '100 facturas al mes',
      'Proyectos',
      '15 automatizaciones activas',
      'Exportar CSV + PDF',
      'Soporte prioritario',
    ],
    limits: {
      clients: 200,
      automations: 15,
      integrations: -1,
      aiRequests: 0,
    },
    badge: 'Más popular',
    popular: true,
  },
  {
    id: 'business',
    name: 'Negocio',
    price: 4999, // 49,99€/mes
    priceYearly: 4166, // 41,66€/mes en anual
    yearlyTotal: 49992, // 499,92€/año
    savings: '17%',
    currency: 'EUR',
    interval: 'month',
    stripePriceId: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || '',
    stripePriceIdYearly: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || '',
    features: [
      '5 usuarios incluidos',
      'Leads ilimitados',
      'Clientes ilimitados',
      'Facturas ilimitadas',
      'Proyectos',
      'Automatizaciones ilimitadas',
      'Email marketing',
      'Soporte WhatsApp directo',
    ],
    limits: {
      clients: -1,
      automations: -1,
      integrations: -1,
      aiRequests: -1,
    },
    badge: 'Negocio',
  },
]

export const PLAN_NAMES = {
  starter: 'Básico',
  pro: 'Pro',
  business: 'Negocio',
  trial: 'Prueba gratuita',
}

export const PLAN_COLORS = {
  free: 'bg-gray-500/20 text-[var(--text-secondary)] border-gray-500/30',
  starter: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
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
    minimumFractionDigits: 2,
  }).format(price / 100)
}

export function getPlanLimits(planId: string) {
  const plan = getPlanById(planId)
  return plan?.limits || {
    clients: 0,
    automations: 0,
    integrations: 0,
    aiRequests: 0,
  }
}

export function canUpgrade(currentPlan: string, targetPlan: string): boolean {
  const order = ['trial', 'starter', 'pro', 'business']
  const currentIndex = order.indexOf(currentPlan.toLowerCase())
  const targetIndex = order.indexOf(targetPlan.toLowerCase())
  return targetIndex > currentIndex
}

export function canDowngrade(currentPlan: string, targetPlan: string): boolean {
  const order = ['starter', 'pro', 'business']
  const currentIndex = order.indexOf(currentPlan.toLowerCase())
  const targetIndex = order.indexOf(targetPlan.toLowerCase())
  return currentIndex > 0 && targetIndex >= 0 && targetIndex < currentIndex
}
