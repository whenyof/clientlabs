import { PlanType } from "@prisma/client"

// -1 = ilimitado
export const PLAN_LIMITS = {
  FREE: {
    // Legacy — mismos límites que STARTER
    maxLeadsTotal: 100,
    maxClients: 50,
    maxProviders: 10,
    maxInvoicesPerMonth: 20,
    maxTasks: 50,
    maxTemplates: 1,
    maxActiveAutomations: 3,
    maxUsers: 1,
    maxForms: -1,
    storageGB: 1,
  },
  TRIAL: {
    // Trial se resuelve a Autónomo (STARTER) en effectivePlan — sin acceso Pro gratis.
    maxLeadsTotal: -1,
    maxClients: -1,
    maxProviders: -1,
    maxInvoicesPerMonth: -1,
    maxTasks: -1,
    maxTemplates: -1,
    maxActiveAutomations: -1,
    maxUsers: 1,
    maxForms: -1,
    storageGB: -1,
  },
  STARTER: {
    // Autónomo — todo abierto salvo el nº de usuarios (lo demás no se capa entre planes).
    maxLeadsTotal: -1,
    maxClients: -1,
    maxProviders: -1,
    maxInvoicesPerMonth: -1,
    maxTasks: -1,
    maxTemplates: -1,
    maxActiveAutomations: -1,
    maxUsers: 1,
    maxForms: -1,
    storageGB: -1,
  },
  PRO: {
    // Pro — todo abierto, hasta 5 usuarios.
    maxLeadsTotal: -1,
    maxClients: -1,
    maxProviders: -1,
    maxInvoicesPerMonth: -1,
    maxTasks: -1,
    maxTemplates: -1,
    maxActiveAutomations: -1,
    maxUsers: 5,
    maxForms: -1,
    storageGB: -1,
  },
  BUSINESS: {
    maxLeadsTotal: -1,
    maxClients: -1,
    maxProviders: -1,
    maxInvoicesPerMonth: -1,
    maxTasks: -1,
    maxTemplates: -1,
    maxActiveAutomations: -1,
    maxUsers: 5,
    maxForms: -1,
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
    automations: true,
    projects: false,
    customDashboards: false,
    calendarSync: false,
    notifications: false,
    advancedSegmentation: false,
    webhooks: false,
    api: false,
    teamRoles: false,
    verifactu: true,
    advancedReports: false,
    exportPdf: false,
    exportExcel: false,
    activityFull: false,
    prioritySupport: false,
    dedicatedSupport: false,
    emailMarketing: false,
  },
  TRIAL: {
    // Trial se resuelve a Autónomo (STARTER) en effectivePlan; esta fila queda
    // como respaldo equivalente a Autónomo (sin las 3 funciones Pro).
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
    projects: true,
    customDashboards: true,
    calendarSync: true,
    notifications: true,
    advancedSegmentation: false,
    webhooks: false,
    api: false,
    teamRoles: false,
    verifactu: true,
    advancedReports: false,
    exportPdf: true,
    exportExcel: false,
    activityFull: true,
    prioritySupport: false,
    dedicatedSupport: false,
    emailMarketing: false,
  },
  STARTER: {
    // Autónomo — todo el producto operativo abierto; las 3 funciones Pro (ai,
    // automations, emailMarketing) quedan en false. Solo se capan esas + nº usuarios.
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
    projects: false,
    customDashboards: false,
    calendarSync: false,
    notifications: false,
    advancedSegmentation: false,
    webhooks: false,
    api: false,
    teamRoles: false,
    verifactu: true,
    advancedReports: false,
    exportPdf: false,
    exportExcel: false,
    activityFull: false,
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
    projects: true,
    customDashboards: true,
    calendarSync: true,
    notifications: true,
    advancedSegmentation: false,
    webhooks: false,
    api: false,
    teamRoles: false,
    verifactu: true,
    advancedReports: false,
    exportPdf: true,
    exportExcel: false,
    activityFull: true,
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
    projects: true,
    customDashboards: true,
    calendarSync: true,
    notifications: true,
    advancedSegmentation: true,
    webhooks: true,
    api: true,
    teamRoles: true,
    verifactu: true,
    advancedReports: true,
    exportPdf: true,
    exportExcel: true,
    activityFull: true,
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
  const val = PLAN_LIMITS[plan]?.[limit]
  if (val === undefined) return 0
  if ((val as number) === Infinity) return -1
  return val as number
}

export function isAtLimit(plan: PlanType, limit: LimitKey, currentCount: number): boolean {
  const max = getLimit(plan, limit)
  if (max === -1) return false
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

export function planDisplayName(plan: PlanType | string): string {
  const names: Record<string, string> = {
    FREE: "Autónomo",
    STARTER: "Autónomo",
    TRIAL: "Prueba",
    PRO: "Pro",
    BUSINESS: "Negocio",
  }
  return names[plan] ?? plan
}

/**
 * Single-source reparto check: does `plan` include `feature`?
 * Server enforcement and UI both go through this (alias of hasFeature) so the
 * plan/feature split lives in exactly one place (PLAN_FEATURES above).
 */
export function planIncludes(plan: PlanType, feature: FeatureKey): boolean {
  return hasFeature(plan, feature)
}

export function upgradeMessage(feature: FeatureKey): string {
  const required = requiredPlanFor(feature)
  const messages: Partial<Record<FeatureKey, string>> = {
    ai: "La inteligencia artificial está disponible desde el plan Pro.",
    aiScoring: "El scoring de leads con IA está disponible desde el plan Pro.",
    aiPredictions: "Las predicciones de IA están disponibles en el plan Negocio.",
    automations: "Las automatizaciones están disponibles en el plan Pro.",
    projects: "Los proyectos están disponibles desde el plan Pro.",
    customDashboards: "Los dashboards personalizables están disponibles desde el plan Pro.",
    calendarSync: "La sincronización con calendario está disponible desde el plan Pro.",
    webhooks: "Los webhooks están disponibles en el plan Negocio.",
    api: "El acceso API está disponible en el plan Negocio.",
    teamRoles: "Los roles de equipo están disponibles en el plan Negocio.",
    advancedReports: "Los informes avanzados están disponibles en el plan Negocio.",
    advancedSegmentation: "La segmentación avanzada está disponible en el plan Negocio.",
    emailMarketing: "El email marketing está disponible en el plan Pro.",
    exportPdf: "La exportación en PDF está disponible desde el plan Pro.",
    exportExcel: "La exportación en Excel está disponible en el plan Negocio.",
  }
  return messages[feature] ?? `Esta función requiere el plan ${planDisplayName(required)}.`
}

// Trial config
export const TRIAL_CONFIG = {
  days: 14,
  graceDays: 3,
  level: "PRO" as PlanType,
  readOnlyAfterGrace: true,
} as const

// Add-ons
export const ADDONS = {
  EXTRA_SEAT: { price: 2.99, name: "Usuario adicional" },
} as const
