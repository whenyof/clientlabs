/**
 * Narrativa automática del negocio.
 * Transforma comparativas (comparisons) en texto tipo informe ejecutivo.
 * Solo interpretación; no recalcula datos ni llama a Prisma.
 */

import type { SalesComparisonsResult } from "./salesAnalytics"

export type SalesNarrativeData = {
  summary: string
  highlights: string[]
  risks: string[]
  opportunities: string[]
}

const GROWTH_STRONG = 20
const DROP_ALERT = -20

export function buildSalesNarrative(
  comparisons: SalesComparisonsResult | null
): SalesNarrativeData {
  if (!comparisons) {
    return {
      summary: "No hay datos comparativos disponibles para el periodo seleccionado.",
      highlights: [],
      risks: [],
      opportunities: [],
    }
  }

  const rev = comparisons.revenue
  const count = comparisons.salesCount
  const ticket = comparisons.avgTicket

  const summary = buildSummary(rev, count, ticket)
  const highlights = buildHighlights(rev, count, ticket)
  const risks = buildRisks(rev, count, ticket)
  const opportunities = buildOpportunities(rev, count, ticket)

  return { summary, highlights, risks, opportunities }
}

function buildSummary(
  rev: SalesComparisonsResult["revenue"],
  count: SalesComparisonsResult["salesCount"],
  _ticket: SalesComparisonsResult["avgTicket"]
): string {
  const g = rev.growthVsPrevious
  if (g === null) {
    if (rev.current > 0) {
      return "Ingresos registrados en el periodo. No hay periodo anterior para comparar."
    }
    return "Sin ingresos en el periodo. No hay periodo anterior para comparar."
  }
  if (g > 0) return "Los ingresos están creciendo respecto al periodo anterior."
  if (g < 0) return "Los ingresos han caído frente al periodo anterior."
  return "Los ingresos se mantienen estables respecto al periodo anterior."
}

function buildHighlights(
  rev: SalesComparisonsResult["revenue"],
  count: SalesComparisonsResult["salesCount"],
  ticket: SalesComparisonsResult["avgTicket"]
): string[] {
  const out: string[] = []
  const rg = rev.growthVsPrevious
  const cg = count.growthVsPrevious
  const tg = ticket.growthVsPrevious

  if (rg !== null && rg > 0) {
    out.push("Los ingresos están creciendo respecto al periodo anterior.")
  }
  if (rg !== null && rg >= GROWTH_STRONG) {
    out.push("Momentum positivo fuerte en ingresos.")
  }
  if (cg !== null && cg > 0) {
    out.push("El número de ventas ha aumentado frente al periodo anterior.")
  }
  if (tg !== null && tg > 0) {
    out.push("El ticket medio ha mejorado respecto al periodo anterior.")
  }
  if (rg !== null && rg === 0 && rev.current > 0) {
    out.push("Ingresos estables respecto al periodo anterior.")
  }

  return out
}

function buildRisks(
  rev: SalesComparisonsResult["revenue"],
  count: SalesComparisonsResult["salesCount"],
  ticket: SalesComparisonsResult["avgTicket"]
): string[] {
  const out: string[] = []
  const rg = rev.growthVsPrevious
  const cg = count.growthVsPrevious
  const tg = ticket.growthVsPrevious

  if (rg !== null && rg < 0) {
    out.push("Los ingresos han caído frente al periodo anterior.")
  }
  if (rg !== null && rg <= DROP_ALERT) {
    out.push("Alerta de caída relevante en ingresos.")
  }
  if (cg !== null && tg !== null && cg < 0 && tg > 0) {
    out.push("Riesgo de volumen: menos operaciones con ticket más alto.")
  }
  if (cg !== null && tg !== null && cg > 0 && tg < 0) {
    out.push("Más clientes pero menor rentabilidad por operación.")
  }

  return out
}

function buildOpportunities(
  rev: SalesComparisonsResult["revenue"],
  count: SalesComparisonsResult["salesCount"],
  ticket: SalesComparisonsResult["avgTicket"]
): string[] {
  const out: string[] = []
  const rg = rev.growthVsPrevious
  const cg = count.growthVsPrevious
  const tg = ticket.growthVsPrevious

  if (rg !== null && rg >= GROWTH_STRONG) {
    out.push("Mantener el momentum en ingresos.")
  }
  if (cg !== null && cg > 0 && (tg === null || tg >= 0)) {
    out.push("Capitalizar el aumento de volumen con foco en ticket medio.")
  }
  if (rg !== null && rg < 0) {
    out.push("Priorizar recuperación de ingresos y retención de clientes.")
  }
  if (cg !== null && tg !== null && cg < 0 && tg > 0) {
    out.push("Potencial en aumentar número de operaciones manteniendo ticket.")
  }

  return out
}
