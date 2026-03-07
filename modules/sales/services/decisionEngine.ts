/**
 * Motor de decisiones automáticas basado en datos reales.
 * Analiza métricas, predicciones y comparativas para generar recomendaciones
 * priorizadas con impacto económico estimado. Sin datos inventados.
 */

import type { SalesComparisonsResult } from "./salesAnalytics"
import type { ClientPredictionsResult } from "./clientPredictions"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DecisionType =
  | "PRICING"
  | "RETENTION"
  | "RECOVERY"
  | "CONVERSION"
  | "LOYALTY"

export type DecisionDifficulty = "low" | "medium" | "high"

export type BusinessDecision = {
  id: string
  title: string
  description: string
  estimatedImpact: number
  confidence: number
  difficulty: DecisionDifficulty
  type: DecisionType
}

export type DecisionEngineInput = {
  /** Ingresos del periodo actual (no anualizados). */
  revenue: number
  /** Número de ventas del periodo. */
  salesCount: number
  /** Ticket medio del periodo. */
  avgTicket: number
  /** Días del periodo (para annualizar). Si no se pasa, se asume ~30. */
  periodDays?: number
  /** Comparativas del motor central. Opcional. */
  comparisons?: SalesComparisonsResult | null
  /** Predicción por cliente (segmentos). Opcional. */
  clientPredictions?: ClientPredictionsResult | null
  /** Leads del periodo (para decisión de conversión). Opcional. */
  leads?: number
  /** Tasa de conversión actual (0-1). Opcional. */
  conversionRate?: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function safeNum(value: unknown): number {
  if (value == null || typeof value !== "number") return 0
  if (!Number.isFinite(value) || value < 0) return 0
  return value
}

/** Annualiza ingresos del periodo. */
function annualizeRevenue(revenue: number, periodDays: number): number {
  if (periodDays <= 0) return revenue * 12
  return (revenue / periodDays) * 365
}

// ---------------------------------------------------------------------------
// Decision builders (solo con datos reales)
// ---------------------------------------------------------------------------

/** 1. Subida moderada de precios: simular +3% a +10%, impacto anual. */
function decisionPricing(input: DecisionEngineInput): BusinessDecision | null {
  const revenue = safeNum(input.revenue)
  if (revenue <= 0) return null
  const periodDays = input.periodDays ?? 30
  const annual = annualizeRevenue(revenue, periodDays)
  const impactLow = annual * 0.03
  const impactHigh = annual * 0.1
  const estimatedImpact = Math.round((impactLow + impactHigh) / 2)
  if (estimatedImpact <= 0) return null
  return {
    id: "pricing-moderate",
    title: "Subida moderada de precios",
    description:
      "Simular subida de precios entre +3% y +10% sobre base actual. Impacto anual estimado según ingresos del periodo.",
    estimatedImpact,
    confidence: 72,
    difficulty: "medium",
    type: "PRICING",
  }
}

/** 2. Recuperación de clientes en riesgo: revenue potencial de retenerlos. */
function decisionRecovery(input: DecisionEngineInput): BusinessDecision | null {
  const predictions = input.clientPredictions
  if (!predictions?.clients?.length) return null
  const atRisk = predictions.clients.filter((c) => c.segment === "RISK")
  if (atRisk.length === 0) return null
  const totalSpentRisk = atRisk.reduce((s, c) => s + c.totalSpent, 0)
  const recoverablePct = 0.3
  const estimatedImpact = Math.round(totalSpentRisk * recoverablePct)
  if (estimatedImpact <= 0) return null
  return {
    id: "recovery-at-risk",
    title: "Recuperación de clientes en riesgo",
    description: `${atRisk.length} cliente(s) con más de 90 días sin comprar. Revenue histórico asociado: retener un 30% supone este impacto estimado.`,
    estimatedImpact,
    confidence: 65,
    difficulty: "medium",
    type: "RECOVERY",
  }
}

/** 3. Clientes con alta probabilidad de recompra: valor de incentivar (VIP + Leales). */
function decisionLoyalty(input: DecisionEngineInput): BusinessDecision | null {
  const predictions = input.clientPredictions
  if (!predictions?.clients?.length) return null
  const highValue = predictions.clients.filter(
    (c) => c.segment === "VIP" || c.segment === "LOYAL"
  )
  if (highValue.length === 0) return null
  const totalSpent = highValue.reduce((s, c) => s + c.totalSpent, 0)
  const upliftPct = 0.1
  const estimatedImpact = Math.round(totalSpent * upliftPct)
  if (estimatedImpact <= 0) return null
  return {
    id: "loyalty-incentive",
    title: "Incentivar recompra (VIP y leales)",
    description: `${highValue.length} cliente(s) con alta probabilidad de recompra. Incentivos (fidelización, ofertas) con uplift estimado del 10% sobre su valor histórico.`,
    estimatedImpact,
    confidence: 68,
    difficulty: "low",
    type: "LOYALTY",
  }
}

/** 4. Mejora conversión leads: +X% basado en histórico. */
function decisionConversion(input: DecisionEngineInput): BusinessDecision | null {
  const leads = safeNum(input.leads)
  const conversionRate = input.conversionRate ?? 0
  const avgTicket = safeNum(input.avgTicket)
  if (leads <= 0 || avgTicket <= 0) return null
  const currentConverted = leads * conversionRate
  const improvementPct = 0.05
  const extraConversions = leads * improvementPct
  const estimatedImpact = Math.round(extraConversions * avgTicket)
  if (estimatedImpact <= 0) return null
  return {
    id: "conversion-leads",
    title: "Mejora de conversión de leads",
    description: `Aumentar la tasa de conversión en ~5 puntos. Con ${leads} leads y ticket medio actual, el impacto estimado es el indicado.`,
    estimatedImpact,
    confidence: 60,
    difficulty: "high",
    type: "CONVERSION",
  }
}

/** 5. Retención: clientes perdidos recuperables (LOST). */
function decisionRetention(input: DecisionEngineInput): BusinessDecision | null {
  const predictions = input.clientPredictions
  if (!predictions?.clients?.length) return null
  const lost = predictions.clients.filter((c) => c.segment === "LOST")
  if (lost.length === 0) return null
  const totalSpentLost = lost.reduce((s, c) => s + c.totalSpent, 0)
  const recoverablePct = 0.15
  const estimatedImpact = Math.round(totalSpentLost * recoverablePct)
  if (estimatedImpact <= 0) return null
  return {
    id: "retention-lost",
    title: "Recuperación de clientes perdidos",
    description: `${lost.length} cliente(s) sin compra en más de 180 días. Campaña de reactivación con recuperación estimada del 15% del valor histórico.`,
    estimatedImpact,
    confidence: 55,
    difficulty: "high",
    type: "RETENTION",
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

/**
 * Genera decisiones de negocio priorizadas por impacto y confianza.
 * Solo incluye acciones para las que hay datos suficientes.
 */
export function generateBusinessDecisions(
  data: DecisionEngineInput
): BusinessDecision[] {
  const decisions: BusinessDecision[] = []
  const pricing = decisionPricing(data)
  if (pricing) decisions.push(pricing)
  const recovery = decisionRecovery(data)
  if (recovery) decisions.push(recovery)
  const loyalty = decisionLoyalty(data)
  if (loyalty) decisions.push(loyalty)
  const conversion = decisionConversion(data)
  if (conversion) decisions.push(conversion)
  const retention = decisionRetention(data)
  if (retention) decisions.push(retention)

  decisions.sort((a, b) => {
    if (b.estimatedImpact !== a.estimatedImpact) {
      return b.estimatedImpact - a.estimatedImpact
    }
    return b.confidence - a.confidence
  })

  return decisions
}
