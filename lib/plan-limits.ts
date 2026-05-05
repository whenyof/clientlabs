/**
 * @deprecated Usar `lib/plan-gates.ts` como fuente de verdad.
 * Mantenido únicamente para compatibilidad con código existente.
 */
export const PLAN_LIMITS = {
  FREE: {
    maxLeads: 200,
    maxClients: Infinity,
    maxInvoicesPerMonth: Infinity,
    maxUsers: 1,
    maxForms: Infinity,
    hasAI: false,
    hasAutomations: false,
    maxActiveAutomations: 0,
    hasAPI: false,
    invoiceWatermark: false,
    hasCalendarSync: false,
    hasDedicatedSupport: false,
  },
  STARTER: {
    maxLeads: 200,
    maxClients: Infinity,
    maxInvoicesPerMonth: Infinity,
    maxUsers: 1,
    maxForms: Infinity,
    hasAI: false,
    hasAutomations: false,
    maxActiveAutomations: 0,
    hasAPI: false,
    invoiceWatermark: false,
    hasCalendarSync: false,
    hasDedicatedSupport: false,
  },
  PRO: {
    maxLeads: Infinity,
    maxClients: Infinity,
    maxInvoicesPerMonth: Infinity,
    maxUsers: 5,
    maxForms: Infinity,
    hasAI: true,
    hasAutomations: true,
    maxActiveAutomations: 10,
    hasAPI: false,
    invoiceWatermark: false,
    hasCalendarSync: true,
    hasDedicatedSupport: false,
  },
  BUSINESS: {
    maxLeads: Infinity,
    maxClients: Infinity,
    maxInvoicesPerMonth: Infinity,
    maxUsers: Infinity,
    maxForms: Infinity,
    hasAI: true,
    hasAutomations: true,
    maxActiveAutomations: Infinity,
    hasAPI: true,
    invoiceWatermark: false,
    hasCalendarSync: true,
    hasDedicatedSupport: true,
  },
} as const

export type PlanKey = keyof typeof PLAN_LIMITS

export function getPlanLimits(plan: string) {
  const key = plan.toUpperCase() as PlanKey
  return PLAN_LIMITS[key] ?? PLAN_LIMITS.STARTER
}
