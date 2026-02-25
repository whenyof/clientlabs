// ─────────────────────────────────────────────────────────────
// Insights Engine V2 — Commercial Rules
// ─────────────────────────────────────────────────────────────

import type { InsightV2 } from "../types/insights-v2.types"

export function getCommercialInsights(params: {
 leadsTotal: number,
 conversionRate: number,
 leadsGrowth: number
}): InsightV2[] {
 const insights: InsightV2[] = []

 // 1. Volume Check
 if (params.leadsTotal < 5) {
 insights.push({
 category: "COMMERCIAL",
 severity: "WARNING",
 message: "Entrada de leads insuficiente",
 recommendation: "Aumenta la inversión en captación o revisa tus canales de marketing.",
 estimatedImpact: "Crecimiento Estancado"
 })
 }

 // 2. Conversion Check
 if (params.conversionRate < 5) {
 insights.push({
 category: "COMMERCIAL",
 severity: "CRITICAL",
 message: "Tasa de cierre alarmante",
 recommendation: "Revisa tu propuesta de valor o el proceso de seguimiento de ventas.",
 estimatedImpact: "-60% Ventas Potenciales"
 })
 }

 // 3. Negative Trend
 if (params.leadsGrowth < -10) {
 insights.push({
 category: "COMMERCIAL",
 severity: "WARNING",
 message: "Tendencia de captación negativa",
 recommendation: "Analiza por qué han caído los leads un " + Math.abs(params.leadsGrowth).toFixed(0) + "% vs el periodo anterior.",
 estimatedImpact: "Menor Pipeline"
 })
 }

 return insights
}
