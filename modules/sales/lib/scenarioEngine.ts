/**
 * Scenario Simulator — motor matemático puro.
 * Separa: datos reales (base) → inputs usuario → resultados.
 * Sin Prisma. Sin side effects. Determinista. Números seguros.
 *
 * Flujo: UI → inputs | baseMetrics → calculateScenario() → result → UI.
 * Escalabilidad: result puede alimentar IA → recomendaciones, alertas, exportes.
 */

export type BaseMetrics = {
  revenue: number
  sales: number
  avgTicket: number
  leads: number
  conversionRate: number
  inactiveClients: number
  monthlyGoal?: number
}

export type ScenarioInputs = {
  extraSales: number
  ticketChangePct: number
  convertedLeads: number
  reactivatedClients: number
  discountPct: number
}

export type ScenarioResult = {
  projectedRevenue: number
  growthPct: number
  projectedSales: number
  goalCompletionPct: number
  neededSalesToGoal: number
}

function safeNum(value: unknown): number {
  if (value == null || typeof value !== "number") return 0
  if (!Number.isFinite(value)) return 0
  return value
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Calcula el resultado del escenario a partir de métricas base e inputs.
 * - Recalcula ticket medio con ticketChangePct
 * - Suma ventas adicionales (extra + conversiones + reactivaciones)
 * - Aplica descuento a ingresos base
 * - Crecimiento vs real (si revenue 0 → 100)
 * - Cumplimiento objetivo (si no hay monthlyGoal → 0)
 * - Ventas necesarias para alcanzar objetivo
 */
export function calculateScenario(
  base: BaseMetrics,
  inputs: ScenarioInputs
): ScenarioResult {
  const revenue = Math.max(0, safeNum(base.revenue))
  const sales = Math.max(0, safeNum(base.sales))
  const avgTicket = Math.max(0, safeNum(base.avgTicket))
  const monthlyGoal = base.monthlyGoal != null ? Math.max(0, safeNum(base.monthlyGoal)) : 0

  const extraSales = Math.max(0, safeNum(inputs.extraSales))
  const ticketChangePct = safeNum(inputs.ticketChangePct)
  const convertedLeads = Math.max(0, safeNum(inputs.convertedLeads))
  const reactivatedClients = Math.max(0, safeNum(inputs.reactivatedClients))
  const discountPct = Math.max(0, Math.min(100, safeNum(inputs.discountPct)))

  const newTicket =
    avgTicket > 0 ? avgTicket * (1 + ticketChangePct / 100) : 0
  const additionalSales = extraSales + convertedLeads + reactivatedClients

  const revenueFromBase = revenue * (1 - discountPct / 100)
  const revenueFromNew = additionalSales * (Number.isFinite(newTicket) ? newTicket : 0)
  const projectedRevenue = round2(revenueFromBase + revenueFromNew)

  const growthPct =
    revenue === 0
      ? 100
      : round2(((projectedRevenue - revenue) / revenue) * 100)

  const projectedSales = Math.max(0, sales + additionalSales)

  const goalCompletionPct =
    monthlyGoal > 0
      ? round2((projectedRevenue / monthlyGoal) * 100)
      : 0

  const neededSalesToGoal =
    monthlyGoal > 0 &&
    projectedRevenue < monthlyGoal &&
    newTicket > 0
      ? round2((monthlyGoal - projectedRevenue) / newTicket)
      : 0

  return {
    projectedRevenue,
    growthPct,
    projectedSales,
    goalCompletionPct,
    neededSalesToGoal,
  }
}
