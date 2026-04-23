/**
 * @deprecated Este archivo está deprecado.
 * Usar `lib/plan-gates.ts` como fuente de verdad para límites y features por plan.
 * Este archivo se mantiene únicamente para compatibilidad con código existente.
 */
export const PLAN_LIMITS = {
  FREE: {
    maxLeads: 50,              // totales, no por mes
    maxClients: 20,
    maxInvoicesPerMonth: 10,
    maxUsers: 1,
    maxForms: 1,
    hasAI: false,
    hasAutomations: false,
    maxActiveAutomations: 0,
    hasAPI: false,
    invoiceWatermark: true,
    hasCalendarSync: false,
    hasDedicatedSupport: false,
  },
  PRO: {
    maxLeads: Infinity,
    maxClients: Infinity,
    maxInvoicesPerMonth: Infinity,
    maxUsers: 3,
    maxForms: Infinity,
    hasAI: true,
    hasAutomations: true,
    maxActiveAutomations: 5,
    hasAPI: false,
    invoiceWatermark: false,
    hasCalendarSync: true,
    hasDedicatedSupport: false,
  },
  BUSINESS: {
    maxLeads: Infinity,
    maxClients: Infinity,
    maxInvoicesPerMonth: Infinity,
    maxUsers: 10,
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
  return PLAN_LIMITS[key] ?? PLAN_LIMITS.FREE
}
