// ─────────────────────────────────────────────────────────────
// Analytics Pro — Insights Service
// ─────────────────────────────────────────────────────────────
// Rule-based insight generator. Evaluates business metrics
// and returns actionable alerts sorted by priority.
// ─────────────────────────────────────────────────────────────

import type { Insight, InsightPriority } from "../types/analytics-pro.types"

export interface InsightInputs {
 conversion: number // 0-100 %
 leadsTotal: number // absolute count
 overdueRatio: number // 0-100 %
 revenueGrowth: number // can be negative
 paidRatio: number // 0-100 %
 avgTicket: number // absolute €
 ltv: number // absolute €
}

interface InsightRule {
 code: string
 priority: InsightPriority
 condition: (inputs: InsightInputs) => boolean
 message: string
 recommendation: string
}

const RULES: InsightRule[] = [
 // ── HIGH priority ──────────────────────────────────────────
 {
 code: "LOW_CONVERSION_HIGH_LEADS",
 priority: "HIGH",
 condition: (i) => i.conversion < 5 && i.leadsTotal > 10,
 message:
 "Tua tasa de conversión es crítica (<5%) con flujo de leads activo.",
 recommendation:
 "Revisa urgentemente tu proceso de ventas y la calidad de los leads entrantes.",
 },
 {
 code: "CRITICAL_PAYMENT_RATIO",
 priority: "HIGH",
 condition: (i) => i.paidRatio < 50 && i.paidRatio >= 0,
 message:
 "Menos de la mitad de tus ingresos emitidos han sido cobrados.",
 recommendation:
 "Implementa una política de cobros más estricta y automatiza recordatorios.",
 },
 {
 code: "HIGH_OVERDUE_ALARM",
 priority: "HIGH",
 condition: (i) => i.overdueRatio > 20,
 message:
 "Alerta: Más del 20% de tu facturación está vencida.",
 recommendation:
 "Contacta individualmente con los clientes morosos y detén nuevos servicios si es necesario.",
 },

 // ── MEDIUM priority ────────────────────────────────────────
 {
 code: "NEGATIVE_GROWTH",
 priority: "MEDIUM",
 condition: (i) => i.revenueGrowth < 0,
 message:
 "Tendencia negativa: Tus ingresos están bajando respecto al periodo anterior.",
 recommendation:
 "Analiza la fuga de clientes o la bajada en el volumen de ventas.",
 },
 {
 code: "CONVERSION_IMPROVABLE",
 priority: "MEDIUM",
 condition: (i) => i.conversion >= 5 && i.conversion < 10,
 message:
 "Tu conversión (5-10%) tiene margen de mejora significativo.",
 recommendation:
 "Optimiza tus guiones de venta y reduce el tiempo de respuesta a leads.",
 },

 // ── POSITIVE (LOW priority in our model) ───────────────────
 {
 code: "HEALTHY_BUSINESS",
 priority: "LOW",
 condition: (i) => i.revenueGrowth > 20 && i.paidRatio > 80,
 message:
 "¡Excelente! Crecimiento sólido y alta eficiencia de cobro.",
 recommendation:
 "Es un buen momento para reinvertir en el negocio o escalar operaciones.",
 },
]

// Priority order for sorting
const PRIORITY_ORDER: Record<InsightPriority, number> = {
 HIGH: 0,
 MEDIUM: 1,
 LOW: 2,
}

export function generateInsights(inputs: InsightInputs): Insight[] {
 const insights: Insight[] = []

 for (const rule of RULES) {
 if (rule.condition(inputs)) {
 insights.push({
 priority: rule.priority,
 code: rule.code,
 message: rule.message,
 recommendation: rule.recommendation,
 })
 }
 }

 // Sort by priority: HIGH first, then MEDIUM, then LOW
 insights.sort(
 (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
 )

 return insights
}
