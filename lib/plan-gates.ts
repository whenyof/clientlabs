import { PlanType } from "@prisma/client"

export const PLAN_LIMITS = {
  FREE: {
    // Legacy — mismos límites que STARTER
    maxLeadsTotal: 200,
    maxClients: Infinity,
    maxInvoicesPerMonth: Infinity,
    maxUsers: 1,
    maxForms: Infinity,
    maxActiveAutomations: 0,
    maxProviders: Infinity,
    maxTasksPerMonth: Infinity,
    storageGB: 1,
  },
  TRIAL: {
    // 14 días con acceso nivel Pro
    maxLeadsTotal: Infinity,
    maxClients: Infinity,
    maxInvoicesPerMonth: Infinity,
    maxUsers: 5,
    maxForms: Infinity,
    maxActiveAutomations: 10,
    maxProviders: Infinity,
    maxTasksPerMonth: Infinity,
    storageGB: 10,
  },
  STARTER: {
    maxLeadsTotal: 200,
    maxClients: Infinity,
    maxInvoicesPerMonth: Infinity,
    maxUsers: 1,
    maxForms: Infinity,
    maxActiveAutomations: 0,
    maxProviders: Infinity,
    maxTasksPerMonth: Infinity,
    storageGB: 1,
  },
  PRO: {
    maxLeadsTotal: Infinity,
    maxClients: Infinity,
    maxInvoicesPerMonth: Infinity,
    maxUsers: 5,
    maxForms: Infinity,
    maxActiveAutomations: 10,
    maxProviders: Infinity,
    maxTasksPerMonth: Infinity,
    storageGB: 10,
  },
  BUSINESS: {
    maxLeadsTotal: Infinity,
    maxClients: Infinity,
    maxInvoicesPerMonth: Infinity,
    maxUsers: Infinity,
    maxForms: Infinity,
    maxActiveAutomations: Infinity,
    maxProviders: Infinity,
    maxTasksPerMonth: Infinity,
    storageGB: 50,
  },
} as const

export const PLAN_FEATURES = {
  FREE: {
    // Legacy — mismas features que STARTER
    leads: true,
    clients: true,
    providers: true,
    invoicing: true,
    invoiceWatermark: false,
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
    verifactu: true,
    advancedReports: false,
    prioritySupport: false,
    dedicatedSupport: false,
    emailMarketing: false,
  },
  TRIAL: {
    // 14 días con acceso nivel Pro
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
    verifactu: true,
    advancedReports: false,
    prioritySupport: true,
    dedicatedSupport: false,
    emailMarketing: true,
  },
  STARTER: {
    leads: true,
    clients: true,
    providers: true,
    invoicing: true,
    invoiceWatermark: false,
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
    verifactu: true,
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
    verifactu: true,
    advancedReports: false,
    prioritySupport: true,
    dedicatedSupport: false,
    emailMarketing: true,
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

export type FeatureKey = keyof typeof PLAN_FEATURES.STARTER
export type LimitKey = keyof typeof PLAN_LIMITS.STARTER

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
  if (PLAN_FEATURES.STARTER[feature]) return "STARTER"
  if (PLAN_FEATURES.PRO[feature]) return "PRO"
  return "BUSINESS"
}

export function planAtLeast(userPlan: PlanType, requiredPlan: PlanType): boolean {
  const hierarchy: Record<PlanType, number> = { FREE: 1, TRIAL: 2, STARTER: 1, PRO: 2, BUSINESS: 3 }
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
    advancedReports: "Los informes avanzados están disponibles en el plan Business.",
    advancedSegmentation: "La segmentación avanzada está disponible en el plan Business.",
    emailMarketing: "El email marketing está disponible desde el plan Pro.",
  }
  return messages[feature] ?? `Esta función requiere el plan ${required}.`
}
