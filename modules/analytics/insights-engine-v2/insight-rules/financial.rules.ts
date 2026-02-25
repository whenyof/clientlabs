// ─────────────────────────────────────────────────────────────
// Insights Engine V2 — Financial Rules
// ─────────────────────────────────────────────────────────────

import type { InsightV2 } from "../types/insights-v2.types"

export function getFinancialInsights(params: {
 paidRatio: number,
 overdueRatio: number,
 maxConcentration: number // % of revenue from top client
}): InsightV2[] {
 const insights: InsightV2[] = []

 // 1. Paid Ratio Check
 if (params.paidRatio < 50) {
 insights.push({
 category: "FINANCIAL",
 severity: "CRITICAL",
 message: "Flujo de caja muy bajo",
 recommendation: "Revisa el proceso de cobro y considera penalizaciones por mora.",
 estimatedImpact: "-40% Liquoridez"
 })
 }

 // 2. Overdue Check
 if (params.overdueRatio > 20) {
 insights.push({
 category: "FINANCIAL",
 severity: "WARNING",
 message: "Deuda vencida excesivamente alta",
 recommendation: "Inicia gestiones de recobro para facturas de más de 30 días.",
 estimatedImpact: "Riesgo de Impago"
 })
 }

 // 3. Concentration Check
 if (params.maxConcentration > 60) {
 insights.push({
 category: "FINANCIAL",
 severity: "WARNING",
 message: "Alta concentración de riesgo",
 recommendation: "Diversifica tu cartera; un solo cliente representa más del 60% de tus ingresos.",
 estimatedImpact: "Fragilidad Operativa"
 })
 }

 return insights
}
