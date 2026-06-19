/**
 * SINGLE SOURCE OF TRUTH for the prices + plan feature lists SHOWN on the public
 * marketing site (pricing page, landing teaser, comparison table, JSON-LD, FAQ).
 *
 * Two plans. All amounts are €/month, IVA included. Annual billing applies a
 * "2 months free" discount → annual = monthly × 10 (effective monthly = annual / 12).
 *
 * DISPLAY ONLY. This is not wired to billing/Stripe or the dashboard, and it is
 * not the feature-gating source — gating lives in lib/plan-gates.ts (PLAN_FEATURES).
 * Keep the two in sync when the plan split changes.
 */

export type PlanCtaType = "preview" | "contact"

export interface MarketingPlan {
  key: "autonomo" | "pro"
  name: string
  tagline: string
  /** €/month, IVA included */
  monthlyEUR: number
  /** Stripe/gating plan id this maps to (Autónomo→STARTER, Pro→PRO). */
  stripePlan: "STARTER" | "PRO"
  recommended?: boolean
  ctaType: PlanCtaType
  ctaLabel: string
  /** Feature bullets shown on the plan card — real, shipped features only. */
  features: string[]
}

/** Months charged on annual billing (12 − 2 free). */
export const ANNUAL_FREE_MONTHS = 2
export const ANNUAL_MONTHS_CHARGED = 12 - ANNUAL_FREE_MONTHS // 10

/** Real % saved by paying annually (1 − 10/12 ≈ 17%). Computed, never hardcoded. */
export const ANNUAL_SAVINGS_PCT = Math.round((1 - ANNUAL_MONTHS_CHARGED / 12) * 100)

export const PLANS: MarketingPlan[] = [
  {
    key: "autonomo",
    name: "Autónomo",
    tagline: "Todo lo que necesitas para gestionar tu negocio y facturar en regla.",
    monthlyEUR: 19.99,
    stripePlan: "STARTER",
    ctaType: "preview",
    ctaLabel: "Empezar gratis",
    features: [
      "CRM de leads y clientes",
      "Facturación con Verifactu",
      "Presupuestos, pedidos y albaranes",
      "Proveedores y gastos",
      "Impuestos e informes trimestrales",
      "Tareas y proyectos",
      "1 usuario",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    tagline: "Para crecer: comunicación, automatización y trabajo en equipo.",
    monthlyEUR: 39.99,
    stripePlan: "PRO",
    recommended: true,
    ctaType: "preview",
    ctaLabel: "Empezar gratis",
    features: [
      "Todo lo de Autónomo",
      "Email marketing",
      "Automatizaciones",
      "Asistente de IA",
      "Hasta 5 usuarios",
      "Soporte prioritario",
    ],
  },
]

/** Total charged per year on annual billing (monthly × 10). */
export const annualEUR = (plan: MarketingPlan): number =>
  Math.round(plan.monthlyEUR * ANNUAL_MONTHS_CHARGED * 100) / 100

/** Effective per-month cost when paying annually (annual / 12). */
export const effectiveMonthlyEUR = (plan: MarketingPlan): number =>
  Math.round((annualEUR(plan) / 12) * 100) / 100

/** "19,99 €" — es-ES formatting with 2 decimals. */
export const formatEUR = (n: number): string =>
  `${n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`

/** Plain number string for JSON-LD (e.g. "19.99"). */
export const schemaPrice = (n: number): string => n.toFixed(2)

export const PRICE_RANGE = {
  low: PLANS[0].monthlyEUR,
  high: PLANS[PLANS.length - 1].monthlyEUR,
}

/** One-line summary used in FAQ / meta copy, built from PLANS so it never drifts. */
export const plansSummary = (): string =>
  PLANS.map((p) => `${p.name} a ${formatEUR(p.monthlyEUR)}/mes`).join(" y ")
