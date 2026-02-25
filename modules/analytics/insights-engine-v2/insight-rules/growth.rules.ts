// ─────────────────────────────────────────────────────────────
// Insights Engine V2 — Growth Rules
// ─────────────────────────────────────────────────────────────

import type { InsightV2 } from "../types/insights-v2.types"

export function getGrowthInsights(params: {
 maxDailySpike: number, // % of total period in one day
 volatilityIndex: number, // variation coefficient
 revenueGrowth: number
}): InsightV2[] {
 const insights: InsightV2[] = []

 // 1. Artificial Peak
 if (params.maxDailySpike > 70) {
 insights.push({
 category: "GROWTH",
 severity: "WARNING",
 message: "Pico de ingresos artificial",
 recommendation: "Tus datos están sesgados por un evento puntual del 70%; no es una tendencia real.",
 estimatedImpact: "Datos No Fiables"
 })
 }

 // 2. High Volatility
 if (params.volatilityIndex > 0.8) {
 insights.push({
 category: "GROWTH",
 severity: "WARNING",
 message: "Inestabilidad de ingresos alta",
 recommendation: "Busca modelos de ingresos recurrentes para estabilizar tu flujo de caja.",
 estimatedImpact: "Riesgo de Liquidez"
 })
 }

 // 3. Positive Sustained Growth
 if (params.revenueGrowth > 20 && params.maxDailySpike < 40) {
 insights.push({
 category: "GROWTH",
 severity: "POSITIVE",
 message: "Crecimiento orgánico sólido",
 recommendation: "Buen trabajo. Tu crecimiento es real y no depende de un solo día.",
 estimatedImpact: "+25% Valor Empresa"
 })
 }

 return insights
}
