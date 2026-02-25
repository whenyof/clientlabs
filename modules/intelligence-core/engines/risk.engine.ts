// ─────────────────────────────────────────────────────────────
// Intelligence Core — Risk Engine
// ─────────────────────────────────────────────────────────────

import { BusinessMetricsInput, RiskAlert } from "../types/intelligence.types"
import { calculateMaxConcentration } from "../calculators"
import { detectAnomalies } from "./anomaly.engine"

export function computeRisks(input: BusinessMetricsInput): RiskAlert[] {
 const alerts: RiskAlert[] = []

 // 1. Concentration Risk
 if (input.revenueByClient && input.collectedRevenue > 0) {
 const concentration = calculateMaxConcentration(input.revenueByClient, input.collectedRevenue)
 if (concentration > 60) {
 alerts.push({
 code: "CONCENTRATION_HIGH",
 severity: "HIGH",
 message: "Alta dependencia de un cliente único",
 recommendation: "Diversifica tu cartera; un solo cliente representa más del 60% de tus cobros."
 })
 }
 }

 // 2. Overdue Risk
 const totalCurrentAssets = input.issuedRevenue + input.overdueAmount
 const overdueRatio = totalCurrentAssets > 0 ? (input.overdueAmount / totalCurrentAssets) * 100 : 0

 if (overdueRatio > 20) {
 alerts.push({
 code: "DEBT_OVERDUE_HIGH",
 severity: "HIGH",
 message: "Mora superior al 20%",
 recommendation: "Inicia procesos de recobro automático o revisa tus términos de pago."
 })
 }

 // 3. Conversion Risk
 const conversion = input.leads > 0 ? (input.sales / input.leads) * 100 : 0
 if (input.leads >= 10 && conversion < 5) {
 alerts.push({
 code: "CONVERSION_CRITICAL",
 severity: "MEDIUM",
 message: "Eficiencia comercial alarmante",
 recommendation: "Revisa tu proceso de cierre; estás convirtiendo menos del 5% de tus leads."
 })
 }

 // 4. Artificial Growth (Spikes)
 const anomalies = detectAnomalies(input)
 if (anomalies.hasAnomalies) {
 alerts.push({
 code: "ARTIFICIAL_GROWTH",
 severity: "LOW",
 message: "Crecimiento impulsado por picos puntuales",
 recommendation: "Tus métricas de crecimiento están sesgadas por uno o más días de actividad atípica."
 })
 }

 return alerts
}
