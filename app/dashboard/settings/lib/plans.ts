// Plan configuration for the settings UI. Two plans (Autónomo/Pro). Prices and
// features are derived from lib/pricing.ts (the single marketing source) so they
// never drift. Display only — Stripe price IDs come from env, mapped by plan.
import {
  PLANS as MKT_PLANS,
  annualEUR,
  effectiveMonthlyEUR,
  ANNUAL_SAVINGS_PCT,
} from "@/lib/pricing"

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

const PRICE_ENV: Record<"STARTER" | "PRO", { monthly: string; yearly: string }> = {
  STARTER: {
    monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || '',
    yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || '',
  },
  PRO: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
  },
}

export const PLANS: Plan[] = MKT_PLANS.map((p) => ({
  id: p.stripePlan === 'STARTER' ? 'starter' : 'pro',
  name: p.name,
  price: Math.round(p.monthlyEUR * 100),
  priceYearly: Math.round(effectiveMonthlyEUR(p) * 100),
  yearlyTotal: Math.round(annualEUR(p) * 100),
  savings: `${ANNUAL_SAVINGS_PCT}%`,
  currency: 'EUR',
  interval: 'month',
  stripePriceId: PRICE_ENV[p.stripePlan].monthly,
  stripePriceIdYearly: PRICE_ENV[p.stripePlan].yearly,
  features: p.features,
  limits: {
    clients: -1,
    automations: p.stripePlan === 'PRO' ? -1 : 0,
    integrations: -1,
    aiRequests: p.stripePlan === 'PRO' ? -1 : 0,
  },
  badge: p.recommended ? 'Más popular' : p.name,
  popular: p.recommended,
}))

export const PLAN_NAMES = {
  starter: 'Autónomo',
  pro: 'Pro',
  business: 'Negocio', // legacy — usuarios antiguos
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
