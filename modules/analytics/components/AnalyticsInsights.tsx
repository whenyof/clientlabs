"use client";

import { motion } from "framer-motion";
import { KPISection } from "@/components/dashboard/KPISection";
import type { AnalyticsOverview } from "@/modules/analytics/types/analytics.types";
import type { SecondaryMetrics } from "@/modules/analytics/actions/getAnalyticsDashboard";

interface AnalyticsInsightsProps {
 overview: AnalyticsOverview;
 secondary: SecondaryMetrics;
 loading?: boolean;
}

// ── Insight generation ─────────────────────────────────────────────────────

interface Insight {
 emoji: string;
 title: string;
 description: string;
 priority: "high" | "medium" | "opportunity";
}

const PRIORITY_STYLES: Record<Insight["priority"], string> = {
 high: "border-[var(--critical)] bg-[var(--bg-card)]/[0.04]",
 medium: "border-[var(--border-subtle)] bg-[var(--bg-card)]/[0.04]",
 opportunity: "border-[var(--accent)] bg-[var(--accent-soft)]/[0.04]",
};

const PRIORITY_LABELS: Record<Insight["priority"], { text: string; color: string }> = {
 high: { text: "Alta", color: "text-[var(--critical)] bg-[var(--bg-card)]" },
 medium: { text: "Media", color: "text-[var(--text-secondary)] bg-[var(--bg-card)]" },
 opportunity: { text: "Oportunidad", color: "text-[var(--accent)] bg-[var(--accent-soft)]" },
};

function generateInsights(
 overview: AnalyticsOverview,
 secondary: SecondaryMetrics,
): Insight[] {
 const insights: Insight[] = [];

 // Revenue drop — HIGH priority
 if (overview.revenue.trend === "down" && overview.revenue.changePercentage < -10) {
 insights.push({
 emoji: "⚠️",
 title: "Caída de ingresos detectada",
 description: `Los ingresos han bajado un ${Math.abs(overview.revenue.changePercentage)}%. Revisa la estrategia comercial.`,
 priority: "high",
 });
 }

 // Low conversion — HIGH
 if (overview.conversions.value > 0 && overview.conversions.value < 10) {
 insights.push({
 emoji: "🔎",
 title: "Conversión baja",
 description: `Solo el ${overview.conversions.value}% de los leads convierten. Optimiza el proceso de seguimiento.`,
 priority: "high",
 });
 }

 // Unpaid invoices — MEDIUM
 if (secondary.paidRate > 0 && secondary.paidRate < 50) {
 insights.push({
 emoji: "🟡",
 title: "Facturas pendientes de cobro",
 description: `Solo el ${secondary.paidRate}% cobradas. Activa recordatorios automáticos.`,
 priority: "medium",
 });
 }

 // No leads — MEDIUM
 if (overview.leads.value === 0) {
 insights.push({
 emoji: "💡",
 title: "Sin leads en este periodo",
 description: "Considera activar campañas de captación o revisa los canales activos.",
 priority: "medium",
 });
 }

 // Revenue up — OPPORTUNITY
 if (overview.revenue.trend === "up" && overview.revenue.changePercentage > 10) {
 insights.push({
 emoji: "📈",
 title: "Ingresos en tendencia alcista",
 description: `Han crecido un ${overview.revenue.changePercentage}% vs periodo anterior.`,
 priority: "opportunity",
 });
 }

 // Good conversion — OPPORTUNITY
 if (overview.conversions.value > 30) {
 insights.push({
 emoji: "🔥",
 title: "Conversión excelente",
 description: `El ${overview.conversions.value}% de los leads convierten. Por encima del promedio.`,
 priority: "opportunity",
 });
 }

 // High paid rate — OPPORTUNITY
 if (secondary.paidRate > 80) {
 insights.push({
 emoji: "✅",
 title: "Excelente tasa de cobro",
 description: `El ${secondary.paidRate}% de las facturas están cobradas.`,
 priority: "opportunity",
 });
 }

 // Ticket up — OPPORTUNITY
 if (overview.averageTicket.trend === "up") {
 insights.push({
 emoji: "💶",
 title: "Ticket medio al alza",
 description: `Ha subido un ${overview.averageTicket.changePercentage}%. Cada operación aporta más valor.`,
 priority: "opportunity",
 });
 }

 return insights;
}

// ── Main component ─────────────────────────────────────────────────────────

export function AnalyticsInsights({
 overview,
 secondary,
 loading = false,
}: AnalyticsInsightsProps) {
 const insights = generateInsights(overview, secondary);

 const highCount = insights.filter((i) => i.priority === "high").length;
 const mediumCount = insights.filter((i) => i.priority === "medium").length;
 const opportunityCount = insights.filter((i) => i.priority === "opportunity").length;

 return (
 <KPISection title="Insights IA" description="Sugerencias basadas en tus datos">
 <motion.div
 className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 overflow-hidden"
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.3 }}
 >
 {loading ? (
 <div className="space-y-3">
 {[1, 2, 3].map((i) => (
 <div key={i} className="h-16 animate-pulse rounded-xl bg-[var(--bg-card)]" />
 ))}
 </div>
 ) : insights.length === 0 ? (
 /* No backend / no data fallback */
 <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
 <div className="flex items-center gap-2">
 <div className="h-2 w-2 rounded-full bg-[var(--accent-soft)] animate-pulse" />
 <span className="text-sm font-medium text-[var(--text-secondary)]">IA activa y aprendiendo</span>
 </div>
 <p className="text-xs text-[var(--text-secondary)] max-w-[240px]">
 Los insights aparecerán a medida que se registren más datos
 </p>
 </div>
 ) : (
 <div className="space-y-4">
 {/* Summary bar */}
 <div className="flex items-center gap-3 flex-wrap">
 {highCount > 0 && (
 <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-card)] px-2.5 py-1 text-[11px] font-medium text-[var(--critical)]">
 {highCount} alta prioridad
 </span>
 )}
 {mediumCount > 0 && (
 <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-card)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)]">
 {mediumCount} media
 </span>
 )}
 {opportunityCount > 0 && (
 <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--accent)]">
 {opportunityCount} oportunidad{opportunityCount > 1 ? "es" : ""}
 </span>
 )}
 <span className="ml-auto text-[11px] text-[var(--text-secondary)]">
 Última actualización: ahora
 </span>
 </div>

 {/* Insight cards */}
 <div className="space-y-2.5">
 {insights.map((insight, idx) => (
 <div
 key={idx}
 className={`rounded-xl border p-3.5 transition-colors ${PRIORITY_STYLES[insight.priority]}`}
 >
 <div className="flex items-start gap-3">
 <span className="text-lg leading-none shrink-0">{insight.emoji}</span>
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2 flex-wrap">
 <p className="text-sm font-medium text-[var(--text-primary)]">
 {insight.title}
 </p>
 <span
 className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${PRIORITY_LABELS[insight.priority].color}`}
 >
 {PRIORITY_LABELS[insight.priority].text}
 </span>
 </div>
 <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
 {insight.description}
 </p>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </motion.div>
 </KPISection>
 );
}
