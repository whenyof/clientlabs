import { PlanType } from "@prisma/client"

export const PLAN_LIMITS = {
  FREE: {
    maxLeadsTotal: 50,
    maxClients: 20,
    maxInvoicesPerMonth: 10,
    maxUsers: 1,
    maxForms: 1,
    maxActiveAutomations: 0,
    maxProviders: 10,
    maxTasksPerMonth: 50,
    storageGB: 0.5,
  },
  PRO: {
    maxLeadsTotal: Infinity,
    maxClients: Infinity,
    maxInvoicesPerMonth: Infinity,
    maxUsers: 3,
    maxForms: Infinity,
    maxActiveAutomations: 5,
    maxProviders: Infinity,
    maxTasksPerMonth: Infinity,
    storageGB: 10,
  },
  BUSINESS: {
    maxLeadsTotal: Infinity,
    maxClients: Infinity,
    maxInvoicesPerMonth: Infinity,
    maxUsers: 10,
    maxForms: Infinity,
    maxActiveAutomations: Infinity,
    maxProviders: Infinity,
    maxTasksPerMonth: Infinity,
    storageGB: 50,
  },
} as const

export const PLAN_FEATURES = {
  FREE: {
    leads: true,
    clients: true,
    providers: true,
    invoicing: true,
    invoiceWatermark: true,
    pipelineBasic: true,
    dashboard: true,
    csvExport: true,
    tasks: true,
    ai: false,
    aiScoring: false,
    aiPredictions: false,
    automations: false,
    customDashboards: false,
    calendarSync: false,
    notifications: false,
    advancedSegmentation: false,
    webhooks: false,
    api: false,
    teamRoles: false,
    verifactu: false,
    advancedReports: false,
    prioritySupport: false,
    dedicatedSupport: false,
    emailMarketing: false,
  },
  PRO: {
    leads: true,
    clients: true,
    providers: true,
    invoicing: true,
    invoiceWatermark: false,
    pipelineBasic: true,
    dashboard: true,
    csvExport: true,
    tasks: true,
    ai: true,
    aiScoring: true,
    aiPredictions: false,
    automations: true,
    customDashboards: true,
    calendarSync: true,
    notifications: true,
    advancedSegmentation: false,
    webhooks: false,
    api: false,
    teamRoles: false,
    verifactu: false,
    advancedReports: false,
    prioritySupport: true,
    dedicatedSupport: false,
    emailMarketing: false,
  },
  BUSINESS: {
    leads: true,
    clients: true,
    providers: true,
    invoicing: true,
    invoiceWatermark: false,
    pipelineBasic: true,
    dashboard: true,
    csvExport: true,
    tasks: true,
    ai: true,
    aiScoring: true,
    aiPredictions: true,
    automations: true,
    customDashboards: true,
    calendarSync: true,
    notifications: true,
    advancedSegmentation: true,
    webhooks: true,
    api: true,
    teamRoles: true,
    verifactu: true,
    advancedReports: true,
    prioritySupport: true,
    dedicatedSupport: true,
    emailMarketing: true,
  },
} as const satisfies Record<PlanType, Record<string, boolean>>

export type FeatureKey = keyof typeof PLAN_FEATURES.FREE
export type LimitKey = keyof typeof PLAN_LIMITS.FREE

export function hasFeature(plan: PlanType, feature: FeatureKey): boolean {
  return PLAN_FEATURES[plan]?.[feature] ?? false
}

export function getLimit(plan: PlanType, limit: LimitKey): number {
  return PLAN_LIMITS[plan]?.[limit] ?? 0
}

export function isAtLimit(plan: PlanType, limit: LimitKey, currentCount: number): boolean {
  const max = getLimit(plan, limit)
  return currentCount >= max
}

export function requiredPlanFor(feature: FeatureKey): PlanType {
  if (PLAN_FEATURES.FREE[feature]) return "FREE"
  if (PLAN_FEATURES.PRO[feature]) return "PRO"
  return "BUSINESS"
}

export function planAtLeast(userPlan: PlanType, requiredPlan: PlanType): boolean {
  const hierarchy: Record<PlanType, number> = { FREE: 0, PRO: 1, BUSINESS: 2 }
  return hierarchy[userPlan] >= hierarchy[requiredPlan]
}

export function upgradeMessage(feature: FeatureKey): string {
  const required = requiredPlanFor(feature)
  const messages: Partial<Record<FeatureKey, string>> = {
    ai: "La inteligencia artificial está disponible desde el plan Pro.",
    aiScoring: "El scoring de leads con IA está disponible desde el plan Pro.",
    aiPredictions: "Las predicciones de IA están disponibles en el plan Business.",
    automations: "Las automatizaciones están disponibles desde el plan Pro.",
    customDashboards: "Los dashboards personalizables están disponibles desde el plan Pro.",
    calendarSync: "La sincronización con calendario está disponible desde el plan Pro.",
    webhooks: "Los webhooks están disponibles en el plan Business.",
    api: "El acceso API está disponible en el plan Business.",
    teamRoles: "Los roles de equipo están disponibles en el plan Business.",
    verifactu: "Verifactu está disponible en el plan Business.",
    advancedReports: "Los informes avanzados están disponibles en el plan Business.",
    advancedSegmentation: "La segmentación avanzada está disponible en el plan Business.",
    emailMarketing: "El email marketing está disponible en el plan Business.",
  }
  return messages[feature] ?? `Esta función requiere el plan ${required}.`
}
